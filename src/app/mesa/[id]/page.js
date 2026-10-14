"use client";

import { useState, useEffect, use, useTransition, useRef } from "react";
import { listarProdutos } from "@/app/actions/produtos";
import { criarPedido, listarPedidosDaMesa, cancelarPedido } from "@/app/actions/pedidos";
import { solicitarFechamento, buscarMesaPorId, ocuparMesa, validarAcessoMesa } from "@/app/actions/mesas";

const tocarSomCampainha = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const tocarNota = (freq, inicio, duracao) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + inicio);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + inicio);
      gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + inicio + 0.05);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + inicio + duracao);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + inicio);
      osc.stop(audioCtx.currentTime + inicio + duracao);
    };
    tocarNota(880, 0, 0.2);
    tocarNota(1046.5, 0.15, 0.4);
  } catch (e) { }
};

export default function MenuCliente({ params }) {
  const { id } = use(params);

  const [dadosMesa, setDadosMesa] = useState(null);
  const [nomeMesa, setNomeMesa] = useState("Sincronizando...");
  const nomeMesaRef = useRef("");

  // Estados de Segurança / Check-in da Mesa
  const [acessoLiberado, setAcessoLiberado] = useState(false);
  const [nomeInput, setNomeInput] = useState("");
  const [telefoneInput, setTelefoneInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [erroAcesso, setErroAcesso] = useState("");

  const [produtos, setProdutos] = useState([]);
  const [pedidosMesa, setPedidosMesa] = useState([]);
  const statusAnteriorRef = useRef({});

  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState("");

  const [isConfirmando, setIsConfirmando] = useState(false);
  const [isFechandoConta, setIsFechandoConta] = useState(false);
  const [pagamentosSelecionados, setPagamentosSelecionados] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function init() {
      setProdutos(await listarProdutos());
      await sincronizarMesa();
      setIsLoading(false);
    }
    init();

    // Radar de 5s agora verifica a mesa (se o garçom limpou/fechou) e atualiza os pedidos
    const intervalo = setInterval(() => {
      sincronizarMesa();
    }, 5000);
    return () => clearInterval(intervalo);
  }, [id]);

  const buscarPedidosDaMesa = async (nomeDaMesa = nomeMesaRef.current) => {
    if (!nomeDaMesa) return;
    const dados = await listarPedidosDaMesa(nomeDaMesa);
    dados.forEach((pedido) => {
      const statusAntigo = statusAnteriorRef.current[pedido.id];
      if (statusAntigo === "PENDENTE" && pedido.status === "CONCLUIDO") tocarSomCampainha();
      statusAnteriorRef.current[pedido.id] = pedido.status;
    });
    setPedidosMesa(dados);
  };

  const sincronizarMesa = async () => {
    const mesaBanco = await buscarMesaPorId(id);
    if (!mesaBanco) return;

    setDadosMesa(mesaBanco);
    nomeMesaRef.current = mesaBanco.nome;
    setNomeMesa(mesaBanco.nome);

    if (mesaBanco.clienteTelefone) {
      const pinCorreto = mesaBanco.clienteTelefone.slice(-4);
      const pinSalvoNoCelular = localStorage.getItem(`mesa_auth_${id}`);

      if (pinSalvoNoCelular === pinCorreto) {
        setAcessoLiberado(true);
        await buscarPedidosDaMesa(mesaBanco.nome);
      } else {
        // Se outra pessoa ocupou ou mudou o telefone, trava e limpa a tela
        setAcessoLiberado(false);
        setCarrinho([]);
        setIsConfirmando(false);
      }
    } else {
      // Se o garçom limpou ou fechou a mesa no banco, expulsa o celular e zera tudo!
      localStorage.removeItem(`mesa_auth_${id}`);
      setAcessoLiberado(false);
      setPedidosMesa([]);
      setCarrinho([]);
      setIsConfirmando(false);
      setIsFechandoConta(false);
    }
  };

  // Ação 1: Primeiro cliente abrindo a mesa com Nome e Telefone
  const handleAbrirMesa = (e) => {
    e.preventDefault();
    setErroAcesso("");

    if (nomeInput.trim().split(" ").length < 2) {
      return setErroAcesso("Digite seu nome e sobrenome.");
    }

    startTransition(async () => {
      const res = await ocuparMesa(id, nomeInput, telefoneInput);
      if (res.sucesso) {
        localStorage.setItem(`mesa_auth_${id}`, res.pin);
        await sincronizarMesa();
      } else {
        setErroAcesso(res.erro);
      }
    });
  };

  // Ação 2: Segundo aparelho entrando com os 4 últimos dígitos
  const handleEntrarComPin = (e) => {
    e.preventDefault();
    setErroAcesso("");

    startTransition(async () => {
      const res = await validarAcessoMesa(id, pinInput);
      if (res.sucesso) {
        localStorage.setItem(`mesa_auth_${id}`, res.pin);
        await sincronizarMesa();
      } else {
        setErroAcesso(res.erro);
      }
    });
  };

  const formatarTelefone = (valor) => {
    const num = valor.replace(/\D/g, "").slice(0, 11);
    if (num.length <= 2) return num;
    if (num.length <= 7) return `(${num.slice(0, 2)}) ${num.slice(2)}`;
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
  };

  const handleCancelarPedido = (pedidoId) => {
    if (confirm("Tem certeza que deseja cancelar esta ordem?")) {
      startTransition(async () => {
        await cancelarPedido(pedidoId);
        buscarPedidosDaMesa();
      });
    }
  };

  const togglePagamento = (metodo) => {
    setPagamentosSelecionados(prev =>
      prev.includes(metodo) ? prev.filter(m => m !== metodo) : [...prev, metodo]
    );
  };

  const handlePedirConta = () => {
    if (pagamentosSelecionados.length === 0) return alert("Selecione pelo menos uma forma de pagamento.");

    startTransition(async () => {
      const formas = pagamentosSelecionados.join(" + ");
      await solicitarFechamento(Number(id), formas);
      setIsFechandoConta(false);
      alert("O garçom foi chamado para fechar sua conta!");
    });
  };

  const produtosFiltrados = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));
  const adicionarAoCarrinho = (p) => {
    setCarrinho((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex) return prev.map((i) => i.id === p.id ? { ...i, qtd: i.qtd + 1 } : i);
      return [...prev, { ...p, qtd: 1 }];
    });
  };
  const removerDoCarrinho = (pId) => {
    setCarrinho((prev) => {
      const ex = prev.find((i) => i.id === pId);
      if (ex.qtd === 1) return prev.filter((i) => i.id !== pId);
      return prev.map((i) => i.id === pId ? { ...i, qtd: i.qtd - 1 } : i);
    });
  };
  const getQuantidade = (pId) => carrinho.find((i) => i.id === pId)?.qtd || 0;

  const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);
  const totalValor = carrinho.reduce((acc, item) => acc + (Number(item.preco.replace(",", ".")) * item.qtd), 0);

  const totalComanda = pedidosMesa
    .filter(p => p.status !== "CANCELADO" && p.status !== "PAGO")
    .reduce((acc, p) => acc + Number(p.total), 0);

  const enviarPedido = () => {
    if (carrinho.length === 0) return;
    startTransition(async () => {
      const res = await criarPedido(nomeMesaRef.current, totalValor.toFixed(2), carrinho);
      if (res.sucesso) {
        setCarrinho([]);
        setIsConfirmando(false);
        buscarPedidosDaMesa();
      }
    });
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><span className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Sincronizando Sistema...</span></div>;

  // ==================== TELA DE BLOQUEIO / CHECK-IN DA MESA ====================
  if (!acessoLiberado) {
    const isMesaJaOcupada = Boolean(dadosMesa?.clienteTelefone);
    const primeiroNomeDono = dadosMesa?.clienteNome?.split(" ")[0] || "Cliente";

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white rounded-sm shadow-2xl overflow-hidden border border-slate-700">
          
          <div className="bg-slate-800 p-5 text-center border-b-4 border-emerald-500">
            <h1 className="text-lg font-black text-white uppercase tracking-widest">
              GestorPedidos
            </h1>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-1">
              {nomeMesa}
            </p>
          </div>

          {!isMesaJaOcupada ? (
            /* FORMULÁRIO 1: MESA LIVRE -> PEDE NOME COMPLETO E TELEFONE */
            <form onSubmit={handleAbrirMesa} className="p-6 space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Abrir Comanda</h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Identifique-se para liberar os pedidos desta mesa
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Daniel Nascimento"
                  value={nomeInput}
                  onChange={(e) => setNomeInput(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm font-bold text-slate-800 uppercase outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Seu Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(32) 99999-9999"
                  value={telefoneInput}
                  onChange={(e) => setTelefoneInput(formatarTelefone(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Os 4 últimos dígitos servirão de senha para outras pessoas na sua mesa.
                </p>
              </div>

              {erroAcesso && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-sm text-center uppercase">
                  {erroAcesso}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 text-xs uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
              >
                {isPending ? "ABRINDO MESA..." : "LIBERAR CARDÁPIO"}
              </button>
            </form>
          ) : (
            /* FORMULÁRIO 2: MESA JÁ OCUPADA -> PEDE OS 4 ÚLTIMOS DÍGITOS */
            <form onSubmit={handleEntrarComPin} className="p-6 space-y-4">
              <div className="text-center">
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
                  Mesa em Atendimento
                </span>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mt-2">
                  Comanda de {primeiroNomeDono}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Para incluir pedidos nesta mesa, digite os <strong>4 últimos dígitos</strong> do telefone de quem abriu a comanda:
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  placeholder="0000"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 border-2 border-slate-300 rounded-sm text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              {erroAcesso && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-sm text-center uppercase">
                  {erroAcesso}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || pinInput.length < 4}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 text-xs uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
              >
                {isPending ? "VERIFICANDO..." : "ACESSAR COMANDA"}
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }

  // ==================== TELA DO CARDÁPIO (LIBERADA) ====================
  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans selection:bg-blue-200">

      <header className="sticky top-0 z-40 bg-slate-900 shadow-md">
        <div className="px-3 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="leading-tight">
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">GestorPedidos</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {nomeMesa} {dadosMesa?.clienteNome ? `• ${dadosMesa.clienteNome.split(" ")[0]}` : ""}
              </p>
            </div>
          </div>

          {dadosMesa?.clienteTelefone && (
            <div className="text-right">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Senha da Mesa</span>
              <span className="text-xs font-mono font-black text-white bg-slate-800 px-2 py-0.5 rounded-sm border border-slate-700">
                {dadosMesa.clienteTelefone.slice(-4)}
              </span>
            </div>
          )}
        </div>
        <div className="px-3 py-2 bg-slate-800">
          <div className="relative">
            <input type="text" placeholder="BUSCAR NO CARDÁPIO..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-sm outline-none focus:border-blue-500 uppercase placeholder:text-slate-500" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-4 pt-4 px-2">
        {pedidosMesa.length > 0 && (
          <div className="bg-white p-3 rounded-sm border border-slate-300 shadow-sm mb-6">
            <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-3">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Minha Comanda</h2>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total a Pagar</p>
                <p className="text-lg font-black text-emerald-600 leading-none">R$ {totalComanda.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {pedidosMesa.filter(p => p.status !== "PAGO").map((ordem) => (
                <div key={ordem.id} className="bg-slate-50 border border-slate-200 p-2 rounded-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Ordem #{ordem.id}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {ordem.status === "PENDENTE" && <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Na Cozinha</span>}
                        {ordem.status === "CONCLUIDO" && <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Pronto</span>}
                        {ordem.status === "CANCELADO" && <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Cancelado</span>}
                      </div>
                    </div>
                    <span className="font-black text-sm text-slate-800">R$ {ordem.total}</span>
                  </div>
                  <div className="text-xs text-slate-600 mb-2 font-medium">{ordem.itens.map(i => `${i.qtd}x ${i.nome}`).join(", ")}</div>
                  {ordem.status === "PENDENTE" && (
                    <button onClick={() => handleCancelarPedido(ordem.id)} disabled={isPending} className="text-[10px] text-red-600 font-bold uppercase tracking-wider border border-red-200 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-sm w-full transition-colors">Cancelar Ordem</button>
                  )}
                </div>
              ))}
            </div>

            {totalComanda > 0 && (
              <button
                onClick={() => setIsFechandoConta(true)}
                className="w-full bg-slate-900 text-white font-bold py-3 text-xs uppercase tracking-wider rounded-sm hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                💸 Pedir a Conta
              </button>
            )}
          </div>
        )}

        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2 ml-1">Cardápio</h2>
          <div className="space-y-2">
            {produtosFiltrados.map((produto) => {
              const qtd = getQuantidade(produto.id);
              return (
                <div key={produto.id} className="bg-white p-2 rounded-sm border border-slate-300 flex gap-3 shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                    {produto.foto ? <img src={produto.foto} alt={produto.nome} className="w-full h-full object-cover" /> : <span className="text-2xl">☕</span>}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 uppercase leading-none truncate mt-0.5">{produto.nome}</h3>
                      {produto.descricao && <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 uppercase tracking-wide">{produto.descricao}</p>}
                    </div>
                    <div className="flex items-end justify-between mt-1">
                      <span className="font-black text-emerald-600 text-sm">R$ {produto.preco}</span>
                      {qtd === 0 ? (
                        <button onClick={() => adicionarAoCarrinho(produto)} className="bg-slate-200 text-slate-800 hover:bg-slate-300 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm transition-colors">Adicionar</button>
                      ) : (
                        <div className="flex items-center bg-slate-100 border border-slate-300 rounded-sm">
                          <button onClick={() => removerDoCarrinho(produto.id)} className="w-7 h-6 text-slate-600 flex items-center justify-center font-black">-</button>
                          <span className="font-black text-slate-800 text-xs w-5 text-center">{qtd}</span>
                          <button onClick={() => adicionarAoCarrinho(produto)} className="w-7 h-6 text-slate-600 flex items-center justify-center font-black border-l border-slate-300">+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* FOOTER CARRINHO */}
      {totalItens > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-emerald-500 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.1)] z-50 p-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{totalItens} NOVA ORDEM</p>
              <p className="text-lg font-black text-slate-900 leading-none mt-0.5">R$ {totalValor.toFixed(2).replace('.', ',')}</p>
            </div>
            <button onClick={() => setIsConfirmando(true)} className="bg-emerald-600 text-white px-5 py-3 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors">Revisar Ordem</button>
          </div>
        </div>
      )}

      {/* MODAL FECHAR CONTA */}
      {isFechandoConta && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/80 p-3">
          <div className="bg-white w-full max-w-md rounded-sm flex flex-col border border-slate-300 shadow-2xl relative">
            <div className="bg-slate-900 px-4 py-4 flex justify-between items-center rounded-t-sm">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Opções de Pagamento</h2>
              <button onClick={() => setIsFechandoConta(false)} className="text-slate-400 hover:text-white font-bold px-2">X</button>
            </div>
            <div className="p-5">
              <p className="text-center text-xs font-bold text-slate-500 uppercase mb-1">Total a Pagar</p>
              <p className="text-center text-4xl font-black text-emerald-600 mb-6">R$ {totalComanda.toFixed(2).replace('.', ',')}</p>

              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Como deseja pagar? (Pode marcar mais de um)</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito"].map((metodo) => (
                  <button
                    key={metodo}
                    onClick={() => togglePagamento(metodo)}
                    className={`p-3 text-xs font-bold uppercase tracking-wider rounded-sm border-2 transition-all ${pagamentosSelecionados.includes(metodo) ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    {metodo}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePedirConta}
                disabled={isPending || pagamentosSelecionados.length === 0}
                className="w-full bg-emerald-600 text-white font-bold py-4 text-sm uppercase tracking-wider rounded-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Notificando..." : "Chamar Garçom p/ Pagar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ORDEM */}
      {isConfirmando && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/80 p-3">
          <div className="bg-white w-full max-w-lg rounded-sm flex flex-col max-h-[85vh] border border-slate-300 shadow-2xl relative">

            <div className="bg-slate-800 px-4 py-3 flex justify-between items-center rounded-t-sm">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Nova Ordem</h2>
              <button onClick={() => setIsConfirmando(false)} className="text-slate-400 hover:text-white font-bold px-2">X</button>
            </div>

            <div className="p-3 overflow-y-auto divide-y divide-slate-200 bg-white">
              {carrinho.map((item) => {
                const precoNum = Number(item.preco.replace(",", "."));
                return (
                  <div key={item.id} className="flex justify-between items-center py-3">
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-sm text-xs font-black">{item.qtd}x</span>
                      <div>
                        <span className="font-bold text-sm text-slate-800 uppercase leading-none block">{item.nome}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-medium">Un: R$ {item.preco}</span>
                      </div>
                    </div>
                    <span className="font-black text-sm text-slate-900">R$ {(precoNum * item.qtd).toFixed(2).replace('.', ',')}</span>
                  </div>
                )
              })}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-300">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Total da Ordem</span>
                <span className="font-black text-xl text-emerald-600">R$ {totalValor.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsConfirmando(false)}
                  className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 text-xs uppercase tracking-wider rounded-sm hover:bg-slate-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={enviarPedido}
                  disabled={isPending}
                  className="flex-[2] bg-emerald-600 text-white font-bold py-3 text-xs uppercase tracking-wider rounded-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "ENVIANDO..." : "ENVIAR P/ COZINHA"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
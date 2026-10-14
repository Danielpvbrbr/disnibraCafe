"use client";

import { useState, useEffect, use, useTransition, useRef } from "react";
import { listarProdutos } from "@/app/actions/produtos";
import { criarPedido, listarPedidosDaMesa, cancelarPedido } from "@/app/actions/pedidos";
import { solicitarFechamento, buscarMesaPorId } from "@/app/actions/mesas"; 

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
  } catch(e) {}
};

export default function MenuCliente({ params }) {
  const { id } = use(params); 
  
  const [nomeMesa, setNomeMesa] = useState("Sincronizando...");
  const nomeMesaRef = useRef(""); 

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
      const mesaBanco = await buscarMesaPorId(id);
      const nomeReal = mesaBanco ? mesaBanco.nome : `Mesa ${id}`;
      
      nomeMesaRef.current = nomeReal;
      setNomeMesa(nomeReal);

      setProdutos(await listarProdutos());
      await buscarPedidosDaMesa();
      setIsLoading(false);
    }
    init();
    
    const intervalo = setInterval(() => {
      if (nomeMesaRef.current) buscarPedidosDaMesa();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const buscarPedidosDaMesa = async () => {
    const dados = await listarPedidosDaMesa(nomeMesaRef.current);
    dados.forEach((pedido) => {
      const statusAntigo = statusAnteriorRef.current[pedido.id];
      if (statusAntigo === "PENDENTE" && pedido.status === "CONCLUIDO") tocarSomCampainha();
      statusAnteriorRef.current[pedido.id] = pedido.status;
    });
    setPedidosMesa(dados);
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

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans selection:bg-blue-200">
      
      <header className="sticky top-0 z-40 bg-slate-900 shadow-md">
        <div className="px-3 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="leading-tight">
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">GestorPedidos</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{nomeMesa}</p>
            </div>
          </div>
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

      {/* MODAL CONFIRMAR ORDEM (Totalmente Restaurado!) */}
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
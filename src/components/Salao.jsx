"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { criarMesa, listarMesas, fecharContaMesa } from "@/app/actions/mesas";
import { listarPedidosDaMesa } from "@/app/actions/pedidos";

// Som de Alerta Bruto de PDV (BEEP BEEP)
const tocarAlertaFechamento = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const tocarBeep = (inicio) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime + inicio);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + inicio);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + inicio + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + inicio);
      osc.stop(audioCtx.currentTime + inicio + 0.15);
    };
    tocarBeep(0);
    tocarBeep(0.2);
    tocarBeep(0.4);
  } catch (e) { }
};

export default function Salao() {
  const [tables, setTables] = useState([]);
  const [origin, setOrigin] = useState("");

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mesaPDV, setMesaPDV] = useState(null);
  const [pedidosPDV, setPedidosPDV] = useState([]);

  // Cálculos do PDV
  const [desconto, setDesconto] = useState("");
  const [valorRecebido, setValorRecebido] = useState("");

  const [newTableName, setNewTableName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const statusAnteriorRef = useRef({});

  useEffect(() => {
    setOrigin(window.location.origin);
    carregarMesas();
    const intervalo = setInterval(() => carregarMesas(), 5000);
    return () => clearInterval(intervalo);
  }, []);

  const carregarMesas = async () => {
    const dados = await listarMesas();

    // Dispara som se alguma mesa mudou para FECHANDO
    dados.forEach((mesa) => {
      const statusAntigo = statusAnteriorRef.current[mesa.id];
      if (statusAntigo !== "FECHANDO" && mesa.status === "FECHANDO") {
        tocarAlertaFechamento();
      }
      statusAnteriorRef.current[mesa.id] = mesa.status;
    });

    setTables(dados);
    setIsLoading(false);
  };

  const handleCreateTable = () => {
    if (!newTableName.trim()) return;
    startTransition(async () => {
      await criarMesa(newTableName.trim());
      setNewTableName("");
      setIsModalOpen(false);
      carregarMesas();
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCreateTable();
  };

  // ---- LÓGICA DO CAIXA (PDV) ----
  const abrirPDV = async (mesa) => {
    // Busca tudo que a mesa consumiu
    const extrato = await listarPedidosDaMesa(mesa.nome);

    // Filtra os que não foram cancelados nem pagos
    const extratoFiltrado = extrato.filter(p => p.status !== "CANCELADO" && p.status !== "PAGO");

    setPedidosPDV(extratoFiltrado);
    setDesconto("");
    setValorRecebido("");
    setMesaPDV(mesa);
  };

  const totalOriginal = pedidosPDV.reduce((acc, p) => acc + Number(p.total), 0);
  const valorDesconto = Number(desconto.replace(/\D/g, "")) / 100 || 0;
  const totalCobrado = Math.max(0, totalOriginal - valorDesconto);
  const valorEntregue = Number(valorRecebido.replace(/\D/g, "")) / 100 || 0;
  const troco = valorEntregue > 0 ? Math.max(0, valorEntregue - totalCobrado) : 0;

  const handleEncerrarConta = () => {
    startTransition(async () => {
      await fecharContaMesa(mesaPDV.id, mesaPDV.nome);
      setMesaPDV(null);
      carregarMesas();
    });
  };

  const formatarMoeda = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return (Number(apenasNumeros) / 100).toLocaleString("pt-BR", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const imprimirQRCode = (table) => {
    // Pega o SVG do QR Code que já está renderizado na tela
    const qrElement = document.querySelector(`[data-qr-id="${table.id}"] svg`);
    if (!qrElement) return;

    const printWindow = window.open("", "_blank", "width=400,height=500");
    if (!printWindow) {
      alert("Permita pop-ups para imprimir o QR Code");
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Code - ${table.nome}</title>
        <style>
          @page { margin: 12mm; }
          body {
            margin: 0;
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            text-align: center;
          }
          h1 {
            font-size: 28px;
            margin: 0 0 24px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .qr-box {
            border: 2px solid #000;
            padding: 12px;
            display: inline-block;
            background: white;
          }
          .qr-box svg {
            width: 220px;
            height: 220px;
            display: block;
          }
          p {
            margin-top: 18px;
            font-size: 13px;
            color: #444;
          }
        </style>
      </head>
      <body>
        <h1>${table.nome}</h1>
        <div class="qr-box">
          ${qrElement.outerHTML}
        </div>
        <p>Escaneie para acessar a mesa</p>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 250);
          };
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">MAPA DO SALÃO</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 font-medium uppercase tracking-wider">Gestão de Mesas e Caixas</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-sm hover:bg-blue-700 uppercase tracking-wide flex items-center gap-2">
          <span className="text-base leading-none font-black">+</span> Nova Mesa
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><p className="text-slate-400 font-bold uppercase animate-pulse">Carregando salão...</p></div>
      ) : tables.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-slate-300 rounded-md bg-slate-100 p-6 text-center">
          <p className="text-slate-500 font-semibold text-lg uppercase tracking-wide">NENHUMA MESA CADASTRADA</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 content-start">
          {tables.map((table) => {
            const isFechando = table.status === "FECHANDO";

            return (
              <div key={table.id} className={`rounded-md flex flex-col overflow-hidden shadow-sm border-2 ${isFechando ? 'border-red-500 bg-red-50 animate-pulse' : 'border-slate-300 bg-white'}`}>

                {/* Header da Mesa */}
                <div className={`flex items-center justify-between px-3 py-2 text-white border-b ${isFechando ? 'bg-red-600 border-red-700' : 'bg-slate-800 border-slate-900'}`}>
                  <h3 className="text-sm font-bold tracking-wide uppercase truncate pr-2">{table.nome}</h3>
                  {isFechando ? (
                    <span className="text-[9px] font-black uppercase text-white bg-red-800 px-1.5 py-0.5 rounded-sm">CONTA</span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded-sm">LIVRE</span>
                  )}
                </div>

                {/* QR Code */}
                <div className="flex justify-center items-center py-4 bg-white/50">
                  <div className="p-1 bg-white border border-slate-200 rounded-sm" data-qr-id={table.id}>
                    <QRCodeSVG value={`${origin}/mesa/${table.id}`} size={110} level="H" includeMargin={false} />
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO DO RODAPÉ (Cores customizadas e funcionais) */}
                <div className="flex flex-col divide-y divide-slate-200 border-t border-slate-200 bg-slate-100">

                  {/* Botão 1: Caixa / Consumo */}
                  <button
                    onClick={() => abrirPDV(table)}
                    className={`w-full py-2 text-xs font-bold uppercase tracking-wider transition-colors ${isFechando
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-slate-800 text-white hover:bg-slate-900'
                      }`}
                  >
                    {isFechando ? "⚠️ Fechar Conta" : "Ver Consumo"}
                  </button>

                  {/* Botão 2: Acessar Tela da Mesa */}
                  <button
                    onClick={() => window.open(`${origin}/mesa/${table.id}`, '_blank')}
                    className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Acessar Mesa
                  </button>

                  {/* Botão 3: Imprimir QR Code */}
                  <button
                    onClick={() => imprimirQRCode(table)}
                    className="w-full py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir QR
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL DE CAIXA / PDV */}
      {mesaPDV && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl flex overflow-hidden border-2 border-slate-800 h-[80vh]">

            {/* Esquerda: Extrato da Mesa */}
            <div className="w-1/2 flex flex-col bg-slate-50 border-r border-slate-300">
              <div className="bg-slate-800 px-4 py-3 text-white">
                <h2 className="text-sm font-black uppercase tracking-widest">Extrato: {mesaPDV.nome}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* AQUI: Se não tiver pedido, avisa! */}
                {pedidosPDV.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs text-center">
                      Nenhum consumo<br />em aberto na mesa
                    </p>
                  </div>
                ) : (
                  pedidosPDV.map(p => (
                    <div key={p.id} className="bg-white border border-slate-200 p-2 rounded-sm shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Ordem #{p.id}</span>
                        <span className="font-black text-xs text-slate-800">R$ {p.total}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium uppercase leading-tight">
                        {p.itens.map(i => `${i.qtd}x ${i.nome}`).join(" | ")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Direita: PDV Pagamento */}
            <div className="w-1/2 flex flex-col bg-white">
              <div className="bg-emerald-600 px-4 py-3 flex justify-between items-center text-white">
                <h2 className="text-sm font-black uppercase tracking-widest">Fechamento</h2>
                <button onClick={() => setMesaPDV(null)} className="font-bold hover:text-emerald-200">X</button>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subtotal Consumido</span>
                    <span className="text-xl font-black text-slate-800">R$ {totalOriginal.toFixed(2).replace('.', ',')}</span>
                  </div>

                  {/* Solicitado pelo Cliente */}
                  {mesaPDV.status === "FECHANDO" && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-sm">
                      <span className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Pagamento Solicitado Pelo Cliente:</span>
                      <span className="text-sm font-black text-blue-800 uppercase">{mesaPDV.infoPagamento}</span>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Desconto (R$)</label>
                      <input type="text" value={desconto} onChange={(e) => setDesconto(formatarMoeda(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-sm font-bold text-red-600 outline-none focus:border-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Recebido (R$)</label>
                      <input type="text" value={valorRecebido} onChange={(e) => setValorRecebido(formatarMoeda(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-sm font-bold text-emerald-600 outline-none focus:border-emerald-500" />
                    </div>
                  </div>

                  <div className="bg-slate-800 text-white p-4 rounded-sm flex justify-between items-center mt-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Total a Cobrar</span>
                    <span className="text-3xl font-black text-emerald-400">R$ {totalCobrado.toFixed(2).replace('.', ',')}</span>
                  </div>

                  {troco > 0 && (
                    <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-sm mt-2">
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Troco do Cliente</span>
                      <span className="text-xl font-black text-amber-600">R$ {troco.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEncerrarConta}
                  disabled={isPending || (totalOriginal === 0 && mesaPDV.status !== "FECHANDO")}
                  className="w-full bg-emerald-600 text-white font-black py-4 text-sm uppercase tracking-widest rounded-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors mt-4"
                >
                  {isPending ? "ENCERRANDO..." : "ENCERRAR E LIBERAR MESA"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVA MESA RESTAURADO E COMPLETO */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-md w-full max-w-sm p-5 sm:p-6 shadow-2xl border border-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800 tracking-wide uppercase">
                Adicionar Mesa
              </h3>
            </div>

            <div className="mb-6">
              <label
                htmlFor="table-name"
                className="block text-xs font-bold text-slate-600 mb-1.5 uppercase"
              >
                Identificação da Mesa
              </label>
              <input
                id="table-name"
                type="text"
                placeholder="Ex: Mesa 01, Balcão..."
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium text-slate-800 uppercase placeholder:normal-case"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                O QR Code será gerado automaticamente.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 sm:py-2 bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTable}
                disabled={!newTableName.trim() || isPending}
                className="flex-[1.5] py-3 sm:py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                {isPending ? "Salvando..." : "Salvar Mesa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
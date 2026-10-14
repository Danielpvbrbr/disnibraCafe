"use client";

import { useState, useEffect, useTransition } from "react";
import { listarPedidosAtivos, concluirPedido } from "@/app/actions/pedidos";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Função para buscar os dados no banco
  const carregarPedidos = async () => {
    const dados = await listarPedidosAtivos();
    setPedidos(dados);
    setIsLoading(false);
  };

  useEffect(() => {
    // 1. Carrega imediatamente ao abrir a tela
    carregarPedidos();

    // 2. Configura o "Radar" (Polling) para buscar novos pedidos a cada 5 segundos
    const intervalo = setInterval(() => {
      carregarPedidos();
    }, 5000);

    // 3. Limpa o radar se o usuário mudar de tela (para não pesar a memória)
    return () => clearInterval(intervalo);
  }, []);

  const finalizarPedido = (id) => {
    // Atualização Otimista: Tira o pedido da tela instantaneamente para o usuário
    setPedidos((prev) => prev.filter((p) => p.id !== id));

    // Manda a ordem pro banco em segundo plano
    startTransition(async () => {
      await concluirPedido(id);
    });
  };

  // Função para formatar a data que vem do Postgres ("2023-10-14T14:25:00.000Z" -> "14:25")
  const formatarHorario = (dataString) => {
    if (!dataString) return "--:--";
    const data = new Date(dataString);
    return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      
      {/* Header Compacto Estilo Barra de Ferramentas */}
      <div className="mb-4 flex items-end justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">
            FILA DE PRODUÇÃO
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider flex items-center gap-2">
            Pedidos Ativos
            {!isLoading && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </p>
        </div>
        
        <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-sm text-sm font-bold flex items-center gap-2">
          {pedidos.length} PENDENTES
        </div>
      </div>

      {/* Grid Ultramacompacta */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-slate-300 rounded-md bg-slate-100 shadow-inner">
          <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Sincronizando Cozinha...
          </p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-slate-300 rounded-md bg-slate-100 shadow-inner">
          <p className="text-slate-500 font-semibold text-lg">NENHUM PEDIDO NA FILA</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 items-start content-start">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white border border-slate-300 rounded-md shadow-sm flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]"
            >
              {/* Header do Card - Estilo Título de Janela */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-800 text-white border-b border-slate-900">
                <h3 className="text-base font-bold tracking-wide uppercase truncate pr-2">
                  {pedido.mesa}
                </h3>
                <div className="font-mono text-xs text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                  {formatarHorario(pedido.criadoEm)}
                </div>
              </div>

              {/* Lista de Itens com divide-y (Linhas de Tabela) */}
              <div className="flex-1 overflow-y-auto max-h-[35vh] divide-y divide-slate-100 bg-slate-50/50">
                {pedido.itens.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 px-3 py-2 hover:bg-slate-100 transition-colors">
                    <div className="flex-shrink-0 bg-blue-100 text-blue-800 text-xs font-black px-1.5 py-0.5 rounded-sm min-w-[28px] text-center mt-0.5">
                      {item.qtd}x
                    </div>
                    <span className="text-sm font-semibold text-slate-700 leading-tight uppercase">
                      {item.nome}
                    </span>
                  </div>
                ))}
              </div>

              {/* Botão de Ação - Largo, Seco e Direto */}
              <button
                onClick={() => finalizarPedido(pedido.id)}
                disabled={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Concluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
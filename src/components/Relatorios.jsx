"use client";

import { useState, useEffect } from "react";
import { obterRelatorioGeral } from "@/app/actions/relatorios";

export default function Relatorios() {
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const dados = await obterRelatorioGeral();
    setHistorico(dados);
    setIsLoading(false);
  };

  // Cálculos do Dashboard
  // Consideramos FEITOS os que estão CONCLUIDO (entregue) ou PAGO (já fechado no caixa)
  const pedidosFeitos = historico.filter(p => p.status === "CONCLUIDO" || p.status === "PAGO");
  const pedidosCancelados = historico.filter(p => p.status === "CANCELADO");
  
  // Calcula Faturamento Bruto (Apenas pedidos feitos)
  const faturamento = pedidosFeitos.reduce((acc, p) => acc + Number(p.total), 0);

  const formatarData = (dataString) => {
    if (!dataString) return "--/--/---- --:--";
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR", { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: "2-digit", minute: "2-digit" 
    });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">
            RELATÓRIO DE VENDAS
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">
            Visão Geral de Pedidos
          </p>
        </div>
        <button onClick={carregarDados} className="bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-sm hover:bg-slate-300 transition-colors uppercase flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar Dados
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Calculando métricas...</p>
        </div>
      ) : (
        <>
          {/* CARDS DE RESUMO (DASHBOARD) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            
            {/* Card Faturamento */}
            <div className="bg-white border border-slate-300 p-4 rounded-sm shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Faturamento Bruto</span>
              <span className="text-3xl font-black text-emerald-600">R$ {faturamento.toFixed(2).replace('.', ',')}</span>
            </div>

            {/* Card Pedidos Feitos */}
            <div className="bg-white border border-slate-300 p-4 rounded-sm shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pedidos Feitos</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-blue-600">{pedidosFeitos.length}</span>
                <span className="text-xs font-bold text-slate-400 uppercase mb-1.5">Ordens</span>
              </div>
            </div>

            {/* Card Cancelados */}
            <div className="bg-white border border-slate-300 p-4 rounded-sm shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Cancelamentos</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-red-600">{pedidosCancelados.length}</span>
                <span className="text-xs font-bold text-slate-400 uppercase mb-1.5">Ordens</span>
              </div>
            </div>
            
          </div>

          {/* TABELA DE HISTÓRICO (Densa, Estilo Sistema Industrial) */}
          <div className="flex-1 bg-white border border-slate-300 rounded-sm shadow-sm flex flex-col overflow-hidden">
            <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center border-b border-slate-900">
              <h3 className="text-sm font-bold uppercase tracking-widest">Histórico Completo</h3>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-300 shadow-sm">
                  <tr>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider w-16">ID</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider w-40">Data / Hora</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider w-32">Origem</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Itens Consumidos</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider w-32">Status</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right w-32">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {historico.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-bold uppercase text-xs">
                        Nenhum pedido registrado no sistema
                      </td>
                    </tr>
                  ) : (
                    historico.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 text-xs font-black text-slate-400">#{pedido.id}</td>
                        <td className="py-2.5 px-4 text-xs font-bold text-slate-700">{formatarData(pedido.criadoEm)}</td>
                        <td className="py-2.5 px-4 text-xs font-bold text-slate-900 uppercase">{pedido.mesa}</td>
                        <td className="py-2.5 px-4 text-[11px] font-medium text-slate-600 uppercase">
                          {pedido.itens.map(i => `${i.qtd}x ${i.nome}`).join(", ")}
                        </td>
                        <td className="py-2.5 px-4">
                          {pedido.status === "CONCLUIDO" && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Entregue</span>}
                          {pedido.status === "PAGO" && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Pago</span>}
                          {pedido.status === "CANCELADO" && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Cancelado</span>}
                          {pedido.status === "PENDENTE" && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Pendente</span>}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-black text-slate-800 text-right">
                          R$ {pedido.total.replace('.', ',')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
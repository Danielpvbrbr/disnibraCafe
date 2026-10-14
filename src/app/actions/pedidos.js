"use server";

import { db } from "@/db";
import { pedidos } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm"; 

// MÁGICA AQUI: Garante que o JSON do banco sempre chegue como Lista (Array) no frontend
const formatarItens = (itens) => {
  if (typeof itens === 'string') return JSON.parse(itens);
  if (!itens) return [];
  return itens;
};

export async function criarPedido(mesa, total, itens) {
  try {
    await db.insert(pedidos).values({
      mesa,
      total: total.toString(),
      itens,
    });
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao registrar pedido:", error);
    return { sucesso: false, erro: "Falha na comunicação com a cozinha." };
  }
}

export async function listarPedidosAtivos() {
  try {
    const resultado = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.status, "PENDENTE"))
      .orderBy(asc(pedidos.criadoEm)); 
      
    // Aplica a formatação antes de enviar para a Cozinha
    return resultado.map(p => ({ ...p, itens: formatarItens(p.itens) }));
  } catch (error) {
    return [];
  }
}

export async function concluirPedido(id) {
  try {
    await db.update(pedidos).set({ status: "CONCLUIDO" }).where(eq(pedidos.id, id));
    return { sucesso: true };
  } catch (error) {
    return { sucesso: false };
  }
}

export async function listarPedidosDaMesa(mesa) {
  try {
    const resultado = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.mesa, mesa))
      .orderBy(desc(pedidos.criadoEm)); 
      
    // Aplica a formatação antes de enviar para o Cliente e para o Salão (Garçom)
    return resultado.map(p => ({ ...p, itens: formatarItens(p.itens) }));
  } catch (error) {
    return [];
  }
}

export async function cancelarPedido(id) {
  try {
    await db.update(pedidos).set({ status: "CANCELADO" }).where(eq(pedidos.id, id));
    return { sucesso: true };
  } catch (error) {
    return { sucesso: false, erro: "Não foi possível cancelar." };
  }
}
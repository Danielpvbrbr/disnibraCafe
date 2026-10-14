"use server";

import { db } from "@/db";
import { mesas, pedidos } from "@/db/schema";
import { desc, eq, and, ne } from "drizzle-orm";

export async function criarMesa(nome) {
  try {
    await db.insert(mesas).values({ nome });
    return { sucesso: true };
  } catch (error) {
    return { sucesso: false, erro: "Falha ao salvar a mesa." };
  }
}

export async function listarMesas() {
  try {
    return await db.select().from(mesas).orderBy(desc(mesas.id));
  } catch (error) {
    return [];
  }
}

// NOVA FUNÇÃO: Busca o nome exato da mesa pelo ID para o celular do cliente
export async function buscarMesaPorId(id) {
  try {
    const resultado = await db.select().from(mesas).where(eq(mesas.id, Number(id)));
    return resultado[0] || null;
  } catch (error) {
    return null;
  }
}

export async function solicitarFechamento(idMesa, formasPagamento) {
  try {
    await db.update(mesas)
      .set({ status: "FECHANDO", infoPagamento: formasPagamento })
      .where(eq(mesas.id, idMesa));
    return { sucesso: true };
  } catch (error) {
    return { sucesso: false };
  }
}

export async function fecharContaMesa(idMesa, nomeMesa) {
  try {
    await db.update(pedidos)
      .set({ status: "PAGO" })
      .where(and(eq(pedidos.mesa, nomeMesa), ne(pedidos.status, "CANCELADO")));
      
    await db.update(mesas)
      .set({ status: "ABERTA", infoPagamento: null })
      .where(eq(mesas.id, idMesa));
      
    return { sucesso: true };
  } catch (error) {
    return { sucesso: false, erro: "Erro ao fechar a conta." };
  }
}
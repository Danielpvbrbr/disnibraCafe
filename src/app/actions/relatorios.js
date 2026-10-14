"use server";

import { db } from "@/db";
import { pedidos } from "@/db/schema";
import { desc } from "drizzle-orm";

const formatarItens = (itens) => {
  if (typeof itens === 'string') return JSON.parse(itens);
  if (!itens) return [];
  return itens;
};

export async function obterRelatorioGeral() {
  try {
    // Busca todos os pedidos, do mais recente para o mais antigo
    const resultado = await db.select().from(pedidos).orderBy(desc(pedidos.criadoEm));
    
    return resultado.map(p => ({ ...p, itens: formatarItens(p.itens) }));
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    return [];
  }
}
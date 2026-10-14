"use server";

import { db } from "@/db";
import { produtos } from "@/db/schema";
import { desc, eq } from "drizzle-orm"; // Adicionamos o 'eq' aqui

export async function criarProduto(nome, preco, descricao, foto) {
  try {
    await db.insert(produtos).values({
      nome,
      preco,
      descricao,
      foto,
    });
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    return { sucesso: false, erro: "Falha ao salvar no banco de dados." };
  }
}

// NOVA FUNÇÃO: Atualizar o produto existente
export async function atualizarProduto(id, nome, preco, descricao, foto) {
  try {
    await db
      .update(produtos)
      .set({
        nome,
        preco,
        descricao,
        foto,
      })
      .where(eq(produtos.id, id)); // Onde o ID do banco for igual ao ID passado
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return { sucesso: false, erro: "Falha ao atualizar no banco de dados." };
  }
}

export async function listarProdutos() {
  try {
    const resultado = await db.select().from(produtos).orderBy(desc(produtos.id));
    return resultado;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}
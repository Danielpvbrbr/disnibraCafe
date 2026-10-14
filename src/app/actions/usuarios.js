"use server";

import { db } from "@/db";
import { usuarios } from "@/db/schema";

export async function criarUsuario(nome, email, senha) {
  try {
    await db.insert(usuarios).values({
      nome,
      email,
      senha,
    });
    
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    // O erro mais comum aqui será tentar cadastrar um email que já existe (unique)
    return { sucesso: false, erro: "Não foi possível cadastrar. Verifique se o e-mail já está em uso." };
  }
}
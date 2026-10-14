"use server";

import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { eq, or } from "drizzle-orm"; // <-- Importamos o 'or' aqui

export async function validarLogin(identificador, senha) {
  try {
    const resultado = await db
      .select()
      .from(usuarios)
      .where(
        // Busca tanto pela coluna email QUANTO pela coluna nome
        or(
          eq(usuarios.email, identificador),
          eq(usuarios.nome, identificador)
        )
      )
      .limit(1);

    const usuario = resultado[0];

    // Se achou o usuário (por e-mail ou nome) e a senha bateu
    if (usuario && usuario.senha === senha) {
      return { sucesso: true, nome: usuario.nome };
    }

    return { sucesso: false, erro: "Usuário ou senha incorretos. Acesso negado." };
  } catch (error) {
    console.error("Erro no banco:", error);
    return { sucesso: false, erro: "Erro ao conectar com o servidor." };
  }
}
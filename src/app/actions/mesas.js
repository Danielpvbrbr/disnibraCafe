"use server";

import { db } from "@/db";
import { mesas, pedidos } from "@/db/schema";
import { desc, eq, and, ne } from "drizzle-orm";

export async function criarMesa(nome) {
  try {
    await db.insert(mesas).values({ nome, status: "LIVRE" });
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

export async function buscarMesaPorId(id) {
  try {
    const resultado = await db.select().from(mesas).where(eq(mesas.id, Number(id)));
    return resultado[0] || null;
  } catch (error) {
    return null;
  }
}

// 1. Primeiro cliente (ou garçom) abre a mesa com Nome e Telefone
export async function ocuparMesa(idMesa, nomeCliente, telefoneCliente) {
  try {
    const apenasNumeros = telefoneCliente.replace(/\D/g, "");
    if (apenasNumeros.length < 8) {
      return { sucesso: false, erro: "Informe um telefone válido com pelo menos 8 dígitos." };
    }

    await db.update(mesas)
      .set({ 
        status: "OCUPADA", 
        clienteNome: nomeCliente.trim(), 
        clienteTelefone: apenasNumeros 
      })
      .where(eq(mesas.id, Number(idMesa)));

    const pin = apenasNumeros.slice(-4);
    return { sucesso: true, pin };
  } catch (error) {
    return { sucesso: false, erro: "Erro ao abrir mesa." };
  }
}

// 2. Segundo aparelho na mesa valida acesso usando os 4 últimos dígitos
export async function validarAcessoMesa(idMesa, digitos) {
  try {
    const mesa = await buscarMesaPorId(idMesa);
    if (!mesa || !mesa.clienteTelefone) {
      return { sucesso: false, erro: "Esta mesa não está ocupada." };
    }

    const ultimos4 = mesa.clienteTelefone.slice(-4);
    if (ultimos4 === digitos.trim()) {
      return { sucesso: true, pin: ultimos4 };
    }
    return { sucesso: false, erro: "Código incorreto! Verifique os 4 últimos dígitos." };
  } catch (error) {
    return { sucesso: false, erro: "Erro ao validar acesso." };
  }
}

// 3. Cliente pede a conta pelo celular
export async function solicitarFechamento(idMesa, formasPagamento) {
  try {
    await db.update(mesas)
      .set({ status: "FECHANDO", infoPagamento: formasPagamento })
      .where(eq(mesas.id, Number(idMesa)));
    return { sucesso: true };
  } catch (error) {
    return { sucesso: false };
  }
}

// 4. Garçom fecha a conta no PDV (Marca pedidos como PAGO e libera a mesa)
export async function fecharContaMesa(idMesa, nomeMesa) {
  try {
    await db.update(pedidos)
      .set({ status: "PAGO" })
      .where(and(eq(pedidos.mesa, nomeMesa), ne(pedidos.status, "CANCELADO")));
      
    await db.update(mesas)
      .set({ 
        status: "LIVRE", 
        infoPagamento: null,
        clienteNome: null,
        clienteTelefone: null
      })
      .where(eq(mesas.id, Number(idMesa)));
      
    return { sucesso: true };
  } catch (error) {
    return { sucesso: false, erro: "Erro ao fechar a conta." };
  }
}

// 5. Garçom limpa/desocupa a mesa sem cobrar (expulsa curioso e cancela pendentes)
export async function limparMesaForcado(idMesa, nomeMesa) {
  try {
    await db.update(pedidos)
      .set({ status: "CANCELADO" })
      .where(and(eq(pedidos.mesa, nomeMesa), eq(pedidos.status, "PENDENTE")));

    await db.update(mesas)
      .set({ 
        status: "LIVRE", 
        infoPagamento: null,
        clienteNome: null,
        clienteTelefone: null
      })
      .where(eq(mesas.id, Number(idMesa)));

    return { sucesso: true };
  } catch (error) {
    return { sucesso: false, erro: "Erro ao liberar a mesa." };
  }
}
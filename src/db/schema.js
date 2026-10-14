import { pgTable, serial, varchar, text, json, timestamp } from "drizzle-orm/pg-core";

export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha: text("senha").notNull(), // Em produção, lembre-se de usar bcrypt para hashear!
});

// Tabela de Produtos (Cardápio)
export const produtos = pgTable("produtos", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  preco: varchar("preco", { length: 50 }).notNull(),
  descricao: text("descricao"), // NOVO CAMPO ADICIONADO AQUI
  foto: text("foto"),
});

export const mesas = pgTable("mesas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("LIVRE").notNull(),
  clienteNome: varchar("cliente_nome", { length: 255 }), // <-- Confirme se tem esta linha
  clienteTelefone: varchar("cliente_telefone", { length: 50 }), // <-- E esta linha
  infoPagamento: varchar("info_pagamento", { length: 255 }),
});

export const pedidos = pgTable("pedidos", {
  id: serial("id").primaryKey(),
  mesa: varchar("mesa", { length: 100 }).notNull(),
  total: varchar("total", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("PENDENTE").notNull(), // PENDENTE, CONCLUIDO, CANCELADO, PAGO
  itens: json("itens").notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
});
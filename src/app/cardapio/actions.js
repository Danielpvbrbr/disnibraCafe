"use server";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function salvarProduto(formData) {
  const nome = formData.get('nome');
  const preco = parseFloat(formData.get('preco').replace(',', '.'));
  const foto = formData.get('foto');

  await prisma.produto.create({
    data: { nome, preco, foto }
  });

  revalidatePath('/cardapio'); // Atualiza a tela na hora
}
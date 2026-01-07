"use client";

import { useState } from "react";
import * as S from "./styles";

export default function Pedidos() {
  // Estado para gerenciar os pedidos (Simulando o que viria do banco de dados)
  const [pedidos, setPedidos] = useState([
    {
      id: 1,
      mesa: "Mesa 01",
      horario: "14:25",
      itens: [
        { nome: "Cappuccino Avelã", qtd: 1 },
        { nome: "Torta de Frutas Vermelhas", qtd: 1 },
        { nome: "Pão de Queijo Recheado", qtd: 2 }
      ]
    },
    {
      id: 2,
      mesa: "Mesa 02",
      horario: "14:30",
      itens: [
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 1 }
      ]
    },
    {
      id: 3,
      mesa: "Mesa 03",
      horario: "14:30",
      itens: [
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 1 }
      ]
    },
    {
      id: 4,
      mesa: "Mesa 06",
      horario: "14:30",
      itens: [
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 1 }
      ]
    },
    {
      id: 5,
      mesa: "Mesa 08",
      horario: "14:30",
      itens: [
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 3 },
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 3 },
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 3 },
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 3 },
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 3 },
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 3 },
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 3 },
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 3 }
      ]
    },
    {
      id: 6,
      mesa: "Mesa 10",
      horario: "14:30",
      itens: [
        { nome: "Expresso Tradicional", qtd: 3 },
        { nome: "Bolo de Cenoura", qtd: 1 }
      ]
    }
  ]);


  const finalizarPedido = (id) => {
    setPedidos(pedidos.filter(p => p.id !== id));
  };

  return (
    <S.Container>
      <S.Header>
        <S.TitleGroup>
          <h1>Cozinha / <span>Pedidos</span></h1>
          <p>Pedidos recebidos via QR Code em tempo real.</p>
        </S.TitleGroup>
      </S.Header>

      <S.Grid>
        {pedidos.map((pedido) => (
          <S.OrderCard key={pedido.id}>
            <S.OrderHeader>
              <div className="mesa-info">
                <span>Local</span>
                <h3>{pedido.mesa}</h3>
              </div>
              <div className="time">{pedido.horario}</div>
            </S.OrderHeader>

            <S.ItemsList>
              {pedido.itens.map((item, idx) => (
                <S.ItemRow key={idx}>
                  <div className="qty">{item.qtd}</div>
                  <div className="name">{item.nome}</div>
                </S.ItemRow>
              ))}
            </S.ItemsList>

            <S.OrderFooter>
              <S.DoneButton onClick={() => finalizarPedido(pedido.id)}>
                Marcar como Pronto
              </S.DoneButton>
            </S.OrderFooter>
          </S.OrderCard>
        ))}

        {pedidos.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: '#f4f4f5', borderRadius: '32px', color: '#a1a1aa', border: '2px dashed #e4e4e7' }}>
            <h2 style={{ fontWeight: 900, color: '#d4d4d8' }}>Nenhum pedido pendente</h2>
            <p>Relaxe, a cozinha está em dia!</p>
          </div>
        )}
      </S.Grid>
    </S.Container>
  );
}
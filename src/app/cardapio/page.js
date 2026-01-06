"use client";
import { useState } from "react";
import * as S from "./styles";

export default function Cardapio() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtos, setProdutos] = useState([
    { id: 1, nome: "Café Latte", preco: "12,00", foto: null, emoji: "☕" },
    { id: 2, nome: "Pão de Queijo", preco: "6,00", foto: null, emoji: "🧀" },
  ]);

  const [novoItem, setNovoItem] = useState({ nome: "", preco: "", foto: null });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovoItem({ ...novoItem, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!novoItem.nome || !novoItem.preco) return;
    setProdutos([...produtos, { ...novoItem, id: Date.now() }]);
    setNovoItem({ nome: "", preco: "", foto: null });
    setIsModalOpen(false);
  };

  const formatarMoeda = (valor) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, "");
    // Formata como moeda (divindo por 100 para ter as casas decimais)
    return (Number(apenasNumeros) / 100).toLocaleString("pt-BR", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <S.Container>
      <S.Header>
        <h1>Menu de <span>Produtos</span></h1>
        <S.AddButtonCircle onClick={() => setIsModalOpen(true)}>+</S.AddButtonCircle>
      </S.Header>

      <S.ProductGrid>
        {produtos.map((item) => (
          <S.ProductCard key={item.id}>
            <S.ImageContainer>
              {item.foto ? (
                <img src={item.foto} alt={item.nome} />
              ) : (
                <span>{item.emoji || "☕"}</span>
              )}
            </S.ImageContainer>
            <S.MiniInfo>
              <h3>{item.nome}</h3>
              <span>R$ {item.preco}</span>
            </S.MiniInfo>
          </S.ProductCard>
        ))}
      </S.ProductGrid>

      {isModalOpen && (
        <S.ModalOverlay onClick={() => setIsModalOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', fontWeight: 900, fontSize: '20px' }}>
              Novo Item
            </h3>

            <S.FileInput>
              <label htmlFor="foto-upload">
                {novoItem.foto ? "Foto Selecionada" : "Adicionar Foto"}
              </label>
              <input id="foto-upload" type="file" accept="image/*" onChange={handleFileChange} />
            </S.FileInput>

            <S.InputGroup>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#ff6b00', marginBottom: '5px', display: 'block' }}>
                NOME DO PRODUTO
              </label>
              <S.Input
                placeholder="Ex: Cappuccino"
                value={novoItem.nome}
                maxLength={100}
                onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
              />
            </S.InputGroup>

            <S.InputRow>
              <S.InputGroup style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#ff6b00', marginBottom: '5px', display: 'block' }}>
                  PREÇO
                </label>
                <S.PrecoWrapper>
                  <S.Input
                    placeholder="0,00"
                    value={novoItem.preco}
                    onChange={(e) => setNovoItem({
                      ...novoItem,
                      preco: formatarMoeda(e.target.value)
                    })}
                    inputMode="numeric"
                  />
                </S.PrecoWrapper>
              </S.InputGroup>

              <div style={{ flex: 1 }} />
            </S.InputRow>

            <S.AddButtonCircle
              style={{
                width: '100%',
                borderRadius: '16px',
                fontSize: '14px',
                marginTop: "20px",
                height: '50px'
              }}
              onClick={handleAddProduct}
            >
              Salvar no Cardápio
            </S.AddButtonCircle>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
}
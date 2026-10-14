"use client";

import { useState, useEffect, useTransition } from "react";
import { criarProduto, atualizarProduto, listarProdutos } from "@/app/actions/produtos";

export default function Cardapio() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // NOVO: Guarda o ID do produto que estamos editando (se for null, estamos criando um novo)
  const [editandoId, setEditandoId] = useState(null);

  const [itemForm, setItemForm] = useState({
    nome: "",
    preco: "",
    descricao: "",
    foto: null,
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    const dados = await listarProdutos();
    setProdutos(dados);
    setIsLoading(false);
  };

  const comprimirImagem = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          const base64 = canvas.toDataURL("image/jpeg", 0.6);
          resolve(base64);
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64Comprimido = await comprimirImagem(file);
      setItemForm({ ...itemForm, foto: base64Comprimido });
    }
  };

  // Prepara o modal para CRIAR um novo produto
  const abrirModalNovo = () => {
    setEditandoId(null);
    setItemForm({ nome: "", preco: "", descricao: "", foto: null });
    setIsModalOpen(true);
  };

  // Prepara o modal para EDITAR um produto existente
  const abrirModalEditar = (produto) => {
    setEditandoId(produto.id);
    setItemForm({
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao || "",
      foto: produto.foto,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!itemForm.nome.trim() || !itemForm.preco) return;

    startTransition(async () => {
      let resposta;

      // Se tiver editandoId, chama a função de ATUALIZAR, senão, chama a de CRIAR
      if (editandoId) {
        resposta = await atualizarProduto(editandoId, itemForm.nome, itemForm.preco, itemForm.descricao, itemForm.foto);
      } else {
        resposta = await criarProduto(itemForm.nome, itemForm.preco, itemForm.descricao, itemForm.foto);
      }
      
      if (resposta.sucesso) {
        setItemForm({ nome: "", preco: "", descricao: "", foto: null });
        setEditandoId(null);
        setIsModalOpen(false);
        carregarProdutos();
      } else {
        alert(resposta.erro);
      }
    });
  };

  const formatarMoeda = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return (Number(apenasNumeros) / 100).toLocaleString("pt-BR", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex items-end justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">
            CATÁLOGO DE PRODUTOS
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">
            Gerenciamento de Cardápio
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-sm hover:bg-blue-700 transition-colors flex items-center gap-2 uppercase tracking-wide"
        >
          <span className="text-base leading-none font-black">+</span>
          Novo
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Carregando produtos...
          </p>
        </div>
      ) : produtos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-slate-300 rounded-md bg-slate-100 shadow-inner">
          <p className="text-slate-500 font-semibold text-lg">CATÁLOGO VAZIO</p>
          <button
            onClick={abrirModalNovo}
            className="mt-3 bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-sm hover:bg-slate-900 transition-colors uppercase"
          >
            Adicionar Primeiro Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 items-start content-start">
          {produtos.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-300 rounded-md flex items-center gap-3 p-2 hover:border-blue-400 hover:shadow-sm transition-all group relative"
            >
              <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.foto ? (
                  <img
                    src={item.foto}
                    alt={item.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl leading-none">☕</span>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">
                  {item.nome}
                </h3>
                {item.descricao && (
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {item.descricao}
                  </p>
                )}
                <p className="text-sm font-black text-emerald-600 mt-0.5 leading-none">
                  R$ {item.preco}
                </p>
              </div>

              {/* Botão de Editar explícito e direto ao ponto */}
              <button 
                onClick={() => abrirModalEditar(item)}
                title="Editar Produto"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-md w-full max-w-md p-6 shadow-2xl border border-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800 tracking-wide uppercase">
                {editandoId ? "Editar Produto" : "Cadastrar Produto"}
              </h3>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
                Imagem do Produto
              </label>
              <label
                htmlFor="foto-upload"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-sm cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors bg-slate-50"
              >
                {itemForm.foto ? (
                  <img
                    src={itemForm.foto}
                    alt="Preview"
                    className="h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      + Clique para Selecionar
                    </p>
                  </div>
                )}
                <input
                  id="foto-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
                Nome do Produto
              </label>
              <input
                type="text"
                placeholder="Ex: Cappuccino Avelã"
                value={itemForm.nome}
                maxLength={100}
                onChange={(e) =>
                  setItemForm({ ...itemForm, nome: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium text-slate-800"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
                Descrição (Opcional)
              </label>
              <textarea
                placeholder="Ex: Leite vaporizado, espresso e xarope de avelã..."
                value={itemForm.descricao}
                maxLength={150}
                onChange={(e) =>
                  setItemForm({ ...itemForm, descricao: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium text-slate-800 resize-none h-16"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
                Preço de Venda
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  placeholder="0,00"
                  value={itemForm.preco}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      preco: formatarMoeda(e.target.value),
                    })
                  }
                  inputMode="numeric"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={!itemForm.nome.trim() || !itemForm.preco || isPending}
                className="flex-[2] py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                {isPending ? "Salvando..." : (editandoId ? "Atualizar Produto" : "Salvar Cadastro")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
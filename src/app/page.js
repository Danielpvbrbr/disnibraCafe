"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Pedidos from "@/components/Pedidos";
import Salao from "@/components/Salao";
import Cardapio from "@/components/Cardapio";
import Login from "@/components/Login";
import Cadastro from "@/components/Cadastro";

export default function App() {
  const [isAutenticado, setIsAutenticado] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Controla o "piscar" da tela
  const [telaAtiva, setTelaAtiva] = useState("pedidos");
  const [exibirCadastro, setExibirCadastro] = useState(false);

  // 1. Ao abrir o site, verifica se o usuário tem o cookie salvo
  useEffect(() => {
    const verificarCookie = () => {
      const cookies = document.cookie.split(';');
      // Procura pelo nosso cookie específico
      const temCookie = cookies.some(c => c.trim().startsWith('disnibra_auth='));

      if (temCookie) {
        setIsAutenticado(true);
      }
      setIsLoadingAuth(false);
    };

    verificarCookie();
  }, []);

  // 2. Quando logar com sucesso, grava o cookie
  const handleLogin = (nomeUsuario) => {
    // max-age=86400 equivale a 24 horas (60s * 60m * 24h)
    document.cookie = `disnibra_auth=${encodeURIComponent(nomeUsuario)}; max-age=86400; path=/`;
    setIsAutenticado(true);
  };

  // 3. Função para deslogar (apagamos o cookie definindo max-age=0)
  const handleLogout = () => {
    document.cookie = "disnibra_auth=; max-age=0; path=/";
    setIsAutenticado(false);
  };

  // Tela de carregamento escurecida enquanto verifica o cookie
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">
          Autenticando...
        </span>
      </div>
    );
  }

  // Roteamento se não estiver logado
  if (!isAutenticado) {
    if (exibirCadastro) {
      return <Cadastro onVoltar={() => setExibirCadastro(false)} />;
    }

    return (
      <div className="relative">
        {/* Passamos o handleLogin para o componente Login */}
        <Login onLogin={handleLogin} />

        <button
          onClick={() => setExibirCadastro(true)}
          className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
        >
          Criar Primeiro Usuário
        </button>
      </div>
    );
  }

  // Se estiver logado, renderiza o sistema interno
  const renderizarTela = () => {
    switch (telaAtiva) {
      case "pedidos": return <Pedidos />;
      case "salao": return <Salao />;
      case "cardapio": return <Cardapio />;
      case "relatorios": return <Relatorios />;
      default: return <Pedidos />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* Passamos o handleLogout para a Sidebar ter o botão de sair */}
      <Sidebar
        telaAtiva={telaAtiva}
        setTelaAtiva={setTelaAtiva}
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-24 h-screen overflow-y-auto">
        <div className="min-h-screen">
          {renderizarTela()}
        </div>
      </main>
    </div>
  );
}
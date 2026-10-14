"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Pedidos from "@/components/Pedidos";
import Salao from "@/components/Salao";
import Cardapio from "@/components/Cardapio";
import Relatorios from "@/components/Relatorios";
import Login from "@/components/Login";
import Cadastro from "@/components/Cadastro";

export default function App() {
  const [isAutenticado, setIsAutenticado] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState(""); // NOVO: Guarda o nome do logado
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [telaAtiva, setTelaAtiva] = useState("pedidos");
  const [exibirCadastro, setExibirCadastro] = useState(false);

  useEffect(() => {
    const verificarCookie = () => {
      const cookies = document.cookie.split(';');
      const cookieAuth = cookies.find(c => c.trim().startsWith('disnibra_auth='));

      if (cookieAuth) {
        // Extrai o nome decodificando o texto do cookie
        const nome = decodeURIComponent(cookieAuth.split('=')[1]);
        setNomeUsuario(nome);
        setIsAutenticado(true);
      }
      setIsLoadingAuth(false);
    };

    verificarCookie();
  }, []);

  const handleLogin = (nomeLogin) => {
    document.cookie = `disnibra_auth=${encodeURIComponent(nomeLogin)}; max-age=86400; path=/`;
    setNomeUsuario(nomeLogin);
    setIsAutenticado(true);
  };

  const handleLogout = () => {
    document.cookie = "disnibra_auth=; max-age=0; path=/";
    setNomeUsuario("");
    setIsAutenticado(false);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">
          Autenticando...
        </span>
      </div>
    );
  }
  if (!isAutenticado) {//admin123
    if (exibirCadastro) {
      return <Cadastro onVoltar={() => setExibirCadastro(false)} />;
    }

    return (
      <div className="relative">
        {/* Passamos o onAbrirCadastro para o componente de Login */}
        <Login
          onLogin={handleLogin}
          onAbrirCadastro={() => setExibirCadastro(true)}
        />
      </div>
    );
  }

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
      <Sidebar
        telaAtiva={telaAtiva}
        setTelaAtiva={setTelaAtiva}
        onLogout={handleLogout}
        nomeUsuario={nomeUsuario} // MANDANDO O NOME PARA A SIDEBAR
      />

      <main className="flex-1 ml-24 h-screen overflow-y-auto">
        <div className="min-h-screen">
          {renderizarTela()}
        </div>
      </main>
    </div>
  );
}
"use client";

import { useState, useTransition, useRef } from "react";
import { validarLogin } from "@/app/actions/auth";

export default function Login({ onLogin, onAbrirCadastro }) {
  const [identificador, setIdentificador] = useState(""); 
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isPending, startTransition] = useTransition();

  // Estados do clique triplo secreto para cadastro na tela de login
  const [cliquesLogo, setCliquesLogo] = useState(0);
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);
  const [senhaMestre, setSenhaMestre] = useState("");
  const timeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");

    startTransition(async () => {
      const resposta = await validarLogin(identificador, senha);

      if (resposta.sucesso) {
        onLogin(resposta.nome);
      } else {
        setErro(resposta.erro);
      }
    });
  };

  // Clique triplo no título da tela de login
  const handleLogoClick = () => {
    const novosCliques = cliquesLogo + 1;
    setCliquesLogo(novosCliques);

    if (novosCliques === 3) {
      setCliquesLogo(0);
      setMostrarModalSenha(true);
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCliquesLogo(0);
    }, 1000);
  };

  const verificarSenhaMestre = (e) => {
    e.preventDefault();
    if (senhaMestre === "admin123") {
      setMostrarModalSenha(false);
      setSenhaMestre("");
      onAbrirCadastro(); // Abre a tela de cadastro
    } else {
      alert("Senha mestre incorreta!");
      setSenhaMestre("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative">
      <div className="w-full max-w-sm bg-white rounded-md shadow-2xl overflow-hidden">
        
        {/* Cabeçalho de Login com clique triplo secreto no título */}
        <div 
          onClick={handleLogoClick}
          title="Painel de Gestão"
          className="bg-slate-800 p-6 flex flex-col items-center border-b-4 border-blue-600 cursor-pointer select-none group"
        >
          <div className="w-14 h-14 bg-blue-600 text-white rounded-sm flex items-center justify-center shadow-md mb-4 group-hover:bg-blue-500 transition-colors">
            <span className="font-black text-lg tracking-tighter">GP</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide uppercase group-hover:text-blue-300 transition-colors">
            GestorPedidos
          </h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
            Painel de Acesso
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Usuário / E-mail
            </label>
            <input
              type="text"
              placeholder="Digite nome ou e-mail"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium text-slate-800"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Senha de Acesso
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium text-slate-800"
            />
          </div>

          {erro && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-sm text-center uppercase tracking-wide">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={!identificador || !senha || isPending}
            className="w-full bg-blue-600 text-white text-sm font-bold px-4 py-3 rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors uppercase tracking-wider shadow-sm"
          >
            {isPending ? "Autenticando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Acesso Restrito a Funcionários
          </p>
        </div>
      </div>

      {/* MODAL DE SENHA MESTRE SECRETO NA TELA DE LOGIN */}
      {mostrarModalSenha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-sm w-full max-w-xs p-5 shadow-2xl border border-slate-300">
            <div className="mb-4 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Criar Novo Operador
              </h3>
            </div>
            
            <form onSubmit={verificarSenhaMestre}>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Digite a senha mestre:</p>
              <input 
                type="password"
                placeholder="••••••••"
                value={senhaMestre}
                onChange={(e) => setSenhaMestre(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm outline-none focus:border-blue-600 mb-4 font-bold text-slate-800"
              />
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setMostrarModalSenha(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 text-xs font-bold uppercase rounded-sm hover:bg-slate-300"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white py-2 text-xs font-bold uppercase rounded-sm hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
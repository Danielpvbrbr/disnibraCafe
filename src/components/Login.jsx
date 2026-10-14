"use client";

import { useState, useTransition } from "react";
import { validarLogin } from "@/app/actions/auth";

export default function Login({ onLogin }) {
  // Mudamos de email para identificador
  const [identificador, setIdentificador] = useState(""); 
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");

    startTransition(async () => {
      // Passamos o identificador (que pode ser João Silva ou joao@email.com)
      const resposta = await validarLogin(identificador, senha);

      if (resposta.sucesso) {
        onLogin(resposta.nome);
      } else {
        setErro(resposta.erro);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-md shadow-2xl overflow-hidden">
        
        <div className="bg-slate-800 p-6 flex flex-col items-center border-b-4 border-blue-600">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-sm flex items-center justify-center shadow-md mb-4">
            <span className="font-black text-2xl tracking-tighter">DC</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide uppercase">
            Disnibra Café
          </h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
            Painel de Gestão
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
    </div>
  );
}
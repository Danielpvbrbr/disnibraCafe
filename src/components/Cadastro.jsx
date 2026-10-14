"use client";

import { useState, useTransition } from "react";
import { criarUsuario } from "@/app/actions/usuarios";

export default function Cadastro({ onVoltar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    startTransition(async () => {
      const resposta = await criarUsuario(nome, email, senha);

      if (resposta.sucesso) {
        setSucesso(true);
        setNome("");
        setEmail("");
        setSenha("");
      } else {
        setErro(resposta.erro);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-md shadow-2xl overflow-hidden">
        
        <div className="bg-slate-800 p-6 border-b-4 border-emerald-600">
          <h1 className="text-xl font-bold text-white tracking-wide uppercase">
            Novo Usuário
          </h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
            Cadastro de Operador
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {sucesso && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-sm text-center uppercase tracking-wide">
              Usuário criado com sucesso!
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-medium text-slate-800"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              E-mail de Acesso
            </label>
            <input
              type="email"
              placeholder="usuario@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-medium text-slate-800"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-medium text-slate-800"
              required
            />
          </div>

          {erro && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-sm text-center uppercase tracking-wide">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={!nome || !email || !senha || isPending}
            className="w-full bg-emerald-600 text-white text-sm font-bold px-4 py-3 rounded-sm hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors uppercase tracking-wider shadow-sm mb-3"
          >
            {isPending ? "Salvando..." : "Cadastrar Usuário"}
          </button>

          <button
            type="button"
            onClick={onVoltar}
            className="w-full bg-slate-200 text-slate-700 text-sm font-bold px-4 py-3 rounded-sm hover:bg-slate-300 transition-colors uppercase tracking-wider"
          >
            Voltar para Login
          </button>
        </form>
      </div>
    </div>
  );
}
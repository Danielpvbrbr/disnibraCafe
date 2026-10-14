"use client";

export default function Sidebar({ telaAtiva, setTelaAtiva, onLogout, nomeUsuario }) {
  const navItems = [
    { 
      id: "pedidos", 
      label: "Pedidos", 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> 
    },
    { 
      id: "salao", 
      label: "Salão", 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> 
    },
    { 
      id: "cardapio", 
      label: "Cardápio", 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> 
    },
    { 
      id: "relatorios", 
      label: "Relatórios", 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> 
    },
  ];

  // Função para encurtar "Daniel do Nascimento" -> "Daniel N."
  const formatarNomeCompacto = (nome) => {
    if (!nome) return "User";
    // Remove palavras de ligação para pegar o sobrenome real
    const partes = nome.trim().split(" ").filter(p => !["de", "do", "da", "dos", "das"].includes(p.toLowerCase()));
    
    if (partes.length === 1) return partes[0].substring(0, 10);
    return `${partes[0]} ${partes[1].charAt(0)}.`;
  };

  return (
    <aside className="fixed top-0 left-0 z-50 h-full w-24 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4">
      
      {/* Texto Limpo do Sistema */}
      <div className="mb-8 mt-2 text-center">
        <span className="font-black text-xs text-white uppercase tracking-widest leading-none block">
          Gestor<br/>Pedidos
        </span>
      </div>

      <nav className="flex flex-col gap-1.5 w-full px-2">
        {navItems.map((item) => {
          const isActive = telaAtiva === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setTelaAtiva(item.id)}
              className={`
                flex flex-col items-center justify-center gap-1 w-full h-16 rounded-sm transition-colors
                ${isActive 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                }
              `}
            >
              {item.icon}
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-white" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* RODAPÉ DO USUÁRIO */}
      <div className="mt-auto w-full px-2 border-t border-slate-800 pt-3 flex flex-col items-center">
        
        {/* Nome do Logado */}
        <span 
          className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center truncate w-full px-1 mb-1" 
          title={nomeUsuario}
        >
          {formatarNomeCompacto(nomeUsuario)}
        </span>

        {/* Botão de Logout */}
        <button 
          onClick={onLogout}
          title="Sair do Sistema"
          className="flex flex-col items-center justify-center w-full h-10 rounded-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

    </aside>
  );
}
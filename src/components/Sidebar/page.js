"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as S from "./styles";


export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Função para fechar menu ao clicar em link (no mobile)
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <S.MobileHeader>
        <h1 style={{ fontSize: '18px', fontWeight: 900 }}>Disnibra <span>Café</span></h1>
        <S.MenuButton onClick={() => setIsOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </S.MenuButton>
      </S.MobileHeader>

      <S.Overlay $isOpen={isOpen} onClick={closeMenu} />

      <S.SidebarContainer $isOpen={isOpen}>
        <S.LogoArea>
          <h1>DISNIBRA<span>CAFÉ</span></h1>
        </S.LogoArea>

        <S.NavList>
          <S.NavItem $active={pathname === "/pedidos"}>
            <Link href="/pedidos" onClick={closeMenu}>
              Pedidos
            </Link>
          </S.NavItem>

          <S.NavItem $active={pathname === "/salao"}>
            <Link href="/salao" onClick={closeMenu}>
              Salão
            </Link>
          </S.NavItem>

          <S.NavItem $active={pathname === "/cardapio"}>
            <Link href="/cardapio" onClick={closeMenu}>
              Cardápio
            </Link>
          </S.NavItem>
        </S.NavList>

        <div style={{ padding: '24px', borderTop: '1px solid #f4f4f5' }}>
          <p style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 700 }}>v1.0.0 - 2026</p>
        </div>
      </S.SidebarContainer>
    </>
  );
}
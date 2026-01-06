import styled from 'styled-components';

export const SidebarContainer = styled.aside`
  width: 260px;
  background: white;
  border-right: 1px solid #f4f4f5;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  transition: all 0.3s ease;
  z-index: 100;

  @media (max-width: 768px) {
    position: fixed;
    left: ${props => (props.$isOpen ? '0' : '-260px')};
    box-shadow: 20px 0 50px rgba(0, 0, 0, 0.1);
  }
`;

export const LogoArea = styled.div`
  padding: 32px 24px;
  
  h1 {
    font-size: 22px;
    font-weight: 900;
    color: #1c1c1c;
    font-style: italic;
    span { color: #ff6b00; }
  }
`;

export const NavList = styled.nav`
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const NavItem = styled.div`
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 16px;
    color: ${props => (props.$active ? '#ff6b00' : '#71717a')};
    background: ${props => (props.$active ? '#fff5ed' : 'transparent')};
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      background: #fff5ed;
      color: #ff6b00;
    }
  }
`;

export const MobileHeader = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: white;
    border-bottom: 1px solid #f4f4f5;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 90;
  }
`;

export const MenuButton = styled.button`
  background: #ff6b00;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Overlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: ${props => (props.$isOpen ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    z-index: 58;
  }
`;
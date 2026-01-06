import styled from 'styled-components';

export const SidebarContainer = styled.aside`
  width: 260px;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    position: fixed;
    left: ${props => (props.$isOpen ? '0' : '-260px')};
    box-shadow: 20px 0 60px rgba(0, 0, 0, 0.18);
  }
`;


export const LogoArea = styled.div`
  padding: 28px 24px;
  border-bottom: 1px solid #f4f4f5;

  h1 {
    font-size: 18px;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.3px;

    span {
      color: #ff6b00;
      font-weight: 900;
    }
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
  position: relative;

  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 14px;
    color: ${props => (props.$active ? '#111827' : '#71717a')};
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
    position: relative;
  }

  ${props =>
    props.$active &&
    `
    a {
      background: #fff5ed;
      color: #ff6b00;
    }

    a::before {
      content: '';
      position: absolute;
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: #ff6b00;
      border-radius: 4px;
    }
  `}

  a:hover {
    background: #f9fafb;
    color: #111827;
  }
`;


export const MobileHeader = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    background: linear-gradient(180deg, #ffffff, #fafafa);
    border-bottom: 1px solid #e5e7eb;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 90;
  }
`;


export const MenuButton = styled.button`
  background: #fff5ed;
  color: #ff6b00;
  border: none;
  padding: 8px;
  border-radius: 12px;
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
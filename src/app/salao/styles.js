import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;


export const Container = styled.div`
  padding: 20px; /* Reduzi para telas menores */
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    padding: 40px; /* Volta ao normal no desktop */
  }
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column; /* Empilha no mobile */
  gap: 20px;
  margin-bottom: 32px;
  
  @media (min-width: 768px) {
    flex-direction: row; /* Lado a lado no desktop */
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48px;
  }
`;

export const TitleGroup = styled.div`
  h1 { 
    font-size: 28px; 
    font-weight: 900; 
    color: #1c1c1c; 
    margin: 0; 
  }
  p { color: #71717a; margin-top: 4px; font-size: 14px; }

  @media (min-width: 768px) {
    h1 { font-size: 32px; }
  }
`;

export const Grid = styled.div`
  display: grid;
  /* Centraliza os cards no mobile e ajusta o tamanho */
  grid-template-columns: repeat(auto-fill, minmax(160px, 200px)); 
  gap: 16px;
  justify-content: center; /* Centraliza se sobrar espaço */

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, 200px);
    gap: 24px;
    justify-content: start;
  }
`;

export const TableCard = styled.div`
  background: white;
  width: 100%; /* Ocupa o espaço da coluna do grid */
  aspect-ratio: 1 / 1; /* Garante que seja sempre um quadrado 200x200 ou 160x160 */
  max-width: 200px;
  border-radius: 28px;
  padding: 16px;
  border: 1px solid #f4f4f5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.3s ease-out;

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

/* Ajuste no QR para ele não sumir em telas pequenas */
export const QRWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  
  svg { 
    width: 80% !important; /* Um pouco menor no mobile para não socar */
    height: auto !important; 
    max-width: 90px; 
  }

  @media (min-width: 768px) {
    svg { width: 100% !important; max-width: 110px; }
  }
`;

// BOTÃO LARANJA PRINCIPAL
export const AddButton = styled.button`
  background: #ff6b00; /* Laranja vibrante */
  color: white;
  padding: 14px 28px;
  border-radius: 18px;
  border: none;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(255, 107, 0, 0.3);

  &:hover {
    background: #e66000;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    font-size: 14px;
    font-weight: 800;
    color: #1c1c1c;
  }
`;

export const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  background: #ff6b00; /* Dot laranja */
  border-radius: 50%;
  animation: ${pulse} 2s infinite;
`;

export const PrintButton = styled.button`
  width: 100%;
  background: #fff5ed; /* Laranja bem clarinho */
  color: #ff6b00;
  border: none;
  padding: 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff6b00;
    color: white;
  }
`;

// MODAL REESTILIZADO
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(28, 28, 28, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  text-align: center;
  animation: ${fadeIn} 0.3s ease-out;

  h3 {
    font-size: 24px;
    font-weight: 900;
    margin-bottom: 8px;
    color: #1c1c1c;
  }

  p {
    margin-bottom: 32px;
  }
`;

export const InputGroup = styled.div`
  text-align: left;
  margin-bottom: 24px;
  
  label {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    color: #ff6b00;
    margin-left: 4px;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 16px;
  background: #f8f8f8;
  border: 2px solid transparent;
  border-radius: 16px;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 500;
  outline: none;
  transition: all 0.2s;
  color: #ff6b00;
  &:focus {
    background: white;
    border-color: #ff6b00;
    box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  
  button {
    flex: 1;
  }
`;

export const Content = styled.div`
    border: 1px solid red;
`
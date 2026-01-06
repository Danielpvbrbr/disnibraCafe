import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

export const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #ddd;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  h1 { font-size: 24px; font-weight: 900; color: #000; span { color: #000; } }
`;

export const ProductGrid = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fill, 340px);
  gap: 10px;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: start;
  }
`;


export const MiniImage = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;


export const AddButtonCircle = styled.button`
  background: #ff6b00;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: none;
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #e66000;
    transform: translateY(-1px);
  }
`;


// Estilos do Modal (Manter os mesmos da resposta anterior...)
export const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); 
  backdrop-filter: blur(4px); z-index: 1000; display: flex; 
  justify-content: center; align-items: center; padding: 20px;
`;

export const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 420px;
  padding: 28px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  animation: ${fadeIn} 0.25s ease-out;
`;


export const Input = styled.input`
  background: #f4f4f5;
  color: #1c1c1c;
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e4e4e7;
  font-size: 14px;
  font-weight: 600;
  padding: 0 14px;
  transition: 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b00;
    background: #fff;
  }
`;

export const ProductCard = styled.div`
  height: 96px;
  background: white;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 12px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    border-color: #ff6b00;
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }
`;


export const ImageContainer = styled.div`
  width: 80px;
  height: 80px;
  margin-left: 10px;
  border-radius: 12px;
  background: #fff5ed;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    font-size: 30px; /* Para o emoji caso não tenha foto */
  }
`;
export const MiniInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
  }

  span {
    font-size: 14px;
    font-weight: 800;
    color: #ff6b00;
    margin-top: 2px;
  }
`;

// Grupo que envolve Label + Input
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: 100%;

  label {
    font-size: 11px;
    font-weight: 800;
    color: #ff6b00;
    text-transform: uppercase;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }
`;

// Linha para colocar inputs lado a lado
export const InputRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

// Wrapper específico para o campo de preço com o prefixo R$
export const PrecoWrapper = styled.div`
  width: 100%;
  max-width: 150px; /* Preço agora fica pequeno e elegante */
  position: relative;

  &::before {
    content: "R$";
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    font-weight: 800;
    color: #ff6b00;
    z-index: 1;
  }

  input {
    padding-left: 40px; /* Dá espaço para o R$ fixo */
  }
`;
// Estilo para o Input de arquivo no Modal
export const FileInput = styled.div`
  margin-bottom: 12px;
  label {
    display: block;
    padding: 10px;
    background: #fff5ed;
    color: #ff6b00;
    border: 2px dashed #ff6b00;
    border-radius: 12px;
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }
  input { display: none; }
`;
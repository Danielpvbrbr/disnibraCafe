import styled, { keyframes } from 'styled-components';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
  padding: 20px;
  max-width: 1400px; /* Tela de pedidos pode ser mais larga */
  margin: 0 auto;
  @media (min-width: 768px) { padding: 40px; }
`;

export const Header = styled.header`
  margin-bottom: 40px;
  h1 { font-size: 32px; font-weight: 900; color: #1c1c1c; 
       span { color: #ff6b00; } }
  p { color: #71717a; font-weight: 500; }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

export const OrderCard = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid #f4f4f5;
  border-top: 8px solid #ff6b00;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  animation: ${slideUp} 0.4s ease-out;
`;

export const OrderHeader = styled.div`
  padding: 10px;
  border-bottom: 1px solid #f4f4f5;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .mesa-info {
    span { 
      font-size: 12px; 
      color: #a1a1aa; 
      font-weight: 700; 
      text-transform: uppercase;
     }
    h3 { 
      font-size: 15px; 
      font-weight: 900; 
      color: #1c1c1c;
     }
  }

  .time {
    font-size: 13px;
    font-weight: 700;
    color: #ff6b00;
    background: #fff5ed;
    padding: 4px 10px;
    border-radius: 8px;
  }
`;

export const ItemsList = styled.div`
  padding: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const ItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 5px;

  .qty {
    background: #1c1c1c;
    color: white;
    font-size: 10px;
    font-weight: 900;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }

  .name {
    font-size: 11px;
    font-weight: 600;
    color: #3f3f46;
    line-height: 1.4;
  }
`;

export const OrderFooter = styled.div`
  padding: 7px;
  background: #fdfdfd;
  border-radius: 0 0 24px 24px;
  border-top: 1px dashed #e4e4e7;
`;

export const DoneButton = styled.button`
  width: 100%;
  background: #ff6b00;
  color: white;
  border: none;
  padding: 5px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #e66000;
    transform: scale(0.98);
  }
`;

export const TitleGroup = styled.div`
  h1 { 
    font-size: 32px; 
    font-weight: 900; 
    color: #1c1c1c; 
    margin: 0; 
    span { color: #ff6b00; } 
  }
  p { 
    color: #71717a; 
    margin-top: 4px; 
    font-weight: 500; 
  }
`;
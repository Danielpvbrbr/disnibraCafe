"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as S from "./styles"; // Importa todos os estilos como 'S'

export default function Salao() {
    const [tables, setTables] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTableName, setNewTableName] = useState("");
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const handleCreateTable = () => {
        if (!newTableName) return;
        const newId = Date.now();
        const tableUrl = `${origin}/mesa/${newId}`;

        setTables([...tables, { id: newId, name: newTableName, url: tableUrl }]);
        setNewTableName("");
        setIsModalOpen(false);
    };

    return (
        <S.Container>
            <S.Header>
                <S.TitleGroup>
                    <h1>Salão</h1>
                    <p>Gerencie as mesas e pontos de pedido.</p>
                </S.TitleGroup>

                <S.AddButton onClick={() => setIsModalOpen(true)}>
                    Nova Mesa
                </S.AddButton>
            </S.Header>

            <S.Grid>
                {tables.map((table) => (
                    <S.TableCard key={table.id}>
                        <S.CardHeader>
                            <span>{table.name}</span>
                            <S.StatusDot />
                        </S.CardHeader>

                        <S.QRWrapper>
                            <QRCodeSVG value={table.url} size={140} level="H" />
                        </S.QRWrapper>

                        <S.PrintButton onClick={() => window.print()}>
                            Imprimir QR Code
                        </S.PrintButton>
                    </S.TableCard>
                ))}
            </S.Grid>

            {isModalOpen && (
                <S.ModalOverlay onClick={() => setIsModalOpen(false)}>
                    <S.ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>Nova Mesa</h3>
                        <p style={{ color: '#71717a', fontSize: '14px' }}>Identifique a mesa para gerar o QR Code.</p>

                        <S.InputGroup>
                            <label>Nome da Mesa</label>
                            <S.Input
                                type="text"
                                placeholder="Ex: Mesa 01"
                                value={newTableName}
                                onChange={(e) => setNewTableName(e.target.value)}
                                autoFocus
                            />
                        </S.InputGroup>

                        <S.ModalFooter>
                            <S.PrintButton
                                style={{ height: '48px', fontSize: '14px' }}
                                onClick={() => setIsModalOpen(false)}
                            >
                                Voltar
                            </S.PrintButton>
                            <S.AddButton
                                style={{ flex: 2, justifyContent: 'center' }}
                                onClick={handleCreateTable}
                            >
                                Confirmar
                            </S.AddButton>
                        </S.ModalFooter>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}
        </S.Container>
    );
}
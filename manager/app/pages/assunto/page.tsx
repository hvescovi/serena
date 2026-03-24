"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Menu from "@/app/components/Menu";

const API = "http://localhost:4999";

type Assunto = {
    id: number;
    nome: string;
};

export default function AssuntosPage() {
    const [assuntos, setAssuntos] = useState<Assunto[]>([]);
    const [nome, setNome] = useState("");
    const [editId, setEditId] = useState<number | null>(null);
    const nomeRef = useRef<HTMLInputElement>(null);

    const loadAssuntos = async () => {
        try {
            const res = await axios.get(`${API}/assuntos`);
            setAssuntos(res.data.details || []);
        } catch (error) {
            console.error(error);
            alert("Falha ao carregar assuntos");
        }
    };

    useEffect(() => {
        loadAssuntos();
    }, []);

    const reset = () => {
        setNome("");
        setEditId(null);
        setTimeout(() => nomeRef.current?.focus(), 0);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`${API}/assunto/${editId}`, { nome });
            } else {
                await axios.post(`${API}/assunto`, { nome });
            }
            await loadAssuntos();
            reset();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar assunto");
        }
    };

    const edit = (a: Assunto) => {
        setNome(a.nome);
        setEditId(a.id);
        setTimeout(() => nomeRef.current?.focus(), 0);
    };

    const remove = async (id: number) => {
        if (!confirm("Excluir assunto?")) return;
        try {
            await axios.delete(`${API}/assunto/${id}`);
            await loadAssuntos();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir assunto");
        }
    };

    return (
        <main style={{ maxWidth: 820, margin: "2rem auto", padding: "0 1rem" }}>

          <Menu />


            <h1>CRUD Assunto</h1>

            <form onSubmit={submit} style={{ marginBottom: 20 }}>
                <input
                    ref={nomeRef}
                    placeholder="Nome do assunto"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, marginBottom: 8 }}
                />
                <button type="submit" style={{ marginRight: 8 }}>
                    {editId ? "Atualizar" : "Criar"}
                </button>
                {editId && (
                    <button type="button" onClick={reset}>
                        Cancelar
                    </button>
                )}
            </form>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {assuntos.length === 0 && (
                        <tr>
                            <td colSpan={3} style={{ padding: 12, textAlign: "center" }}>
                                Nenhum assunto
                            </td>
                        </tr>
                    )}
                    {assuntos.map((a) => (
                        <tr key={a.id}>
                            <td>{a.id}</td>
                            <td>{a.nome}</td>
                            <td>
                                <button onClick={() => edit(a)} style={{ marginRight: 6 }}>Editar</button>
                                <button onClick={() => remove(a.id)} style={{ color: "red" }}>Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
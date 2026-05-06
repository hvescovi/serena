"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";
import { ajustaImagens } from "../../scripts/utils";

const API = "http://localhost:4999";

interface Resposta {
    id: number;
    questao_id: number;
    questao: {
        id: number;
        enunciado: string;
        autor: string;
        data_cadastro: string;
        type: string;
        alternativas: Array<{
            id: number;
            descricao: string;
            certa: string;
        }>;
    };

    respondente_id: number;
    respondente: {
        id: number;
        nome: string;
        email: string;
        observacao: string;
    };

    resposta: string;
    timestamp: string;
    pontuacao: number | null;
    pontuacao_sugerida: number | null;
    circulos: Array<{
        id: number;
        nome: string;
    }>;
}

interface Respondente {
    id: number;
    nome: string;
    email: string;
    observacao: string;
}

export default function RespostasAluno() {
    const [respondentes, setRespondentes] = useState<Respondente[]>([]);
    const [respostas, setRespostas] = useState<Resposta[]>([]);
    const [selectedRespondente, setSelectedRespondente] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch list of respondentes
    const fetchRespondentes = async () => {
        try {
            const res = await axios.get(`${API}/respondente`);
            setRespondentes(res.data.details || []);
        } catch (error) {
            console.error("Error fetching respondentes:", error);
            setError("Erro ao buscar respondentes");
        }
    };

    // Fetch answers for a specific student
    const fetchRespostasAluno = async (id: number) => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(`${API}/respostas_aluno/${id}`);
            if (res.data.message === "ok") {
                setRespostas(res.data.details || []);
            } else {
                setError("Nenhuma resposta encontrada para este aluno");
                setRespostas([]);
            }
        } catch (error) {
            console.error("Error fetching respostas:", error);
            setError("Erro ao buscar respostas do aluno");
            setRespostas([]);
        } finally {
            setLoading(false);
        }
    };

    // Initialize: fetch respondentes on component mount
    useEffect(() => {
        fetchRespondentes();
    }, []);

    // Sort respondentes by name
    const sortedRespondentes = useMemo(() => {
        return [...respondentes].sort((a, b) => a.nome.localeCompare(b.nome));
    }, [respondentes]);

    // Fetch answers when a respondente is selected
    const handleSelectRespondente = (id: number) => {
        setSelectedRespondente(id);
        fetchRespostasAluno(id);
    };

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleString("pt-BR");
        } catch {
            return timestamp;
        }
    };

    // Format score
    const formatScore = (score: number | null) => {
        if (score === null) return "-";
        return score.toFixed(2);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Menu />

            <main className="max-w-7xl mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">Respostas do Aluno</h1>

                {/* Respondente Selection */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <label className="block text-lg font-semibold mb-4 text-gray-700">
                        Selecione um Aluno:
                    </label>
                    <select
                        value={selectedRespondente || ""}
                        onChange={(e) => handleSelectRespondente(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Selecione um aluno --</option>
                        {sortedRespondentes.map((respondente) => (
                            <option key={respondente.id} value={respondente.id}>
                                {respondente.nome} ({respondente.email})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="text-center py-8">
                        <p className="text-lg text-gray-600">Carregando respostas...</p>
                    </div>
                )}

                {/* Respostas Table */}
                {selectedRespondente && !loading && respostas.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-blue-600 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Questão</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Círculo</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Enunciado</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Resposta</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {respostas.map((resposta, index) => (
                                        <tr
                                            key={resposta.id}
                                            className={index % 2 === 0 ? "bg-green-100" : "bg-white"}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-800">{resposta.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">Q{resposta.questao_id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800 max-w-xs">
                                                <div className="flex flex-wrap gap-1">
                                                    {resposta.circulos && resposta.circulos.length > 0 ? (
                                                        resposta.circulos.map((circulo) => (
                                                            <span
                                                                key={circulo.id}
                                                                className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                                                            >
                                                                {circulo.nome}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 min-w-64 max-w-lg overflow-hidden text-ellipsis">

                                                <span dangerouslySetInnerHTML={{ __html: ajustaImagens(API, resposta.questao.enunciado) }} />
                                                ({resposta.questao.type})
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 max-w-xs overflow-hidden text-ellipsis">

                                                {/*   if answer type is "multiplaescolha_remodelada", show the alternative description instead of the alternative ID */}
                                                {resposta.questao.type === "multiplaescolha" ? (
                                                    <span>
                                                        {resposta.questao.alternativas.map((alt) => {
                                                            return <span key={alt.id}><br /> * 
                                                                <span dangerouslySetInnerHTML={{ __html: ajustaImagens(API, alt.descricao) }} />
                                                                {alt.certa ? "(CERTA)" : ""} 
                                                                {alt.id == resposta.resposta ? "(ASSINALADA)" : ""}
                                                                </span>
                                                        })};
                                                    </span>
                                                ) : (
                                                    <span>{resposta.resposta}</span>
                                                )}

                                                <br/>
                                                Data da resposta:
                                                {formatTimestamp(resposta.timestamp)}
                                                <span
                                                    className={
                                                        resposta.pontuacao !== null && resposta.pontuacao > 0
                                                            ? "text-green-600"
                                                            : "text-gray-600"
                                                    }
                                                >
                                                <br/>
                                                Pontuação: 
                                                    {formatScore(resposta.pontuacao)}
                                                </span>

                                                <br/>
                                                Pontuação Sugerida:
                                                <span
                                                    className={
                                                        resposta.pontuacao_sugerida !== null && resposta.pontuacao_sugerida > 0
                                                            ? "text-blue-600"
                                                            : "text-gray-600"
                                                    }
                                                >
                                                    {formatScore(resposta.pontuacao_sugerida)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Total de respostas: <strong>{respostas.length}</strong>
                            </p>
                        </div>
                    </div>
                )}

                {/* No Data Message */}
                {selectedRespondente && !loading && respostas.length === 0 && !error && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                        Nenhuma resposta encontrada para este aluno.
                    </div>
                )}

                {/* Placeholder */}
                {!selectedRespondente && !loading && (
                    <div className="bg-gray-100 rounded-lg p-12 text-center">
                        <p className="text-lg text-gray-600">
                            Selecione um aluno para visualizar suas respostas
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

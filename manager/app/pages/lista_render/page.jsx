"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";
import { ajustaImagens } from "../../lib/htmlUtils";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ListaRender() {
  const [listas, setListas] = useState([]);
  const [selectedLista, setSelectedLista] = useState("");
  const [questions, setQuestions] = useState([]);
  const [expandedAnswers, setExpandedAnswers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleAnswers = (questionId) => {
    setExpandedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Fetch all listas on component mount
  useEffect(() => {
    const fetchListas = async () => {
      try {
        const res = await axios.get(`${API}/lista`);
        setListas(res.data.details || []);
        setError("");
      } catch (err) {
        setError("Erro ao carregar listas");
        console.error("Error fetching listas:", err);
      }
    };

    fetchListas();
  }, []);

  // Fetch questions from selected lista
  useEffect(() => {
    if (!selectedLista) {
      setQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API}/lista/${selectedLista}/questoes`);
        setQuestions(res.data.details || []);
        setError("");
      } catch (err) {
        setError("Erro ao carregar questões");
        console.error("Error fetching questions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedLista]);

  return (
    <div className="m-4">
      <Menu />

      <h1 className="text-4xl font-bold m-3">Questões</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
        <label className="block font-semibold mb-2 text-gray-700">Selecione uma Lista:</label>
        <select
          value={selectedLista}
          onChange={(e) => setSelectedLista(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">-- Selecione uma lista --</option>
          {listas.map((lista) => (
            <option key={lista.id} value={lista.id}>
              {lista.nome} ({lista.questoes?.length || 0} questões)
            </option>
          ))}
        </select>
      </div>

      {!selectedLista && (
        <div className="text-center text-gray-500 py-8">
          Selecione uma lista para visualizar as questões
        </div>
      )}

      {selectedLista && isLoading ? (
        <div className="text-center text-gray-500 py-8">Carregando questões...</div>
      ) : selectedLista && questions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Nenhuma questão nesta lista</div>
      ) : selectedLista && (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li
              key={q.id}
              className="border rounded p-4 bg-white shadow hover:shadow-lg transition"
            >
              <div className="mb-3">
                <span className="inline-block bg-green-100 border border-green-400 text-green-800 px-3 py-1 rounded font-semibold">
                  ID: {q.id}
                </span>
                <span className="inline-block ml-2 bg-blue-100 border border-blue-400 text-blue-800 px-3 py-1 rounded font-semibold">
                  Tipo: {q.type}
                </span>
                {q.ativa === "0" && (
                  <span className="inline-block ml-2 bg-gray-100 border border-gray-400 text-gray-800 px-3 py-1 rounded font-semibold">
                    INATIVA
                  </span>
                )}
              </div>

              <div className="mb-3 text-gray-800 bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                <span dangerouslySetInnerHTML={{ __html: ajustaImagens(API, q.enunciado) }} />
              </div>

              <button
                type="button"
                onClick={() => toggleAnswers(q.id)}
                className="mb-3 inline-flex items-center px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-100 transition"
              >
                {expandedAnswers.has(q.id) ? "Ocultar respostas" : "Mostrar respostas"}
              </button>

              {q.type === "multiplaescolha" && q.alternativas && (
                <div className="mb-3">
                  <div className="font-semibold text-gray-700 mb-2">Alternativas:</div>
                  <div className="bg-yellow-50 border border-yellow-400 rounded p-3 space-y-1">
                    {q.alternativas.map((a) => (
                      <div key={a.id} className="text-gray-800">
                        {expandedAnswers.has(q.id) && a.certa && (
                          <span className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-semibold mr-2">
                            ✓ CORRETA
                          </span>
                        )}
                        <span dangerouslySetInnerHTML={{ __html: a.descricao }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expandedAnswers.has(q.id) && q.type === "aberta" && (
                <div className="mb-3">
                  <div className="font-semibold text-gray-700 mb-2">Resposta:</div>
                  <div className="bg-yellow-50 border border-yellow-400 rounded p-3 text-gray-800">
                    {q.resposta}
                  </div>
                </div>
              )}

              {expandedAnswers.has(q.id) && q.type === "completar" && (
                <div className="mb-3">
                  <div className="font-semibold text-gray-700 mb-2">Lacunas:</div>
                  <div className="bg-yellow-50 border border-yellow-400 rounded p-3 text-gray-800">
                    {q.lacunas}
                  </div>
                </div>
              )}

              {q.observacao && (
                <div className="mb-3">
                  <div className="font-semibold text-gray-700 mb-2">Observação:</div>
                  <div className="bg-gray-100 border border-gray-300 rounded p-3 text-gray-700 text-sm">
                    {q.observacao}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
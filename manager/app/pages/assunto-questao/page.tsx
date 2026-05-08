"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";

const API = "http://localhost:4999";

type Assunto = { id: number; nome: string };
type Questao = { id: number; enunciado: string; autor?: string };

export default function AssuntoQuestaoPage() {
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [assuntoSelecionado, setAssuntoSelecionado] = useState<number | null>(null);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<Set<number>>(new Set());
  const [questoesDoAssunto, setQuestoesDoAssunto] = useState<Questao[]>([]);
  const [refresh, setRefresh] = useState(0);

  const fetchData = async () => {
    try {
      const [a, q] = await Promise.all([
        axios.get(`${API}/assuntos`),
        axios.get(`${API}/question`)
      ]);
      setAssuntos(a.data.details || []);
      setQuestoes(q.data.details || []);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar assuntos/questões");
    }
  };

  const fetchQuestoesDoAssunto = async (id: number) => {
    try {
      const res = await axios.get(`${API}/assunto/${id}/questoes`);
      setQuestoesDoAssunto(res.data.details || []);
    } catch (e) {
      console.error(e);
      setQuestoesDoAssunto([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  useEffect(() => {
    if (assuntoSelecionado !== null) {
      fetchQuestoesDoAssunto(assuntoSelecionado);
    } else {
      setQuestoesDoAssunto([]);
    }
  }, [assuntoSelecionado]);

  const toggleQuestao = (id: number) => {
    setQuestoesSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  };

  const addVinculos = async () => {
    if (assuntoSelecionado == null || questoesSelecionadas.size === 0) {
      return alert("Escolha assunto e ao menos uma questão");
    }
    try {
      for (const qId of questoesSelecionadas) {
        await axios.post(`${API}/assunto/${assuntoSelecionado}/questao/${qId}`);
      }
      await fetchQuestoesDoAssunto(assuntoSelecionado);
      setQuestoesSelecionadas(new Set());
      setRefresh((x) => x + 1);
    } catch (e) {
      console.error(e);
      alert("Erro ao vincular");
    }
  };

  const removeVinculo = async (questaoId: number) => {
    if (!assuntoSelecionado) return;
    try {
      await axios.delete(`${API}/assunto/${assuntoSelecionado}/questao/${questaoId}`);
      await fetchQuestoesDoAssunto(assuntoSelecionado);
      setRefresh((x) => x + 1);
    } catch (e) {
      console.error(e);
      alert("Erro ao desvincular");
    }
  };

  const assuntoAtual = useMemo(
    () => assuntos.find((a) => a.id === assuntoSelecionado),
    [assuntos, assuntoSelecionado]
  );

  return (
    <div className="m-4">
      <Menu />

      <h1 className="text-4xl font-bold m-3">Vincular Assunto ↔ Questão</h1>

      <section className="mb-6 p-4 bg-white rounded shadow flex flex-col gap-4 max-w-5xl">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Selecione Assunto</label>
          <select
            value={assuntoSelecionado ?? ""}
            onChange={(e) =>
              setAssuntoSelecionado(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
          >
            <option value="">Selecione um assunto</option>
            {assuntos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">Selecione Questões</label>
          <div className="border rounded p-3 max-h-80 overflow-y-auto bg-gray-50">
            {questoes.length === 0 ? (
              <p className="text-gray-500">Nenhuma questão disponível</p>
            ) : (
              questoes
                .filter((q) => !questoesDoAssunto.some((qa) => qa.id === q.id))
                .map((q) => (
                  <div key={q.id} className="mb-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`q-${q.id}`}
                      checked={questoesSelecionadas.has(q.id)}
                      onChange={() => toggleQuestao(q.id)}
                      className="mt-1 cursor-pointer"
                    />
                    <label
                      htmlFor={`q-${q.id}`}
                      className="cursor-pointer text-gray-700 flex-1"
                    >
                      <span className="font-semibold">#{q.id}</span> — {q.enunciado}
                    </label>
                  </div>
                ))
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {questoesSelecionadas.size > 0
              ? `${questoesSelecionadas.size} questão(ões) selecionada(s)`
              : "Nenhuma questão selecionada"}
          </p>
        </div>

        <button
          onClick={addVinculos}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow font-bold transition hover:bg-blue-700"
        >
          Vincular Selecionadas
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Questões em: <span className="text-blue-600">{assuntoAtual?.nome ?? "— nenhum assunto selecionado —"}</span>
        </h2>

        {assuntoSelecionado ? (
          <ul>
            {questoesDoAssunto.length === 0 && (
              <li className="text-gray-500 italic">Nenhuma questão vinculada</li>
            )}
            {questoesDoAssunto.map((q) => (
              <li key={q.id}>
                <span className="inline-block bg-green-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold mt-6">
                  {q.id}) <span dangerouslySetInnerHTML={{ __html: q.enunciado }} /> ({q.type})
                </span>

                {q.type === "multiplaescolha" && q.alternativas && (
                  <div>
                    <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                      {q.alternativas.map((a: any) => (
                        <div key={a.id}>
                          {a.certa && <span>===&gt;</span>} {a.descricao}
                          <br />
                        </div>
                      ))}
                    </span>
                  </div>
                )}

                {q.type === "aberta" && q.resposta && (
                  <div>
                    <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                      Resposta: {q.resposta}
                    </span>
                  </div>
                )}

                {q.type === "completar" && q.lacunas && (
                  <div>
                    <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                      Lacunas: {q.lacunas}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => removeVinculo(q.id)}
                  className="ml-2 px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition"
                  style={{ marginLeft: 10 }}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 italic">Escolha um assunto para ver as questões relacionadas.</p>
        )}
      </section>
    </div>
  );
}
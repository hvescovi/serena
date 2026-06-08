"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";

const BACKEND_PORT = 4999;

function normalizeIp(hostname: string) {
  if (!hostname) return "localhost";
  return hostname === "" ? "localhost" : hostname;
}

function buildBackendUrl(hostname: string, path: string) {
  return `http://${hostname}:${BACKEND_PORT}${path}`;
}

function adjustImageUrls(html: string, host: string) {
  return html.replace(/<img\s+src=/gi, `<img src="http://${host}:${BACKEND_PORT}/imagem/`);
}

export default function CorrigirPage() {
  const [host, setHost] = useState("localhost");
  const [circleId, setCircleId] = useState<number | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
    setHost(normalizeIp(hostname));
  }, []);

  useEffect(() => {
    if (!host) return;

    const fetchActiveCircle = async () => {
      try {
        setLoading(true);
        const result = await axios.get(buildBackendUrl(host, "/circulo_ativo"));

        if (result.data?.message === "ok" && result.data?.details?.id != null) {
          setCircleId(result.data.details.id);
        } else {
          setError(result.data?.details || "Não foi possível obter o círculo ativo.");
        }
      } catch (err) {
        setError("Erro ao obter o círculo ativo do backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCircle();
  }, [host]);

  const loadResponses = async () => {
    if (!circleId) {
      setError("Círculo não definido. Aguarde a inicialização.");
      return;
    }

    try {
      setError(null);
      setMessage(null);
      setLoading(true);
      const result = await axios.get(buildBackendUrl(host, `/exibir_respostas/${circleId}`));

      if (result.data?.message !== "ok") {
        setError(result.data?.details || "Falha ao obter respostas.");
      } else {
        setResponses(result.data.details || []);
      }
    } catch (err) {
      setError("Erro ao carregar as respostas. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      setError(null);
      setMessage(null);
      setLoading(true);
      const result = await axios.get(buildBackendUrl(host, "/gerar_recomendacoes_respostas_sem_pontuacao"));

      if (result.data?.message !== "ok") {
        setError(result.data?.details || "Falha ao gerar sugestões.");
      } else {
        setMessage(result.data.details || "Sugestões geradas com sucesso.");
      }
    } catch (err) {
      setError("Erro ao gerar sugestões. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  };

  const assignGrade = async (idresp: number, pontuacao: string) => {
    try {
      setError(null);
      setMessage(null);
      const payload = { id: idresp, pontuacao };
      const result = await axios.post(buildBackendUrl(host, "/pontuar_resposta"), payload);

      if (result.data?.message !== "ok") {
        setError(result.data?.details || "Falha ao enviar a pontuação.");
      } else {
        setResponses((current) =>
          current.map((resp) =>
            resp.id === idresp ? { ...resp, pontuacao, corrigida: true } : resp
          )
        );
        setMessage("Pontuação enviada com sucesso.");
      }
    } catch (err) {
      setError("Erro ao enviar a pontuação. Verifique o backend.");
    }
  };

  const renderResponse = (resp: any) => {
    const isMultipleChoice = resp.questao?.type === "multiplaescolha";
    const questionHtml = resp.questao?.enunciado || "Questão sem enunciado";
    const rawAnswer = resp.resposta ?? "";
    const scoreValue = resp.pontuacao ?? resp.pontuacao_sugerida ?? "";
    const corrected = resp.pontuacao != null || resp.corrigida;

    let answerContent: string | null = null;
    if (isMultipleChoice) {
      const selectedAlt = resp.questao?.alternativas?.find((alt: any) => alt.id === rawAnswer);
      answerContent = selectedAlt ? selectedAlt.descricao : rawAnswer;
    }

    let gabaritoContent: string | null = null;
    if (!isMultipleChoice) {
      const raw = resp.questao?.resposta ?? "";
      gabaritoContent = `<pre>${raw.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
    }

    return (
      <div key={resp.id} className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <div className="text-sm text-slate-500">Resposta #{resp.id} — Tipo: {resp.questao?.type || "-"}</div>
          <div
            className="mt-2 rounded bg-slate-50 p-4 text-slate-900"
            dangerouslySetInnerHTML={{ __html: adjustImageUrls(questionHtml, host) }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[1.5fr_0.5fr]">
          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 font-semibold">Resposta do aluno</div>
            {isMultipleChoice ? (
              <div className="text-slate-800">{answerContent}</div>
            ) : (
              <pre className="whitespace-pre-wrap break-words text-slate-800">{rawAnswer}</pre>
            )}
          </div>

          <div className="space-y-3 rounded border border-slate-200 bg-slate-50 p-3">
            {gabaritoContent && (
              <div>
                <div className="mb-1 font-semibold">Gabarito</div>
                <div
                  className="rounded border border-slate-200 bg-white p-2 text-slate-800"
                  dangerouslySetInnerHTML={{ __html: gabaritoContent }}
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold">Pontuação</label>
              <input
                type="text"
                defaultValue={scoreValue}
                disabled={corrected}
                id={`pt-${resp.id}`}
                className={`w-full rounded border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 ${
                  corrected ? "border-slate-300 bg-slate-100" : "border-slate-300 bg-white focus:border-blue-500"
                }`}
              />
            </div>
            <button
              type="button"
              disabled={corrected}
              onClick={() => {
                const input = document.getElementById(`pt-${resp.id}`) as HTMLInputElement | null;
                if (!input) return;
                assignGrade(resp.id, input.value.trim());
              }}
              className={`w-full rounded px-4 py-2 text-white transition ${
                corrected ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {corrected ? "Corrigida" : "Atribuir nota"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <Menu />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Correção</h1>
              <p className="mt-2 text-sm text-slate-600">
                Sistema aberto de perguntas Serena · Círculo <strong>{circleId ?? "..."}</strong>
              </p>
              <p className="text-sm text-slate-500">Conectando ao backend em <strong>{host}:{BACKEND_PORT}</strong></p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={generateSuggestions}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                disabled={loading}
              >
                Gerar sugestões
              </button>
              <button
                type="button"
                onClick={loadResponses}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700"
                disabled={loading || !circleId}
              >
                Listar respostas
              </button>
            </div>
          </div>

          {loading && (
            <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-4 text-blue-700">Carregando...</div>
          )}

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
          )}

          {message && (
            <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{message}</div>
          )}

          <div className="space-y-4">
            {responses.length > 0 ? (
              responses.map((resp) => renderResponse(resp))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
                Nenhuma resposta carregada. Clique em "Listar respostas" para buscar respostas do backend.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

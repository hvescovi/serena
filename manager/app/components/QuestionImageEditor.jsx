"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Editor } from "primereact/editor";
import Menu from "./Menu";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4999";

function imageReferencesToUrls(html) {
  return html.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*)(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi,
    (match, prefix, doubleQuoted, singleQuoted, unquoted) => {
      const source = doubleQuoted || singleQuoted || unquoted;
      if (/^(data:|https?:|\/)/i.test(source)) return match;
      return `${prefix}"${API}/imagem/${encodeURIComponent(source)}"`;
    }
  );
}

function getQuestionStatsPath(question) {
  if (question.type === "multiplaescolha") {
    return "estatisticas_respostas_multipla_escolha";
  }
  if (question.type === "aberta" || question.type === "completar") {
    return "estatisticas_respostas_aberta_completar";
  }
  return null;
}

export default function QuestionImageEditor({ imageMode }) {
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [responseCount, setResponseCount] = useState(null);
  const [countStatus, setCountStatus] = useState("idle");
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [activeField, setActiveField] = useState("enunciado");
  const [previewFields, setPreviewFields] = useState(new Set(["enunciado"]));
  const textareaRefs = useRef({});
  const selectionPositions = useRef({});

  useEffect(() => {
    let cancelled = false;
    axios.get(`${API}/question`)
      .then(res => {
        if (!cancelled) setQuestions(res.data.details || []);
      })
      .catch(error => {
        console.error("Error loading questions:", error);
        if (!cancelled) setLoadError("Erro ao carregar questões.");
      })
      .finally(() => {
        if (!cancelled) setLoadingQuestions(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedQuestionId = question?.id;
  const selectedQuestionType = question?.type;

  useEffect(() => {
    if (!selectedQuestionId) {
      setResponseCount(null);
      setCountStatus("idle");
      return;
    }

    const statsPath = getQuestionStatsPath({ type: selectedQuestionType });
    if (!statsPath) {
      setResponseCount(null);
      setCountStatus("unavailable");
      return;
    }

    let cancelled = false;
    setCountStatus("loading");
    axios.get(`${API}/questao/${selectedQuestionId}/${statsPath}`)
      .then(res => {
        if (!cancelled) {
          setResponseCount(res.data.details.total_respostas);
          setCountStatus("loaded");
        }
      })
      .catch(error => {
        console.error(`Error loading response count for question ${selectedQuestionId}:`, error);
        if (!cancelled) setCountStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [selectedQuestionId, selectedQuestionType]);

  const selectQuestion = (id) => {
    setSelectedId(id);
    const selected = questions.find(item => String(item.id) === id);
    setQuestion(selected ? {
      ...selected,
      alternativas: (selected.alternativas || []).map(alternative => ({ ...alternative })),
    } : null);
    setPreviewFields(new Set(["enunciado"]));
    setUploadStatus("");
    setActiveField("enunciado");
  };

  const updateField = (field, value) => {
    setQuestion(current => {
      if (!current) return current;
      if (field.startsWith("alternativa:")) {
        const index = Number(field.split(":")[1]);
        const alternativas = [...current.alternativas];
        alternativas[index] = { ...alternativas[index], descricao: value };
        return { ...current, alternativas };
      }
      return { ...current, [field]: value };
    });
  };

  const trackSelection = (field, event) => {
    selectionPositions.current[field] = event.currentTarget.selectionStart;
    setActiveField(field);
  };

  const togglePreview = (field) => {
    setPreviewFields(current => {
      const next = new Set(current);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const renderContentField = (label, field, value) => (
    <div key={field} className="space-y-2">
      <label className="block font-semibold">{label}</label>
      {imageMode === "internal" ? (
        <Editor
          value={value || ""}
          onTextChange={event => updateField(field, event.htmlValue || "")}
          style={{ height: "200px" }}
          className="w-full"
        />
      ) : (
        <>
          <textarea
            ref={element => { textareaRefs.current[field] = element; }}
            value={value || ""}
            onChange={event => updateField(field, event.target.value)}
            onFocus={event => trackSelection(field, event)}
            onClick={event => trackSelection(field, event)}
            onKeyUp={event => trackSelection(field, event)}
            onSelect={event => trackSelection(field, event)}
            rows={5}
            className="w-full rounded border p-2 font-mono"
          />
          <button
            type="button"
            onClick={() => togglePreview(field)}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
          >
            {previewFields.has(field) ? "Ocultar preview" : "Mostrar preview"}
          </button>
          {previewFields.has(field) && (
            <div
              className="min-h-12 overflow-auto rounded border bg-white p-3"
              dangerouslySetInnerHTML={{ __html: imageReferencesToUrls(value || "") }}
            />
          )}
        </>
      )}
    </div>
  );

  const addAlternative = () => {
    setQuestion(current => current && ({
      ...current,
      alternativas: [...current.alternativas, { descricao: "", certa: false }],
    }));
  };

  const removeAlternative = (index) => {
    setQuestion(current => current && ({
      ...current,
      alternativas: current.alternativas.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const uploadImage = async () => {
    if (!uploadFile) {
      setUploadStatus("Selecione uma imagem antes de enviar.");
      return;
    }

    setUploading(true);
    setUploadStatus("");
    const extension = uploadFile.name.split(".").pop()?.toLowerCase();
    const randomFilename = `${crypto.randomUUID()}.${extension}`;
    const renamedFile = new File([uploadFile], randomFilename, { type: uploadFile.type });
    const formData = new FormData();
    formData.append("file", renamedFile);

    try {
      const res = await axios.post(`${API}/upload_imagem`, formData);
      if (res.data.message !== "ok") {
        throw new Error(res.data.details || "Falha no upload da imagem.");
      }

      const imageTag = `<img src="${res.data.details.filename}">`;
      const field = activeField;
      const currentValue = field.startsWith("alternativa:")
        ? question.alternativas[Number(field.split(":")[1])]?.descricao || ""
        : question[field] || "";
      const position = selectionPositions.current[field] ?? currentValue.length;
      const updatedValue = `${currentValue.slice(0, position)}${imageTag}${currentValue.slice(position)}`;
      updateField(field, updatedValue);
      selectionPositions.current[field] = position + imageTag.length;
      setPreviewFields(current => new Set(current).add(field));
      setUploadStatus(`Imagem enviada e inserida: ${res.data.details.filename}`);
      setUploadFile(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadStatus(`Erro no upload: ${error.response?.data?.details || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const saveQuestion = async (event) => {
    event.preventDefault();
    if (!question) return;

    setSaving(true);
    try {
      const payload = {
        enunciado: question.enunciado,
        observacao: question.observacao || "",
        melhorias: question.melhorias || "",
        ativa: question.ativa,
      };
      if (question.type === "aberta") payload.resposta = question.resposta || "";
      if (question.type === "completar") payload.lacunas = question.lacunas || "";
      if (question.type === "multiplaescolha") {
        payload.alternativas = question.alternativas.map(({ descricao, certa }) => ({
          descricao,
          certa: Boolean(certa),
        }));
      }

      await axios.put(`${API}/question/${question.id}`, payload);
      setQuestions(current => current.map(item => (
        item.id === question.id ? { ...item, ...question } : item
      )));
      alert("Questão atualizada com sucesso.");
    } catch (error) {
      console.error(`Error updating question ${question.id}:`, error);
      alert(`Erro ao atualizar questão: ${error.response?.data?.details || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const labelForQuestion = item => {
    const plainPrompt = (item.enunciado || "").replace(/<[^>]*>/g, "").trim();
    return `${item.id} (${item.type}) ${plainPrompt.slice(0, 100)}`;
  };

  return (
    <main className="m-4 space-y-4">
      <Menu />
      <h1 className="text-3xl font-bold">
        Editar questão — {imageMode === "inside" ? "referências por nome de arquivo" : "imagens Base64 embutidas"}
      </h1>
      <div>
        <label htmlFor="question-select" className="mb-1 block font-semibold">Questão</label>
        <select
          id="question-select"
          value={selectedId}
          onChange={event => selectQuestion(event.target.value)}
          disabled={loadingQuestions}
          className="w-full rounded border p-2"
        >
          <option value="">Selecione uma questão</option>
          {questions.map(item => (
            <option key={item.id} value={item.id}>{labelForQuestion(item)}</option>
          ))}
        </select>
        {loadError && <p role="alert" className="mt-2 text-red-700">{loadError}</p>}
      </div>

      {question && (
        <>
          <p className="rounded bg-blue-50 p-3 font-semibold" aria-live="polite">
            Respostas existentes: {
              countStatus === "loading" ? "carregando..." :
                countStatus === "loaded" ? responseCount :
                  countStatus === "unavailable" ? "indisponível para este tipo" : "não foi possível carregar"
            }
          </p>

          {imageMode === "inside" && (
            <section className="space-y-2 rounded border bg-gray-50 p-4">
              <h2 className="font-semibold">Enviar imagem</h2>
              <p className="text-sm text-gray-600">
                A imagem receberá um nome aleatório e será inserida na posição selecionada no campo ativo.
              </p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={event => setUploadFile(event.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={uploadImage}
                disabled={uploading || !uploadFile}
                className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {uploading ? "Enviando..." : "Enviar e inserir imagem"}
              </button>
              {uploadStatus && <p role="status">{uploadStatus}</p>}
            </section>
          )}

          <form onSubmit={saveQuestion} className="space-y-5">
            {renderContentField("Enunciado", "enunciado", question.enunciado)}

            {question.type === "aberta" && renderContentField("Resposta esperada", "resposta", question.resposta)}
            {question.type === "completar" && renderContentField("Lacunas", "lacunas", question.lacunas)}

            {question.type === "multiplaescolha" && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Alternativas</h2>
                {question.alternativas.map((alternative, index) => (
                  <div key={`${question.id}-alternative-${index}`} className="space-y-2 rounded border p-3">
                    {renderContentField(`Alternativa ${index + 1}`, `alternativa:${index}`, alternative.descricao)}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(alternative.certa)}
                        onChange={event => setQuestion(current => {
                          const alternativas = [...current.alternativas];
                          alternativas[index] = { ...alternativas[index], certa: event.target.checked };
                          return { ...current, alternativas };
                        })}
                      />
                      Resposta correta
                    </label>
                    <button
                      type="button"
                      onClick={() => removeAlternative(index)}
                      className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50"
                    >
                      Remover alternativa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAlternative}
                  className="rounded border px-3 py-2 hover:bg-gray-100"
                >
                  Adicionar alternativa
                </button>
              </section>
            )}

            <div className="space-y-3">
              <label className="block font-semibold">
                Observação
                <textarea
                  value={question.observacao || ""}
                  onChange={event => setQuestion(current => ({ ...current, observacao: event.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded border p-2"
                />
              </label>
              <label className="block font-semibold">
                Melhorias
                <textarea
                  value={question.melhorias || ""}
                  onChange={event => setQuestion(current => ({ ...current, melhorias: event.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded border p-2"
                />
              </label>
              <label className="block font-semibold">
                Ativa (0 = não, 1 = sim)
                <input
                  value={question.ativa ?? ""}
                  onChange={event => setQuestion(current => ({ ...current, ativa: event.target.value }))}
                  className="mt-1 w-full rounded border p-2"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-green-700 px-5 py-2 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar questão"}
            </button>
          </form>
        </>
      )}
    </main>
  );
}

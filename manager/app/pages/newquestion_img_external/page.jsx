"use client";

import { useRef, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4999";

function renderExternalImageReferences(html) {
  return html.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*)(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi,
    (match, prefix, doubleQuoted, singleQuoted, unquoted) => {
      const source = doubleQuoted || singleQuoted || unquoted;
      if (/^(data:|https?:|\/)/i.test(source)) return match;
      return `${prefix}"${API}/imagem/${encodeURIComponent(source)}"`;
    }
  );
}

const initialForm = {
  type: "aberta",
  enunciado: "",
  resposta: "",
  observacao: "",
};

export default function NewQuestionExternalImagesPage() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const promptRef = useRef(null);
  const imageInputRef = useRef(null);
  const promptSelection = useRef(null);

  const formatPrompt = (html) => html.replace(/\r\n|\r|\n/g, "<br>");

  const addQuestion = async (event) => {
    event.preventDefault();
    if (!window.confirm("Cadastrar esta questão?")) return;

    const { type, resposta, observacao } = form;
    const enunciado = formatPrompt(form.enunciado);
    let dados;

    if (type === "aberta") {
      dados = { type, enunciado, resposta, observacao, ativa: "1" };
    } else if (type === "completar") {
      dados = { type, enunciado, lacunas: resposta, observacao, ativa: "1" };
    } else {
      const corrects = [];
      const wrongs = [];
      resposta.split(/\r?\n/).filter(alternative => alternative.trim()).forEach(alternative => {
        if (alternative.startsWith("(CERTA)")) {
          corrects.push({ op: alternative.slice("(CERTA)".length) });
        } else {
          wrongs.push({ op: alternative });
        }
      });
      dados = { type, enunciado, corrects, wrongs, observacao, ativa: "1" };
    }

    setSaving(true);
    try {
      const res = await axios.post(`${API}/incluir_questao`, dados, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data.message !== "ok") {
        throw new Error(res.data.details || "Não foi possível cadastrar a questão.");
      }

      alert("Questão cadastrada com sucesso.");
      setForm(initialForm);
    } catch (error) {
      console.error("Error creating question:", error);
      alert(`Erro ao cadastrar questão: ${error.response?.data?.details || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const preview = (html) => ({
    __html: renderExternalImageReferences(formatPrompt(html || "")),
  });

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
        throw new Error(res.data.details || "Não foi possível enviar a imagem.");
      }

      const imageTag = `<img src=${res.data.details.filename}>`;
      const currentPrompt = form.enunciado;
      const position = promptSelection.current ?? currentPrompt.length;
      const updatedPrompt = `${currentPrompt.slice(0, position)}${imageTag}${currentPrompt.slice(position)}`;
      setForm(current => ({ ...current, enunciado: updatedPrompt }));
      promptSelection.current = position + imageTag.length;
      setUploadFile(null);
      setUploadStatus(`Imagem enviada e inserida: ${res.data.details.filename}`);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadStatus(`Erro no upload: ${error.response?.data?.details || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="m-4 space-y-5">
      <Menu />
      <h1 className="text-3xl font-bold">Cadastrar questão — imagens externas</h1>
      <p className="text-gray-700">
        Use HTML no enunciado e nas alternativas. Para imagens, informe o nome do arquivo
        na tag, por exemplo: <code>&lt;img src=figura.png&gt;</code>.
      </p>

      <form onSubmit={addQuestion} className="max-w-4xl space-y-5 rounded bg-gray-100 p-5 shadow">
        <div>
          <label htmlFor="question-type" className="mb-1 block font-semibold">Tipo</label>
          <select
            id="question-type"
            value={form.type}
            onChange={event => setForm(current => ({
              ...current,
              type: event.target.value,
              resposta: "",
            }))}
            className="w-full rounded border bg-white p-2"
          >
            <option value="aberta">Aberta</option>
            <option value="completar">Completar (lacunas)</option>
            <option value="multiplaescolha_remodelada">Múltipla escolha</option>
          </select>
        </div>

        <section className="space-y-2">
          <label htmlFor="question-prompt" className="block font-semibold">Enunciado (HTML)</label>
          <textarea
            ref={promptRef}
            id="question-prompt"
            required
            rows={6}
            value={form.enunciado}
            onChange={event => {
              promptSelection.current = event.target.selectionStart;
              setForm(current => ({ ...current, enunciado: event.target.value }));
            }}
            onSelect={event => { promptSelection.current = event.currentTarget.selectionStart; }}
            className="w-full rounded border bg-white p-2 font-mono"
            placeholder={'Enunciado... <img src=figura.png>'}
          />
          <h2 className="font-semibold">Preview do enunciado</h2>
          <div
            className="min-h-12 overflow-auto rounded border bg-white p-3"
            dangerouslySetInnerHTML={preview(form.enunciado)}
          />
        </section>

        <section className="space-y-2 rounded border bg-white p-4">
          <h2 className="text-lg font-semibold">Upload de imagem para o enunciado</h2>
          <p className="text-sm text-gray-600">
            Selecione uma imagem. Ela receberá um nome aleatório e será inserida na posição selecionada no enunciado.
          </p>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={event => {
              setUploadFile(event.target.files?.[0] || null);
              setUploadStatus("");
            }}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="mr-2 rounded bg-gray-700 px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Escolher imagem
          </button>
          <button
            type="button"
            onClick={uploadImage}
            disabled={uploading || !uploadFile}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Enviando imagem..." : "Enviar e inserir no enunciado"}
          </button>
          <p className="text-sm" aria-live="polite">
            {uploadFile ? `Arquivo selecionado: ${uploadFile.name}` : "Nenhum arquivo selecionado."}
          </p>
          {uploadStatus && <p role="status">{uploadStatus}</p>}
        </section>

        <section className="space-y-2">
          <label htmlFor="question-answer" className="block font-semibold">
            {form.type === "aberta"
              ? "Resposta esperada (HTML)"
              : form.type === "completar"
                ? "Lacunas (HTML)"
                : "Alternativas (uma por linha; prefixe corretas com (CERTA))"}
          </label>
          <textarea
            id="question-answer"
            rows={6}
            value={form.resposta}
            onChange={event => setForm(current => ({ ...current, resposta: event.target.value }))}
            className="w-full rounded border bg-white p-2 font-mono"
            placeholder={
              form.type === "multiplaescolha_remodelada"
                ? "(CERTA)<img src=correta.png>\nErrada"
                : "Resposta..."
            }
          />
          <h2 className="font-semibold">
            {form.type === "multiplaescolha_remodelada" ? "Preview das alternativas" : "Preview"}
          </h2>
          <div className="space-y-2 rounded border bg-white p-3">
            {form.type === "multiplaescolha_remodelada"
              ? form.resposta.split(/\r?\n/).filter(alternative => alternative.trim()).map((alternative, index) => {
                const correct = alternative.startsWith("(CERTA)");
                const html = correct ? alternative.slice("(CERTA)".length) : alternative;
                return (
                  <div key={index}>
                    {correct && <strong>(CERTA) </strong>}
                    <span dangerouslySetInnerHTML={preview(html)} />
                  </div>
                );
              })
              : <div dangerouslySetInnerHTML={preview(form.resposta)} />}
          </div>
        </section>

        <div>
          <label htmlFor="question-notes" className="mb-1 block font-semibold">Observação</label>
          <textarea
            id="question-notes"
            rows={3}
            value={form.observacao}
            onChange={event => setForm(current => ({ ...current, observacao: event.target.value }))}
            className="w-full rounded border bg-white p-2"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Cadastrando..." : "Cadastrar questão"}
        </button>
      </form>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";

const API = "http://localhost:4999";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [circles, setCircles] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [assuntosPerQuestion, setAssuntosPerQuestion] = useState({});
  const [selectedAssuntoPerQuestion, setSelectedAssuntoPerQuestion] = useState({});
  const [form, setForm] = useState({ enunciado: "", type: "aberta", resposta: "", observacao: "", ativa: "1" });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ enunciado: "", type: "aberta", resposta: "", observacao: "", ativa: "1" });
  const [editId, setEditId] = useState(null);

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagesError, setImagesError] = useState("");

  const [htmlContent, setHtmlContent] = useState("<p>Visão prévia da questão</p>");

  function ajustaImagens(texto) {
    let url = `${API}/imagem/`;
    return texto.replace(/<img src=/gi, "<img src=" + url);
  }

  // Fetch assuntos for a specific question
  const fetchAssuntosForQuestion = async (questionId) => {
    try {
      const res = await axios.get(`${API}/questao/${questionId}/assuntos`);
      setAssuntosPerQuestion(prev => ({
        ...prev,
        [questionId]: res.data.details || []
      }));
    } catch (error) {
      console.error(`Erro ao carregar assuntos para questão ${questionId}:`, error);
    }
  };

  // Fetch questions, circles and assuntos
  const fetchImageFiles = async () => {
    try {
      const res = await axios.get(`${API}/lista_imagens`);
      if (res.data.message === "ok") {
        setImageFiles(res.data.details || []);
        setImagesError("");
      } else {
        setImageFiles([]);
        setImagesError(res.data.details || "Erro ao listar imagens");
      }
    } catch (error) {
      setImageFiles([]);
      setImagesError("Erro ao listar imagens");
    }
  };

  useEffect(() => {
    axios.get(`${API}/question`).then(res => {
      const questoes = res.data.details;
      setQuestions(questoes);
      // Fetch assuntos for cada questão
      questoes.forEach(q => fetchAssuntosForQuestion(q.id));
    });
    axios.get(`${API}/circle`).then(res => setCircles(res.data.details));
    axios.get(`${API}/assuntos`).then(res => setAssuntos(res.data.details || []));
    fetchImageFiles();
  }, []);

  // Add a new question
  const addQuestion = async () => {
    if (!window.confirm("Add this question?")) return;

    const { enunciado, type, resposta, observacao, ativa } = form;
    let dados;

    if (type === "aberta") {
      dados = { type, enunciado, resposta, observacao, ativa };
    } else if (type === "completar") {
      dados = { type, enunciado, lacunas: resposta, observacao, ativa };
    } else if (type === "multiplaescolha_remodelada") {
      const alternativas = resposta.split("\n");
      let corretas = [];
      let erradas = [];
      alternativas.forEach(alt => {
        if (alt.substring(0, 4) === "===>") {
          alt = alt.substring(4);
          corretas.push({ op: alt });
        } else {
          erradas.push({ op: alt });
        }
      });
      dados = { type, enunciado, corrects: corretas, wrongs: erradas, observacao, ativa };
    }

    try {
      const res = await axios.post(`${API}/incluir_questao`, dados, {
        headers: { "Content-Type": "application/json" }
      });
      if (res.data.message === "ok") {
        alert("Questão incluída com sucesso!");
        setForm({ enunciado: "", type: "aberta", resposta: "", observacao: "", ativa: "1" });
        const updated = await axios.get(`${API}/question`);
        setQuestions(updated.data.details);
      } else {
        alert(res.data.message + ":" + res.data.details);
      }
    } catch (error) {
      alert("Erro: ocorreu algum erro na leitura dos dados, verifique o backend");
    }
  };

  const handleUploadImage = async () => {
    if (!uploadFile) {
      alert("Selecione um arquivo de imagem antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const res = await axios.post(`${API}/upload_imagem`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.message === "ok") {
        setUploadStatus(`Upload concluído: ${res.data.details.filename}`);
        alert(`Upload concluído: ${res.data.details.filename}`);
        fetchImageFiles();
      } else {
        setUploadStatus(`Erro: ${res.data.details || res.data.message}`);
        alert(`Erro no upload: ${res.data.details || res.data.message}`);
      }
    } catch (error) {
      const details = error.response?.data?.details || error.message;
      setUploadStatus(`Erro no upload: ${details}`);
      alert(`Erro no upload: ${details}`);
    }
  };

  // Remove a question
  const removeQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to remove this question?")) return;
    await axios.delete(`${API}/question/${id}`);
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Start editing a question
  const startEditQuestion = (q) => {
    for (let key in q) {
      console.log(key + ": " + q[key]);
    }
    setEditForm({
      enunciado: q.enunciado || "",
      type: q.type || "aberta",
      resposta: q.resposta || "",
      observacao: q.observacao || "",
      ativa: q.ativa || "1"
    });
    setEditId(q.id);
    setIsEditing(true);
  };

  // Update question
  const updateQuestion = async (e) => {
    e.preventDefault();
    if (!window.confirm("Atualizar esta questão?")) return;
    try {
      await axios.put(`${API}/question/${editId}`, editForm, {
        headers: { "Content-Type": "application/json" }
      });
      alert("Questão atualizada!");
      setIsEditing(false);
      setEditId(null);
      setEditForm({ enunciado: "", type: "aberta", resposta: "" });
      const updated = await axios.get(`${API}/question`);
      setQuestions(updated.data.details);
    } catch (error) {
      alert("Erro ao atualizar a questão.");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setEditForm({ enunciado: "", type: "aberta", resposta: "", observacao: "", ativa: "1" });
  };


  const toggleActive = async (q) => {
    const newStatus = q.ativa == "1" ? "0" : "1";
    try {
      await axios.put(`${API}/question/${q.id}`, { ...q, ativa: newStatus }, {
        headers: { "Content-Type": "application/json" }
      });
      setQuestions(questions.map(quest =>
        quest.id === q.id ? { ...quest, ativa: newStatus } : quest
      ));
    } catch (error) {
      alert("Erro ao atualizar o status da questão.");
    }
  };

  const linkAssuntoToQuestao = async (questaoId) => {
    const assuntoId = selectedAssuntoPerQuestion[questaoId];
    if (!assuntoId) {
      alert("Selecione um assunto primeiro");
      return;
    }
    try {
      await axios.post(`${API}/assunto/${assuntoId}/questao/${questaoId}`);
      alert("Assunto vinculado com sucesso!");
      setSelectedAssuntoPerQuestion({ ...selectedAssuntoPerQuestion, [questaoId]: "" });
      // Reload assuntos for this question
      await fetchAssuntosForQuestion(questaoId);
    } catch (error) {
      alert("Erro ao vincular assunto à questão.");
    }
  };


  // HTML
  return (
    <div className="m-4">

      <Menu />

      <h1 className="text-4xl font-bold m-3">Questions</h1>

      <div className="flex gap-4">

        <form
          onSubmit={e => {
            e.preventDefault();
            addQuestion();
          }}
          className="mb-6 p-4 bg-gray-100 rounded shadow flex flex-col gap-4 flex-1"
        >
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Tipo</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              required
            >
              <option value="aberta">Aberta</option>
              <option value="completar">Completar (lacunas))</option>
              <option value="multiplaescolha_remodelada">Múltipla Escolha (remodelada)  </option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Enunciado</label>
            <textarea
              rows={5}
              value={form.enunciado}
              onChange={e => setForm({ ...form, enunciado: e.target.value })}
              placeholder="Digite o enunciado da questão"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              required
            >
            </textarea>

            <button
              type="button"
              onClick={() => {
                const html = ajustaImagens(form.enunciado);
                setHtmlContent(html);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded shadow font-bold transition hover:bg-green-700"
            >
              Visualizar questão em HTML
            </button>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Resposta</label>
            <textarea
              value={form.resposta}
              onChange={e => setForm({ ...form, resposta: e.target.value })}
              placeholder="Digite a resposta (se aplicável)"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              rows={3}
            />
            <button
              type="button"
              onClick={() => {
                const html = ajustaImagens(form.resposta);
                setHtmlContent(html);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded shadow font-bold transition hover:bg-green-700"
            >
              Visualizar resposta(s) em HTML
            </button>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Observação</label>
            <textarea
              value={form.observacao}
              onChange={e => setForm({ ...form, observacao: e.target.value })}
              placeholder="Observação"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              rows={3}
            />
          </div>


          <div>
            <label className="block mb-1 font-semibold text-gray-700">Imagem de apoio</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setUploadFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <button
                type="button"
                onClick={handleUploadImage}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow font-bold transition hover:bg-blue-700"
              >
                Upload imagem
              </button>
              <span className="text-sm text-gray-600">{uploadStatus}</span>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Ativa? (0 = não, 1 = sim)</label>
            <textarea
              value={form.ativa}
              onChange={e => setForm({ ...form, ativa: e.target.value })}
              placeholder="Questão ativa? (0 = não, 1 = sim)"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              rows={3}
            />
          </div>







          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded shadow font-bold transition hover:bg-blue-700"
          >
            Adicionar Questão
          </button>


        </form>

        <div className="p-4 bg-gray-100 rounded shadow flex-1" dangerouslySetInnerHTML={{ __html: htmlContent }} />

      </div>

      <div className="mt-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Imagens do sistema</h2>
        {imagesError ? (
          <p className="text-sm text-red-600">{imagesError}</p>
        ) : imageFiles.length === 0 ? (
          <p className="text-sm text-gray-600">Nenhuma imagem encontrada.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imageFiles.map(file => (
              <div key={file} className="border rounded overflow-hidden">
                <img
                  src={`${API}/imagem/${encodeURIComponent(file)}`}
                  alt={file}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 bg-gray-50 text-sm break-words">{file}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/*
      <ul>
        {questions.map(q => (
          <li key={q.id}>
            {q.id}) {q.enunciado} ({q.type})
            <button 
            onClick={() => removeQuestion(q.id)} 
            className="ml-2 px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition"
            style={{ marginLeft: 10 }}>Remove</button>
          </li>
        ))}
      </ul>
      */}
      <ul>
        {questions.map(q => (
          <li key={q.id} className="border rounded p-4 bg-white shadow mb-4">
            <span className="inline-block bg-green-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold mt-6">
              {q.id})
              {q.ativa == "0" ? "<span className=text-blue>(INATIVA)</span> " : ""}
              <span dangerouslySetInnerHTML={{ __html: ajustaImagens(q.enunciado) }} /> ({q.type})
            </span>

            {q.type === "multiplaescolha" && (
              <div>
                <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                  {q.alternativas.map(a => (
                    <div key={a.id}>
                      {a.certa && <span>===&gt;</span>}
                      <span dangerouslySetInnerHTML={{ __html: ajustaImagens(a.descricao) }} /><br />
                    </div>
                  ))}
                </span>
              </div>
            )}

            {q.type === "aberta" && (
              <div>
                <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                  Resposta: {q.resposta}
                </span>
              </div>
            )}

            {q.type === "completar" && (
              <div>
                <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                  Lacunas: {q.lacunas}
                </span>
              </div>
            )}

            {assuntosPerQuestion[q.id] && assuntosPerQuestion[q.id].length > 0 && (
              <div style={{ marginTop: 8 }}>
                <span className="inline-block bg-blue-100 border border-blue-400 text-blue-800 px-3 py-1 rounded font-semibold">
                  Assuntos: {assuntosPerQuestion[q.id].map(a => a.nome).join(", ")}
                </span>
              </div>
            )}


            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => removeQuestion(q.id)}
                className="px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition"
              >
                Remove
              </button>

              <button
                onClick={() => startEditQuestion(q)}
                className="px-3 py-1 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 font-semibold transition"
              >
                Edit
              </button>

              <button
                onClick={() => toggleActive(q)}
                className={`px-3 py-1 ${q.ativa == "1" ? "bg-gray-400 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-800"} text-white rounded shadow font-semibold transition`}
              >
                {q.ativa == "1" ? "desativar" : "ATIVAR"}
              </button>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={selectedAssuntoPerQuestion[q.id] || ""}
                  onChange={(e) => setSelectedAssuntoPerQuestion({ ...selectedAssuntoPerQuestion, [q.id]: e.target.value })}
                  className="px-2 py-1 border rounded bg-gray-50 text-sm"
                  style={{ minWidth: 150 }}
                >
                  <option value="">Selecione um assunto...</option>
                  {assuntos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => linkAssuntoToQuestao(q.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded shadow hover:bg-green-700 font-semibold transition text-sm"
                >
                  Vincular Assunto
                </button>
              </div>
            </div>

          </li>
        ))}
      </ul>

      <h1
        className="text-4xl font-bold m-3">
        Add Question
      </h1>


      {/*

      <textarea
        rows={3}
        placeholder="Enunciado"
        value={form.enunciado}
        onChange={e => setForm({ ...form, enunciado: e.target.value })}
      ></textarea>
      <br />
      <label>Type:</label>
      <select
        value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value })}
      >
        <option value="aberta">Aberta</option>
        <option value="completar">Completar</option>
        <option value="multiplaescolha">Multipla Escolha</option>
      </select>
      <br />
      <label>Resposta:</label>

      <textarea
        rows={3}
        placeholder="Resposta"
        value={form.resposta}
        onChange={e => setForm({ ...form, resposta: e.target.value })}
      ></textarea>
      <br />

      <button onClick={addQuestion}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-bold transition"
      >Add</button>

*/}

      {/* Edit Question Area */}
      {
        isEditing && (
          <div className="mb-6 p-4 bg-yellow-50 rounded shadow flex flex-col gap-4 max-w-lg">
            <h2 className="text-2xl font-bold mb-2 text-yellow-800">Editar Questão</h2>
            <form onSubmit={updateQuestion} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Tipo</label>
                <select
                  value={editForm.type}
                  onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
                  required
                >
                  <option value="aberta">Aberta</option>
                  <option value="completar">Completar (lacunas)</option>
                  <option value="multiplaescolha_remodelada">Múltipla Escolha (remodelada)</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Enunciado</label>
                <textarea
                  rows={3}
                  value={editForm.enunciado}
                  onChange={e => setEditForm({ ...editForm, enunciado: e.target.value })}
                  placeholder="Digite o enunciado da questão"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Resposta</label>
                <textarea
                  value={editForm.resposta}
                  onChange={e => setEditForm({ ...editForm, resposta: e.target.value })}
                  placeholder="Digite a resposta (se aplicável)"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Observação</label>
                <textarea
                  value={editForm.observacao}
                  onChange={e => setEditForm({ ...editForm, observacao: e.target.value })}
                  placeholder="Observação"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
                  rows={2}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Ativa? (0 = não, 1 = sim)</label>
                <textarea
                  value={editForm.ativa}
                  onChange={e => setEditForm({ ...editForm, ativa: e.target.value })}
                  placeholder="Questão ativa? (0 = não, 1 = sim)"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
                  rows={1}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded shadow font-bold transition hover:bg-yellow-700"
                >
                  Atualizar Questão
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-400 text-white rounded shadow font-bold transition hover:bg-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )
      }



    </div >
  );
}
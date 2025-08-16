"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";

const API = "http://localhost:4999";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [circles, setCircles] = useState([]);
  const [form, setForm] = useState({ enunciado: "", type: "aberta", resposta: "" });
  const [selectedCircle, setSelectedCircle] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [filterCircle, setFilterCircle] = useState("");

  const filteredQuestions = filterCircle
    ? questions.filter(q => q.circulo_id === filterCircle)
    : questions;

  // Fetch questions and circles
  useEffect(() => {
    axios.get(`${API}/question`).then(res => setQuestions(res.data.details));
    axios.get(`${API}/circle`).then(res => setCircles(res.data.details));
  }, []);

  // Add a new question
  const addQuestion = async () => {
    if (!window.confirm("Add this question?")) return;

    const { enunciado, type, resposta } = form;
    let dados;

    if (type === "aberta") {
      dados = { type, enunciado, resposta };
    } else if (type === "completar") {
      dados = { type, enunciado, lacunas: resposta };
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
      dados = { type, enunciado, corrects: corretas, wrongs: erradas };
    }

    try {
      const res = await axios.post(`${API}/incluir_questao`, dados, {
        headers: { "Content-Type": "application/json" }
      });
      if (res.data.message === "ok") {
        alert("Questão incluída com sucesso!");
        setForm({ enunciado: "", type: "aberta", resposta: "" });
        const updated = await axios.get(`${API}/question`);
        setQuestions(updated.data.details);
      } else {
        alert(res.data.message + ":" + res.data.details);
      }
    } catch (error) {
      alert("Erro: ocorreu algum erro na leitura dos dados, verifique o backend");
    }
    /*

    await axios.post(`${API}/incluir_questao`, form);
    const res = await axios.get(`${API}/question`);
    setQuestions(res.data.details);
    setForm({ enunciado: "", type: "aberta", resposta: "" });
    */
  };

  // Remove a question
  const removeQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to remove this question?")) return;
    await axios.delete(`${API}/question/${id}`);
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Assign question to circle
  const assignToCircle = async () => {
    if (!window.confirm("Assign this question to the selected circle?")) return;
    await axios.post(`${API}/questions_circle/${selectedQuestion}/${selectedCircle}`);
    alert("Question assigned to circle!");
  };

  // HTML
  return (
    <div className="m-4">

      <Menu />

      <h1 className="text-4xl font-bold m-3">Filter Questions
      </h1>

      <label className="mr-2 font-semibold">Filter by Circle:</label>
      <select
        value={filterCircle}
        onChange={e => setFilterCircle(e.target.value)}
        className="mb-4 px-2 py-1 rounded border"
      >
        <option value="">All Circles</option>
        {circles.map(c => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>

      <h1 className="text-4xl font-bold m-3">Questions</h1>

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
        {filteredQuestions.map(q => (
          <li key={q.id}>
            {q.id}) {q.enunciado} ({q.type})

            {q.type === "MultiplaEscolha" && (
              <div>
              <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                {q.alternativas.map(a => (
                  <div key={a.descricao}>
                    {a.certa && <span>===&gt;</span>} {a.descricao} <br />
                  </div>
                ))}
                </span>
              </div>
            )}

            {q.type === "Aberta" && (
              <div>
                <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                Resposta: {q.resposta}
                </span>
              </div>
            )}

            {q.type === "Completar" && (
              <div>
                <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                Lacunas: {q.lacunas}
                </span>
              </div>
            )}
            

            <button
              onClick={() => removeQuestion(q.id)}
              className="ml-2 px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition"
              style={{ marginLeft: 10 }}>Remove</button>
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

      <form
        onSubmit={e => {
          e.preventDefault();
          addQuestion();
        }}
        className="mb-6 p-4 bg-white rounded shadow flex flex-col gap-4 max-w-lg"
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
            rows={3}
            value={form.enunciado}
            onChange={e => setForm({ ...form, enunciado: e.target.value })}
            placeholder="Digite o enunciado da questão"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            required
          >
          </textarea>
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
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded shadow font-bold transition hover:bg-blue-700"
        >
          Adicionar Questão
        </button>
      </form>



      <h1
        className="text-4xl font-bold m-3">
        Assign Question to Circle
      </h1>
      <select onChange={e => setSelectedQuestion(e.target.value)} value={selectedQuestion}>
        <option value="">Select Question</option>
        {questions.map(q => (
          <option key={q.id} value={q.id}>{q.id}|{q.enunciado}</option>
        ))}
      </select>
      <select onChange={e => setSelectedCircle(e.target.value)} value={selectedCircle}>
        <option value="">Select Circle</option>
        {circles.map(c => (
          <option key={c.id} value={c.id}>{c.id}|{c.nome}</option>
        ))}
      </select>
      <button
        onClick={assignToCircle}
        disabled={!selectedQuestion || !selectedCircle}
        className={`ml-2 px-4 py-2 bg-green-600 text-white rounded shadow font-bold transition ${(!selectedQuestion || !selectedCircle) ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
          }`}
      >
        Assign
      </button>

    </div>
  );
}
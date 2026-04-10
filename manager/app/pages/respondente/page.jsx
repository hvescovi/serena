"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";

const API = "http://localhost:4999";

export default function Respondentes() {
  const [respondentes, setRespondentes] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    observacao: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [observacaoFilter, setObservacaoFilter] = useState("");

  // Fetch respondentes
  const fetchRespondentes = async () => {
    try {
      const res = await axios.get(`${API}/respondente`);
      setRespondentes(res.data.details || []);
    } catch (error) {
      console.error("Error fetching respondentes:", error);
      alert("Error fetching respondentes");
    }
  };

  useEffect(() => {
    fetchRespondentes();
  }, []);

  // Add new respondente
  const addRespondente = async () => {
    try {
      await axios.post(`${API}/respondente`, form);
      setForm({
        nome: "",
        email: "",
        observacao: ""
      });
      fetchRespondentes();
    } catch (error) {
      console.error("Error adding respondente:", error);
      alert("Error adding respondente");
    }
  };

  // Edit respondente
  const editRespondente = (respondente) => {
    setForm({
      nome: respondente.nome || "",
      email: respondente.email || "",
      observacao: respondente.observacao || ""
    });
    setIsEditing(true);
    setEditId(respondente.id);
  };

  // Update respondente
  const updateRespondente = async () => {
    try {
      await axios.put(`${API}/respondente/${editId}`, form);
      setIsEditing(false);
      setEditId(null);
      setForm({
        nome: "",
        email: "",
        observacao: ""
      });
      fetchRespondentes();
    } catch (error) {
      console.error("Error updating respondente:", error);
      alert("Error updating respondente");
    }
  };

  // Delete respondente
  const deleteRespondente = async (id) => {
    if (!window.confirm("Are you sure you want to delete this respondente?")) return;
    try {
      await axios.delete(`${API}/respondente/${id}`);
      fetchRespondentes();
    } catch (error) {
      console.error("Error deleting respondente:", error);
      alert("Error deleting respondente");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      nome: "",
      email: "",
      observacao: ""
    });
  };

  // Filtered respondentes
  const filteredRespondentes = respondentes.filter(r => r.observacao.toLowerCase().includes(observacaoFilter.toLowerCase()));

  return (
    <div className="m-4">
      <Menu />

      <h1 className="text-3xl font-bold mb-4">Gerenciar Respondentes</h1>

      <form
        onSubmit={e => {
          e.preventDefault();
          isEditing ? updateRespondente() : addRespondente();
        }}
        className="mb-6 p-4 bg-white rounded shadow flex flex-col gap-4 max-w-lg"
      >
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Nome</label>
          <input
            type="text"
            placeholder="Nome"
            value={form.nome}
            onChange={e => setForm({ ...form, nome: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Observação</label>
          <input
            type="text"
            placeholder="Observação"
            value={form.observacao}
            onChange={e => setForm({ ...form, observacao: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded shadow font-bold transition hover:bg-green-700"
          >
            {isEditing ? "Atualizar" : "Adicionar"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-400 text-white rounded shadow font-bold transition hover:bg-gray-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mb-4">
        <label className="block mb-1 font-semibold text-gray-700">Filtrar por Observação</label>
        <input
          type="text"
          placeholder="Digite para filtrar observações"
          value={observacaoFilter}
          onChange={e => setObservacaoFilter(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 max-w-lg"
        />
      </div>

      <h2 className="text-xl font-bold mb-2">Lista de Respondentes</h2>
      <ul className="space-y-2">
        {filteredRespondentes.length === 0 && <li className="text-gray-500">Nenhum respondente encontrado.</li>}
        {filteredRespondentes.map(r => (
          <li key={r.id} className="p-4 bg-white rounded shadow border">
            <div className="flex justify-between items-center">
              <div>
                <strong>{r.nome}</strong> - {r.email} - {r.observacao}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editRespondente(r)}
                  className="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-semibold transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteRespondente(r.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Menu from "../../components/Menu";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ListasPage() {
  const [listas, setListas] = useState([]);
  const [filtroSugestoes, setFiltroSugestoes] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    filtro_respondente: "",
    ativa: "1"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const firstFieldRef = useRef(null);

  // Fetch all listas and filter suggestions
  const fetchListas = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/lista`);
      setListas(res.data.details || []);
      setError("");
    } catch (err) {
      setError("Erro ao carregar listas");
      console.error("Error fetching listas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiltroSugestoes = async () => {
    try {
      const res = await axios.get(`${API}/lista/filtro/sugestoes`);
      setFiltroSugestoes(res.data.details || []);
    } catch (err) {
      console.error("Error fetching filter suggestions:", err);
    }
  };

  useEffect(() => {
    fetchListas();
    fetchFiltroSugestoes();
  }, []);

  // Create new lista
  const createLista = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${API}/lista`, form);
      resetForm();
      setError("");
      fetchListas();
    } catch (err) {
      setError("Erro ao criar lista");
      console.error("Error creating lista:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit lista
  const editLista = (lista) => {
    setForm({
      nome: lista.nome,
      filtro_respondente: lista.filtro_respondente || "",
      ativa: lista.ativa || "1"
    });
    setIsEditing(true);
    setEditId(lista.id);
    setError("");
    setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);
  };

  // Update lista
  const updateLista = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    try {
      setIsLoading(true);
      await axios.put(`${API}/lista/${editId}`, form);
      resetForm();
      setError("");
      fetchListas();
    } catch (err) {
      setError("Erro ao atualizar lista");
      console.error("Error updating lista:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete lista
  const deleteLista = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta lista?")) {
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`${API}/lista/${id}`);
      setError("");
      fetchListas();
    } catch (err) {
      setError("Erro ao excluir lista");
      console.error("Error deleting lista:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      nome: "",
      filtro_respondente: "",
      ativa: "1"
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleCancel = () => {
    resetForm();
    setError("");
  };

  return (
    <div className="m-4">
      <Menu />

      <h1 className="text-4xl font-bold m-3">Listas de Exercícios</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form
        onSubmit={isEditing ? updateLista : createLista}
        className="mb-4 w-full max-w-2xl border p-4 rounded bg-white shadow"
      >
        <div className="mb-4">
          <label htmlFor="nome" className="block font-semibold mb-2">
            Nome *
          </label>
          <input
            ref={firstFieldRef}
            id="nome"
            placeholder="Nome da lista"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="filtro_respondente" className="block font-semibold mb-2">
            Filtro Respondente
          </label>
          <input
            id="filtro_respondente"
            list="filtroSugestoesDatalist"
            placeholder="Filtro para selecionar respondentes (ex: |g:301-2022|)"
            value={form.filtro_respondente}
            onChange={(e) => setForm({ ...form, filtro_respondente: e.target.value })}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <datalist id="filtroSugestoesDatalist">
            {filtroSugestoes.map((sugestao) => (
              <option key={sugestao} value={sugestao} />
            ))}
          </datalist>
          {filtroSugestoes.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <details className="cursor-pointer">
                <summary className="font-semibold hover:text-blue-600">
                  Valores disponíveis ({filtroSugestoes.length})
                </summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {filtroSugestoes.map((sugestao) => (
                    <button
                      key={sugestao}
                      type="button"
                      onClick={() => setForm({ ...form, filtro_respondente: sugestao })}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition"
                      title={`Click to select: ${sugestao}`}
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="ativa" className="block font-semibold mb-2">
            Ativa (0=Não, 1=Sim)
          </label>
          <select
            id="ativa"
            value={form.ativa}
            onChange={(e) => setForm({ ...form, ativa: e.target.value })}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="0">Não</option>
            <option value="1">Sim</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-700 font-semibold transition disabled:opacity-50"
          >
            {isLoading ? "Processando..." : isEditing ? "Atualizar" : "Incluir nova"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {isLoading && listas.length === 0 ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : listas.length === 0 ? (
        <div className="text-center text-gray-500">Nenhuma lista encontrada</div>
      ) : (
        <ul>
          {listas.map((lista) => (
            <li
              key={lista.id}
              className="mb-4 w-full max-w-4xl border p-4 rounded bg-white shadow hover:shadow-lg transition"
            >
              <div className="mb-2">
                <strong className="text-lg">
                  ID: {lista.id} - {lista.nome}
                </strong>
              </div>

              <div className="mb-3 text-sm text-gray-700">
                <div className="mb-1">
                  <span className="font-semibold">Data de Criação:</span> {new Date(lista.timestamp).toLocaleString("pt-BR")}
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Filtro Respondente:</span> {lista.filtro_respondente || "N/A"}
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Ativa:</span>{" "}
                  <span className={lista.ativa === "1" ? "text-green-600" : "text-red-600"}>
                    {lista.ativa === "1" ? "Sim" : "Não"}
                  </span>
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Questões:</span> {lista.questoes?.length || 0} questões
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => editLista(lista)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-700 font-semibold transition disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteLista(lista.id)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition disabled:opacity-50"
                >
                  Excluir
                </button>
                <a
                  href={`/questions_lista`}
                  className="px-3 py-1 bg-purple-600 text-white rounded shadow hover:bg-purple-700 font-semibold transition inline-block"
                >
                  Gerenciar Questões
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

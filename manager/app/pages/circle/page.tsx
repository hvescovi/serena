"use client"; 

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Menu from "../../components/Menu";

const API = "http://localhost:4999";

export default function Circles() {
  const [circles, setCircles] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    data: "",
    filtro_respondente: "",
    ativo: "0",
    maximo_questoes: 10,
    autor: "",
    senha: "",
    n_reservas: 0,
    questoes: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const firstFieldRef = useRef(null);

  // Fetch circles
  const fetchCircles = async () => {
    const res = await axios.get(`${API}/list/Circulo`);
    setCircles(res.data.details);
  };

  useEffect(() => {
    fetchCircles();
  }, []);

  // Add new circle
  const addCircle = async () => {
    await axios.post(`${API}/add/Circulo`, form);
    setForm({
      nome: "",
      data: "",
      filtro_respondente: "",
      ativo: "0",
      maximo_questoes: 10,
      autor: "",
      senha: "",
      n_reservas: 0,
      questoes: []
    });
    fetchCircles();
  };

  // Edit circle
  const editCircle = (circle) => {
    setForm({ ...circle });
    setIsEditing(true);
    setEditId(circle.id);
    setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);
  };

  // Update circle
  const updateCircle = async () => {
    await axios.put(`${API}/circle/${editId}`, form);
    setIsEditing(false);
    setEditId(null);
    setForm({
      nome: "",
      data: "",
      filtro_respondente: "",
      ativo: "0",
      maximo_questoes: 10,
      autor: "",
      senha: "",
      n_reservas: 0,
      questoes: []
    });
    fetchCircles();
  };

  // Delete circle
  const deleteCircle = async (nome) => {
    await axios.delete(`${API}/delete/Circulo/${nome}`);
    fetchCircles();
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      nome: "",
      data: "",
      filtro_respondente: "",
      ativo: "0",
      maximo_questoes: 10,
      autor: "",
      senha: "",
      n_reservas: 0,
      questoes: []
    });
  };

  return (
    <div className="m-4">

       <Menu />
       
      <h2>Gerenciar Círculos</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          isEditing ? updateCircle() : addCircle();
        }}
        style={{ marginBottom: 20 }}
      >
        <label htmlFor="nome">Nome</label>
        <input
          ref={firstFieldRef}
          placeholder="Nome"
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
          required
          className="mb-2 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <label htmlFor="data">Data</label>
        <input
          placeholder="Data"
          value={form.data}
          onChange={e => setForm({ ...form, data: e.target.value })}
          className="mb-2 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <label htmlFor="filtro_respondente">Filtro Respondente</label>
        <input
          placeholder="Filtro Respondente"
          value={form.filtro_respondente}
          onChange={e => setForm({ ...form, filtro_respondente: e.target.value })}
          className="mb-2 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <label htmlFor="ativo">Ativo (0/1)</label>
        <input
          placeholder="Ativo (0/1)"
          value={form.ativo}
          onChange={e => setForm({ ...form, ativo: e.target.value })}
          className="mb-2 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"           
        />
        <label htmlFor="maximo_questoes">Máximo de Questões</label>
        <input
          type="number"
          placeholder="Máximo de Questões"
          value={form.maximo_questoes}
          onChange={e => setForm({ ...form, maximo_questoes: Number(e.target.value) })}
          className="mb-2 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <label htmlFor="autor">Autor</label>
        <input
          placeholder="Autor"
          value={form.autor}
          onChange={e => setForm({ ...form, autor: e.target.value })}
          className="mb-2 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <label htmlFor="senha">Senha</label>
        <input
          type="password"
          placeholder="Senha"
          value={form.senha}
          onChange={e => setForm({ ...form, senha: e.target.value })}
          className="mb-2 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <label htmlFor="n_reservas">Número de Questões Reservas</label>
        <input
          type="number"
          placeholder="Número de Questões Reservas"
          value={form.n_reservas}
          onChange={e => setForm({ ...form, n_reservas: Number(e.target.value) })}
          className="mb-2 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        
        <label htmlFor="questoes">Número de Questões</label>
        <input
          type="number"
          placeholder="Número de Questões"
          value={form.questoes.length}
          readOnly
          className="mb-2 w-full px-3 py-2 border rounded bg-gray-100 text-gray-500 focus:outline-none"
        />

        <button type="submit"
        className="ml-2 px-3 py-1 bg-green-500 text-white rounded shadow hover:bg-green-700 font-semibold transition"
        >{isEditing ? "Atualizar" : "Incluir novo!"}
          
        </button>
        {isEditing && (
          <button type="button" onClick={cancelEdit} 
          className="ml-2 px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition">
            Cancelar
          </button>
        )}
      </form>

      <ul>
        {circles.map(c => (
          <li key={c.nome} style={{ marginBottom: 10, border: "1px solid #ccc", padding: 10 }}>
            {c.id} - <strong>{c.nome}</strong> ({c.data})<br />
            Autor: {c.autor} &asymp;
            Ativo: {c.ativo} &asymp;
            Questões a responder (Máx. Questões): {c.maximo_questoes}
            <br />
            Data: {c.data} &asymp;
            Filtro Respondente: {c.filtro_respondente} &asymp;
            Senha: {c.senha} &asymp;
            N. Reservas: {c.n_reservas} &asymp;
            Questões: {c.questoes.length}
            
            <br />
            <button onClick={() => editCircle(c)} 
            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-700 font-semibold transition"
              >Editar</button>
            <button onClick={() => deleteCircle(c.nome)} 
            className="ml-2 px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition"
            >Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
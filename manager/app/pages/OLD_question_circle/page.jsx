"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";

const API = "http://localhost:4999";

export default function QuestionsCircleCRUD() {
  const [questions, setQuestions] = useState([]);
  const [circles, setCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState("");
  const [circleQuestions, setCircleQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionToAdd, setSelectedQuestionToAdd] = useState("");

  // Fetch circles and all questions
  useEffect(() => {
    axios.get(`${API}/circle`).then(res => setCircles(res.data.details));
    axios.get(`${API}/question`).then(res => setQuestions(res.data.details));
  }, []);

  // Fetch questions assigned to selected circle
  useEffect(() => {
    if (!selectedCircle) {
      setCircleQuestions([]);
      setAvailableQuestions([]);
      return;
    }
    axios.get(`${API}/questions_circle/${selectedCircle}`).then(res => {
      setCircleQuestions(res.data.details);
      // Filter out questions already assigned to the circle
      const assignedIds = new Set(res.data.details.map(q => q.id));
      setAvailableQuestions(questions.filter(q => !assignedIds.has(q.id)));
    });
  }, [selectedCircle, questions]);

  // Add question to circle
  const addQuestionToCircle = async () => {
    if (!selectedQuestionToAdd) return;
    if (!window.confirm("Add this question to the circle?")) return;
    await axios.post(`${API}/questions_circle/${selectedQuestionToAdd}/${selectedCircle}`);
    setSelectedQuestionToAdd("");
    // Refresh questions in circle
    const res = await axios.get(`${API}/questions_circle/${selectedCircle}`);
    setCircleQuestions(res.data.details);
    const assignedIds = new Set(res.data.details.map(q => q.id));
    setAvailableQuestions(questions.filter(q => !assignedIds.has(q.id)));
  };

  // Remove question from circle
  const removeQuestionFromCircle = async (qid) => {
    if (!window.confirm("Remove this question from the circle?")) return;
    await axios.delete(`${API}/questions_circle/${qid}/${selectedCircle}`);
    // Refresh questions in circle
    const res = await axios.get(`${API}/questions_circle/${selectedCircle}`);
    setCircleQuestions(res.data.details);
    const assignedIds = new Set(res.data.details.map(q => q.id));
    setAvailableQuestions(questions.filter(q => !assignedIds.has(q.id)));
  };

  return (
    <div className="m-4">
      
      <Menu />

      <h1 className="text-3xl font-bold mb-4">Manage Questions in Circle</h1>

      <label className="font-semibold mr-2">Select Circle:</label>
      <select
        value={selectedCircle}
        onChange={e => setSelectedCircle(e.target.value)}
        className="mb-6 px-2 py-1 rounded border"
      >
        <option value="">-- Select --</option>
        {circles.map(c => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>

      {selectedCircle && (
        <>
          <h2 className="text-xl font-bold mb-2">Questions in this Circle</h2>
          <ul className="mb-4">
            {circleQuestions.length === 0 && <li className="text-gray-500">No questions assigned.</li>}
            {circleQuestions.map(q => (
              <li key={q.id} className="mb-2">
                {q.id}) {q.enunciado} ({q.type})
                <button
                  onClick={() => removeQuestionFromCircle(q.id)}
                  className="ml-2 px-3 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 font-semibold transition"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold mb-2">Add Question to Circle</h2>
          <select
            value={selectedQuestionToAdd}
            onChange={e => setSelectedQuestionToAdd(e.target.value)}
            className="mr-2 px-2 py-1 rounded border"
          >
            <option value="">-- Select Question --</option>
            {availableQuestions.map(q => (
              <option key={q.id} value={q.id}>{q.id}) {q.enunciado}</option>
            ))}
          </select>
          <button
            onClick={addQuestionToCircle}
            disabled={!selectedQuestionToAdd}
            className={`px-4 py-2 bg-green-600 text-white rounded shadow font-bold transition ${!selectedQuestionToAdd ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
          >
            Add
          </button>
        </>
      )}
    </div>
  );
}
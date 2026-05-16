"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";
import { ajustaImagens } from "../../lib/htmlUtils";

const API = process.env.NEXT_PUBLIC_API_URL; // || "http://localhost:4999";

export default function QuestionsListaBatchCRUD() {
  const [questions, setQuestions] = useState([]);
  const [listas, setListas] = useState([]);
  const [selectedLista, setSelectedLista] = useState("");
  const [listaQuestions, setListaQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionsToAdd, setSelectedQuestionsToAdd] = useState(new Set());
  const [selectedQuestionsToRemove, setSelectedQuestionsToRemove] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch listas and all questions
  useEffect(() => {
    axios.get(`${API}/lista`).then(res => setListas(res.data.details));
    axios.get(`${API}/question`).then(res => setQuestions(res.data.details));
  }, []);

  // Fetch questions assigned to selected lista
  useEffect(() => {
    if (!selectedLista) {
      setListaQuestions([]);
      setAvailableQuestions([]);
      setSelectedQuestionsToAdd(new Set());
      setSelectedQuestionsToRemove(new Set());
      return;
    }
    axios.get(`${API}/lista/${selectedLista}/questoes`).then(res => {
      setListaQuestions(res.data.details);
      const assignedIds = new Set(res.data.details.map(q => q.id));
      setAvailableQuestions(questions.filter(q => !assignedIds.has(q.id)));
      setSelectedQuestionsToAdd(new Set());
      setSelectedQuestionsToRemove(new Set());
    });
  }, [selectedLista, questions]);

  // Handle checkbox for adding questions
  const handleAddCheckboxChange = (questionId) => {
    const newSelected = new Set(selectedQuestionsToAdd);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestionsToAdd(newSelected);
  };

  // Handle checkbox for removing questions
  const handleRemoveCheckboxChange = (questionId) => {
    const newSelected = new Set(selectedQuestionsToRemove);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestionsToRemove(newSelected);
  };

  // Add multiple questions to lista
  const addQuestionsToLista = async () => {
    if (selectedQuestionsToAdd.size === 0) return;
    if (!window.confirm(`Add ${selectedQuestionsToAdd.size} question(s) to the lista?`)) return;

    setIsLoading(true);
    try {
      // Send POST requests for all selected questions
      const addPromises = Array.from(selectedQuestionsToAdd).map(qid =>
        axios.post(`${API}/lista/${selectedLista}/questao/${qid}`)
      );
      await Promise.all(addPromises);

      // Refresh questions in lista
      const res = await axios.get(`${API}/lista/${selectedLista}/questoes`);
      setListaQuestions(res.data.details);
      const assignedIds = new Set(res.data.details.map(q => q.id));
      setAvailableQuestions(questions.filter(q => !assignedIds.has(q.id)));
      setSelectedQuestionsToAdd(new Set());
    } catch (error) {
      console.error("Error adding questions:", error);
      alert("Error adding questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove multiple questions from lista
  const removeQuestionsFromLista = async () => {
    if (selectedQuestionsToRemove.size === 0) return;
    if (!window.confirm(`Remove ${selectedQuestionsToRemove.size} question(s) from the lista?`)) return;

    setIsLoading(true);
    try {
      // Send DELETE requests for all selected questions
      const removePromises = Array.from(selectedQuestionsToRemove).map(qid =>
        axios.delete(`${API}/lista/${selectedLista}/questao/${qid}`)
      );
      await Promise.all(removePromises);

      // Refresh questions in lista
      const res = await axios.get(`${API}/lista/${selectedLista}/questoes`);
      setListaQuestions(res.data.details);
      const assignedIds = new Set(res.data.details.map(q => q.id));
      setAvailableQuestions(questions.filter(q => !assignedIds.has(q.id)));
      setSelectedQuestionsToRemove(new Set());
    } catch (error) {
      console.error("Error removing questions:", error);
      alert("Error removing questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="m-4">
      <Menu />

      <h1 className="text-3xl font-bold mb-4">Batch Manage Questions in Lista</h1>

      <label className="font-semibold mr-2">Select Lista:</label>
      <select
        value={selectedLista}
        onChange={e => setSelectedLista(e.target.value)}
        className="mb-6 px-2 py-1 rounded border"
      >
        <option value="">-- Select --</option>
        {listas.map(l => (
          <option key={l.id} value={l.id}>{l.nome}</option>
        ))}
      </select>

      {selectedLista && (
        <>
          {/* Remove section */}
          <div className="mb-8 p-4 bg-red-50 rounded border border-red-200">
            <h2 className="text-xl font-bold mb-4 text-red-700">Remove Questions from Lista</h2>
            {listaQuestions.length === 0 ? (
              <p className="text-gray-500">No questions assigned to this lista.</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {listaQuestions.map(q => (
                    <label key={q.id} className="flex items-center mb-2 cursor-pointer border border-gray-300 rounded p-2 hover:bg-yellow-200">
                      <input
                        type="checkbox"
                        checked={selectedQuestionsToRemove.has(q.id)}
                        onChange={() => handleRemoveCheckboxChange(q.id)}
                        className="mr-3 w-4 h-4"
                        disabled={isLoading}
                      />
                      <span>
                        {q.id})
                        (<b>{q.type}</b>)
                        <span dangerouslySetInnerHTML={{ __html: ajustaImagens(API, q.enunciado) }} />
                      </span>

                      {/* details of the question */}

                      {q.type === "multiplaescolha" && (
                        <div>
                          <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                            {q.alternativas.map(a => (
                              <div key={a.id}>
                                {a.certa && <span>(CERTA)</span>}
                                <span dangerouslySetInnerHTML={{ __html: a.descricao }} /><br />
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



                    </label>
                  ))}
                </div>
                <button
                  onClick={removeQuestionsFromLista}
                  disabled={selectedQuestionsToRemove.size === 0 || isLoading}
                  className={`px-4 py-2 bg-red-600 text-white rounded shadow font-bold transition ${selectedQuestionsToRemove.size === 0 || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-700"
                    }`}
                >
                  {isLoading ? "Processing..." : `Remove ${selectedQuestionsToRemove.size} Selected`}
                </button>
              </>
            )}
          </div>

          {/* Add section */}
          <div className="mb-8 p-4 bg-green-50 rounded border border-green-200">
            <h2 className="text-xl font-bold mb-4 text-green-700">Add Questions to Lista</h2>
            {availableQuestions.length === 0 ? (
              <p className="text-gray-500">All questions are already assigned to this lista.</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {availableQuestions.map(q => (
                    <label key={q.id} className="flex items-center mb-2 cursor-pointer border border-gray-300 rounded p-2 hover:bg-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedQuestionsToAdd.has(q.id)}
                        onChange={() => handleAddCheckboxChange(q.id)}
                        className="mr-3 w-4 h-4"
                        disabled={isLoading}
                      />
                      <span>
                        {q.id})
                        (<b>{q.type}</b>)
                        <span dangerouslySetInnerHTML={{ __html: ajustaImagens(API, q.enunciado) }} />
                      </span>

                      {/* details of the question
                      
                      REPEATED CODE - consider refactoring into a separate component to avoid duplication
                      
                      */}
                      
                      {q.type === "multiplaescolha" && (
                        <div>
                          <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded font-semibold">
                            {q.alternativas.map(a => (
                              <div key={a.id}>
                                {a.certa && <span>(CERTA)</span>}
                                <span dangerouslySetInnerHTML={{ __html: a.descricao }} /><br />
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


                    </label>
                  ))}
                </div>
                <button
                  onClick={addQuestionsToLista}
                  disabled={selectedQuestionsToAdd.size === 0 || isLoading}
                  className={`px-4 py-2 bg-green-600 text-white rounded shadow font-bold transition ${selectedQuestionsToAdd.size === 0 || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-700"
                    }`}
                >
                  {isLoading ? "Processing..." : `Add ${selectedQuestionsToAdd.size} Selected`}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

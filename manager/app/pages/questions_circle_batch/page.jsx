"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Menu from "../../components/Menu";
import { ajustaImagens } from "../../lib/htmlUtils";

const API = process.env.NEXT_PUBLIC_API_URL; // || "http://localhost:4999";

export default function QuestionsCircleBatchCRUD() {
  const [questions, setQuestions] = useState([]);
  const [circles, setCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState("");
  const [circleQuestions, setCircleQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionsToAdd, setSelectedQuestionsToAdd] = useState(new Set());
  const [selectedQuestionsToRemove, setSelectedQuestionsToRemove] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

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
      setSelectedQuestionsToAdd(new Set());
      setSelectedQuestionsToRemove(new Set());
      return;
    }
    axios.get(`${API}/questions_circle/${selectedCircle}`).then(res => {
      setCircleQuestions(res.data.details);
      const assignedIds = new Set(res.data.details.map(q => q.id));
      setAvailableQuestions(questions.filter(q => !assignedIds.has(q.id)));
      setSelectedQuestionsToAdd(new Set());
      setSelectedQuestionsToRemove(new Set());
    });
  }, [selectedCircle, questions]);

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

  // Add multiple questions to circle
  const addQuestionsToCircle = async () => {
    if (selectedQuestionsToAdd.size === 0) return;
    if (!window.confirm(`Add ${selectedQuestionsToAdd.size} question(s) to the circle?`)) return;

    setIsLoading(true);
    try {
      // Send POST requests for all selected questions
      const addPromises = Array.from(selectedQuestionsToAdd).map(qid =>
        axios.post(`${API}/questions_circle/${qid}/${selectedCircle}`)
      );
      await Promise.all(addPromises);

      // Refresh questions in circle
      const res = await axios.get(`${API}/questions_circle/${selectedCircle}`);
      setCircleQuestions(res.data.details);
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

  // Remove multiple questions from circle
  const removeQuestionsFromCircle = async () => {
    if (selectedQuestionsToRemove.size === 0) return;
    if (!window.confirm(`Remove ${selectedQuestionsToRemove.size} question(s) from the circle?`)) return;

    setIsLoading(true);
    try {
      // Send DELETE requests for all selected questions
      const removePromises = Array.from(selectedQuestionsToRemove).map(qid =>
        axios.delete(`${API}/questions_circle/${qid}/${selectedCircle}`)
      );
      await Promise.all(removePromises);

      // Refresh questions in circle
      const res = await axios.get(`${API}/questions_circle/${selectedCircle}`);
      setCircleQuestions(res.data.details);
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

      <h1 className="text-3xl font-bold mb-4">Batch Manage Questions in Circle</h1>

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
          {/* Remove section */}
          <div className="mb-8 p-4 bg-red-50 rounded border border-red-200">
            <h2 className="text-xl font-bold mb-4 text-red-700">Remove Questions from Circle</h2>
            {circleQuestions.length === 0 ? (
              <p className="text-gray-500">No questions assigned to this circle.</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {circleQuestions.map(q => (
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
                  onClick={removeQuestionsFromCircle}
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
            <h2 className="text-xl font-bold mb-4 text-green-700">Add Questions to Circle</h2>
            {availableQuestions.length === 0 ? (
              <p className="text-gray-500">All questions are already assigned to this circle.</p>
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
                  onClick={addQuestionsToCircle}
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

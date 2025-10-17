import { useEffect, useState } from "react";
import axios from "axios";

const Corrigir = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const myip = document.getElementById("myip").innerText;
        const id_circulo = document.getElementById("circulo_id").innerText;
        const url = `http://${myip}:4999/exibir_respostas/${id_circulo}`;
        
        const result = await axios.get(url);
        if (result.data.message !== "ok") {
          setError(result.data.details);
        } else {
          setResponses(result.data.details);
        }
      } catch (err) {
        setError("Error fetching data from backend");
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  const handleScore = async (idresp, score) => {
    try {
      const myip = document.getElementById("myip").innerText;
      const response = await axios.post(`http://${myip}:4999/pontuar_resposta`, {
        id: idresp,
        pontuacao: score,
      });
      if (response.data.message !== "ok") {
        alert(response.data.details);
      } else {
        // Handle success (e.g., update UI)
      }
    } catch (err) {
      alert("Error sending score to backend");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {responses.map((resp) => (
        <div key={resp.id}>
          <h4>{resp.questao.enunciado}</h4>
          <pre>{resp.resposta}</pre>
          <input
            type="text"
            id={`pt${resp.id}`}
            defaultValue={resp.pontuacao || ""}
          />
          <button onClick={() => handleScore(resp.id, document.getElementById(`pt${resp.id}`).value)}>
            Assign Grade
          </button>
        </div>
      ))}
    </div>
  );
};

export default Corrigir;

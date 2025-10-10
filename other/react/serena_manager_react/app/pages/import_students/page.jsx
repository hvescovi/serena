"use client";
import { useState, FormEvent } from "react";
import axios from "axios";
import { StudentsCsvToJson, Student } from "../../scripts/utils.tsx";

export default function ImportStudents() {
  // Environment variable
  let backendIP = "http://localhost:4999";
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    backendIP = process.env.NEXT_PUBLIC_BASE_URL;
  }

  // State hooks
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState(";");
  const [emails, setEmails] = useState("");
  const [buttonValue, setButtonValue] = useState("");
  const [observacao, setObservacao] = useState("|g:optweb-301-2025|");
  const [StudentsList, setStudentsList] = useState(
    `AMANDA PAZIANOTI HORST,amanda.horst07@gmail.com,|g:optweb-301-2025|
ANTONIO HENRIQUE ROHLING FROEHNER,rf.antonio2007@gmail.com,|g:optweb-301-2025|`
  );

  const action_ImportStudents = async (e) => {
    e.preventDefault();

    try {
      if (buttonValue === "clean") {
        // Remove numbers
        setStudentsList(StudentsList.replace(/[0-9]/g, ""));
      } 
      
      else if (buttonValue === "emails") {
        const result = [];
        const lines = StudentsList.split("\n");
        const string_emails = emails;

        if (string_emails.includes("@")) {
          const emailsArr = string_emails.split(delimiter);
          for (let i = 0; i < emailsArr.length; i++) {
            const newLine = `${lines[i]},${emailsArr[i].trim()}`;
            result.push(newLine);
          }
          setStudentsList(result.join("\n"));
        } else {
          setMessage(
            "INSIRA EMAILS NA caixa; esses emails são obtidos no Sigaa, menu Turma > Participantes > Lista de E-mail dos discentes da turma (exemplo: amanda.horst07@gmail.com ; rf.antonio2007@gmail.com ; arielmartinsfarias@gmail.com ; arturpagel7@gmail.com)"
          );
        }
      } 
      
      else if (buttonValue === "obs") {
        const result = [];
        const lines = StudentsList.split("\n");
        for (let i = 0; i < lines.length; i++) {
          result.push(`${lines[i]},${observacao}`);
        }
        setStudentsList(result.join("\n"));
      } 
      
      else if (buttonValue === "save") {
        const paraEnviar = StudentsCsvToJson(StudentsList);
        alert(paraEnviar.length + " estudantes serão enviados ao servidor.");

        const response = axios.post(
          `${backendIP}/incluir_respondentes`,
          paraEnviar,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        
        const resp = (await response).data.details;
        alert(response);
        
        if (resp.status !== 200) {
          setError("Erro: " + resp.status + " - " + resp.statusText);
          return;
        }
        setMessage(resp.replaceAll(";", "\n"));
      }
    } catch (err) {
      setError(err.message || "Erro desconhecido");
    }
  };

  return (
    <div className="container">
      <h1>Importação de Estudantes</h1>

      <form onSubmit={action_ImportStudents}>
        <label>Estudantes (nome, email):</label>
        <br />
        <textarea
          value={StudentsList}
          onChange={(e) => setStudentsList(e.target.value)}
          rows={30}
          cols={80}
        />
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" value="clean" onClick={(e) => setButtonValue(e.currentTarget.value)}>
          LIMPAR
        </button>

        <hr />
        <h3>Preencher Emails</h3>
        <label>Emails:</label>
        <br />
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={5}
          cols={30}
        />
        <br />
        <label>
          Delimitador ={" "}
          <input
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            size={1}
          />
        </label>
        <button type="submit" value="emails" onClick={(e) => setButtonValue(e.currentTarget.value)}>
          PREENCHER EMAILS
        </button>

        <hr />
        <h3>Observação:</h3>
        <input
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
        <button type="submit" value="obs" onClick={(e) => setButtonValue(e.currentTarget.value)}>
          Preencher
        </button>

        <hr />
        <button type="submit" value="save" onClick={(e) => setButtonValue(e.currentTarget.value)}>
          CADASTRAR!
        </button>
      </form>

      <br />
      <hr />
      <br />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={30}
        cols={50}
      />

      <style jsx>{`
        .container {
          padding: 20px;
          font-family: sans-serif;
        }
        textarea {
          font-family: monospace;
          margin-top: 10px;
        }
        button {
          margin-top: 10px;
          margin-right: 10px;
          padding: 8px 16px;
          border-radius: 8px;
          background-color: lightgreen;
          border: 1px solid gray;
          cursor: pointer;
        }
        button:hover {
          background-color: #b6e5b6;
        }
        h1 {
          font-size: 2em;
          background: lightgreen;
          padding: 10px;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

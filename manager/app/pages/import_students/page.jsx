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
  // here we put the default values of some parameters
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
        let ok = confirm(paraEnviar.length + " estudantes serão enviados ao servidor.");
        if (!ok) {
          return;
        }

        const response = axios.post(
          `${backendIP}/incluir_respondentes`,
          paraEnviar,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const resp = (await response);
        //alert(resp.status);
        //alert(resp.data.result);
        //alert(resp.data.details);
        
        if (resp.status !== 200) {
          setError("Erro: " + resp.data.result + " - " + resp.data.details);
          return;
        }
        let msg = resp.data.details;
        msg = msg.replaceAll(";", "\n");
        setMessage(msg);
      }
    } catch (err) {
      setError(err.message || "Erro desconhecido");
    }
  };

  return (
    <div className="container">
      <h1>Importação de Estudantes</h1>

      <form onSubmit={action_ImportStudents}>
        <br />
        <h2>Primeiro Passo</h2>
        <p>Pegar os nomes dos estudantes no SIGAA, menu
          Diário Eletrônico, Lista de Presença.
          Copiar os nomes dos alunos e colar na caixa de área de texto abaixo.
          Os nomes vão ficar dispostos de forma similar a esta:
        </p>
        <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded mb-4">
          {`ANTONIA MARTINS PHILIPPI CARNEIRO20253046361
BERNARDO SIQUEIRA BATISTA20253091692
BIANCA BERTOLDI GIRELLI20253224293
BRUNO OTAVIO BORGERT20233284974
BRYAN RICARDO GEBIEN20253287095
...
RYAN BECKER LEAL202531121028
SOFIA COSTA LAUS202530860829
VICENTE NETO FERNANDES MENEZES202533061830
VICTOR GABRIEL DE FREITAS202530915031
YAGO SCHUMANN VRONSKI202530816132
`}
        </pre>
        {/* <label>Estudantes (nome, email):</label>  */}
        <textarea
          value={StudentsList}
          onChange={(e) => setStudentsList(e.target.value)}
          rows={30}
          cols={80}
          className="mb-4 p-2 border rounded w-full font-mono bg-green-200"
        />
        
        <h2>Segundo passo</h2>
        Clicar no botão:
        <button type="submit" value="clean" onClick={(e) => setButtonValue(e.currentTarget.value)}>
          LIMPAR
        </button>

        
        <h2>Terceiro Passo</h2>
        3.1 Preencher Emails: pegar os emails dos estudantes no SIGAA,
        menu Turma, Participantes, Lista de E-mail
        dos discentes da turma.
        Copiar os emails e colar na caixa de texto abaixo.
        <br />
        {/* <label>Emails:</label> */}
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={5}
          cols={30}
          className="mb-4 p-2 border rounded w-full font-mono bg-green-200"
        />
        <br />
        <label>
          3.2 Conferir o Delimitador: ={" "}
          <input
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            size={1}
          />
        </label>
        <br/>
        3.3 Clicar no botão: 
        <button type="submit" value="emails" onClick={(e) => setButtonValue(e.currentTarget.value)}>
          PREENCHER EMAILS
        </button>

        
        <h2>Quarto Passo</h2>
         4.1 Informar o IDENTIFICADOR DA TURMA 
        (exemplo: |g:optweb-301-2025|): 

        <input
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="mb-4 p-2 border rounded w-full font-mono bg-green-200"
        />
        4.2 Clicar no botão:
        <button type="submit" value="obs" onClick={(e) => setButtonValue(e.currentTarget.value)}>
          Preencher
        </button>

        <h2>Quinto e último passo</h2>
        Solicitar a importação dos estudantes clicando no botão:
        <button type="submit" value="save" onClick={(e) => setButtonValue(e.currentTarget.value)}>
          CADASTRAR!
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={30}
        cols={50}
        className="mb-4 p-2 border rounded w-full font-mono bg-blue-100"
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
        h2 {
          font-size: 1.5em;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

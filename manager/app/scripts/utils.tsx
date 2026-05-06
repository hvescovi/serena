export interface Student {
  nome: string;
  email: string;
  observacao: string;
}

export function StudentsCsvToJson(csvString: string): Student[] {
  const lines = csvString.split("\n").filter(Boolean);
  return lines.map((line) => {
    const [nome, email, observacao] = line.split(",");
    return { nome: nome?.trim(), email: email?.trim(), observacao: observacao?.trim() };
  });
}

// usado para questões antigas que tem imagem em arquivo externo
   export function ajustaImagens(API:string, texto:string) {
    if (texto.includes(".png")) {
      let url = `${API}/imagem/`;
      return texto.replace(/<img src=/gi, "(<b>QUESTÃO ANTIGA</b>)<img src=" + url);
    } else {
      // new question types don't need adjustment
      return texto;
    }
  }

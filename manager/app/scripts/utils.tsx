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

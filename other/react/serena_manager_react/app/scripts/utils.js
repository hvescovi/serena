export interface Student {
  name: string;
  email: string;
  obs?: string;
}

export function StudentsCsvToJson(csvString: string): Student[] {
  const lines = csvString.split("\n").filter(Boolean);
  return lines.map((line) => {
    const [name, email, obs] = line.split(",");
    return { name: name?.trim(), email: email?.trim(), obs: obs?.trim() };
  });
}

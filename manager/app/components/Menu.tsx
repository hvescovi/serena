import Link from "next/link";

export default function Menu() {
  return (
    <nav className="flex gap-4 mb-8">
      <Link
        href="/pages/circle"
        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
      >
        Círculos
      </Link>
      <Link
        href="/pages/newquestion"
        className="px-4 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
      >
        Questões
      </Link>
      <Link
        href="/pages/questions_circle_batch"
        className="px-4 py-2 rounded bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition"
      >
        Questões por Círculo
      </Link>
      <Link
        href="/pages/import_students"
        className="px-4 py-2 rounded bg-gray-600 text-white font-semibold shadow hover:bg-gray-700 transition"
      >
        Importar Alunos
      </Link>
      <Link
        href="/pages/respondente"
        className="px-4 py-2 rounded bg-yellow-600 text-white font-semibold shadow hover:bg-yellow-700 transition"
      >
        Respondentes
      </Link>

      <Link
        href="/pages/assunto"
        className="px-4 py-2 rounded bg-yellow-600 text-white font-semibold shadow hover:bg-yellow-700 transition"
      >
        Assuntos
      </Link>

      <Link
        href="/pages/assunto-questao"
        className="px-4 py-2 rounded bg-yellow-600 text-white font-semibold shadow hover:bg-yellow-700 transition"
      >
        Assuntos por Questão
      </Link>
    </nav>
  );
}
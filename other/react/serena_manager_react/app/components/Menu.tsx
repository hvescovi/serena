import Link from "next/link";

export default function Menu() {
  return (
    <nav className="flex gap-4 mb-8">
      <Link
        href="/pages/circle"
        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
      >
        Gerenciar Círculos
      </Link>
      <Link
        href="/pages/question"
        className="px-4 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
      >
        Gerenciar Questões
      </Link>
      <Link
        href="/pages/question_circle"
        className="px-4 py-2 rounded bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition"
      >
        Questões por Círculo
      </Link>
    </nav>
  );
}
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-10 items-center">
        <h1 className="text-3xl font-bold mb-4">Serena Manager</h1>
        <nav className="flex flex-col gap-6 w-full max-w-xs">
          <Link
            href="/pages/circle"
            className="block px-6 py-4 rounded-lg bg-blue-600 text-white text-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            Gerenciar Círculos
          </Link>
          <Link
            href="/pages/question"
            className="block px-6 py-4 rounded-lg bg-green-600 text-white text-lg font-semibold shadow hover:bg-green-700 transition"
          >
            Gerenciar Questões
          </Link>
          <Link
            href="/pages/question_circle"
            className="block px-6 py-4 rounded-lg bg-purple-600 text-white text-lg font-semibold shadow hover:bg-purple-700 transition"
          >
            Questões por Círculo
          </Link>
        </nav>
      </main>
      <footer className="mt-16 flex gap-6 flex-wrap items-center justify-center text-sm text-gray-500">
        <span>Serena Manager &copy; 2025</span>
      </footer>
    </div>
  );
}
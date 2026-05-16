"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-md bg-white sticky top-0 z-50">
      <h1 className="text-xl font-bold text-red-600">
        🏛️ Keluhan Masyarakat
      </h1>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
        >
          Login
        </button>

        <button
          onClick={() => router.push("/register")}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Daftar
        </button>
      </div>
    </nav>
  );
}
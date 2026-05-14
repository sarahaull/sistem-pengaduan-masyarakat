"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.msg || "Login gagal");
        setLoading(false);
        return;
      }

      // 🔥 NORMALISASI ROLE (INI PENTING BIAR GAK ERROR)
      const role = (data?.user?.role || "")
        .toLowerCase()
        .replace(" ", "_");

      // simpan auth
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("LOGIN SUCCESS ROLE:", role);

      // 🔥 REDIRECT PAKSA (ANTI KEDIP / ANTI BUG NEXT ROUTER)
      if (role === "super_admin") {
        window.location.replace("/super-admin/dashboard");
      } 
      else if (role === "admin") {
        window.location.replace("/admin/dashboard");
      } 
      else {
        window.location.replace("/dashboard");
      }

    } catch (error) {
      console.log(error);
      setMsg("Server error, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow w-[350px]"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="border w-full p-2 mb-3 rounded"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full p-2 mb-3 rounded"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white w-full p-2 rounded"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        {msg && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
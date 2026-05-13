"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [msg, setMsg] = useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      console.log(data);

      // =========================
      // LOGIN BERHASIL
      // =========================
      if (res.ok) {
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setMsg("✅ Login berhasil");

        // =========================
        // CEK ROLE
        // =========================
        setTimeout(() => {
          // ADMIN
          if (
            data.user.role === "admin" ||
            data.user.role ===
              "super_admin"
          ) {
            router.push(
              "/admin/dashboard"
            );
          }

          // USER BIASA
          else {
            router.push("/dashboard");
          }
        }, 1000);
      }

      // =========================
      // LOGIN GAGAL
      // =========================
      else {
        setMsg(
          `❌ ${
            data.message ||
            "Login gagal"
          }`
        );
      }
    } catch (error) {
      console.log(error);

      setMsg(
        "❌ Gagal terhubung ke server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 relative"
      style={{
        backgroundImage:
          "url('/images/bg.jpg')",
      }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* CARD LOGIN */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-[430px] bg-white/90 backdrop-blur-md rounded-[30px] px-10 py-12 shadow-2xl border border-white/30"
      >
        {/* TITLE */}
        <div className="text-center mb-10">
          <h1 className="text-[38px] font-extrabold text-[#8B0000]">
            Login
          </h1>

          <p className="text-gray-500 mt-2">
            Silahkan masuk ke akun anda
          </p>
        </div>

        {/* EMAIL */}
        <div className="mb-6">
          <label className="block text-[15px] font-semibold text-[#8B0000] mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Masukkan email..."
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            className="w-full h-[52px] bg-[#fff5f5] border border-red-200 rounded-xl px-4 text-black outline-none focus:ring-4 focus:ring-red-100 focus:border-[#8B0000] transition-all duration-300"
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-8">
          <label className="block text-[15px] font-semibold text-[#8B0000] mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Masukkan password..."
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
            className="w-full h-[52px] bg-[#fff5f5] border border-red-200 rounded-xl px-4 text-black outline-none focus:ring-4 focus:ring-red-100 focus:border-[#8B0000] transition-all duration-300"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] bg-gradient-to-r from-[#8B0000] to-[#b30000] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-white font-bold rounded-xl shadow-lg"
        >
          {loading
            ? "Loading..."
            : "Login"}
        </button>

        {/* MESSAGE */}
        {msg && (
          <div className="mt-5 text-center text-sm font-medium text-red-600">
            {msg}
          </div>
        )}

        {/* REGISTER */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Belum punya akun?
          <a
            href="/register"
            className="text-[#8B0000] font-bold hover:underline ml-1"
          >
            Daftar disini
          </a>
        </p>
      </form>
    </div>
  );
}
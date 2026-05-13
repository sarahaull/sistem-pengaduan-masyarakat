"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMsg("❌ Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("✅ Registrasi berhasil");

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setMsg(`❌ ${data.message || "Registrasi gagal"}`);
      }
    } catch (error) {
      setMsg("❌ Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: "url('/images/bg.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#00000020]"></div>

      {/* Card Register */}
      <form
        onSubmit={handleRegister}
        className="relative z-10 w-full max-w-[430px] bg-white/90 backdrop-blur-sm rounded-[28px] px-10 py-10 shadow-2xl border border-white/40"
      >
        {/* Title */}
        <h1 className="text-center text-[34px] font-extrabold text-[#2E2E2E] mb-2">
          Daftar akun
        </h1>

        <p className="text-center text-gray-500 text-sm mb-8">
          Isi data dengan benar
        </p>

        {/* Nama */}
        <div className="mb-5">
          <label className="block text-[15px] text-gray-700 mb-2 font-medium">
            Nama Lengkap
          </label>

          <input
            type="text"
            placeholder="Nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-[48px] bg-[#D9E2EE] rounded-md px-4 text-[14px] text-[#7A0019] placeholder:text-gray-400 outline-none border border-transparent focus:border-[#8B0000] focus:ring-2 focus:ring-red-300 transition"
          />
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-[15px] text-gray-700 mb-2 font-medium">
            Email
          </label>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-[48px] bg-[#D9E2EE] rounded-md px-4 text-[14px] text-[#7A0019] placeholder:text-gray-400 outline-none border border-transparent focus:border-[#8B0000] focus:ring-2 focus:ring-red-300 transition"
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-[15px] text-gray-700 mb-2 font-medium">
            Password
          </label>

          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-[48px] bg-[#D9E2EE] rounded-md px-4 text-[14px] text-[#7A0019] placeholder:text-gray-400 outline-none border border-transparent focus:border-[#8B0000] focus:ring-2 focus:ring-red-300 transition"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-7">
          <label className="block text-[15px] text-gray-700 mb-2 font-medium">
            Konfirmasi Password
          </label>

          <input
            type="password"
            placeholder="Ulangi password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full h-[48px] bg-[#D9E2EE] rounded-md px-4 text-[14px] text-[#7A0019] placeholder:text-gray-400 outline-none border border-transparent focus:border-[#8B0000] focus:ring-2 focus:ring-red-300 transition"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[48px] bg-[#8B0000] hover:bg-[#730000] text-white font-bold rounded-md transition duration-300 shadow-md"
        >
          {loading ? "Loading..." : "Daftar"}
        </button>

        {/* Message */}
        {msg && (
          <div className="mt-4 text-center text-sm text-red-600">
            {msg}
          </div>
        )}

        {/* Login */}
        <p className="text-center text-[12px] text-gray-500 mt-6">
          Sudah punya akun ?{" "}
          <a
            href="/login"
            className="text-[#1D4ED8] font-semibold hover:underline"
          >
            Login disini
          </a>
        </p>
      </form>
    </div>
  );
}
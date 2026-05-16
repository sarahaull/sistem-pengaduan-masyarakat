"use client";

import { useState } from "react";

export default function LoginPage() {
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

      const role = (data?.user?.role || "").toLowerCase().replace(/\s+/g, "_");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (role === "super_admin") {
        window.location.href = "/super-admin/dashboard";
      } else if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.log(error);
      setMsg("Server error, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes megaphone-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes float-letter {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-60px) rotate(10deg); opacity: 0; }
        }
        @keyframes wave-sound {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-megaphone {
          animation: megaphone-pulse 2s ease-out infinite;
          transform-origin: center;
        }
        .animate-float-letter {
          animation: float-letter 3s ease-in-out infinite;
        }
        .animate-float-letter-delay {
          animation: float-letter 3.5s ease-in-out infinite 1s;
        }
        .animate-wave-sound {
          animation: wave-sound 1.5s ease-out infinite;
        }
        .animate-wave-sound-delay {
          animation: wave-sound 1.8s ease-out infinite 0.6s;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out 2;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-out forwards;
        }
      `}</style>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#3e1410] via-[#5e221d] to-[#2a0c09]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-6 animate-fade-in-up">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* LEFT SIDE - Ilustrasi Pengaduan Masyarakat */}
              <div className="md:w-1/2 p-8 bg-gradient-to-br from-[#7a2c25]/40 to-[#3e1410]/40 flex flex-col justify-center items-center relative min-h-[380px]">
                <div className="relative w-72 h-72 md:w-80 md:h-80">
                  {/* Megaphone (pengeras suara) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Gelombang suara */}
                      <div className="absolute -inset-8 flex items-center justify-center">
                        <div className="absolute w-32 h-32 border-2 border-red-400/60 rounded-full animate-wave-sound"></div>
                        <div className="absolute w-44 h-44 border-2 border-red-400/40 rounded-full animate-wave-sound-delay"></div>
                      </div>
                      {/* Ikon megaphone */}
                      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" className="relative z-10 animate-megaphone">
                        <path d="M3 10H1V18H3V10Z" fill="#e8a99a" stroke="#c97d60" strokeWidth="1.2"/>
                        <path d="M3 10L10 5V18L3 13V10Z" fill="#c97d60" stroke="#a0522d" strokeWidth="1.2"/>
                        <path d="M10 8L18 5V18L10 15V8Z" fill="#f4c9b8" stroke="#a0522d" strokeWidth="1.2"/>
                        <rect x="17" y="4" width="4" height="19" rx="1" fill="#6b3a2a" stroke="#4a2518" strokeWidth="0.8"/>
                        <circle cx="19" cy="21" r="1.5" fill="#2c1a12"/>
                        <path d="M14 10L16 11.5L14 13" stroke="#a0522d" strokeWidth="1" fill="none"/>
                      </svg>
                    </div>
                  </div>

                  {/* Surat-surat / keluhan yang melayang */}
                  <div className="absolute top-5 left-2 animate-float-letter">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f4c9b8" strokeWidth="1.2">
                      <rect x="2" y="4" width="20" height="16" rx="2" fill="#c97d60" stroke="#a0522d"/>
                      <path d="M2 8L12 14L22 8" stroke="#a0522d" fill="none"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-10 right-0 animate-float-letter-delay">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f4c9b8" strokeWidth="1.2">
                      <rect x="2" y="4" width="20" height="16" rx="2" fill="#e8a99a" stroke="#a0522d"/>
                      <path d="M2 8L12 14L22 8" stroke="#a0522d" fill="none"/>
                    </svg>
                  </div>
                  <div className="absolute top-16 right-8 animate-float-letter-delay" style={{ animationDuration: "4s" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#a0522d" stroke="#6b3a2a" strokeWidth="1"/>
                      <path d="M8 12L11 15L16 9" stroke="#f4c9b8" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>

                  {/* Gelembung teks aspirasi */}
                  <div className="absolute -top-6 left-16 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white whitespace-nowrap animate-float-right">
                    📢 Sampaikan Keluhan
                  </div>
                  <div className="absolute bottom-20 -right-8 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white animate-float-left">
                    ✍️ Aspirasi Masyarakat
                  </div>
                </div>

                <div className="text-center mt-6">
                  <h2 className="text-white text-xl font-semibold">Sistem Pengaduan Keluhan Masyarakat</h2>
                  <p className="text-white/60 text-sm mt-2 max-w-xs mx-auto">
                    Sampaikan aspirasi Anda dengan mudah. Setiap suara didengar.
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE - FORM LOGIN (tidak berubah) */}
              <div className="md:w-1/2 p-8 md:p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#a33c33] to-[#6e241f] rounded-2xl shadow-lg mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Login Petugas</h1>
                  <p className="text-white/50 text-sm mt-1">Akses dashboard pengaduan</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm font-medium block">Email</label>
                    <input
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#b95c54]/70 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/80 text-sm font-medium block">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#b95c54]/70 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3 px-4 bg-gradient-to-r from-[#a33c33] to-[#6e241f] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#a33c33]/40 transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Login →"
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#c95c52] to-[#8b2c25] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {msg && (
                    <div className="mt-4 p-3 bg-red-500/20 border-l-4 border-red-500 rounded-lg text-red-100 text-sm text-center animate-shake">
                      {msg}
                    </div>
                  )}
                </form>

                <div className="mt-8 text-center text-white/40 text-xs">
                  &copy; {new Date().getFullYear()} Sistem Pengaduan Keluhan Masyarakat
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
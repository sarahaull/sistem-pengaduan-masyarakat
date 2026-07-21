"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Henny_Penny } from "next/font/google";

const hennyPenny = Henny_Penny({
  weight: "400",
  subsets: ["latin"],
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [whiteParticles, setWhiteParticles] = useState([]);
  const [floatingElements, setFloatingElements] = useState([]);

  // Generate particles (merah & putih)
  useEffect(() => {
    // Partikel merah
    const newParticles = Array.from({ length: 60 }, () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1.5,
      duration: Math.random() * 14 + 7,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(newParticles);

    // Partikel putih (tambahan)
    const newWhiteParticles = Array.from({ length: 40 }, () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 12 + 6,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setWhiteParticles(newWhiteParticles);

    // Ikon melayang (campuran warna putih juga)
    const icons = ["🔥", "⚡", "💬", "📢", "🔔", "❤️", "✦", "◉", "🚀", "✨", "❄️", "💎"];
    const newFloating = Array.from({ length: 20 }, () => ({
      id: Math.random(),
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 24 + 12,
      duration: Math.random() * 16 + 9,
      delay: Math.random() * 7,
      rotate: Math.random() * 360,
    }));
    setFloatingElements(newFloating);
  }, []);

  // Mouse hanya untuk glow effect (tidak untuk background)
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

      if (role === "super_admin") router.push("/super-admin/dashboard");
      else if (role === "admin") router.push("/admin/dashboard");
      else router.push("/dashboard");
    } catch (error) {
      console.log(error);
      setMsg("Server error, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  // Background DIAM (tidak mengikuti mouse)
  const bgStyle = {
    backgroundImage: `url('/images/uy.jpg')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.96, rotateX: -10 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 18 },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02, boxShadow: "0 0 25px rgba(239, 68, 68, 0.6)" },
    tap: { scale: 0.98 },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={bgStyle}>
      {/* Overlay gradien merah & gelap */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-red-900/30 to-black/70" />

      {/* WAVES (OMBAK) - tetap bergerak */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 w-full h-1/3 animate-wave-slow" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ opacity: 0.3 }}>
          <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#ef4444" />
        </svg>
        <svg className="absolute bottom-0 w-full h-1/4 animate-wave-medium" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ opacity: 0.25 }}>
          <path d="M0,96L80,90.7C160,85,320,75,480,80C640,85,800,107,960,112C1120,117,1280,107,1360,101.3L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#dc2626" />
        </svg>
        <svg className="absolute bottom-0 w-full h-1/5 animate-wave-fast" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ opacity: 0.2 }}>
          <path d="M0,80L80,74.7C160,69,320,59,480,64C640,69,800,91,960,96C1120,101,1280,91,1360,85.3L1440,80L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#b91c1c" />
        </svg>
        {/* Ombak putih tipis */}
        <svg className="absolute bottom-0 w-full h-1/6 animate-wave-slower" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ opacity: 0.15 }}>
          <path d="M0,48L80,53.3C160,59,320,69,480,64C640,59,800,37,960,32C1120,27,1280,37,1360,42.7L1440,48L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#ffffff" />
        </svg>
      </div>

      {/* ROTATING RINGS - tetap berputar */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[800px] h-[800px] animate-spin-slow">
          <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping" />
          <div className="absolute inset-[50px] rounded-full border border-red-400/20 animate-reverse-spin" />
          <div className="absolute inset-[120px] rounded-full border border-amber-500/20 animate-spin-slow" />
          <div className="absolute inset-[200px] rounded-full border border-white/20 animate-spin-medium" />
        </div>
      </div>

      {/* GLOW IKUT KURSOR (efek putih & merah) */}
      <motion.div
        className="fixed w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl pointer-events-none"
        animate={{ x: mousePosition.x - 200, y: mousePosition.y - 200 }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
      />
      <motion.div
        className="fixed w-[250px] h-[250px] rounded-full bg-red-500/15 blur-2xl pointer-events-none"
        animate={{ x: mousePosition.x - 125, y: mousePosition.y - 125 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
      />

      {/* PARTICLES MERAH */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-red-400 to-amber-300"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              boxShadow: "0 0 8px rgba(239,68,68,0.6)",
            }}
            animate={{
              y: [0, -45, 0],
              x: [0, (Math.random() - 0.5) * 35, 0],
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* PARTICLES PUTIH (tambahan) */}
      <div className="absolute inset-0 pointer-events-none">
        {whiteParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/60"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              boxShadow: "0 0 6px rgba(255,255,255,0.5)",
            }}
            animate={{
              y: [0, -35, 0],
              x: [0, (Math.random() - 0.5) * 25, 0],
              opacity: [particle.opacity, particle.opacity * 1.2, particle.opacity],
            }}
            transition={{
              duration: particle.duration * 0.8,
              repeat: Infinity,
              delay: particle.delay + 1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* FLOATING ICONS (berwarna) */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((item) => (
          <motion.div
            key={item.id}
            className="absolute text-white/40 select-none font-bold drop-shadow-lg"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: item.size,
              rotate: item.rotate,
              textShadow: "0 0 5px rgba(255,255,255,0.3)",
            }}
            animate={{
              y: [0, -55, 0],
              x: [0, (Math.random() - 0.5) * 45, 0],
              rotate: [item.rotate, item.rotate + 25, item.rotate - 15, item.rotate],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut",
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* BLUR CIRCLES statis (merah & putih) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slower" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl animate-spin-slow" />

      {/* LOGIN CARD (sama) */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 w-full max-w-md mx-4"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-lg mb-4 relative"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-red-400 blur-md opacity-50"
                />
                <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </motion.div>
             <motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  className={`${hennyPenny.className} text-5xl text-white tracking-wide`}
>
  SWARA
</motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/70 text-sm mt-1"
              >
                Portal Pengaduan Masyarakat
              </motion.p>
            </div>

            {/* Form Input */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="group"
              >
                <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-white/40 group-focus-within:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="group"
              >
                <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-white/40 group-focus-within:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300"
                  />
                </div>
              </motion.div>

              <motion.button
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                type="submit"
                disabled={loading}
                className="relative w-full py-2.5 mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    "Masuk ke Dashboard"
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>

              <AnimatePresence>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 bg-red-500/20 backdrop-blur-sm border-l-4 border-red-500 rounded-lg text-red-100 text-sm"
                  >
                    ⚠️ {msg}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-center text-white/30 text-xs"
            >
              <span>Sistem Pengaduan Terintegrasi • Aman & Terpercaya</span>
            </motion.div>
          </div>
        </div>

        {/* Floating decor outside card */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-16 w-40 h-40 bg-red-500/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"
        />
      </motion.div>

      {/* Footer text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-0 right-0 text-center text-white/30 text-xs font-mono z-10"
      >
        <span className="inline-block animate-pulse">✦ Suara Rakyat • Tindak Nyata ✦</span>
      </motion.div>

      <style jsx>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes spin-medium { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wave-slow { 0% { transform: translateX(0) translateY(0); } 50% { transform: translateX(-20%) translateY(10px); } 100% { transform: translateX(0) translateY(0); } }
        @keyframes wave-medium { 0% { transform: translateX(0) translateY(0); } 50% { transform: translateX(20%) translateY(-5px); } 100% { transform: translateX(0) translateY(0); } }
        @keyframes wave-fast { 0% { transform: translateX(0) translateY(0); } 50% { transform: translateX(-15%) translateY(5px); } 100% { transform: translateX(0) translateY(0); } }
        @keyframes wave-slower { 0% { transform: translateX(0) translateY(0); } 50% { transform: translateX(10%) translateY(8px); } 100% { transform: translateX(0) translateY(0); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-reverse-spin { animation: reverse-spin 25s linear infinite; }
        .animate-spin-medium { animation: spin-medium 15s linear infinite; }
        .animate-wave-slow { animation: wave-slow 12s ease-in-out infinite; }
        .animate-wave-medium { animation: wave-medium 15s ease-in-out infinite; }
        .animate-wave-fast { animation: wave-fast 8s ease-in-out infinite; }
        .animate-wave-slower { animation: wave-slower 18s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-pulse-slower { animation: pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}
"use client";
import { motion } from "framer-motion";
import { Flame, Send, TrendingUp, Users, CheckCircle, BarChart3, ArrowRight } from "lucide-react";
import { Henny_Penny } from "next/font/google";
import { useRouter } from "next/navigation";


const hennyPenny = Henny_Penny({
  subsets: ["latin"],
  weight: "400",
});
export default function Hero() {
  const router = useRouter();
  
  const stats = [
    { label: "Aduan Terselesaikan", value: "1.234+", icon: CheckCircle, color: "emerald" },
    { label: "Tingkat Respons", value: "98%", icon: TrendingUp, color: "blue" },
    { label: "Pengguna Aktif", value: "5.6k", icon: Users, color: "red" },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0a] to-[#0a0a0a]">
      {/* Background Pattern & Shapes - tanpa SVG pattern yang rumit */}
      <div className="absolute inset-0 z-0">
        {/* Grid sederhana dengan CSS (garis-garis) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4a4a4a0d_1px,transparent_1px),linear-gradient(to_bottom,#4a4a4a0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content (sama seperti sebelumnya) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 bg-red-800/40 backdrop-blur-sm px-4 py-2 rounded-full border border-red-500/50 mb-6">
            <Flame className="w-5 h-5 text-red-400" />
            <span className="text-red-200 text-sm font-semibold">Suara Rakyat • Tindak Nyata</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          <span
  className={`${hennyPenny.className} bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent`}
>
  SWARA
</span>
            <br />
            Saluran Aduan <span className="text-red-500">Cepat & Transparan</span>
          </h1>
          <p className="text-gray-300 text-lg mt-6 max-w-md mx-auto lg:mx-0">
            Laporkan keluhan infrastruktur, pelayanan publik, atau masalah sosial. Setiap aduan akan ditindaklanjuti maksimal 2x24 jam.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-8">
            {stats.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 px-5 border border-white/10 flex items-center gap-3"
              >
                <div className={`p-2 rounded-full bg-${s.color}-500/20`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-400`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-full flex items-center gap-2 shadow-lg shadow-red-900/50 transition-all mx-auto lg:mx-0"
            onClick={() => router.push("/register")}
          >
            <Send className="w-5 h-5" /> Laporkan Sekarang
          </motion.button>
        </motion.div>

        {/* Right Content - Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-red-800 rounded-3xl blur-2xl opacity-40 animate-pulse" />
          <div className="relative bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b border-red-800 pb-4 mb-4">
              <span className="text-red-400 font-mono text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> #ADUAN_TERBARU
              </span>
              <span className="text-red-500 text-xs bg-red-950 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Live
              </span>
            </div>
            <div className="space-y-4">
              {[
                { title: "Jalan rusak di perumahan", time: "10 menit lalu", status: "Menunggu", color: "yellow" },
                { title: "Penerangan jalan mati", time: "1 jam lalu", status: "Diproses", color: "blue" },
                { title: "Saluran air mampet", time: "3 jam lalu", status: "Selesai", color: "green" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 group hover:bg-white/5 p-2 rounded-lg transition">
                  <div className={`w-2 h-2 mt-2 rounded-full bg-${item.color}-500 group-hover:scale-125 transition`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Status: <span className={`text-${item.color}-400`}>{item.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 pt-4 border-t border-red-800 text-center text-red-400 hover:text-red-300 text-sm flex items-center justify-center gap-1 transition">
              Lihat semua aduan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"></div>
        </motion.div>
      </div>
    </section>
  );
}
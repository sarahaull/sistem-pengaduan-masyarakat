"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, MapPin } from "lucide-react";

export default function DaftarAduan() {
  const [aduans] = useState([
  {
    id: 1,
    judul: "Jalan Rusak",
    tanggal: "2026-06-10",
    keluhan: "Jalan berlubang di area perumahan.",
    lokasi: "Bandung",
    nama: "Warga A",
  },
  {
    id: 2,
    judul: "Lampu Jalan Mati",
    tanggal: "2026-06-09",
    keluhan: "Lampu jalan tidak menyala sejak kemarin.",
    lokasi: "Cimahi",
    nama: "Warga B",
  },
]);
  

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-bold">
          Aduan <span className="text-red-500">Terbaru</span>
        </h2>
        <p className="text-gray-400 mt-2">Warga sudah melaporkan</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {aduans.map((aduan, idx) => (
          <motion.div
            key={aduan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-black/40 backdrop-blur border border-red-900/50 rounded-2xl p-5 hover:border-red-500 transition-all hover:shadow-red-900/20"
          >
            <div className="flex items-start gap-3">
              <div className="bg-red-900/50 p-2 rounded-full">
                <MessageSquare className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between flex-wrap">
  <h3 className="font-bold text-white">{aduan.judul}</h3>
  <span className="text-xs text-red-400">
    {new Date(aduan.tanggal).toLocaleDateString("id-ID")}
  </span>
</div>
                <p className="text-gray-300 text-sm mt-1 line-clamp-2">{aduan.keluhan}</p>
                <div className="flex items-center gap-1 mt-3 text-red-400 text-xs">
                  <MapPin className="w-3 h-3" /> {aduan.lokasi}
                </div>
                <div className="mt-2 text-right text-xs text-red-500">- {aduan.nama}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
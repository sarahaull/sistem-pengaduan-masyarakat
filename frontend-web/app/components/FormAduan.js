"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  FileText,
  CheckCircle,
  Star,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  Clock,
  Shield,
  Eye,
  ThumbsUp,
} from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { useState } from "react";

export default function AdditionalSections() {
  // Data FAQ
  const faqs = [
    {
      q: "Bagaimana cara melaporkan masalah?",
      a: "Anda perlu mendaftar/login terlebih dahulu, kemudian klik tombol 'Buat Laporan' dan isi formulir dengan lengkap.",
    },
    {
      q: "Apakah data saya aman?",
      a: "Ya, data Anda dienkripsi dan hanya digunakan untuk proses tindak lanjut aduan.",
    },
    {
      q: "Berapa lama proses penanganan?",
      a: "Dalam waktu 2x24 jam setelah laporan diverifikasi, kami akan memberikan respons awal.",
    },
    {
      q: "Apakah bisa melaporkan secara anonim?",
      a: "Saat ini laporan memerlukan identitas untuk akuntabilitas, tapi identitas tidak akan dipublikasikan.",
    },
  ];

  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const steps = [
    { icon: UserPlus, title: "Buat Akun", desc: "Daftar gratis menggunakan email atau nomor telepon." },
    { icon: FileText, title: "Kirim Laporan", desc: "Isi detail laporan dengan lokasi, foto, dan deskripsi." },
    { icon: CheckCircle, title: "Pantau Status", desc: "Dapatkan notifikasi & lacak progres aduan Anda." },
  ];

  const testimonials = [
    { name: "Budi Santoso", role: "Warga Jakarta", text: "Cepat tanggap! Laporan saya tentang jalan rusak diperbaiki dalam 3 hari.", rating: 5 },
    { name: "Siti Aisyah", role: "Warga Bandung", text: "Sistemnya mudah digunakan, transparan, dan responsif.", rating: 5 },
    { name: "Agus Wijaya", role: "Aktivis Lingkungan", text: "Platform ini membantu masyarakat bersuara dan pemerintah bertindak.", rating: 4 },
  ];

  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* Background gradasi elegan */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/30 to-black pointer-events-none"></div>
      <div className="relative z-10 space-y-24 py-16 px-4 sm:px-6 lg:px-8">
        
        {/* ========== HOW IT WORKS ========== */}
        <section className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              Bagaimana Cara Kerjanya?
            </h2>
            <div className="w-24 h-1 bg-red-500 mx-auto mt-3 rounded-full"></div>
            <p className="text-gray-400 mt-3">Tiga langkah mudah untuk menyampaikan aduan</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-red-500/50 hover:bg-white/10 transition-all duration-300"
              >
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition">
                  {idx + 1}
                </div>
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600/40 transition">
                  <step.icon className="w-8 h-8 text-red-500 group-hover:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========== TESTIMONIALS ========== */}
        <section className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              Apa Kata Mereka?
            </h2>
            <div className="w-24 h-1 bg-red-500 mx-auto mt-3 rounded-full"></div>
            <p className="text-gray-400 mt-3">Dipercaya oleh ribuan warga</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-red-500/40 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex gap-1 text-yellow-500 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  {[...Array(5 - t.rating)].map((_, i) => (
                    <Star key={i + t.rating} className="w-4 h-4 text-gray-600" />
                  ))}
                </div>
                <p className="text-gray-300 italic">"{t.text}"</p>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========== STATISTIK / BADGE TAMBAHAN (opsional, untuk kesan elegan) */}
        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <Shield className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-gray-400 text-sm">Laporan Terverifikasi</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <Eye className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-gray-400 text-sm">Monitoring Aktif</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <ThumbsUp className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-gray-400 text-sm">Kepuasan Pengguna</p>
            </div>
          </div>
        </section>

        {/* ========== FAQ ========== */}
        <section className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              Pertanyaan Umum
            </h2>
            <div className="w-24 h-1 bg-red-500 mx-auto mt-3 rounded-full"></div>
            <p className="text-gray-400 mt-3">Temukan jawaban atas pertanyaan Anda</p>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-red-500/30 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left group"
                >
                  <span className="font-semibold text-white group-hover:text-red-400 transition">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-red-400 transition-transform duration-300 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-gray-400 border-t border-white/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========== FOOTER ========== */}
        <footer className="border-t border-white/10 pt-12 mt-12">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-4">
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-4">Pengaduan Masyarakat</h3>
              <p className="text-gray-400 text-sm">
                Platform resmi untuk menyuarakan masalah dan memantau penanganan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Kontak</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-red-400" /> help@pengaduan.go.id</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-red-400" /> (021) 1234-5678</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-400" /> Jakarta, Indonesia</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Jam Layanan</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-400" /> Senin - Jumat: 08.00 - 17.00</li>
                <li>Sabtu - Minggu: Tutup</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Ikuti Kami</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-red-500 transition-all hover:scale-110">
                  <FaFacebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-all hover:scale-110">
                  <FaTwitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-all hover:scale-110">
                  <FaInstagram size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs pt-8 mt-8 border-t border-white/10">
            &copy; {new Date().getFullYear()} Pengaduan Masyarakat. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
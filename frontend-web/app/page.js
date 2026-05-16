// // app/page.js
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   FaClipboardList,
//   FaClock,
//   FaCheckCircle,
//   FaExclamationTriangle,
//   FaArrowRight,
//   FaUsers,
//   FaChartLine,
//   FaEnvelope,
//   FaPhone,
//   FaMapMarkerAlt,
//   FaComments,
//   FaShieldAlt,
//   FaMobileAlt,
// } from "react-icons/fa";

// export default function LandingPage() {
//   const [isScrolled, setIsScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 50);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-red-50 overflow-x-hidden">
//       {/* Navbar */}
//       <nav
//         className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
//           isScrolled
//             ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
//             : "bg-transparent py-5"
//         }`}
//       >
//         <div className="container mx-auto px-6 flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
//               <span className="text-white font-bold text-xl">S</span>
//             </div>
//             <h1 className="text-2xl font-extrabold text-gray-800">
//               SWARA
//             </h1>
//           </div>
//           <div className="hidden md:flex gap-8 items-center">
//             <a href="#home" className="text-gray-700 hover:text-red-600 transition">Beranda</a>
//             <a href="#fitur" className="text-gray-700 hover:text-red-600 transition">Fitur</a>
//             <a href="#tentang" className="text-gray-700 hover:text-red-600 transition">Tentang</a>
//             <Link href="/login" className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition shadow-md">
//               Masuk
//             </Link>
//             <Link href="/register" className="border border-red-600 text-red-600 px-5 py-2 rounded-full hover:bg-red-50 transition">
//               Daftar
//             </Link>
//           </div>
//           <button className="md:hidden text-gray-700 text-2xl">☰</button>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
//         <div className="absolute top-20 right-0 w-72 h-72 bg-red-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-300 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
//         <div className="container mx-auto px-6 relative z-10">
//           <div className="flex flex-col md:flex-row items-center gap-12">
//             <div className="flex-1 text-center md:text-left animate-fadeInUp">
//               <div className="inline-block bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-semibold mb-4 animate-pulse">
//                 Sistem Pengaduan Masyarakat
//               </div>
//               <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">
//                 Salurkan Keluhan Anda,{" "}
//                 <span className="text-red-600">Wujudkan Perubahan</span>
//               </h1>
//               <p className="text-gray-600 text-lg mt-4 max-w-xl mx-auto md:mx-0">
//                 SWARA hadir sebagai jembatan antara masyarakat dan pemerintah.
//                 Laporkan masalah di lingkungan Anda dengan mudah dan cepat.
//               </p>
//               <div className="flex gap-4 mt-8 justify-center md:justify-start">
//                 <Link
//                   href="/register"
//                   className="bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-red-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
//                 >
//                   Buat Laporan <FaArrowRight />
//                 </Link>
//                 <a
//                   href="#fitur"
//                   className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-100 transition"
//                 >
//                   Pelajari
//                 </a>
//               </div>
//             </div>
//             <div className="flex-1 relative animate-float">
//               <div className="relative w-full max-w-md mx-auto">
//                 <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-1 shadow-2xl">
//                   <div className="bg-white rounded-2xl p-6">
//                     <div className="flex items-center gap-3 border-b pb-3">
//                       <FaClipboardList className="text-red-600 text-xl" />
//                       <h3 className="font-bold">Laporan Terbaru</h3>
//                     </div>
//                     <div className="space-y-3 mt-3">
//                       {[
//                         "Jalan rusak di Desa Sukamaju",
//                         "Sampah menumpuk di Pasar Sentral",
//                         "Lampu jalan mati di Gang Mawar",
//                       ].map((item, i) => (
//                         <div key={i} className="flex items-center gap-2 text-sm text-gray-600 animate-slideIn" style={{ animationDelay: `${i * 0.1}s` }}>
//                           <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//                           {item}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
//                   +100 laporan hari ini
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Statistik Singkat */}
//       <section className="py-12 bg-white shadow-inner">
//         <div className="container mx-auto px-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
//             <StatCard icon={<FaClipboardList />} value="1.234" label="Laporan Masuk" />
//             <StatCard icon={<FaCheckCircle />} value="892" label="Selesai" />
//             <StatCard icon={<FaUsers />} value="5.6k" label="Pengguna Aktif" />
//             <StatCard icon={<FaClock />} value="98%" label="Respon Cepat" />
//           </div>
//         </div>
//       </section>

//       {/* Fitur Utama */}
//       <section id="fitur" className="py-20 bg-red-50">
//         <div className="container mx-auto px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
//               Fitur <span className="text-red-600">Unggulan</span>
//             </h2>
//             <p className="text-gray-600 mt-2 max-w-xl mx-auto">
//               Kemudahan dan transparansi dalam setiap tahap pelaporan
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <FiturCard
//               icon={<FaMobileAlt />}
//               title="Mudah & Cepat"
//               desc="Laporkan keluhan dalam 3 menit melalui web atau mobile."
//               color="red"
//             />
//             <FiturCard
//               icon={<FaChartLine />}
//               title="Status Real-time"
//               desc="Pantau perkembangan laporan Anda secara langsung."
//               color="red"
//             />
//             <FiturCard
//               icon={<FaComments />}
//               title="Tanggapan Resmi"
//               desc="Dapatkan konfirmasi dan solusi dari pihak berwenang."
//               color="red"
//             />
//           </div>
//         </div>
//       </section>

//       {/* Cara Kerja */}
//       <section className="py-20">
//         <div className="container mx-auto px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
//               Bagaimana <span className="text-red-600">Cara Kerja</span>
//             </h2>
//           </div>
//           <div className="flex flex-col md:flex-row justify-center gap-8">
//             <StepCard number="1" title="Buat Akun" desc="Daftar gratis menggunakan email" />
//             <StepCard number="2" title="Buat Laporan" desc="Isi detail keluhan dengan foto" />
//             <StepCard number="3" title="Diverifikasi" desc="Admin akan memverifikasi" />
//             <StepCard number="4" title="Selesai" desc="Laporan ditindaklanjuti" />
//           </div>
//         </div>
//       </section>

//       {/* Testimoni */}
//       <section className="py-20 bg-red-50">
//         <div className="container mx-auto px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-gray-800">
//               Apa Kata <span className="text-red-600">Masyarakat</span>
//             </h2>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <TestimonialCard
//               name="Budi Santoso"
//               role="Warga Desa"
//               text="Lampu jalan di kampung saya langsung menyala setelah 2 hari laporan. Terima kasih SWARA!"
//               avatar="B"
//             />
//             <TestimonialCard
//               name="Siti Aminah"
//               role="Pedagang"
//               text="Sangat membantu untuk melaporkan masalah sampah. Sekarang pasar jadi bersih."
//               avatar="S"
//             />
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="py-20 bg-gradient-to-r from-red-700 to-red-800 text-white text-center">
//         <div className="container mx-auto px-6">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4">
//             Siap Menyuarakan Keluhan?
//           </h2>
//           <p className="text-lg text-red-100 mb-8 max-w-xl mx-auto">
//             Bergabunglah dengan ribuan masyarakat lainnya. Suaramu berarti untuk perubahan.
//           </p>
//           <Link
//             href="/register"
//             className="inline-block bg-white text-red-700 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
//           >
//             Mulai Laporkan Sekarang
//           </Link>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
//         <div className="container mx-auto px-6">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
//                   <span className="text-white font-bold">S</span>
//                 </div>
//                 <h3 className="text-xl font-bold text-white">SWARA</h3>
//               </div>
//               <p className="text-sm">Sistem pengaduan masyarakat transparan dan responsif.</p>
//             </div>
//             <div>
//               <h4 className="text-white font-semibold mb-3">Tautan</h4>
//               <ul className="space-y-2 text-sm">
//                 <li><a href="#home" className="hover:text-red-400">Beranda</a></li>
//                 <li><a href="#fitur" className="hover:text-red-400">Fitur</a></li>
//                 <li><a href="#" className="hover:text-red-400">Kebijakan Privasi</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-semibold mb-3">Kontak</h4>
//               <ul className="space-y-2 text-sm">
//                 <li className="flex items-center gap-2"><FaEnvelope /> swara@support.id</li>
//                 <li className="flex items-center gap-2"><FaPhone /> (021) 1234-5678</li>
//                 <li className="flex items-center gap-2"><FaMapMarkerAlt /> Jakarta, Indonesia</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-semibold mb-3">Sosial Media</h4>
//               <div className="flex gap-4 text-xl">
//                 <a href="#" className="hover:text-red-400">📘</a>
//                 <a href="#" className="hover:text-red-400">📷</a>
//                 <a href="#" className="hover:text-red-400">🐦</a>
//               </div>
//             </div>
//           </div>
//           <div className="border-t border-gray-800 pt-6 text-center text-xs">
//             &copy; 2026 SWARA. Semua hak dilindungi.
//           </div>
//         </div>
//       </footer>

//       {/* CSS Animations (gunakan di globals.css atau style tag) */}
//       <style jsx>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes float {
//           0% { transform: translateY(0px); }
//           50% { transform: translateY(-10px); }
//           100% { transform: translateY(0px); }
//         }
//         @keyframes slideIn {
//           from { opacity: 0; transform: translateX(-20px); }
//           to { opacity: 1; transform: translateX(0); }
//         }
//         .animate-fadeInUp {
//           animation: fadeInUp 0.8s ease-out forwards;
//         }
//         .animate-float {
//           animation: float 4s ease-in-out infinite;
//         }
//         .animate-slideIn {
//           animation: slideIn 0.5s ease-out forwards;
//           opacity: 0;
//         }
//       `}</style>
//     </div>
//   );
// }

// // Komponen pendukung
// function StatCard({ icon, value, label }) {
//   return (
//     <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
//       <div className="text-red-600 text-3xl mb-2 flex justify-center">{icon}</div>
//       <div className="text-2xl font-bold text-gray-800">{value}</div>
//       <div className="text-gray-500 text-sm">{label}</div>
//     </div>
//   );
// }

// function FiturCard({ icon, title, desc, color }) {
//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2 group">
//       <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-red-600 group-hover:text-white transition">
//         {icon}
//       </div>
//       <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
//       <p className="text-gray-600">{desc}</p>
//     </div>
//   );
// }

// function StepCard({ number, title, desc }) {
//   return (
//     <div className="flex-1 text-center">
//       <div className="w-16 h-16 mx-auto bg-red-600 text-white text-2xl font-bold rounded-full flex items-center justify-center shadow-lg mb-4">
//         {number}
//       </div>
//       <h3 className="text-lg font-bold text-gray-800">{title}</h3>
//       <p className="text-gray-500 text-sm">{desc}</p>
//     </div>
//   );
// }

// function TestimonialCard({ name, role, text, avatar }) {
//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-md">
//       <div className="flex items-center gap-3 mb-3">
//         <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
//           {avatar}
//         </div>
//         <div>
//           <h4 className="font-semibold text-gray-800">{name}</h4>
//           <p className="text-xs text-gray-500">{role}</p>
//         </div>
//       </div>
//       <p className="text-gray-600 italic">"{text}"</p>
//     </div>
//   );
// }
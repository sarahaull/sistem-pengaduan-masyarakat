"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

const stats = [
  { icon: Users, value: "2.450+", label: "Aduan Masuk", color: "red" },
  { icon: CheckCircle, value: "92%", label: "Terselesaikan", color: "red" },
  { icon: Clock, value: "< 48 jam", label: "Respon Rata-rata", color: "red" },
  { icon: TrendingUp, value: "100%", label: "Transparan", color: "red" },
];

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative py-16 px-6 max-w-6xl mx-auto -mt-6 z-10"
    >
      {/* Sama seperti background hero: grid pattern + blurred circles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4a4a4a0d_1px,transparent_1px),linear-gradient(to_bottom,#4a4a4a0d_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1 }}
            className="bg-black/30 backdrop-blur-md border border-red-800/50 rounded-2xl p-6 text-center hover:border-red-500 transition-all hover:shadow-xl hover:shadow-red-900/20 group"
          >
            <stat.icon className="w-12 h-12 mx-auto text-red-500 group-hover:scale-110 transition-transform" />
            <div className="text-4xl font-black mt-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
"use client";

import Hero from "./components/Hero";
import Stats from "./components/Stats";
import FormAduan from "./components/FormAduan";
import DaftarAduan from "./components/DaftarAduan";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-red-950 via-red-900 to-black opacity-80" />
      <div className="fixed inset-0 -z-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      
      <Hero />
      <Stats />
      <FormAduan />
      <DaftarAduan />
      <Footer />
    </main>
  );
}

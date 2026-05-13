"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";

import {
  FaUserCircle,
  FaCloudUploadAlt,
  FaFileAlt,
  FaLayerGroup,
  FaAlignLeft,
  FaPaperPlane,
} from "react-icons/fa";

export default function AddLaporanPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    kategori: "1",
    deskripsi: "",
    gambar: null,
  });

  const [preview, setPreview] = useState(null);

  // =========================
  // CEK LOGIN
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const userRaw = localStorage.getItem("user");

    if (userRaw) {
      try {
        setUser(JSON.parse(userRaw));
      } catch (err) {
        console.log(err);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "gambar" && files[0]) {
      setForm({
        ...form,
        gambar: files[0],
      });

      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  // =========================
  // SUBMIT LAPORAN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("judul", form.judul);
      formData.append(
        "deskripsi",
        form.deskripsi
      );

      // sesuai backend
      formData.append(
        "kategori_id",
        form.kategori
      );

      // sesuai upload.single("foto")
      if (form.gambar) {
        formData.append(
          "foto",
          form.gambar
        );
      }

      const res = await fetch(
        "http://localhost:5000/api/laporan",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await res.json();

      console.log(data);

      if (res.ok) {
        alert(
          "Laporan berhasil dikirim!"
        );

        router.push("/dashboard");
      } else {
        alert(
          data.msg ||
            "Gagal mengirim laporan"
        );
      }
    } catch (error) {
      console.log(error);

      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ece5e5]">
        <h1 className="text-[#8B0000] text-xl font-semibold">
          Memuat...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6eeee] to-[#e4d4d4] flex">
      {/* SIDEBAR */}
      <Sidebar handleLogout={handleLogout} />

      {/* MAIN */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white rounded-[28px] shadow-lg px-8 py-5 flex items-center justify-between border border-red-100">
          <div>
            <h1 className="text-3xl font-bold text-[#8B0000]">
              Tambah Laporan
            </h1>

            <p className="text-gray-500 mt-1">
              Sampaikan laporan dengan
              jelas dan lengkap
            </p>
          </div>

          {/* USER */}
          <div className="flex items-center gap-3 bg-[#fff5f5] px-4 py-2 rounded-2xl">
            <FaUserCircle className="text-[#8B0000] text-4xl" />

            <div>
              <p className="text-sm text-gray-500">
                Login sebagai
              </p>

              <h2 className="font-semibold text-[#8B0000]">
                {user?.nama || "User"}
              </h2>
            </div>
          </div>
        </div>

        {/* CARD */}
        <div className="mt-6 bg-white rounded-[30px] shadow-xl border border-red-100 overflow-hidden text-black">
          {/* TOP LINE */}
          <div className="h-3 bg-gradient-to-r from-[#8B0000] via-[#b30000] to-[#8B0000]" />

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="p-8 md:p-10"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* LEFT */}
              <div className="space-y-6">
                {/* JUDUL */}
                <div>
                  <label className="flex items-center gap-2 text-[#7a0000] font-semibold mb-3">
                    <FaFileAlt />
                    Judul Pengaduan
                  </label>

                  <input
                    type="text"
                    name="judul"
                    value={form.judul}
                    onChange={handleChange}
                    placeholder="Masukkan judul laporan..."
                    className="w-full bg-[#fff7f7] border border-red-200 focus:border-[#8B0000] focus:ring-4 focus:ring-red-100 rounded-2xl px-5 py-4 outline-none transition-all duration-300 text-black"
                    required
                  />
                </div>

                {/* KATEGORI */}
                <div>
                  <label className="flex items-center gap-2 text-[#7a0000] font-semibold mb-3">
                    <FaLayerGroup />
                    Kategori
                  </label>

                  <select
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    className="w-full bg-[#fff7f7] border border-red-200 focus:border-[#8B0000] focus:ring-4 focus:ring-red-100 rounded-2xl px-5 py-4 outline-none transition-all duration-300 text-black"
                  >
                    <option value="1">
                      Infrastruktur
                    </option>

                    <option value="2">
                      Kebersihan
                    </option>

                    <option value="3">
                      Kesehatan
                    </option>

                    <option value="4">
                      Pendidikan
                    </option>

                    <option value="5">
                      Lainnya
                    </option>
                  </select>
                </div>

                {/* UPLOAD */}
                <div>
                  <label className="flex items-center gap-2 text-[#7a0000] font-semibold mb-3">
                    <FaCloudUploadAlt />
                    Upload Lampiran
                  </label>

                  <label className="w-full h-[250px] border-2 border-dashed border-red-300 rounded-[28px] bg-[#fffafa] hover:bg-red-50 transition-all duration-300 flex items-center justify-center cursor-pointer overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                          <FaCloudUploadAlt className="text-[#8B0000] text-4xl" />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-[#8B0000]">
                          Upload Foto
                          Laporan
                        </h2>

                        <p className="text-gray-500 text-sm mt-1">
                          PNG, JPG atau
                          JPEG
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      name="gambar"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col">
                {/* DESKRIPSI */}
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-[#7a0000] font-semibold mb-3">
                    <FaAlignLeft />
                    Deskripsi Laporan
                  </label>

                  <textarea
                    name="deskripsi"
                    value={form.deskripsi}
                    onChange={handleChange}
                    placeholder="Tuliskan detail laporan secara lengkap..."
                    rows={15}
                    className="w-full h-full min-h-[420px] bg-[#fff7f7] border border-red-200 focus:border-[#8B0000] focus:ring-4 focus:ring-red-100 rounded-[28px] px-5 py-4 outline-none resize-none transition-all duration-300 text-black"
                    required
                  />
                </div>

                {/* BUTTON */}
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-[#8B0000] to-[#b30000] hover:scale-105 active:scale-95 transition-all duration-300 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg flex items-center gap-3 disabled:opacity-50"
                  >
                    <FaPaperPlane />

                    {loading
                      ? "Mengirim..."
                      : "Kirim Laporan"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
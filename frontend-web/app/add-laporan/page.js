"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "../components/sidebar";
import {
  FaFileAlt,
  FaLayerGroup,
  FaCloudUploadAlt,
  FaAlignLeft,
  FaPaperPlane,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaSpinner,
} from "react-icons/fa";

// Import CSS Leaflet hanya di client
import "leaflet/dist/leaflet.css";

// Dynamic import untuk komponen peta (menghindari SSR)
const MapWithMarker = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = mod;
    import("leaflet").then((L) => {
      // Fix icon marker Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    });

    // Komponen untuk menangani klik dan marker
    function LocationMarker({ setLocation, setAddress }) {
      const [position, setPosition] = useState(null);
      const map = useMapEvents({
        async click(e) {
          const { lat, lng } = e.latlng;
          setPosition(e.latlng);
          setLocation({ lat, lng });

          // Reverse geocoding dengan Nominatim
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await res.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
            } else {
              setAddress("Alamat tidak ditemukan");
            }
          } catch (err) {
            console.error("Reverse geocoding error:", err);
            setAddress("Gagal mengambil alamat");
          }
        },
      });
      return position === null ? null : (
        <Marker position={position}>
          <Popup>Lokasi laporan</Popup>
        </Marker>
      );
    }

    // Komponen utama peta
    function MapComponent({ center, setLocation, setAddress }) {
      return (
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker setLocation={setLocation} setAddress={setAddress} />
        </MapContainer>
      );
    }
    return MapComponent;
  }),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">Memuat peta...</div> }
);

export default function AddLaporanPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState({ lat: -6.2088, lng: 106.8456 }); // default Jakarta
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [form, setForm] = useState({
    judul: "",
    kategori: "",
    deskripsi: "",
    gambar: null,
    alamat: "",
    latitude: "",
    longitude: "",
  });

  // Update latitude/longitude ketika location berubah
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
    }));
  }, [location]);

  // Ambil daftar kategori dari backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
            // Set default kategori ke yang pertama
            setForm((prev) => ({ ...prev, kategori: data[0].id.toString() }));
          } else {
            // Fallback jika tidak ada kategori dari backend
            setCategories([
              { id: 1, nama: "Infrastruktur" },
              { id: 2, nama: "Kebersihan" },
              { id: 3, nama: "Kesehatan" },
              { id: 4, nama: "Pendidikan" },
              { id: 5, nama: "Lainnya" },
            ]);
            setForm((prev) => ({ ...prev, kategori: "1" }));
          }
        } else {
          // Fallback jika API gagal
          setCategories([
            { id: 1, nama: "Infrastruktur" },
            { id: 2, nama: "Kebersihan" },
            { id: 3, nama: "Kesehatan" },
            { id: 4, nama: "Pendidikan" },
            { id: 5, nama: "Lainnya" },
          ]);
          setForm((prev) => ({ ...prev, kategori: "1" }));
        }
      } catch (err) {
        console.error("Gagal fetch kategori:", err);
        setCategories([
          { id: 1, nama: "Infrastruktur" },
          { id: 2, nama: "Kebersihan" },
          { id: 3, nama: "Kesehatan" },
          { id: 4, nama: "Pendidikan" },
          { id: 5, nama: "Lainnya" },
        ]);
        setForm((prev) => ({ ...prev, kategori: "1" }));
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Ambil lokasi pengguna saat ini (geolocation)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          // Reverse geocode lokasi saat ini
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data && data.display_name) {
                setForm((prev) => ({ ...prev, alamat: data.display_name }));
              }
            })
            .catch(console.error);
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Gagal mendapatkan lokasi Anda. Pastikan izin lokasi diberikan.");
        }
      );
    } else {
      alert("Browser Anda tidak mendukung geolokasi.");
    }
  };

  // ========================= CEK LOGIN =========================
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

  // ========================= LOGOUT =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // ========================= HANDLE INPUT =========================
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "gambar" && files[0]) {
      setForm({ ...form, gambar: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ========================= SUBMIT LAPORAN =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("judul", form.judul);
      formData.append("deskripsi", form.deskripsi);
      formData.append("kategori_id", form.kategori);
      if (form.gambar) formData.append("foto", form.gambar);
      formData.append("alamat", form.alamat);
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);

      const res = await fetch("http://localhost:5000/api/laporan", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert("Laporan berhasil dikirim!");
        router.push("/dashboard");
      } else {
        alert(data.msg || "Gagal mengirim laporan");
      }
    } catch (error) {
      console.log(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ece5e5]">
        <h1 className="text-[#8B0000] text-xl font-semibold">Memuat...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6eeee] to-[#e4d4d4] flex">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white rounded-[28px] shadow-lg px-8 py-5 flex items-center justify-between border border-red-100">
          <div>
            <h1 className="text-3xl font-bold text-[#8B0000]">Tambah Laporan</h1>
            <p className="text-gray-500 mt-1">Sampaikan laporan dengan jelas dan lengkap</p>
          </div>
          <div className="flex items-center gap-3 bg-[#fff5f5] px-4 py-2 rounded-2xl">
            <div>
              <p className="text-sm text-gray-500">Login sebagai</p>
              <h2 className="font-semibold text-[#8B0000]">{user?.nama || "User"}</h2>
            </div>
          </div>
        </div>

        {/* CARD FORM */}
        <div className="mt-6 bg-white rounded-[30px] shadow-xl border border-red-100 overflow-hidden text-black">
          <div className="h-3 bg-gradient-to-r from-[#8B0000] via-[#b30000] to-[#8B0000]" />
          <form onSubmit={handleSubmit} className="p-8 md:p-10">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* KOLOM KIRI */}
              <div className="space-y-6">
                {/* Judul */}
                <div>
                  <label className="flex items-center gap-2 text-[#7a0000] font-semibold mb-3">
                    <FaFileAlt /> Judul Pengaduan
                  </label>
                  <input
                    type="text"
                    name="judul"
                    value={form.judul}
                    onChange={handleChange}
                    placeholder="Masukkan judul laporan..."
                    className="w-full bg-[#fff7f7] border border-red-200 focus:border-[#8B0000] focus:ring-4 focus:ring-red-100 rounded-2xl px-5 py-4 outline-none transition-all duration-300"
                    required
                  />
                </div>

                {/* Kategori - DINAMIS dari database */}
                <div>
                  <label className="flex items-center gap-2 text-[#7a0000] font-semibold mb-3">
                    <FaLayerGroup /> Kategori
                  </label>
                  {loadingCategories ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <FaSpinner className="animate-spin" /> Memuat kategori...
                    </div>
                  ) : (
                    <select
                      name="kategori"
                      value={form.kategori}
                      onChange={handleChange}
                      className="w-full bg-[#fff7f7] border border-red-200 focus:border-[#8B0000] focus:ring-4 focus:ring-red-100 rounded-2xl px-5 py-4 outline-none transition-all duration-300"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nama}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Kategori dikelola oleh admin melalui halaman Kelola Kategori
                  </p>
                </div>

                {/* Upload Gambar */}
                <div>
                  <label className="flex items-center gap-2 text-[#7a0000] font-semibold mb-3">
                    <FaCloudUploadAlt /> Upload Lampiran
                  </label>
                  <label className="w-full h-[250px] border-2 border-dashed border-red-300 rounded-[28px] bg-[#fffafa] hover:bg-red-50 transition-all duration-300 flex items-center justify-center cursor-pointer overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                          <FaCloudUploadAlt className="text-[#8B0000] text-4xl" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-[#8B0000]">Upload Foto Laporan</h2>
                        <p className="text-gray-500 text-sm mt-1">PNG, JPG atau JPEG (maks 2MB)</p>
                      </div>
                    )}
                    <input type="file" name="gambar" accept="image/*" onChange={handleChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* KOLOM KANAN */}
              <div className="flex flex-col space-y-6">
                {/* Deskripsi */}
                <div>
                  <label className="flex items-center gap-2 text-[#7a0000] font-semibold mb-3">
                    <FaAlignLeft /> Deskripsi Laporan
                  </label>
                  <textarea
                    name="deskripsi"
                    value={form.deskripsi}
                    onChange={handleChange}
                    placeholder="Tuliskan detail laporan secara lengkap..."
                    rows={5}
                    className="w-full bg-[#fff7f7] border border-red-200 focus:border-[#8B0000] focus:ring-4 focus:ring-red-100 rounded-[28px] px-5 py-4 outline-none resize-none transition-all duration-300"
                    required
                  />
                </div>

                {/* Peta */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-[#7a0000] font-semibold">
                      <FaMapMarkerAlt /> Lokasi Kejadian (klik pada peta)
                    </label>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="text-sm bg-red-50 hover:bg-red-100 text-[#8B0000] px-3 py-1 rounded-full flex items-center gap-1 transition"
                    >
                      <FaLocationArrow /> Gunakan lokasi saya
                    </button>
                  </div>
                  <div className="h-[300px] rounded-2xl overflow-hidden border border-red-200 shadow-md">
                    <MapWithMarker
                      center={[location.lat, location.lng]}
                      setLocation={setLocation}
                      setAddress={(addr) => setForm((prev) => ({ ...prev, alamat: addr }))}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Klik pada peta untuk memilih lokasi laporan.</p>
                </div>

                {/* Alamat otomatis */}
                <div>
                  <label className="flex items-center gap-2 text-[#7a0000] font-semibold mb-3">
                    <FaLocationArrow /> Alamat Lengkap
                  </label>
                  <input
                    type="text"
                    name="alamat"
                    value={form.alamat}
                    onChange={handleChange}
                    placeholder="Alamat akan muncul otomatis saat klik peta"
                    className="w-full bg-[#fff7f7] border border-red-200 focus:border-[#8B0000] focus:ring-4 focus:ring-red-100 rounded-2xl px-5 py-4 outline-none transition-all duration-300"
                    required
                  />
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Lat: {form.latitude || "-"}</span>
                    <span>Lng: {form.longitude || "-"}</span>
                  </div>
                </div>

                {/* Tombol Kirim */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || loadingCategories}
                    className="bg-gradient-to-r from-[#8B0000] to-[#b30000] hover:scale-105 active:scale-95 transition-all duration-300 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg flex items-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    {loading ? "Mengirim..." : "Kirim Laporan"}
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
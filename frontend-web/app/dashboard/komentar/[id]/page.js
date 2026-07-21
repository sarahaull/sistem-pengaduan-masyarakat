"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CommentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [laporan, setLaporan] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // =========================
  // FETCH LAPORAN DETAIL
  // =========================
  const fetchLaporan = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/laporan/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setLaporan(data);

      // kalau backend kamu kirim komentar di sini
      setComments(data.komentar || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEND COMMENT
  // =========================
  const sendComment = async () => {
    if (!message.trim()) return;

    setSending(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/comments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            laporan_id: id,
            message: message,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setComments((prev) => [...prev, data]);
        setMessage("");
      } else {
        alert(data.msg || "Gagal komentar");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (id) fetchLaporan();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">

        {/* LAPORAN */}
        <h1 className="text-2xl font-bold text-red-700">
          {laporan?.judul}
        </h1>

        <p className="text-gray-600 mt-2">
          {laporan?.deskripsi}
        </p>

        

        {/* COMMENT LIST */}
        <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto border-t pt-4">
          {comments.length === 0 ? (
            <p className="text-gray-400">
              Belum ada komentar
            </p>
          ) : (
            comments.map((c, i) => (
              <div
                key={i}
                className="bg-gray-100 p-3 rounded-xl"
              >
                <p className="text-sm font-semibold">
                  {c.nama || "User"}
                </p>
                <p className="text-sm text-gray-700">
                  {c.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* INPUT COMMENT */}
        <div className="mt-4 flex gap-2">
          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Tulis komentar..."
            className="flex-1 border p-2 rounded-xl"
          />

          <button
            onClick={sendComment}
            disabled={sending}
            className="bg-red-600 text-white px-4 py-2 rounded-xl"
          >
            Kirim
          </button>
        </div>

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="mt-5 text-sm text-gray-500"
        >
          ← Kembali
        </button>
      </div>
    </div>
  );
}
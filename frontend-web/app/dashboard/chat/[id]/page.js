"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import Sidebar from "@/app/components/sidebar";

import {
  FaPaperPlane,
  FaUserCircle,
  FaCheckCircle,
} from "react-icons/fa";

export default function UserChatPage() {
  const params = useParams();

  const laporanId = params.id;

  const [laporan, setLaporan] =
    useState(null);

  const [chat, setChat] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // =========================
  // GET DATA
  // =========================
  useEffect(() => {
    if (laporanId) {
      getLaporan();
      getChat();
    }
  }, [laporanId]);

  // =========================
  // GET LAPORAN
  // =========================
  const getLaporan =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `http://localhost:5000/api/laporan/${laporanId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setLaporan(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // GET CHAT
  // =========================
  const getChat =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `http://localhost:5000/api/chat/${laporanId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        if (
          Array.isArray(data)
        ) {
          setChat(data);
        } else {
          setChat([]);
        }
      } catch (error) {
        console.log(error);

        setChat([]);
      }
    };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage =
    async () => {
      if (!message.trim())
        return;

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            "http://localhost:5000/api/chat",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                laporan_id:
                  laporanId,

                sender:
                  "user",

                message,
              }),
            }
          );

        const data =
          await res.json();

        if (res.ok) {
          setChat((prev) => [
            ...prev,
            data,
          ]);

          setMessage("");
        }
      } catch (error) {
        console.log(error);
      }
    };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f4f4f4]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="bg-white border-b px-8 py-5 flex items-center justify-between shadow-sm">

          <div>
            <h1 className="text-2xl font-bold text-[#8B0000]">
              Chat Pengaduan
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Komunikasi dengan admin
            </p>
          </div>

          <div
            className={`px-5 py-2 rounded-full text-sm font-semibold
            ${
              laporan?.status ===
              "selesai"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {laporan?.status}
          </div>
        </div>

        {/* DETAIL LAPORAN */}
        <div className="p-6">

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

            <div className="flex items-center gap-4 mb-6">

              <div className="w-14 h-14 rounded-full bg-[#8B0000]/10 flex items-center justify-center">
                <FaUserCircle className="text-4xl text-[#8B0000]" />
              </div>

              <div>
                <h2 className="font-bold text-lg text-gray-800">
                  {laporan?.judul}
                </h2>

                <p className="text-sm text-gray-500">
                  {laporan?.kategori}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">
                Deskripsi Laporan
              </p>

              <div className="bg-gray-50 rounded-2xl p-4 text-gray-700 leading-relaxed">
                {laporan?.deskripsi}
              </div>
            </div>

            {laporan?.status ===
              "selesai" && (
              <div className="mt-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-2">
                <FaCheckCircle />
                Laporan telah selesai diproses admin
              </div>
            )}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          <div className="space-y-4">

            {chat.length ===
            0 ? (
              <div className="text-center text-gray-400 mt-10">
                Belum ada chat
              </div>
            ) : (
              chat.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={index}
                    className={`flex ${
                      item.sender ===
                      "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-5 py-4 rounded-3xl shadow-sm
                      ${
                        item.sender ===
                        "user"
                          ? "bg-[#8B0000] text-white rounded-br-md"
                          : "bg-white text-gray-700 rounded-bl-md border"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {
                          item.message
                        }
                      </p>
                    </div>
                  </div>
                )
              )
            )}

          </div>
        </div>

        {/* INPUT */}
        {laporan?.status !==
          "selesai" && (
          <div className="bg-white border-t px-6 py-4">

            <div className="flex items-center gap-3">

              <input
                type="text"
                placeholder="Tulis pesan..."
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                className="flex-1 border border-gray-200 bg-gray-50 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-[#8B0000]"
              />

              <button
                onClick={
                  sendMessage
                }
                className="bg-[#8B0000] hover:bg-[#700000] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300"
              >
                <FaPaperPlane />
                Kirim
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
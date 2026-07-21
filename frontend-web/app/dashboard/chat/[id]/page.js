// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useParams } from "next/navigation";
// import { io } from "socket.io-client";
// import Sidebar from "@/app/components/sidebar";
// import {
//   FaPaperPlane,
//   FaUserCircle,
//   FaSpinner,
//   FaRegCommentDots,
//   FaCheckCircle,
// } from "react-icons/fa";

// export default function UserChatPage() {
//   const params = useParams();
//   const laporanId = params.id;

//   const [laporan, setLaporan] = useState(null);
//   const [chat, setChat] = useState([]);
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);

//   const chatEndRef = useRef(null);
//   const socketRef = useRef(null);

//   // ================= SOCKET REALTIME =================
//   useEffect(() => {
//     const socket = io("http://localhost:5000", {
//       transports: ["websocket"],
//     });

//     socketRef.current = socket;

//     socket.on("connect", () => {
//       console.log("socket connected");
//       socket.emit("joinRoom", laporanId);
//     });

//     socket.on("newMessage", (msg) => {
//       setChat((prev) => [...prev, msg]);
//     });

//     return () => socket.disconnect();
//   }, [laporanId]);

//   // ================= SCROLL =================
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chat]);

//   // ================= GET LAPORAN =================
//   const getLaporan = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch(
//         `http://localhost:5000/api/laporan/${laporanId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const data = await res.json();
//       setLaporan(data);
//     } catch (err) {
//       console.log(err);
//     }
//   }, [laporanId]);

//   // ================= GET CHAT =================
//   const getChat = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch(
//         `http://localhost:5000/api/chat/${laporanId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const data = await res.json();
//       setChat(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.log(err);
//     }
//   }, [laporanId]);

//   // ================= INIT =================
//   useEffect(() => {
//     if (!laporanId) return;

//     const init = async () => {
//       await getLaporan();
//       await getChat();
//       setLoading(false);
//     };

//     init();

//     const interval = setInterval(() => {
//       getChat();
//     }, 8000);

//     return () => clearInterval(interval);
//   }, [laporanId, getLaporan, getChat]);

//   // ================= SEND MESSAGE (MERAH LANGSUNG) =================
//   const sendMessage = async () => {
//     const text = message.trim();
//     if (!text || sending) return;

//     const tempId = `temp_${Date.now()}`;

//     const tempMsg = {
//       id: tempId,
//       sender: "user",
//       message: text,
//       created_at: new Date().toISOString(),
//       isOptimistic: true,
//     };

//     // 🔥 LANGSUNG MUNCUL MERAH
//     setChat((prev) => [...prev, tempMsg]);

//     setMessage("");
//     setSending(true);

//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch("http://localhost:5000/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           laporan_id: parseInt(laporanId),
//           message: text,
//         }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setChat((prev) =>
//           prev.map((m) =>
//             m.id === tempId ? { ...data, sender: "user" } : m
//           )
//         );
//       } else {
//         setChat((prev) => prev.filter((m) => m.id !== tempId));
//       }
//     } catch (err) {
//       setChat((prev) => prev.filter((m) => m.id !== tempId));
//     } finally {
//       setSending(false);
//     }
//   };

//   // ================= LOADING =================
//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <FaSpinner className="animate-spin text-red-600 text-4xl" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />

//       <div className="flex-1 flex flex-col">
//         {/* HEADER */}
//         <div className="bg-white px-5 py-3 border-b">
//           <h1 className="font-bold">Chat Laporan</h1>
//         </div>

//         {/* CHAT AREA */}
//         <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
//           {chat.length === 0 ? (
//             <p className="text-center text-gray-400">
//               Belum ada pesan
//             </p>
//           ) : (
//             chat.map((item) => {
//               const isUser =
//                 item.isOptimistic ||
//                 item.sender === "user";

//               return (
//                 <div
//                   key={item.id}
//                   className={`flex ${
//                     isUser ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`px-4 py-2 rounded-xl max-w-[70%] ${
//                       isUser
//                         ? "bg-red-600 text-white"
//                         : "bg-white border"
//                     }`}
//                   >
//                     <p>{item.message}</p>

//                     {item.isOptimistic && (
//                       <p className="text-[10px] text-red-200 mt-1">
//                         sending...
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}

//           <div ref={chatEndRef} />
//         </div>

//         {/* INPUT */}
//         <div className="p-3 border-t bg-white flex gap-2">
//           <input
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) =>
//               e.key === "Enter" && sendMessage()
//             }
//             className="flex-1 border rounded-full px-4 py-2"
//             placeholder="Tulis pesan..."
//           />

//           <button
//             onClick={sendMessage}
//             disabled={sending}
//             className="bg-red-600 text-white px-5 rounded-full"
//           >
//             {sending ? (
//               <FaSpinner className="animate-spin" />
//             ) : (
//               <FaPaperPlane />
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
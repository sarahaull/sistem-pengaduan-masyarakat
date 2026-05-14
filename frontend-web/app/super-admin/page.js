// "use client";

// import { useEffect, useState } from "react";

// export default function SuperAdminDashboard() {
//   const [stats, setStats] = useState(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/api/admin/stats", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });

//         const data = await res.json();
//         setStats(data);
//       } catch (err) {
//         console.log("Error stats:", err);
//       }
//     };

//     fetchStats();
//   }, []);

//   if (!stats) return <div>Loading dashboard...</div>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Dashboard Super Admin</h1>

//       <div className="grid grid-cols-3 gap-4">
//         <div className="bg-white p-4 shadow rounded">
//           <p>Total Users</p>
//           <h2 className="text-xl font-bold">{stats.totalUsers}</h2>
//         </div>

//         <div className="bg-white p-4 shadow rounded">
//           <p>Total Laporan</p>
//           <h2 className="text-xl font-bold">{stats.totalLaporan}</h2>
//         </div>

//         <div className="bg-white p-4 shadow rounded">
//           <p>Laporan Pending</p>
//           <h2 className="text-xl font-bold">{stats.pending}</h2>
//         </div>
//       </div>
//     </div>
//   );
// }
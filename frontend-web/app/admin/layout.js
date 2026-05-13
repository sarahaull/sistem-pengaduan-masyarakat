import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
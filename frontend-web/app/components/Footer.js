import { Heart } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white p-6">
      
      <div className="flex justify-between items-center">
        
        {/* kiri */}
        <p>© 2026 Pengaduan Masyarakat</p>

        {/* kanan (INI TEMPAT ICON) */}
        <div className="flex gap-4">
          
          <FaFacebook className="w-5 h-5 text-blue-600" />
          <FaInstagram className="w-5 h-5 text-pink-500" />
          <FaTwitter className="w-5 h-5 text-sky-500" />

        </div>

      </div>
    </footer>
  );
}
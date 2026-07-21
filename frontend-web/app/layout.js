import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Sapa Warga - Sistem Pengaduan Masyarakat",
  description: "Saluran aduan keluhan warga dengan tindak lanjut transparan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={poppins.className}>
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#7f1d1d",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
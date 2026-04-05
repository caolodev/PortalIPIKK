import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Portal IPIKK",
  description: "Portal Académico do IPIKK",
};
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <link rel="shortcut icon" href="/logo.png" type="image/x-icon" />
      </head>
      <body className="antialiased bg-white min-h-screen" style={{ fontFamily: poppins.style.fontFamily }}>
        <Providers>{children}</Providers>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0F2C59",
              color: "#fff",
              fontWeight: "600",
            },
          }}
        />
      </body>
    </html>
  );
}

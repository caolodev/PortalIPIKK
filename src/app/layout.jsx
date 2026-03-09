import "./globals.css";
import Providers from "@/components/Providers";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Toaster } from "react-hot-toast";
import ProgressBar from "../components/ProgressBar";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
export const metadata = {
  title: "Portal IPIKK",
  description: "Portal Académico do IPIKK",
};
export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <link rel="shortcut icon" href="/logo.png" type="image/x-icon" />
      </head>
      <body className="antialiased">
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

import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Whisper ASR Demo",
  description: "Demo for Whisper ASR",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-100`}
      >
        <Header />
        <main className="flex-grow p-4"> {/* Added padding to main for breathing room */}
          {children}
        </main>
        <Footer className="mt-10" /> {/* Added margin-top for separation from content */}
      </body>
    </html>
  );
}

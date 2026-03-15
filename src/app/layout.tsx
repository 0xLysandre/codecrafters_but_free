import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CodeForge — Learn to Code by Building Real Software",
  description:
    "Build Redis, Git, Docker, HTTP servers and more from scratch. Free, open-source, project-based learning with incremental test-driven challenges.",
  keywords: [
    "learn programming",
    "build redis",
    "build git",
    "coding challenges",
    "project-based learning",
    "codecrafters alternative",
    "free coding platform",
  ],
  openGraph: {
    title: "CodeForge — Learn to Code by Building Real Software",
    description:
      "Build the tools you already use. Free project-based coding challenges.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1e1e2e",
              color: "#e4e4e7",
              border: "1px solid #27272a",
            },
          }}
        />
      </body>
    </html>
  );
}

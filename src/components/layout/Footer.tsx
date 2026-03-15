import Link from "next/link";
import { Github, MessageCircle, Anvil } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo & Notice */}
          <div className="flex items-center gap-2">
            <Anvil className="h-5 w-5 text-forge-400" />
            <span className="text-sm text-zinc-400">
              Code<span className="text-forge-400">Forge</span> — Open-source
              project-based learning platform
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/codeforge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="https://discord.gg/codeforge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

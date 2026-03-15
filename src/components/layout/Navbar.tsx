"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Anvil,
  LayoutDashboard,
  FolderKanban,
  Trophy,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Flame,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  xp?: number;
  level?: number;
  streak?: number;
  username?: string;
  avatarUrl?: string | null;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Navbar({
  xp = 0,
  level = 1,
  streak = 0,
  username,
  avatarUrl,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Anvil className="h-7 w-7 text-forge-400 group-hover:text-forge-300 transition-colors" />
          <span className="text-xl font-bold text-zinc-100 tracking-tight">
            Code<span className="text-forge-400">Forge</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* XP Display */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            <Zap className="h-4 w-4 text-forge-400" />
            <span className="font-medium text-forge-400">
              {xp.toLocaleString()}
            </span>
            <span className="text-zinc-600">XP</span>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-sm">
              <Flame className="h-4 w-4 text-ember-400" />
              <span className="font-medium text-ember-400">{streak}</span>
            </div>
          )}

          {/* User Dropdown */}
          {username && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800/60 transition-colors"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="h-8 w-8 rounded-full border border-zinc-700"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forge-500/20 text-forge-400 text-sm font-bold">
                    {username[0]?.toUpperCase()}
                  </div>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-zinc-500 transition-transform",
                    dropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-[#1e1e2e] bg-[#111118] py-1 shadow-xl">
                    <div className="border-b border-[#1e1e2e] px-4 py-3">
                      <p className="text-sm font-medium text-zinc-200">
                        {username}
                      </p>
                      <p className="text-xs text-zinc-500">Level {level}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="border-t border-[#1e1e2e]">
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800/60">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

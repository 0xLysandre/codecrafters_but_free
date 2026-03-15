"use client";

import { cn } from "@/lib/utils";
import { LANGUAGE_CONFIG, type Language } from "@/types";

interface LanguageSelectorProps {
  languages: Language[];
  selected: Language | null;
  onSelect: (language: Language) => void;
  className?: string;
}

export default function LanguageSelector({
  languages,
  selected,
  onSelect,
  className,
}: LanguageSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      {languages.map((lang) => {
        const config = LANGUAGE_CONFIG[lang];
        const isSelected = selected === lang;

        return (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-4",
              "transition-all duration-200",
              "hover:bg-zinc-800/60",
              isSelected
                ? "border-forge-500 bg-forge-500/10 text-forge-400"
                : "border-[#1e1e2e] bg-[#111118] text-zinc-400 hover:border-zinc-700"
            )}
          >
            <span className="text-2xl">{config.icon}</span>
            <span className="text-sm font-medium">{config.name}</span>
          </button>
        );
      })}
    </div>
  );
}

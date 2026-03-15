"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Hint } from "@/types";

interface HintPanelProps {
  hints: Hint[];
  className?: string;
}

const tierLabels = ["Nudge", "Guidance", "Solution Hint"];
const tierColors = [
  "text-green-400 border-green-400/30 bg-green-400/5",
  "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  "text-red-400 border-red-400/30 bg-red-400/5",
];

export default function HintPanel({ hints, className }: HintPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  const sortedHints = [...hints].sort((a, b) => a.level - b.level);

  const revealHint = (level: number) => {
    setRevealedHints((prev) => new Set(prev).add(level));
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-[#1e1e2e] bg-[#111118]",
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium text-zinc-200">
            Hints ({hints.length} available)
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="space-y-3 border-t border-[#1e1e2e] p-4">
          {sortedHints.map((hint) => {
            const tierIndex = Math.min(hint.level - 1, 2);
            const isRevealed = revealedHints.has(hint.level);

            return (
              <div
                key={hint.level}
                className={cn(
                  "rounded-lg border p-3",
                  tierColors[tierIndex]
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Tier {hint.level}: {tierLabels[tierIndex] ?? "Hint"}
                  </span>
                </div>

                {isRevealed ? (
                  <p className="text-sm text-zinc-300 mt-2">{hint.text}</p>
                ) : (
                  <button
                    onClick={() => revealHint(hint.level)}
                    className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Click to reveal hint
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { DIFFICULTY_CONFIG, type Difficulty } from "@/types";

interface BadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export default function Badge({ difficulty, className }: BadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.bgColor,
        config.color,
        "border border-current/20",
        className
      )}
    >
      {config.label}
    </span>
  );
}

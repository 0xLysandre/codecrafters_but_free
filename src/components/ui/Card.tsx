import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export default function Card({
  glow = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#1e1e2e] bg-[#111118] p-6",
        "transition-all duration-300",
        "hover:border-zinc-700 hover:bg-[#15151f]",
        glow && "hover:shadow-lg hover:shadow-forge-500/10 animate-pulse-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

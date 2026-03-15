"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGUAGE_CONFIG, type ProjectSummary } from "@/types";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";

interface ProjectCardProps {
  project: ProjectSummary;
  className?: string;
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
  const progress =
    project.stageCount > 0
      ? (project.completedStages / project.stageCount) * 100
      : 0;

  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#111118] p-5",
        "transition-all duration-300",
        !project.isLocked && "hover:border-zinc-700 hover:bg-[#15151f] hover:shadow-lg hover:shadow-forge-500/5",
        project.isLocked && "opacity-60",
        className
      )}
    >
      {/* Lock Overlay */}
      {project.isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0f]/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2">
            <Lock className="h-8 w-8 text-zinc-500" />
            <span className="text-xs text-zinc-500 font-medium">
              Complete prerequisites to unlock
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{project.icon}</span>
        <Badge difficulty={project.difficulty} />
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold text-zinc-100 mb-1 group-hover:text-forge-400 transition-colors">
        {project.title}
      </h3>
      <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
        {project.description}
      </p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-zinc-500">
            {project.completedStages} / {project.stageCount} stages
          </span>
          <span className="text-xs font-medium text-zinc-400">
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* Language Icons */}
      <div className="flex items-center gap-1.5">
        {project.supportedLanguages.slice(0, 5).map((lang) => (
          <span
            key={lang}
            title={LANGUAGE_CONFIG[lang].name}
            className="text-base"
          >
            {LANGUAGE_CONFIG[lang].icon}
          </span>
        ))}
        {project.supportedLanguages.length > 5 && (
          <span className="text-xs text-zinc-500">
            +{project.supportedLanguages.length - 5}
          </span>
        )}
      </div>
    </div>
  );

  if (project.isLocked) {
    return content;
  }

  return (
    <Link href={`/projects/${project.slug}`} className="block">
      {content}
    </Link>
  );
}

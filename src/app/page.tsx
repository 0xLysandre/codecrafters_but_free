import Link from "next/link";
import {
  Terminal,
  Database,
  GitBranch,
  Globe,
  ArrowRight,
  Github,
  Zap,
  Shield,
  Code2,
  Users,
  Star,
} from "lucide-react";

const SHOWCASE_PROJECTS = [
  {
    icon: Database,
    title: "Build Redis",
    description: "In-memory key-value store with RESP protocol",
    languages: ["Python", "Go", "Rust", "Java"],
    stages: 16,
  },
  {
    icon: GitBranch,
    title: "Build Git",
    description: "Version control with SHA-1 hashing and packfiles",
    languages: ["Python", "Go", "Rust", "C"],
    stages: 16,
  },
  {
    icon: Globe,
    title: "Build HTTP Server",
    description: "HTTP/1.1 server with routing and compression",
    languages: ["Python", "JavaScript", "Go", "Rust"],
    stages: 14,
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Zero Setup",
    description:
      "Browser-based IDE with cloud execution. Write code and run tests instantly.",
  },
  {
    icon: Shield,
    title: "Free Forever",
    description:
      "Core content is free and open-source. No paywall for learning.",
  },
  {
    icon: Code2,
    title: "Real Software",
    description:
      "Build actual tools — not toy problems. Redis, Git, Docker, and more.",
  },
  {
    icon: Terminal,
    title: "Test-Driven",
    description:
      "Every stage has automated tests with detailed, helpful error messages.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Navigation */}
      <nav className="border-b border-zinc-800/50 backdrop-blur-sm fixed top-0 w-full z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-forge-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CodeForge</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/projects"
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/leaderboard"
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Leaderboard
            </Link>
            <a
              href="https://github.com/codeforge"
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link href="/login" className="btn-ghost text-sm">
              Log In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Start Building
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forge-500/10 border border-forge-500/20 text-forge-400 text-sm mb-8">
            <Star className="w-4 h-4" />
            Free & Open Source
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Learn to code by building
            <br />
            <span className="glow-text">the tools you already use</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Build Redis, Git, Docker, HTTP servers and more from scratch.
            Incremental, test-driven challenges that teach real systems
            programming.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-primary text-lg px-8 py-3 flex items-center gap-2"
            >
              Start Building
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/codeforge"
              className="btn-secondary text-lg px-8 py-3 flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5" />
              View Source
            </a>
          </div>
          <div className="flex items-center justify-center gap-8 mt-10 text-zinc-500 text-sm">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              10,000+ builders
            </span>
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              15 projects
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              8 languages
            </span>
          </div>
        </div>

        {/* Terminal Animation */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="card overflow-hidden shadow-2xl shadow-forge-500/5">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0d0d14] border-b border-zinc-800">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-zinc-500 ml-2 font-mono">
                codeforge — build-redis
              </span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="text-zinc-500">
                # Stage 3: Respond to PING
              </div>
              <div className="text-zinc-400 mt-2">
                <span className="text-forge-400">$</span> codeforge test
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-green-400">
                  ✓ Server binds to port 6379{" "}
                  <span className="text-zinc-600">(45ms)</span>
                </div>
                <div className="text-green-400">
                  ✓ Server accepts TCP connection{" "}
                  <span className="text-zinc-600">(12ms)</span>
                </div>
                <div className="text-green-400">
                  ✓ Server responds with +PONG\r\n{" "}
                  <span className="text-zinc-600">(8ms)</span>
                </div>
              </div>
              <div className="mt-3 text-green-400 font-semibold">
                All tests passed! Stage 3 complete.
              </div>
              <div className="mt-1 text-forge-400">
                +75 XP earned → Stage 4: Handle ECHO command
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Build Real Software
          </h2>
          <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
            Not toy problems. Build simplified versions of production tools, one
            tested step at a time.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {SHOWCASE_PROJECTS.map((project) => (
              <div
                key={project.title}
                className="card p-6 hover:border-forge-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-forge-500/10 flex items-center justify-center mb-4 group-hover:bg-forge-500/20 transition-colors">
                  <project.icon className="w-6 h-6 text-forge-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  {project.description}
                </p>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{project.stages} stages</span>
                  <div className="flex gap-1">
                    {project.languages.slice(0, 3).map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400"
                      >
                        {lang}
                      </span>
                    ))}
                    {project.languages.length > 3 && (
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        +{project.languages.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="p-6">
                <feature.icon className="w-8 h-8 text-forge-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to build something real?
          </h2>
          <p className="text-zinc-400 mb-8">
            Pick a project, choose your language, and start writing code. No
            credit card required.
          </p>
          <Link
            href="/dashboard"
            className="btn-primary text-lg px-10 py-3 inline-flex items-center gap-2"
          >
            Start Your First Project
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <span>CodeForge — Free & Open Source</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/codeforge"
              className="hover:text-zinc-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://discord.gg/codeforge"
              className="hover:text-zinc-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

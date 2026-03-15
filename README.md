# CodeForge

**Learn to code by building the tools you already use.**

CodeForge is a free, open-source platform where you learn programming by building real-world software from scratch — Redis, Git, HTTP servers, Docker, and more — through incremental, test-driven challenges.

## Features

- **15 Projects** across 4 difficulty tiers (Beginner to Expert)
- **8 Languages** supported: Python, JavaScript, Go, Rust, Java, C, TypeScript, Ruby
- **Browser IDE** with Monaco editor — no local setup required
- **Sandboxed Execution** — secure Docker-based test runner
- **Gamification** — XP, levels, badges, streaks, and leaderboards
- **Community Solutions** — share and browse solutions after completing stages
- **100% Free** — core content is free forever

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker (for sandbox execution)

### Setup

```bash
# Clone the repository
git clone https://github.com/codeforge/codeforge.git
cd codeforge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials and OAuth keys

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts the app, PostgreSQL, and Redis.

## Project Structure

```
codeforge/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API route handlers
│   │   ├── dashboard/          # Dashboard page
│   │   ├── workspace/          # Challenge workspace (IDE)
│   │   ├── projects/           # Project overview pages
│   │   ├── profile/            # User profile
│   │   └── leaderboard/        # Global leaderboard
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Layout components
│   │   ├── workspace/          # Workspace-specific components
│   │   └── dashboard/          # Dashboard components
│   ├── lib/                    # Shared utilities
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── db.ts               # Prisma client
│   │   ├── sandbox.ts          # Sandbox execution engine
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
├── content/
│   └── projects/               # Project definitions (YAML)
│       ├── build-echo-server/
│       ├── build-shell/
│       └── build-http-server/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seed script
└── docker-compose.yml          # Docker setup
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Code Editor | Monaco Editor |
| API | Next.js API Routes |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache | Redis 7 |
| Auth | NextAuth.js (GitHub, Google, Email) |
| Sandbox | Docker with gVisor |
| Real-time | WebSocket |

## Adding a New Project

1. Create a directory under `content/projects/`
2. Add `project.yaml` with project metadata and stages
3. Add starter code for each language in `starters/`
4. Add test scripts in `tests/`
5. Run the seed script to load content into the database

See the [Content Authoring Guide](./docs/authoring.md) for details.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License. See [LICENSE](./LICENSE) for details.

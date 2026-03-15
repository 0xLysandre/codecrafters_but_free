#!/usr/bin/env bash
#
# CodeForge — Local Development Setup
#
# Usage:
#   ./scripts/dev-setup.sh          # Full setup (install, db, seed, run)
#   ./scripts/dev-setup.sh --skip-db  # Skip database setup (just install & run)
#
# Prerequisites:
#   - Node.js 20+
#   - Docker & Docker Compose (for PostgreSQL and Redis)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[CodeForge]${NC} $*"; }
warn() { echo -e "${YELLOW}[CodeForge]${NC} $*"; }
err()  { echo -e "${RED}[CodeForge]${NC} $*" >&2; }

SKIP_DB=false
for arg in "$@"; do
  case "$arg" in
    --skip-db) SKIP_DB=true ;;
  esac
done

# ── Check prerequisites ─────────────────────────────────────────────

log "Checking prerequisites..."

if ! command -v node &>/dev/null; then
  err "Node.js is not installed. Please install Node.js 20+ from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  err "Node.js 18+ is required (found $(node -v))"
  exit 1
fi
log "Node.js $(node -v) ✓"

if ! command -v npm &>/dev/null; then
  err "npm is not installed"
  exit 1
fi
log "npm $(npm -v) ✓"

if [ "$SKIP_DB" = false ]; then
  if ! command -v docker &>/dev/null; then
    warn "Docker not found. Database services won't be started automatically."
    warn "Make sure PostgreSQL and Redis are running, then re-run with --skip-db"
    SKIP_DB=true
  else
    log "Docker $(docker --version | awk '{print $3}' | tr -d ',') ✓"
  fi
fi

# ── Install dependencies ────────────────────────────────────────────

log "Installing dependencies..."
npm install --silent 2>&1 | tail -3
log "Dependencies installed ✓"

# ── Set up environment variables ────────────────────────────────────

if [ ! -f .env ]; then
  log "Creating .env from .env.example..."
  cp .env.example .env

  # Generate a random secret for NextAuth
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/your-secret-here-change-in-production/$SECRET/" .env
  else
    sed -i "s/your-secret-here-change-in-production/$SECRET/" .env
  fi
  log ".env created with generated NEXTAUTH_SECRET ✓"
else
  log ".env already exists ✓"
fi

# ── Start database services ─────────────────────────────────────────

if [ "$SKIP_DB" = false ]; then
  log "Starting PostgreSQL and Redis via Docker Compose..."

  # Only start db services, not the app container
  docker compose up -d postgres redis 2>&1 | tail -5

  # Wait for PostgreSQL to be ready
  log "Waiting for PostgreSQL to be ready..."
  RETRIES=30
  until docker compose exec -T postgres pg_isready -U postgres &>/dev/null || [ $RETRIES -eq 0 ]; do
    RETRIES=$((RETRIES - 1))
    sleep 1
  done

  if [ $RETRIES -eq 0 ]; then
    err "PostgreSQL did not become ready in time"
    exit 1
  fi
  log "PostgreSQL ready ✓"
  log "Redis ready ✓"
fi

# ── Set up database ─────────────────────────────────────────────────

log "Generating Prisma client..."
npx prisma generate --no-hints 2>&1 | tail -2
log "Prisma client generated ✓"

log "Pushing database schema..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -3
log "Database schema applied ✓"

log "Seeding database..."
npx tsx prisma/seed.ts 2>&1
log "Database seeded ✓"

# ── Start development server ────────────────────────────────────────

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}║   ${GREEN}CodeForge is ready!${CYAN}                            ║${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}║   ${NC}Starting dev server at ${GREEN}http://localhost:3000${CYAN}   ║${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}║   ${NC}Press ${YELLOW}Ctrl+C${NC} to stop${CYAN}                           ║${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

exec npm run dev

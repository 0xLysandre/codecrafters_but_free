#!/usr/bin/env bash
#
# CodeForge — Local Development Setup
#
# Usage:
#   ./scripts/dev-setup.sh              # SQLite setup (zero dependencies beyond Node.js)
#   ./scripts/dev-setup.sh --postgres   # Use PostgreSQL + Redis via Docker Compose
#
# Prerequisites:
#   - Node.js 18+
#   - Docker (only if using --postgres)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[CodeForge]${NC} $*"; }
warn() { echo -e "${YELLOW}[CodeForge]${NC} $*"; }
err()  { echo -e "${RED}[CodeForge]${NC} $*" >&2; }

USE_POSTGRES=false
for arg in "$@"; do
  case "$arg" in
    --postgres) USE_POSTGRES=true ;;
  esac
done

# ── Check prerequisites ─────────────────────────────────────────────

log "Checking prerequisites..."

if ! command -v node &>/dev/null; then
  err "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  err "Node.js 18+ is required (found $(node -v))"
  exit 1
fi
log "Node.js $(node -v) ✓"

if [ "$USE_POSTGRES" = true ]; then
  if ! command -v docker &>/dev/null; then
    err "Docker is required for --postgres mode but was not found"
    err "Either install Docker or run without --postgres to use SQLite"
    exit 1
  fi
  log "Docker $(docker --version | awk '{print $3}' | tr -d ',') ✓"
fi

# ── Install dependencies ────────────────────────────────────────────

log "Installing dependencies..."
npm install 2>&1 | tail -3
log "Dependencies installed ✓"

# ── Set up environment variables ────────────────────────────────────

if [ ! -f .env ]; then
  log "Creating .env file..."
  cp .env.example .env

  # Generate a random secret for NextAuth
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/your-secret-here-change-in-production/$SECRET/" .env
  else
    sed -i "s/your-secret-here-change-in-production/$SECRET/" .env
  fi

  log ".env created ✓"
else
  log ".env already exists ✓"
fi

# ── Start database services (PostgreSQL mode only) ──────────────────

if [ "$USE_POSTGRES" = true ]; then
  log "Starting PostgreSQL and Redis via Docker Compose..."
  docker compose up -d postgres redis 2>&1 | tail -5

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
else
  log "Using SQLite — no external services needed"
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

DB_MODE="SQLite"
if [ "$USE_POSTGRES" = true ]; then
  DB_MODE="PostgreSQL + Redis"
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}║   ${GREEN}CodeForge is ready!${CYAN}                            ║${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}║   ${NC}Database:  ${GREEN}${DB_MODE}$(printf '%*s' $((25 - ${#DB_MODE})) '')${CYAN}║${NC}"
echo -e "${CYAN}║   ${NC}Server:   ${GREEN}http://localhost:3000${CYAN}              ║${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}║   ${NC}Press ${YELLOW}Ctrl+C${NC} to stop${CYAN}                           ║${NC}"
echo -e "${CYAN}║                                                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

exec npm run dev

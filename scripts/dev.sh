#!/usr/bin/env bash
# ===========================================================================
# SRE Command Center — Full-Stack Development Runner
#
# Starts both the Express 5 Backend API Server and the React 19 Frontend Dashboard
# in parallel with unified logging, graceful cleanup on Ctrl+C, and automatic
# origin configuration.
#
# Usage:
#   ./scripts/dev.sh                  Start both backend and frontend
#   ./scripts/dev.sh --api-only       Start only the backend API server
#   ./scripts/dev.sh --ui-only        Start only the frontend dashboard
#
# Ports:
#   Backend API Server:    http://localhost:5000 (API_PORT)
#   Operator Dashboard:    http://localhost:5174 (UI_PORT)
#   PostgreSQL Database:   postgresql://test:test@localhost:5434/sre_demo
# ===========================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Colors & Formatting ───────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[⚠]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header(){ echo -e "\n${CYAN}${BOLD}━━━ $1 ━━━${NC}\n"; }

# ── Configuration Defaults ───────────────────────────────────────────────────
API_PORT="${API_PORT:-5000}"
UI_PORT="${UI_PORT:-5174}"
export DATABASE_URL="${DATABASE_URL:-postgresql://test:test@localhost:5434/sre_demo}"
export CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:${UI_PORT},http://localhost:5173,http://localhost:3000}"
export VITE_NODE_API_ORIGIN="${VITE_NODE_API_ORIGIN:-http://localhost:${API_PORT}}"
export VITE_NODE_WS_ORIGIN="${VITE_NODE_WS_ORIGIN:-http://localhost:${API_PORT}}"

# ── Pre-flight Checks ────────────────────────────────────────────────────────
command -v node >/dev/null 2>&1 || error "Node.js is required but not found in PATH."
command -v pnpm >/dev/null 2>&1 || error "pnpm is required but not found in PATH."

cd "$ROOT_DIR"

# ── Process Management & Cleanup ─────────────────────────────────────────────
PIDS=()

cleanup() {
    echo -e "\n${YELLOW}Shutting down Command Center services...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
    wait 2>/dev/null || true
    echo -e "${GREEN}All services stopped cleanly.${NC}"
}
trap cleanup EXIT SIGINT SIGTERM

# ── Mode Selection ───────────────────────────────────────────────────────────
MODE="${1:-all}"

header "SRE Command Center — Starting Up"
echo -e "  ${BOLD}Database:${NC}  ${DATABASE_URL}"
echo -e "  ${BOLD}API Port:${NC}  http://localhost:${API_PORT}"
echo -e "  ${BOLD}UI Port:${NC}   http://localhost:${UI_PORT}"
echo ""

case "$MODE" in
    --api-only)
        info "Starting Backend API Server..."
        PORT="$API_PORT" pnpm --filter @workspace/api-server run dev
        ;;
    --ui-only)
        info "Starting Operator Dashboard..."
        PORT="$UI_PORT" pnpm --filter @workspace/operator-dashboard run dev
        ;;
    all|--all|"")
        info "Starting Express 5 API Server (port ${API_PORT})..."
        PORT="$API_PORT" pnpm --filter @workspace/api-server run dev &
        PIDS+=($!)

        # Give API server a moment to start
        sleep 1

        info "Starting Operator Dashboard (port ${UI_PORT})..."
        PORT="$UI_PORT" pnpm --filter @workspace/operator-dashboard run dev &
        PIDS+=($!)

        header "Command Center Ready"
        echo -e "  🖥️  ${BOLD}Dashboard:${NC}   ${CYAN}http://localhost:${UI_PORT}${NC}"
        echo -e "  🔌 ${BOLD}REST API:${NC}    ${CYAN}http://localhost:${API_PORT}/api${NC}"
        echo -e "  📖 ${BOLD}Swagger Docs:${NC}${CYAN}http://localhost:${API_PORT}/docs${NC}"
        echo ""
        echo -e "  ${YELLOW}Press Ctrl+C to stop all services.${NC}\n"

        # Wait for child background processes
        wait
        ;;
    *)
        echo "Unknown option: $MODE"
        echo "Usage: ./scripts/dev.sh [--all | --api-only | --ui-only]"
        exit 1
        ;;
esac

#!/bin/bash

# ============================================================
#  AI Browser Extension Platform - Startup Script
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=3001
FRONTEND_PORT=3000
DB_NAME="ai_browser_extension"
DB_USER="postgres"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════════════╗"
echo "  ║     AI Browser Extension Platform                 ║"
echo "  ║     Research | Auto-fill | Summarizer | More      ║"
echo "  ╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Step 1: Clean up used ports ----
echo -e "${YELLOW}[1/6] Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${RED}Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "  ${GREEN}Port $port is free${NC}"
  fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ---- Step 2: Check PostgreSQL ----
echo -e "\n${YELLOW}[2/6] Checking PostgreSQL...${NC}"

if ! command -v psql &> /dev/null; then
  echo -e "  ${RED}PostgreSQL not found. Please install PostgreSQL first.${NC}"
  exit 1
fi

# Try to start PostgreSQL if not running
if ! pg_isready -q 2>/dev/null; then
  echo -e "  ${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || \
  brew services start postgresql 2>/dev/null || \
  pg_ctl -D /usr/local/var/postgres start 2>/dev/null || \
  pg_ctl -D /opt/homebrew/var/postgres start 2>/dev/null || \
  true
  sleep 2
fi

if pg_isready -q 2>/dev/null; then
  echo -e "  ${GREEN}PostgreSQL is running${NC}"
else
  echo -e "  ${RED}PostgreSQL is not running. Please start it manually.${NC}"
  exit 1
fi

# ---- Step 3: Create database ----
echo -e "\n${YELLOW}[3/6] Setting up database...${NC}"

# Create database if not exists
if psql -U $DB_USER -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo -e "  ${GREEN}Database '${DB_NAME}' already exists${NC}"
else
  echo -e "  ${BLUE}Creating database '${DB_NAME}'...${NC}"
  createdb -U $DB_USER $DB_NAME 2>/dev/null || psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
  echo -e "  ${GREEN}Database created${NC}"
fi

# ---- Step 4: Install dependencies ----
echo -e "\n${YELLOW}[4/6] Installing dependencies...${NC}"

cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
  echo -e "  ${BLUE}Installing backend dependencies...${NC}"
  npm install
else
  echo -e "  ${GREEN}Backend dependencies already installed${NC}"
fi

cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo -e "  ${BLUE}Installing frontend dependencies...${NC}"
  npm install
else
  echo -e "  ${GREEN}Frontend dependencies already installed${NC}"
fi

# ---- Step 5: Seed database ----
echo -e "\n${YELLOW}[5/6] Seeding database with sample data (15 items per feature)...${NC}"

cd "$PROJECT_DIR/backend"
node seeds/seed.js

# ---- Step 6: Start servers with hot reload ----
echo -e "\n${YELLOW}[6/6] Starting servers with hot reload...${NC}"

# Start backend with nodemon for code monitoring
cd "$PROJECT_DIR/backend"
echo -e "  ${BLUE}Starting backend on port ${BACKEND_PORT} (with nodemon)...${NC}"
npx nodemon server.js &
BACKEND_PID=$!

# Start frontend with React dev server (built-in hot reload)
cd "$PROJECT_DIR/frontend"
echo -e "  ${BLUE}Starting frontend on port ${FRONTEND_PORT} (with hot reload)...${NC}"
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!

# Wait a moment for servers to start
sleep 3

echo -e "\n${GREEN}"
echo "  ╔═══════════════════════════════════════════════════╗"
echo "  ║  All systems running!                             ║"
echo "  ║                                                   ║"
echo "  ║  Frontend:  http://localhost:${FRONTEND_PORT}              ║"
echo "  ║  Backend:   http://localhost:${BACKEND_PORT}/api           ║"
echo "  ║                                                   ║"
echo "  ║  Login Credentials:                               ║"
echo "  ║  Email: demo@aiextension.com                      ║"
echo "  ║  Password: password123                            ║"
echo "  ║  (or click 'Quick Login' button)                  ║"
echo "  ║                                                   ║"
echo "  ║  Hot reload enabled - changes auto-refresh!       ║"
echo "  ║  Press Ctrl+C to stop all servers                 ║"
echo "  ╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Handle shutdown
cleanup() {
  echo -e "\n${YELLOW}Shutting down servers...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  echo -e "${GREEN}All servers stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait

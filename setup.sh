#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HRMS Lite — Database & Backend Setup Script
# Usage: bash setup.sh YOUR_MYSQL_PASSWORD
# ═══════════════════════════════════════════════════════════

set -e

MYSQL_PASS=${1:-""}
DB_NAME="hrms"

if [ -z "$MYSQL_PASS" ]; then
    echo "Usage: bash setup.sh YOUR_MYSQL_PASSWORD"
    exit 1
fi

echo "▶ Creating MySQL database '${DB_NAME}'..."
mysql -u root -p"${MYSQL_PASS}" -e "
    CREATE DATABASE IF NOT EXISTS ${DB_NAME}
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
" && echo "  ✓ Database created."

echo "▶ Writing .env file..."
cat > backend/.env << EOF
DATABASE_URL=mysql+pymysql://root:${MYSQL_PASS}@localhost:3306/${DB_NAME}
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
APP_NAME=HRMS Lite
APP_VERSION=1.0.0
EOF
echo "  ✓ backend/.env written."

echo "▶ Running Alembic migrations..."
cd backend
python3 -m alembic upgrade head
cd ..
echo "  ✓ Migrations applied."

echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Setup complete!"
echo ""
echo "  To start the backend:"
echo "  cd backend && uvicorn app.main:app --reload --port 8000"
echo ""
echo "  To start the frontend:"
echo "  cd frontend && npm run dev"
echo "══════════════════════════════════════════"

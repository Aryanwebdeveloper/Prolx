#!/bin/bash
# ─────────────────────────────────────────────
# Prolx Production Deploy Script
# Run this on the server to build & restart
# Usage: bash deploy.sh
# ─────────────────────────────────────────────

set -e

echo "📦 Installing dependencies..."
npm install --frozen-lockfile

echo "🏗️  Building Next.js (production)..."
node --max-old-space-size=2048 node_modules/next/dist/bin/next build --webpack

echo "🚀 Reloading PM2..."
# If PM2 is already running:
pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js

echo "✅ Done! App running in production mode."
echo "   No more HMR WebSocket errors. Dashboard data will load correctly."

#!/usr/bin/env bash
# =====================================================================
# Quick Runner for Retro Vintage Quiz Arcade
# =====================================================================

set -e

echo "🕹️  Starting Retro Vintage Quiz Arcade..."
echo "🎨  Theme: 80s/90s Retro Vintage (#934761, #AD5C71, #72BAA9, #D5E7B5)"
echo "🗄️   Database: Microsoft SQL Server (with resilient offline hybrid fallback)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Launching development server on http://localhost:3000 ..."
npm run dev

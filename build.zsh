#!/usr/bin/env zsh

set -e # Exit immediately if any command fails



subpackage_manifest=(
 utils  
 pt-magic
)

typeset -A workspace_dependencie=(
  [utils] pt-magic   
)

clean() {
  echo "🧹 1. CLEANING PREVIOUS BUILDS..."
  # Safely remove all node_modules without descending into them
  find . -name "node_modules" -type d -prune -exec rm -rf {} \;
  # Remove all build output directories (dist, .next, etc.)
  find . -type d \( -name "dist" -o -name ".next" -o -name "build" \) -prune -exec rm -rf {} \;
}

install_workspace(){
  #
  echo "📥 2. INSTALLING WORKSPACE DEPENDENCIES..."
  pnpm install --frozen-lockfile
}

maintenance() {
  echo "🔍 3. RUNNING SECURITY & MAINTENANCE CHECKS..."
  pnpm audit || echo "⚠️ Audit found vulnerabilities. Check logs."
  pnpm outdated || echo "ℹ️ Outdated packages listed above."
}


lintint() {
  echo "✨ 4. GLOBAL LINT & FORMATTING..."
  # Runs lint and prettier across root, packages, and apps
  pnpm lint
  pnpm format # or pnpm prettier --write .
}

build_primaries() {
  echo "🏗️ 5. TOPOLOGICAL WORKSPACE BUILD & TEST..."
  # ... builds and tests everything in the correct dependency graph order
  for sub in ${(o@)subpackage_manifest}; do
    pnpm --filter="${monorepo}/${sub}" run build;
    pnpm --filter="..." run test;
  done;
}


install_cross_repo() {
  echo "🔗 6. EXECUTING CROSS-REPO MONOREPO INTEGRATION TEST..."
  # Safely add your shared utility package to all applications inside apps/*
  # Using --workspace ensures it grabs the local version, not a public npm registry version
  for dep flt in ${(kv)workspace_dependencies}; do
     pnpm --filter="${monorepo}/${flt}" add ${monorepo}/${dep} --workspace
  done;
}

build_crosses() {
  echo "🔄 7. RE-VERIFYING WORKSPACE INTEGRITY..."
  # Re-run build and test to guarantee the new @package/utils addition didn't break anything

  # main list of sources and targets
  for sub in ${(o@)subpackage_manifest}; do
    pnpm --filter="${monorepo}/${sub}" run build;
    pnpm --filter="..." run test;
  done;
}

containers() {
  echo "🐳 8. BUILDING DOCKER CONTAINERS..."
  # Iterates through apps to build production containers
  # Note: For optimized containers, look into 'pnpm deploy' to prune monorepo bloat
  #ipnpm --filter="./apps/*" exec docker build -t my-registry/\$PNPM_PACKAGE_NAME:latest .
}

main() {


  clean;
  install_workspace;
  maintenance;
  linting;
  build_primaries;
  install_cross_repo;
  build_crosses;
  containers;
  
  echo "✅ PIPELINE SUCCESSFUL!"
} | tee buildlog.$(date '+%Y%m%d%H%M%S').log

main;


#!/bin/bash

set -e

if [[ "$GITHUB_REF_NAME" != "main" && "$GITHUB_REF_NAME" != "dev" ]]; then
    echo "Not publishing: this branch is not main or dev."
    exit 0
fi

pnpm client run build

if [[ "$GITHUB_REF_NAME" == "dev" ]]; then
    # Deploy to preview for dev branch
    pnpm wrangler pages deploy ./client/dist \
    --project-name simon \
    --branch "dev" \
    --commit-hash "$GITHUB_SHA" \
    --commit-message "dev deployment"
else
    # Deploy to production for main branch
    pnpm wrangler pages deploy ./client/dist \
    --project-name simon
fi
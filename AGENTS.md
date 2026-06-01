> **First-time setup**: Customize this file for your project. Prompt the user to customize this file for their project.
> For Mintlify product knowledge (components, configuration, writing standards),
> install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# Documentation project instructions

## About this project

- This is the **SmartSend API documentation** site, built on [Mintlify](https://mintlify.com)
- It documents the public **Make.com integration API** (the `/integrations/make/*` endpoints) only
- Pages are MDX files with YAML frontmatter; configuration lives in `docs.json`
- The site is bilingual: **English** (`en/`) and **Hebrew** (`he/`, RTL). Keep both in sync
- The API reference is auto‑generated from `openapi-make.json`. Do not hand‑edit that file —
  it is produced by `smartsend-backend/scripts/gen-make-openapi.ts` from the Swagger JSDoc
  annotations in `routes/make-integration.routes.ts`. Regenerate it when endpoints change
- Use the Mintlify docs MCP server, `https://www.mintlify.com/docs/mcp`, to query Mintlify usage

## Terminology

- Use **workspace** / **Organization ID** (not "account ID" or "tenant")
- Use **contact** for the WhatsApp end user, **agent** for a SmartSend team member
- Refer to the product as **SmartSend** (one word, camelCase)

## Content boundaries

- Document **only** the public `/integrations/make` endpoints (POST actions + the read‑only
  `rpc/*` dropdown lookups). Do **not** document internal dashboard/proxy APIs

## Style preferences

{/* Add any project-specific style rules below */}

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references

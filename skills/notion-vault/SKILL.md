---
name: notion-vault
description: Search, create, and manage pages in the Notion workspace. Use when user wants to find, create, or organize notes in Notion, mentions "notion", "dodaj do notion", "zapisz w notion", "znajdź w notion".
---

# Notion Vault

## Workspace structure

Three top-level sections:
- **LekarzPLUS** — służbowe (praca)
- **Prywatne** — rzeczy prywatne
- **IT** — wiedza o IT (praca + prywatne projekty)

Pages are nested under these sections as subpages.

## MCP tools available

Use the Notion MCP server tools (loaded via `@notionhq/notion-mcp-server`):
- `notion_search` — search pages and databases by query
- `notion_retrieve_page` — get full page content by ID
- `notion_create_page` — create a new page
- `notion_append_block_children` — add content blocks to a page
- `notion_retrieve_block_children` — list child blocks of a page

## Workflows

### Search for a page

1. Call `notion_search` with the user's keyword
2. Present results with title + URL
3. If user wants content, call `notion_retrieve_block_children` with the page ID

### Create a new page

1. Ask which section it belongs to: LekarzPLUS / Prywatne / IT
2. Call `notion_search` to find the parent section page ID (search by section name)
3. Call `notion_create_page` with:
   - `parent.page_id` = ID of the section page
   - `properties.title` = page title
4. Add content via `notion_append_block_children`

### Add content to existing page

1. Find page with `notion_search`
2. Append blocks with `notion_append_block_children`

## Content formatting

Notion blocks use type + content structure. Common types:
- `paragraph` — plain text
- `heading_1` / `heading_2` / `heading_3` — headers
- `bulleted_list_item` — bullet point
- `numbered_list_item` — numbered list
- `code` — code block (specify `language`)
- `divider` — horizontal rule

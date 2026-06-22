# CLAUDE.md

## Project Overview

This is an e-commerce platform built with:

- Next.js App Router
- TypeScript
- Supabase PostgreSQL
- Redis caching
- Tailwind CSS

## Coding Rules

- Always use TypeScript.
- Avoid using any.
- Prefer Server Components.
- Use Next.js Image component for images.
- Store image URLs, not Base64 images.
- Use Redis for caching expensive queries.

## Folder Structure

app/ -> Routes
components/ -> Reusable UI
lib/ -> Utilities
actions/ -> Server actions
types/ -> Type definitions

## Performance Rules

- Optimize images.
- Use Cloudinary for image hosting.
- Cache homepage queries.
- Minimize client-side fetching.
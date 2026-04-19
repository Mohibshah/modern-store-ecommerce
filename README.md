# Trendify Ecommerce (React + Vite)

A modern ecommerce frontend built with React, Vite, React Router, Zustand, and Framer Motion.

## Features

- Home page with hero, categories, announcements, and featured carousel.
- Shop page with category filter, search query support, sorting, and grid/list views.
- Product detail with image gallery, variant selection, wishlist toggle, and local reviews.
- Cart sidebar with quantity controls and subtotal calculations.
- Multi-step checkout flow and order confirmation page.
- Dark mode with persistence.
- Lazy-loaded routes and image loading optimizations.

## Tech Stack

- React 19
- Vite
- React Router
- Zustand
- Framer Motion
- React Hook Form + Zod

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Create a production build

```bash
npm run build
```

### 4. Preview production build locally

```bash
npm run preview
```

## Scripts

- `npm run dev`: Start local dev server.
- `npm run build`: Build production assets.
- `npm run preview`: Preview the production build.
- `npm run lint`: Run ESLint.

## Project Structure

```text
src/
  components/
  pages/
  store/
  Hooks/
  data/
```

## Route Summary

- `/` Home
- `/shop` Product listing (supports query params: `category`, `query`, `sort`, `mode`, `view`)
- `/product/:id` Product detail
- `/checkout` Checkout flow
- `/order-confirmation/:orderId` Order confirmation
- `/dashboard` User dashboard

## Deployment

This app is static-build friendly and can be deployed to Netlify, Vercel, or similar hosting.

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`

### Vercel

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

## Notes

- Product and review persistence currently use local storage and in-project mock data.
- Theme preference is persisted across sessions.

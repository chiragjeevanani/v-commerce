# V-Commerce

Welcome to the V-Commerce monorepo.

## Project Structure

- `frontend/`: The main React + Vite application.
- `package.json`: Root package file for Vercel deployment and task management.
- `vercel.json`: Root Vercel configuration for subfolder build.

## Quick Start

To run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

Or from the root:

```bash
npm run dev
```

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com). The root configuration automatically handles building the `frontend` subfolder.

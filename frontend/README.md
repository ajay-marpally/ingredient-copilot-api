# Ingredient Pal Frontend

A React frontend for the Ingredient Copilot API.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The app will be available at http://localhost:3000

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Header.jsx
│   ├── BottomNav.jsx
│   ├── LoadingSpinner.jsx
│   ├── ErrorMessage.jsx
│   ├── IngredientCard.jsx
│   ├── AIGuide.jsx
│   ├── TextInputModal.jsx
│   └── ImageUpload.jsx
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── AnalysisPage.jsx
│   └── SummaryPage.jsx
├── services/           # API services
│   └── api.js
├── context/            # React context providers
│   └── AnalysisContext.jsx
├── App.jsx             # Main app with routing
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Features

- 📸 Take photos of ingredient labels
- 📝 Paste ingredient text
- 🧪 Use sample products
- 🤖 AI-powered ingredient analysis
- 🎨 Beautiful hand-drawn UI style

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000
```

## Building for Production

```bash
npm run build
```

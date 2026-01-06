# FinCopilot - AI Financial Assistant

FinCopilot is a powerful, full-stack financial analysis assistant built with **React**, **Node.js**, **LangChain**, and **PostgreSQL**. It provides users with real-time financial insights, stock analysis, and economic concept explanations through an intuitive chat interface.

## 🚀 Key Features

- **Intelligent Financial Chat**: Powered by OpenAI's GPT-3.5-Turbo for accurate financial advice and analysis.
- **Semantic Caching**: Utilizes `pgvector` for semantic similarity matching, delivering instant responses to common questions while reducing API costs.
- **Persistent Memory**: Remembers past conversations with a sliding-window history to maintain context without overloading the model.
- **Guest vs. Pro Mode**: Supports anonymous guest sessions with limits, and full "Pro" features for logged-in users via **Supabase Auth**.
- **History Linking**: Automatically syncs guest chat history to a user account upon login/signup.

## 🛠️ Tech Stack

- **Frontend**: React (v19), Vite, CSS3 (Vanilla), Supabase Client.
- **Backend**: Express, LangChain, Node.js.
- **Database**: PostgreSQL with `pgvector` extension.
- **LLM Layer**: OpenAI API.

## 📦 Project Structure

```text
FinCopilot/
├── frontend/        # React application (Vite-powered)
├── backend/         # Express server & LangChain logic
├── database/        # Scaffolding for migrations & schemas
└── middleware/      # Scaffolding for future logic
```

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL with `pgvector` installed.
- Supabase Project (for Auth).
- OpenAI API Key.

### 2. Backend Setup
1. Navigate to `/backend`.
2. Install dependencies: `npm install`.
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   DATABASE_URL=your_postgresql_url
   OPENAI_API_KEY=your_openai_key
   CACHE_ENABLED=true
   CACHE_SIMILARITY_THRESHOLD=0.95
   ```
4. Run the server: `npm run dev`.

### 3. Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   VITE_API_BASE_URL=http://localhost:3000
   ```
4. Run the development server: `npm run dev`.

## 🤝 Contributing

This project is in active development. Feature requests and bug reports are welcome via Issues!

## 📄 License

ISC License.

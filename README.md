# 🧠 MindStack Frontend (Web Interface)

MindStack is an advanced, multimodal context engine that captures your web research, video learning, and IDE development sessions, making them instantly queryable via an intelligent AI assistant. 

This repository contains the **Next.js Web Interface** for MindStack. It is the central hub where you can view your captured knowledge, manage projects, and interact with the AI assistant through a rich, multimodal chat interface.

---

## 🌟 The MindStack Ecosystem

MindStack consists of four core components working together to build your personal knowledge graph. This repository is part 1 of 4:

1. **[This Repo] Web Interface (Frontend)** – The Next.js dashboard and chat UI.
2. **[Backend API Repository](#link-to-backend-repo)** – The Next.js App Router providing RAG, Vector Search, and AWS Bedrock integration.
3. **[Browser Ghost Extension](#link-to-browser-extension-repo)** – The Chrome extension that silently captures your web pages, videos, and research.
4. **[Editor Ghost Extension](#link-to-ide-extension-repo)** – The VS Code extension that captures your code states, bug fixes, and development progress.

---

## 🚀 Key Features of the Web Interface

- **Project Hub:** Organize your captures into distinct projects (e.g., "React Migration" or "Math Studies").
- **Rich Capture Cards:** View visual cards for `WEB_TEXT`, `USER_NOTE`, `IDE_BUG_FIX`, and `VIDEO_SEGMENT` captures natively in the dashboard.
- **Multimodal Chat Interface:** Chat with the AI about your captured context. The frontend natively supports parsing Server-Sent Events (SSE) to render text, syntax-highlighted code blocks, and embedded images/diagrams seamlessly in the chat flow.
- **Optimized Content Rendering:** Uses custom `react-markdown` components to render markdown, diffs, and image attachments beautifully within the application theme.
- **Authentication:** Native Supabase Auth integration for secure, per-user project isolation.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Inline styled-components
- **Authentication:** [Supabase](https://supabase.com/)
- **Markdown & Code Rendering:** `react-markdown` + `react-syntax-highlighter`
- **Streaming:** Server-Sent Events (SSE) parsing for real-time LLM responses

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- A Supabase account (for authentication)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/mindstack-webinterface.git
cd mindstack-webinterface
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Variables
Copy the `.env.local.example` file to create your own localized environment configuration:
```bash
cp .env.local.example .env.local
```
Fill in the following variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# The backend API URL. Defaults to localhost for development.
NEXT_PUBLIC_API_URL=http://localhost:3000 
```
*(Note: If you are running the backend repository locally, `NEXT_PUBLIC_API_URL` should point to the port where the backend is running, usually 3000 or 3001).*

### 4. Run the Development Server
```bash
npm run dev
# or 
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Project Structure

```text
├── app/
│   ├── (auth)/             # Login and authentication routes
│   ├── dashboard/          # Hub for creating and viewing projects
│   │   ├── layout.tsx      # Dashboard layout including Ghost Modal
│   │   └── projects/       # Detailed project view
│   │       └── [id]/       # Chat interface and capture list for a specific project
│   ├── globals.css         # Global styles and Tailwind directives
│   └── layout.tsx          # Root Next.js layout
├── components/             # Reusable UI components
├── lib/
│   ├── supabase.ts         # Supabase client initialization
│   └── constants.ts        # Global configuration constants
├── public/                 # Static assets (including the downloaded ghost extension)
```

---

## 🧩 Usage Instructions
1. **Sign Up / Log In**: Use the `/login` route to create an account via Supabase.
2. **Dashboard**: Create a new project. 
3. **Install the Ghost**: Click "🌐 Browser Assistant" in the header to download and sideload the Chrome extension.
4. **Chat**: Navigate into a project and start querying your context. Ensure the backend RAG pipeline is actively running so the AI can retrieve and stream responses.

---

## 🔗 Related Repositories

- ⚙️ **Backend Repository:** [Insert Link to Backend Repo Here](#)
- 🖥️ **VS Code Editor Extension:** [Insert Link to IDE Extension Repo Here](#)
- 🌐 **Chrome Browser Extension:** [Insert Link to Browser Extension Repo Here](#) 

---

*Built for Next-Gen Developer Productivity.*

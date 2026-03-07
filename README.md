Here is the updated README with comprehensive sections for setting up both the Database (Supabase + pgvector) and AWS (S3 + Bedrock). I added these under a new **Infrastructure Setup** section so anyone deploying the full ecosystem knows exactly what is required behind the scenes.

---

# 🧠 MindStack Frontend (Web Interface)

MindStack is an advanced, multimodal context engine that captures your web research, video learning, and IDE development sessions. It operates as a personal **Second Brain** for your private workflows, and scales into a collaborative **Hive Brain** to unify isolated team workflows into a shared, instantly searchable intelligence.

This repository contains the **Next.js Web Interface** for MindStack. It is the central command hub where you can view your captured knowledge, manage private projects or team workspaces, and interact with the AI assistant through a rich, multimodal chat interface.

---

## 🌟 The MindStack Ecosystem

MindStack consists of four core components working together to build your personal knowledge graph and shared team memory. This repository is part 1 of 4:

1. **[This Repo] Web Interface (Frontend)** – The Next.js dashboard, telemetry UI, and dual-routing chat interface.
2. **[Backend API Repository](https://github.com/lovepop1/MindStack)** – The Next.js App Router providing RAG, Vector Search, and AWS Bedrock/S3 integration.
3. **[Browser Ghost Extension](https://github.com/Nikhilesh611/mindstack-extension)** – The Chrome extension that silently captures your web pages, videos, and document uploads.
4. **[Editor Ghost Extension](https://github.com/Ullas-0-1/MindStack-IDE-Integration)** – The VS Code extension that captures your code states, active bug fixes, and development progress.

---

## 🚀 Key Features of the Web Interface

* **Dual-Routing (Second Brain & Hive Brain):** Seamlessly organize captures into private "Personal Projects" or collaborative "Team Workspaces".
* **The Hive Brain & Attribution Engine:** In team workspaces, the UI mathematically ties every data chunk to its author, displaying clear `👤 Author Name` badges. You can ask the AI about a teammate's uncommitted code fix from an hour ago and get an instant, attributed answer.
* **Rich Telemetry Dashboards:** Visual capture cards go far beyond standard text. The UI renders dynamic visual dashboards for `WEB_TEXT`, `USER_NOTE`, `VIDEO_SEGMENT` (with formatted timestamps), and advanced `IDE` captures.
* **Granular Code Diffing:** IDE captures natively render syntax-highlighted code changes, intelligently splitting them into Initial Error Diffs, Resolution Git Diffs, and Uncommitted Local Fixes.
* **Multimodal Chat Interface:** Chat with Claude 4.6 Sonnet about your captured context. The frontend parses Server-Sent Events (SSE) to stream text in real-time, complete with clickable source citation pills pointing directly to the exact PDF, video, or code snippet used for the answer.
* **Authentication:** Native Supabase Auth integration for secure, per-user isolation and team workspace access control.

---

## 🛠 Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + Inline styled-components
* **Authentication & Database:** [Supabase](https://supabase.com/) (PostgreSQL + pgvector)
* **AWS Infrastructure:** S3 (Blob Storage), Amazon Bedrock (Claude & Titan models)
* **Markdown & Code Rendering:** `react-markdown` + `react-syntax-highlighter`
* **Streaming:** Server-Sent Events (SSE) parsing for real-time AI responses

---

## 💻 Getting Started (Frontend)

### Prerequisites

* Node.js (v18 or higher)
* npm or pnpm
* A Supabase account (for authentication)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/mindstack-webinterface.git
cd mindstack-webinterface

```

### 2. Install dependencies

```bash
npm install

```

### 3. Environment Variables

Copy the `.env.local.example` file:

```bash
cp .env.local.example .env.local

```

Fill in the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# The backend API URL. Defaults to localhost for development.
NEXT_PUBLIC_API_URL=http://localhost:3000 

```

### 4. Run the Development Server

```bash
npm run dev

```

---

## 🏗️ Infrastructure Setup (Database & AWS)

If you are deploying the full MindStack ecosystem (including the backend API), you will need to configure Supabase and AWS.

### 1. Database Setup (Supabase & pgvector)

MindStack relies on a relational PostgreSQL database with the `pgvector` extension enabled to store and query AI embeddings.

1. **Enable pgvector:** Go to your Supabase project dashboard → Database → Extensions, and enable `vector`.
2. **Core Tables Required:**
* `users`: Managed natively by Supabase Auth.
* `projects` / `workspaces`: For data routing and isolation.
* `workspace_members`: To handle the Team Hive Brain attribution.
* `captures`: Stores the high-level metadata, URLs, JSON telemetry (`snapshot_metadata`), and markdown summaries.
* `debug_episodes` & `bug_knowledge_base`: Stores stateful IDE telemetry and global bug resolution data.
* `capture_chunks`: This is your vector store. Must be created with a vector column matching Amazon Titan's output dimensions:
```sql
CREATE TABLE capture_chunks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    capture_id uuid REFERENCES captures(id) ON DELETE CASCADE,
    chunk_text text,
    embedding vector(1024), -- Amazon Titan v2 outputs 1024 dimensions
    chunk_index integer
);

```




3. **RPC Function for Vector Search:** You will need to create a Postgres function (e.g., `match_capture_chunks`) to perform cosine similarity searches against the `embedding` column for the RAG pipeline.

### 2. AWS Setup (Bedrock & S3)

**Amazon Bedrock (The AI Engine):**
MindStack uses Bedrock for embedding generation, telemetry translation, and core chat functionality.

1. Navigate to the AWS Bedrock Console.
2. Under "Model Access", you must explicitly request access to:
* **Amazon Titan Text Embeddings V2** (Used to chunk and embed all captures).
* **Anthropic Claude 3 Haiku / 4.5 Haiku** (Used as a fast background agent to translate unreadable IDE logs into plain English).
* **Anthropic Claude 3.5 Sonnet / 4.6 Sonnet** (The core reasoning engine powering the Multimodal Chat Interface).


3. Ensure your IAM User has the `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream` permissions.

**Amazon S3 (Blob Storage):**
Used to bypass server limits for heavy uploads (PDFs, Images, Video Keyframes).

1. Create a private S3 Bucket.
2. **Configure CORS:** Your bucket must allow `PUT` requests from your frontend domains so the browser extension and web UI can upload directly via pre-signed URLs.
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
        "ExposeHeaders": []
    }
]

```


3. Ensure your backend API's AWS credentials have `s3:PutObject` permissions to generate the pre-signed URLs.

---

## 📂 Project Structure

```text
├── app/
│   ├── (auth)/             # Login and authentication routes
│   ├── dashboard/          # Hub for creating and viewing projects/workspaces
│   │   ├── layout.tsx      # Dashboard layout including Ghost Modal
│   │   ├── projects/       # Private Second Brain views
│   │   │   └── [id]/       # Chat interface and personal timeline
│   │   └── workspaces/     # Shared Hive Brain team views
│   │       └── [id]/       # Collaborative chat and shared timeline
│   ├── globals.css         # Global styles and Tailwind directives
│   └── layout.tsx          # Root Next.js layout
├── components/             # Reusable UI components (StatPills, CaptureCards)
├── lib/
│   ├── supabase.ts         # Supabase client initialization
│   └── constants.ts        # Global configuration constants

```

---

## 🧩 Usage Instructions

1. **Sign Up / Log In**: Use the `/login` route to create an account via Supabase.
2. **Dashboard**: Create a new Personal Project or a shared Team Workspace.
3. **Install the Ghost**: Click "🌐 Browser Assistant" in the header to download and sideload the Chrome extension. Ensure your IDE extension is also authenticated.
4. **Chat**: Navigate into a project or workspace and start querying your context. Ensure the backend RAG pipeline is actively running so the AI can retrieve and stream responses.

---

*Built for Next-Gen Developer Productivity & Collaborative Intelligence.*
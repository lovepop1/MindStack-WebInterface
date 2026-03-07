-- ========================================================================================
-- MINDSTACK DATABASE SETUP SCRIPT (SUPABASE)
-- ========================================================================================

-- 1. Enable pgvector for AWS Titan Embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ========================================================================================
-- CORE ROUTING & AUTHENTICATION TABLES
-- ========================================================================================

-- Projects (Personal "Second Brain" routing)
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Workspaces (Team "Hive Brain" routing)
CREATE TABLE workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Workspace Members (Attribution Engine mapping)
CREATE TABLE workspace_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text NOT NULL, -- 🚨 Drives the '👤 Author' UI badge
    role text DEFAULT 'member',
    created_at timestamptz DEFAULT now(),
    UNIQUE(workspace_id, user_id)
);

-- ========================================================================================
-- INGESTION & TELEMETRY TABLES
-- ========================================================================================

-- Captures (The main multi-modal timeline)
CREATE TABLE captures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    author_display_name text,
    
    -- High Level Metadata
    capture_type text NOT NULL, 
    source_url text,
    page_title text,
    priority integer DEFAULT 0,
    
    -- Content & Summaries
    text_content text,
    ai_markdown_summary text, -- 🚨 Populated asynchronously by Claude Haiku
    
    -- Media Specific
    video_start_time numeric,
    video_end_time numeric,
    
    -- IDE Specific
    ide_error_log text,
    ide_code_diff text,
    ide_file_path text,
    
    -- Rich Telemetry Payload (Lines added, modules, arrays, local diffs)
    snapshot_metadata jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamptz DEFAULT now()
);

-- Capture Attachments (S3 Media mapping)
CREATE TABLE capture_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    capture_id uuid REFERENCES captures(id) ON DELETE CASCADE,
    s3_url text NOT NULL,
    file_type text NOT NULL,
    file_name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Debug Episodes (Stateful bug hunt tracker)
CREATE TABLE debug_episodes (
    episode_id text PRIMARY KEY,
    session_id text,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    status text DEFAULT 'DEBUGGING',
    initial_command text,
    initial_error_message text,
    initial_stacktrace text,
    actions_log jsonb DEFAULT '[]'::jsonb, -- Array of keystrokes/saves
    timestamp_start timestamptz DEFAULT now(),
    timestamp_end timestamptz
);

-- Bug Knowledge Base (Global team memory for resolved issues)
CREATE TABLE bug_knowledge_base (
    fingerprint text PRIMARY KEY,
    resolution_command text,
    git_diff_fix text,
    local_diff_fix text,
    files_changed jsonb,
    created_at timestamptz DEFAULT now()
);

-- ========================================================================================
-- VECTOR STORAGE (AWS TITAN CHUNKS)
-- ========================================================================================

-- Capture Chunks (The actual RAG semantic database)
CREATE TABLE capture_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    capture_id uuid REFERENCES captures(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    chunk_text text NOT NULL,
    
    -- 🚨 Amazon Titan Text v2 outputs exactly 1024 dimensions
    embedding vector(1024), 
    
    chunk_index integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- HNSW Index for ultra-fast Vector Search over millions of rows
CREATE INDEX ON capture_chunks USING hnsw (embedding vector_cosine_ops);


-- ========================================================================================
-- REQUIRED RPC FUNCTIONS (Called by Next.js Backend)
-- ========================================================================================

-- 1. Append Debug Action: Allows backend to safely append JSON to the actions_log array
CREATE OR REPLACE FUNCTION append_debug_action(
    p_episode_id text,
    p_new_actions jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE debug_episodes
    -- Concatenates the new JSON array onto the existing one
    SET actions_log = COALESCE(actions_log, '[]'::jsonb) || p_new_actions
    WHERE episode_id = p_episode_id;
END;
$$;

-- 2. Match Capture Chunks: Performs the Cosine Similarity search for the RAG LLM Chat
CREATE OR REPLACE FUNCTION match_capture_chunks (
    query_embedding vector(1024),
    match_threshold float,
    match_count int,
    p_project_id uuid DEFAULT NULL,
    p_workspace_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    capture_id uuid,
    chunk_text text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc.id,
        cc.capture_id,
        cc.chunk_text,
        1 - (cc.embedding <=> query_embedding) AS similarity
    FROM capture_chunks cc
    WHERE 
        -- Must exceed similarity threshold
        1 - (cc.embedding <=> query_embedding) > match_threshold
        -- Strict routing: MUST match the active project OR workspace
        AND (
            (p_project_id IS NOT NULL AND cc.project_id = p_project_id) OR
            (p_workspace_id IS NOT NULL AND cc.workspace_id = p_workspace_id)
        )
    ORDER BY cc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
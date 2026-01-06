-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create question cache table
CREATE TABLE IF NOT EXISTS question_cache (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hit_count INTEGER DEFAULT 0
);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS question_cache_embedding_idx 
ON question_cache USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add comment
COMMENT ON TABLE question_cache IS 'Caches chatbot responses with semantic embeddings for similarity matching';

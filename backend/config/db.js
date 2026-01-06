import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize Database Table
const initDB = async () => {
    console.log("🔄 Attempting to connect to PostgreSQL...");
    try {
        const client = await pool.connect();
        console.log("✅ PostgreSQL Connection Successful!");

        await client.query(`
            CREATE EXTENSION IF NOT EXISTS vector;

            CREATE TABLE IF NOT EXISTS chat_history (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) NOT NULL,
                user_id UUID,
                type VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_session_id ON chat_history(session_id);
            CREATE INDEX IF NOT EXISTS idx_user_id ON chat_history(user_id);

            CREATE TABLE IF NOT EXISTS question_cache (
                id SERIAL PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                embedding vector(1536),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                hit_count INTEGER DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_question_cache_embedding ON question_cache USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
        `);
        console.log("✅ PostgreSQL Table 'chat_history' ready.");
        client.release();
    } catch (err) {
        console.error("❌ Database Error:", err.message);
        console.error("Full error:", err);
    }
};

export { pool, initDB };

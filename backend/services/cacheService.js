import { pool } from "../config/db.js";

/**
 * Find a similar cached question using cosine similarity
 * @param {number[]} embedding - The embedding vector to search for
 * @param {number} threshold - Similarity threshold (default 0.90)
 * @returns {Promise<Object|null>} - Cached question/answer or null
 */
export const findSimilarQuestion = async (embedding, threshold = 0.90) => {
    try {
        const embeddingString = `[${embedding.join(',')}]`;

        // Query to find the closest match regardless of threshold
        const query = `
            SELECT id, question, answer, 
                   1 - (embedding <=> $1::vector) as similarity
            FROM question_cache
            ORDER BY embedding <=> $1::vector
            LIMIT 1
        `;

        const result = await pool.query(query, [embeddingString]);

        if (result.rows.length > 0) {
            const closest = result.rows[0];
            if (closest.similarity > threshold) {
                console.log(`✅ Cache HIT: "${closest.question}" (similarity: ${closest.similarity.toFixed(3)})`);
                return closest;
            } else {
                console.log(`❌ Cache MISS: Closest match was "${closest.question}" (similarity: ${closest.similarity.toFixed(3)}), which is below threshold ${threshold}`);
            }
        } else {
            console.log("❌ Cache MISS: Cache is empty");
        }
        return null;
    } catch (error) {
        console.error("Error finding similar question:", error);
        return null;
    }
};

/**
 * Cache a new question/answer pair with its embedding
 * @param {string} question - The question text
 * @param {string} answer - The answer text
 * @param {number[]} embedding - The embedding vector
 */
export const cacheResponse = async (question, answer, embedding) => {
    try {
        const embeddingString = `[${embedding.join(',')}]`;

        const query = `
            INSERT INTO question_cache (question, answer, embedding)
            VALUES ($1, $2, $3::vector)
            RETURNING id
        `;

        const result = await pool.query(query, [question, answer, embeddingString]);
        console.log(`💾 Cached new response (ID: ${result.rows[0].id})`);
    } catch (error) {
        console.error("Error caching response:", error);
    }
};

/**
 * Increment the hit count for a cached question
 * @param {number} id - The cache entry ID
 */
export const incrementHitCount = async (id) => {
    try {
        await pool.query(
            'UPDATE question_cache SET hit_count = hit_count + 1 WHERE id = $1',
            [id]
        );
    } catch (error) {
        console.error("Error incrementing hit count:", error);
    }
};

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache stats
 */
export const getCacheStats = async () => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_cached,
                SUM(hit_count) as total_hits,
                AVG(hit_count) as avg_hits_per_question
            FROM question_cache
        `);

        return result.rows[0];
    } catch (error) {
        console.error("Error getting cache stats:", error);
        return null;
    }
};

import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { pool } from "../config/db.js";

// Save message to PostgreSQL
const saveMessageToDB = async (sessionId, message, userId = null) => {
    try {
        const type = message._getType() === 'human' ? 'human' : 'ai';
        const content = message.content;

        await pool.query(
            "INSERT INTO chat_history (session_id, type, content, user_id) VALUES ($1, $2, $3, $4)",
            [sessionId, type, content, userId]
        );
    } catch (error) {
        console.error("Error saving message to DB:", error);
    }
};

// Retrieve history from PostgreSQL for LangChain
export const getSessionHistory = (sessionId, userId = null) => {
    return {
        getMessages: async () => {
            try {
                let query;
                let params;

                if (userId) {
                    query = "SELECT type, content FROM (SELECT type, content, timestamp FROM chat_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 15) sub ORDER BY timestamp ASC";
                    params = [userId];
                } else {
                    query = "SELECT type, content FROM (SELECT type, content, timestamp FROM chat_history WHERE session_id = $1 AND user_id IS NULL ORDER BY timestamp DESC LIMIT 15) sub ORDER BY timestamp ASC";
                    params = [sessionId];
                }

                const res = await pool.query(query, params);

                return res.rows.map(row => {
                    if (row.type === 'human') {
                        return new HumanMessage(row.content);
                    }
                    return new AIMessage(row.content);
                });
            } catch (error) {
                console.error("Error fetching messages:", error);
                return [];
            }
        },
        addMessage: async (msg) => {
            await saveMessageToDB(sessionId, msg, userId);
        }
    };
};

// Retrieve simple history object for Client/Frontend
export const getHistoryForClient = async (sessionId, userId = null) => {
    try {
        let query;
        let params;

        if (userId) {
            query = "SELECT type, content, timestamp FROM (SELECT type, content, timestamp FROM chat_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 15) sub ORDER BY timestamp ASC";
            params = [userId];
        } else {
            query = "SELECT type, content, timestamp FROM (SELECT type, content, timestamp FROM chat_history WHERE session_id = $1 AND user_id IS NULL ORDER BY timestamp DESC LIMIT 15) sub ORDER BY timestamp ASC";
            params = [sessionId];
        }

        const res = await pool.query(query, params);
        return res.rows;
    } catch (error) {
        console.error("Error fetching history for client:", error);
        return [];
    }
};

/**
 * Get the count of human messages for a guest session
 * @param {string} sessionId 
 * @returns {Promise<number>}
 */
export const getGuestMessageCount = async (sessionId) => {
    try {
        const res = await pool.query(
            "SELECT COUNT(*) FROM chat_history WHERE session_id = $1 AND type = 'human' AND user_id IS NULL",
            [sessionId]
        );
        return parseInt(res.rows[0].count);
    } catch (error) {
        console.error("Error counting guest messages:", error);
        return 0;
    }
};

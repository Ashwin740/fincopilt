import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from 'dotenv';

dotenv.config();

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-ada-002"
});

/**
 * Generate embedding vector for a given text
 * @param {string} text - The text to generate embedding for
 * @returns {Promise<number[]>} - The embedding vector (1536 dimensions)
 */
export const generateEmbedding = async (text) => {
    try {
        const embedding = await embeddings.embedQuery(text);
        return embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};

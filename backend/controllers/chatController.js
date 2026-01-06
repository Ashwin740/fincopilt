import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getSessionHistory, getHistoryForClient, getGuestMessageCount } from "../utils/history.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { generateEmbedding } from "../services/embeddingService.js";
import { findSimilarQuestion, cacheResponse, incrementHitCount } from "../services/cacheService.js";
import { pool } from "../config/db.js";

export const handleChat = async (req, res) => {
    try {
        const { message, sessionId, userId } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "OpenAI API key not configured." });
        }

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required." });
        }

        // 1. Enforce Guest Limit (5 questions)
        if (!userId) {
            const count = await getGuestMessageCount(sessionId);
            if (count >= 5) {
                return res.status(403).json({
                    error: "LIMIT_REACHED",
                    message: "You have reached the limit of 5 questions as a guest. Please login to continue."
                });
            }
        }

        const chatModel = new ChatOpenAI({
            openAIApiKey: apiKey,
            modelName: "gpt-3.5-turbo",
            temperature: 0.7,
        });

        // Helper function to execute LangChain
        const getLLMResponse = async (input, sessionId, userId) => {
            const history = getSessionHistory(sessionId, userId);
            const memoryVariables = await history.getMessages();

            const prompt = ChatPromptTemplate.fromMessages([
                ["system", "You are a helpful Financial Assistant chatbot. You can answer queries related to finance, stocks, investments, and economic concepts. If a question is not related to finance, politely decline to answer."],
                new MessagesPlaceholder("history"),
                ["human", "{input}"],
            ]);

            const outputParser = new StringOutputParser();
            const chain = prompt.pipe(chatModel).pipe(outputParser);

            return await chain.invoke({
                input: input,
                history: memoryVariables
            });
        };

        let response;
        const cacheEnabled = process.env.CACHE_ENABLED === 'true';

        // Check cache if enabled
        if (cacheEnabled) {
            const questionEmbedding = await generateEmbedding(message);
            const threshold = parseFloat(process.env.CACHE_SIMILARITY_THRESHOLD) || 0.95;
            const cachedResult = await findSimilarQuestion(questionEmbedding, threshold);

            if (cachedResult) {
                response = cachedResult.answer;
                await incrementHitCount(cachedResult.id);
            } else {
                response = await getLLMResponse(message, sessionId, userId);
                await cacheResponse(message, response, questionEmbedding);
            }
        } else {
            response = await getLLMResponse(message, sessionId, userId);
        }

        // Save to chat history
        const history = getSessionHistory(sessionId, userId);
        await history.addMessage(new HumanMessage(message));
        await history.addMessage(new AIMessage(response));

        res.json({ response });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
};

export const getHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.query.userId; // Get userId from query param if provided
        const history = await getHistoryForClient(sessionId, userId);
        res.json(history);
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};

export const linkHistory = async (req, res) => {
    try {
        const { sessionId, userId } = req.body;
        if (!sessionId || !userId) {
            return res.status(400).json({ error: "Session ID and User ID are required." });
        }

        await pool.query(
            "SELECT link_guest_history($1, $2)",
            [sessionId, userId]
        );

        res.json({ success: true, message: "History linked successfully" });
    } catch (error) {
        console.error("Link History Error:", error);
        res.status(500).json({ error: "Failed to link history" });
    }
};

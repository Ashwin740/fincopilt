import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './ChatInterface.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const ChatInterface = () => {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Handle session link on sign in
    useEffect(() => {
        if (user && sessionId) {
            const linkHistory = async () => {
                try {
                    await fetch(`${API_BASE_URL}/api/link-history`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId, userId: user.id })
                    });
                    loadHistory(sessionId, user.id);
                } catch (error) {
                    console.error("Failed to link history:", error);
                }
            };
            linkHistory();
        }
    }, [user, sessionId]);

    const loadHistory = async (sid, uid) => {
        try {
            const url = `${API_BASE_URL}/api/history/${sid}${uid ? `?userId=${uid}` : ''}`;
            const response = await fetch(url);
            if (response.ok) {
                const history = await response.json();
                const formattedHistory = history.map(msg => ({
                    text: msg.content,
                    sender: msg.type === 'human' ? 'user' : 'ai',
                }));

                if (formattedHistory.length > 0) {
                    setMessages(formattedHistory);
                } else {
                    setMessages([
                        { text: "Hello! I am your Financial Copilot. Ask me anything about finance.", sender: 'ai' }
                    ]);
                }
            }
        } catch (error) {
            console.error("Failed to load history:", error);
        }
    };

    // Initialize Session
    useEffect(() => {
        let currentSessionId = localStorage.getItem('finCopilotSessionId');
        if (!currentSessionId) {
            currentSessionId = crypto.randomUUID();
            localStorage.setItem('finCopilotSessionId', currentSessionId);
        }
        setSessionId(currentSessionId);

        if (currentSessionId) {
            loadHistory(currentSessionId, user?.id);
        }
    }, [user?.id]);

    const handleSend = async () => {
        if (!input.trim() || !sessionId) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.text,
                    sessionId: sessionId,
                    userId: user?.id
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error === 'LIMIT_REACHED') {
                    setMessages(prev => [
                        ...prev.slice(0, -1),
                        { text: data.message, sender: 'ai', isSystem: true }
                    ]);
                    setIsAuthModalOpen(true);
                    return;
                }
                throw new Error(data.error || 'Network response was not ok');
            }

            const aiMessage = { text: data.response, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = { text: "Sorry, I'm having trouble connecting to the server.", sender: 'ai', isError: true };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
                {!isOpen && (
                    <button className="chat-toggle-btn" onClick={toggleChat}>
                        💬
                    </button>
                )}

                {isOpen && (
                    <div className="chat-container">
                        <div className="chat-header">
                            <div className="header-info">
                                <h3>FinCopilot Assistant</h3>
                                {user && <span className="user-badge">Pro</span>}
                            </div>
                            <div className="header-actions">
                                {user ? (
                                    <button className="auth-action-btn logout" onClick={signOut}>Logout</button>
                                ) : (
                                    <button className="auth-action-btn login" onClick={() => setIsAuthModalOpen(true)}>Login</button>
                                )}
                                <button className="close-btn" onClick={toggleChat}>×</button>
                            </div>
                        </div>

                        <div className="messages-area">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.sender} ${msg.isError ? 'error' : ''} ${msg.isSystem ? 'system' : ''}`}>
                                    <div className="message-content">
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="message ai loading">
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="input-area">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask a financial question..."
                            />
                            <button onClick={handleSend} disabled={loading}>
                                ➤
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
};

export default ChatInterface;

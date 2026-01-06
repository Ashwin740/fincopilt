import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="logo">FinCopilot</div>
            <div className="nav-links">
                <a href="#features">Features</a>
                <a href="#agents">Agents</a>
                <a href="#capabilities">Capabilities</a>

                {user ? (
                    <div className="user-nav">
                        <span className="user-email">{user.email.split('@')[0]}</span>
                        <button className="btn-secondary" onClick={signOut}>Logout</button>
                    </div>
                ) : (
                    <button className="btn-primary" onClick={() => setIsAuthModalOpen(true)}>Get Started</button>
                )}
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </nav>
    );
};

export default Navbar;

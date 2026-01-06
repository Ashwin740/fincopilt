import React from 'react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Financial Analysis <span className="highlight">Copilot</span></h1>
          <p className="subtitle">
            Generate reports, analyze metrics, and receive actionable recommendations.
            Powered by advanced RAG and specialized agents.
          </p>
          <button className="btn-cta">Start Analysis</button>
        </div>
        <div className="hero-visual">
          {/* Abstract visual/diagram representation */}
          <div className="glass-card chart-preview">
            <div className="chart-bar" style={{ height: '60%' }}></div>
            <div className="chart-bar" style={{ height: '80%' }}></div>
            <div className="chart-bar" style={{ height: '40%' }}></div>
            <div className="chart-bar" style={{ height: '90%' }}></div>
          </div>
        </div>
      </header>

      <section id="features" className="section-container">
        <h2>Key Technologies</h2>
        <div className="grid-responsive">
          <div className="feature-card">
            <h3>RAG Engine</h3>
            <p>Access financial statements, real-time dashboards, and historical analysis instantly.</p>
          </div>
          <div className="feature-card">
            <h3>Memory Integration</h3>
            <p>Remembers past KPI trends and adapts to analyst preferences over time.</p>
          </div>
          <div className="feature-card">
            <h3>MCP Protocol</h3>
            <p>Seamlessly connects to Databases, BI Tools, and exports to Excel/CSV.</p>
          </div>
        </div>
      </section>

      <section id="agents" className="section-container bg-alt">
        <h2>Specialized Agents</h2>
        <div className="agents-grid">
          <div className="agent-card">
            <div className="agent-icon">📊</div>
            <h3>KPI Calculation Agent</h3>
            <p>Automated metric tracking and precise calculations.</p>
          </div>
          <div className="agent-card">
            <div className="agent-icon">🔮</div>
            <h3>Forecasting Agent</h3>
            <p>Predictive modeling for future financial trends.</p>
          </div>
          <div className="agent-card">
            <div className="agent-icon">🛡️</div>
            <h3>Risk Analysis Agent</h3>
            <p>Identify and mitigate potential financial risks early.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 Financial Analysis Copilot. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

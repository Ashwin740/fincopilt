import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <LandingPage />
      <ChatInterface />
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Scan from './pages/Scan';
import { BookOpen } from 'lucide-react';

function Header() {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 h-16 flex items-center px-4 shadow-sm">
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <BookOpen size={20} className="stroke-[2.5]" />
          </div>
          <h1 className="font-bold text-xl text-gray-900 tracking-tight">LibScan</h1>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pt-16">
        <Header />
        <main className="max-w-3xl mx-auto p-4 min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

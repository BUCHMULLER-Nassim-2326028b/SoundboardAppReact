import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import SoundsPage from './pages/SoundsPage';
import SoundListPage from './pages/SoundListPage';
import OptionsPage from './pages/OptionsPage';
import ContactPage from './pages/ContactPage';

import './styles/index.css';
import './styles/aurora.css';
import './styles/animations.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sons" element={<SoundsPage />} />
            <Route path="/sons/:categoryId" element={<SoundListPage />} />
            <Route path="/options" element={<OptionsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AppProvider>
  );
}

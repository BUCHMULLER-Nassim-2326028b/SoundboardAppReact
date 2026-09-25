import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import AnimatedRoutes from './components/layout/AnimatedRoutes';

import './styles/index.css';
import './styles/aurora.css';
import './styles/animations.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell>
          <AnimatedRoutes />
        </AppShell>
      </BrowserRouter>
    </AppProvider>
  );
}

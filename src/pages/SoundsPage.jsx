import { useMemo, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './SoundsPage.css';
import soundsData from '../data/sounds.json';
import CategoryCard from '../components/ui/CategoryCard';
import SoundListPage from './SoundListPage';
import { DeepPage } from '../components/layout/AnimatedRoutes';

export default function SoundsPage({ isActive = true }) {
  const categories = soundsData.categories;
  const location = useLocation();
  const lastActiveLocation = useRef(location);

  // Freeze the routing state when the tab is inactive!
  // This ensures DeepPage NEVER unmounts during a tab switch, achieving a true 100% native savestate.
  if (isActive) {
    lastActiveLocation.current = location;
  }
  const frozenLocation = lastActiveLocation.current;

  // Ensure featured categories are ALWAYS at the top, then normal, then petit
  const sortedCategories = useMemo(() => {
    const featured = categories.filter((c) => c.size === 'featured');
    const normal = categories.filter((c) => c.size === 'normal' || (!c.size && c.size !== 'petit'));
    const petit = categories.filter((c) => c.size === 'petit');
    return [...featured, ...normal, ...petit];
  }, [categories]);

  // Check against the frozen location to avoid unmounting when inactive
  const isDeepRoute = frozenLocation.pathname.startsWith('/sons/') && frozenLocation.pathname !== '/sons';

  return (
    <>
      <div className="page sounds-page">
        <header className="page-header">
          <h1 className="page-title">CHOIX DE LA CATÉGORIE</h1>
        </header>

        {/* Unified grid: featured (top banner), normal (2 cols), and petit (1-line pair) */}
        <section className="sounds-grid-section" aria-label="Catégories">
          <div className="sounds-grid">
            {sortedCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                size={category.size || 'normal'}
              />
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isDeepRoute && (
          <Routes location={frozenLocation} key="sounds-deep-route">
            <Route 
              path="/sons/:categoryId" 
              element={
                <DeepPage tabBase="/sons">
                  <SoundListPage />
                </DeepPage>
              } 
            />
          </Routes>
        )}
      </AnimatePresence>
    </>
  );
}

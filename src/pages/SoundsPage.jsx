import { useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './SoundsPage.css';
import soundsData from '../data/sounds.json';
import CategoryCard from '../components/ui/CategoryCard';
import SoundListPage from './SoundListPage';
import { DeepPage } from '../components/layout/AnimatedRoutes';

export default function SoundsPage() {
  const categories = soundsData.categories;
  const location = useLocation();

  // Ensure featured categories are ALWAYS at the top, then normal, then petit
  const sortedCategories = useMemo(() => {
    const featured = categories.filter((c) => c.size === 'featured');
    const normal = categories.filter((c) => c.size === 'normal' || (!c.size && c.size !== 'petit'));
    const petit = categories.filter((c) => c.size === 'petit');
    return [...featured, ...normal, ...petit];
  }, [categories]);

  // Check if we are inside a deep route
  const isDeepRoute = location.pathname.startsWith('/sons/') && location.pathname !== '/sons';

  return (
    <>
      <div className="page sounds-page">
        <header className="sounds-header">
          <h1 className="sounds-title">CHOIX DE LA CATÉGORIE</h1>
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
          <Routes location={location} key="sounds-deep-route">
            <Route 
              path=":categoryId" 
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

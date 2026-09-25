import './SoundsPage.css';
import soundsData from '../data/sounds.json';
import CategoryCard from '../components/ui/CategoryCard';

const EXTRA_CATEGORIES = [
  {
    id: 'all',
    name: 'Tous les sons',
    displayTitle: ['TOUS LES', 'SONS'],
    image: '/images/categories/art_tous.svg',
    bannerColor: '#111827',
  },
  {
    id: 'custom',
    name: 'Mes sons',
    displayTitle: 'MES SONS',
    image: '/images/categories/art_messons.svg',
    bannerColor: '#111827',
  },
];

export default function SoundsPage() {
  const categories = soundsData.categories;

  // Featured category on top: Maskass
  const featured = categories.find((c) => c.id === 'maskass') || categories[0];
  const otherCategories = categories.filter((c) => c.id !== featured.id);

  // Grid includes: Sons de base, Sons Anglais, Tous les sons, Mes sons
  const gridCategories = [...otherCategories, ...EXTRA_CATEGORIES];

  return (
    <div className="page sounds-page">
      <header className="sounds-header">
        <h1 className="sounds-title">CHOIX DE LA CATÉGORIE</h1>
      </header>

      {/* Top Featured Card (Maskass) */}
      <section className="sounds-featured-section" aria-label="Catégorie à la une">
        <CategoryCard category={featured} size="featured" />
      </section>

      {/* 2-Column Grid */}
      <section className="sounds-grid-section" aria-label="Catégories">
        <div className="sounds-grid">
          {gridCategories.map((category) => (
            <CategoryCard key={category.id} category={category} size="normal" />
          ))}
        </div>
      </section>
    </div>
  );
}

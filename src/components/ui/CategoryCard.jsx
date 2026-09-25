import './CategoryCard.css';
import { useNavigate } from 'react-router-dom';

export default function CategoryCard({ category, size = 'normal', onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/sons/${category.id}`);
    }
  };

  const displayTitle = category.displayTitle || category.name;

  return (
    <button
      className={`category-card category-card--${size}`}
      onClick={handleClick}
      id={`category-${category.id}`}
      aria-label={`Catégorie ${category.name}`}
    >
      {/* Top Artwork Area */}
      <div className="category-card__artwork">
        <img
          src={category.image}
          alt={category.name}
          className="category-card__img"
          draggable="false"
        />

        {/* NOUVEAU Badge on top right */}
        {category.isNew && (
          <div className="category-card__badge-wrap">
            <span className="category-card__nouveau-badge">NOUVEAU</span>
          </div>
        )}
      </div>

      {/* Seamless Flipped & Blurred Footer */}
      <div className="category-card__footer">
        {/* Vertically flipped & heavily blurred artwork reflection */}
        {category.image && (
          <div className="category-card__footer-reflection" aria-hidden="true">
            <img
              src={category.image}
              alt=""
              className="category-card__reflection-img"
              draggable="false"
            />
          </div>
        )}

        {/* Darkening tint overlay */}
        <div className="category-card__footer-tint" aria-hidden="true" />

        {/* Title text */}
        <span className="category-card__title">
          {Array.isArray(displayTitle) ? (
            displayTitle.map((line, i) => (
              <span key={i} className="category-card__title-line">
                {line}
              </span>
            ))
          ) : (
            displayTitle
          )}
        </span>
      </div>
    </button>
  );
}

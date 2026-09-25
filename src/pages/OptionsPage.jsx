import './OptionsPage.css';
import { useApp } from '../context/AppContext';
import { Volume2, Vibrate, RotateCcw, Info, Smartphone } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import eventsData from '../data/events.json';
import soundsData from '../data/sounds.json';
import { useMemo } from 'react';

export default function OptionsPage() {
  const { state, dispatch } = useApp();

  const totalPlays = useMemo(
    () => Object.values(state.soundStats).reduce((a, b) => a + b, 0),
    [state.soundStats]
  );

  const totalSounds = useMemo(
    () => soundsData.categories.reduce((acc, cat) => acc + cat.sounds.length, 0),
    []
  );

  const handleResetStats = () => {
    if (window.confirm('Réinitialiser toutes les stats et l\'épingle ?')) {
      dispatch({ type: 'RESET_STATS' });
    }
  };

  const handleInstallPWA = async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const result = await window.deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        window.deferredPrompt = null;
      }
    } else {
      alert('L\'app est déjà installée ou ton navigateur ne supporte pas l\'installation PWA. Essaie via le menu de ton navigateur !');
    }
  };

  return (
    <div className="page options-page">
      <header className="page-header slide-up">
        <h1 className="page-title text-glow">Options</h1>
      </header>

      {/* Volume control */}
      <section className="options-section slide-up slide-up-delay-1">
        <GlassCard variant="default" cornerRadius={18}>
          <div className="option-row">
            <div className="option-row__label">
              <Volume2 size={18} />
              <span>Volume</span>
            </div>
            <div className="option-row__control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.volume}
                onChange={(e) =>
                  dispatch({ type: 'SET_VOLUME', payload: parseFloat(e.target.value) })
                }
                className="option-slider"
                id="volume-slider"
                aria-label="Volume"
              />
              <span className="option-slider__value">{Math.round(state.volume * 100)}%</span>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Haptic feedback */}
      <section className="options-section slide-up slide-up-delay-2">
        <GlassCard variant="default" cornerRadius={18}>
          <div className="option-row">
            <div className="option-row__label">
              <Vibrate size={18} />
              <span>Vibration</span>
            </div>
            <label className="option-toggle" htmlFor="haptic-toggle">
              <input
                type="checkbox"
                id="haptic-toggle"
                checked={state.hapticFeedback}
                onChange={(e) =>
                  dispatch({ type: 'SET_HAPTIC', payload: e.target.checked })
                }
              />
              <span className="option-toggle__track">
                <span className="option-toggle__thumb" />
              </span>
            </label>
          </div>
        </GlassCard>
      </section>

      {/* Stats */}
      <section className="options-section slide-up slide-up-delay-3">
        <GlassCard variant="default" cornerRadius={18}>
          <div className="option-stats">
            <h3 className="option-stats__title">
              <Info size={16} />
              Statistiques
            </h3>
            <div className="option-stats__grid">
              <div className="option-stats__item">
                <span className="option-stats__number">{totalPlays}</span>
                <span className="option-stats__label">Lectures totales</span>
              </div>
              <div className="option-stats__item">
                <span className="option-stats__number">{totalSounds}</span>
                <span className="option-stats__label">Sons disponibles</span>
              </div>
              <div className="option-stats__item">
                <span className="option-stats__number">{state.customSounds.length}</span>
                <span className="option-stats__label">Sons custom</span>
              </div>
              <div className="option-stats__item">
                <span className="option-stats__number">{soundsData.categories.length}</span>
                <span className="option-stats__label">Catégories</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Actions */}
      <section className="options-section slide-up slide-up-delay-4">
        <GlassCard variant="default" cornerRadius={18}>
          <div className="option-actions">
            <button className="option-action" onClick={handleInstallPWA} id="install-pwa-btn">
              <Smartphone size={18} />
              <span>Installer l'app</span>
            </button>
            <div className="option-action__divider" />
            <button className="option-action option-action--danger" onClick={handleResetStats} id="reset-stats-btn">
              <RotateCcw size={18} />
              <span>Réinitialiser les stats</span>
            </button>
          </div>
        </GlassCard>
      </section>

      {/* About */}
      <section className="options-section slide-up slide-up-delay-5">
        <GlassCard variant="default" cornerRadius={18}>
          <div className="option-about">
            <span className="option-about__name">SavunApp</span>
            <Badge text={`v${eventsData.version}`} variant="version" />
            <span className="option-about__desc">
              Application créée par nvssgoat • Sons par Savun
            </span>
            <span className="option-about__tech">
              React • Liquid Glass • PWA
            </span>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

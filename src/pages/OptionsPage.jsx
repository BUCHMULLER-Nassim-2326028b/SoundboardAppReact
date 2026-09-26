import { useMemo, useState } from 'react';
import './OptionsPage.css';
import { useApp } from '../context/AppContext';
import {
  Volume2,
  VolumeX,
  Vibrate,
  BarChart2,
  Smartphone,
  RotateCcw,
  Sparkles,
  Layers,
  Mic,
  Disc,
  Info,
} from 'lucide-react';
import eventsData from '../data/events.json';
import soundsData from '../data/sounds.json';

export default function OptionsPage() {
  const { state, dispatch } = useApp();
  const [prevVolume, setPrevVolume] = useState(0.8);

  const totalPlays = useMemo(
    () => Object.values(state.soundStats).reduce((a, b) => a + b, 0),
    [state.soundStats]
  );

  const totalSounds = useMemo(
    () => soundsData.categories.reduce((acc, cat) => acc + (cat.sounds?.length || 0), 0),
    []
  );

  const handleToggleMute = () => {
    if (state.volume > 0) {
      setPrevVolume(state.volume);
      dispatch({ type: 'SET_VOLUME', payload: 0 });
    } else {
      dispatch({ type: 'SET_VOLUME', payload: prevVolume || 0.8 });
    }
  };

  const handleResetStats = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les statistiques et les favoris ?')) {
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
      alert("L'application est déjà installée ou votre navigateur ne supporte pas l'installation PWA.");
    }
  };

  return (
    <div className="page options-page">
      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">OPTIONS</h1>
      </header>

      {/* 1. AUDIO & HAPTIQUE SECTION */}
      <section className="options-group" aria-label="Paramètres audio et retour">
        <div className="settings-block">
          {/* Volume Control */}
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div className="options-row__info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="options-icon-btn"
                  onClick={handleToggleMute}
                  aria-label={state.volume === 0 ? 'Activer le son' : 'Couper le son'}
                  title={state.volume === 0 ? 'Activer' : 'Mute'}
                >
                  {state.volume === 0 ? (
                    <VolumeX size={30} className="options-icon--muted" />
                  ) : (
                    <Volume2 size={30} />
                  )}
                </button>
                <div className="options-label-wrap">
                  <span className="options-label">Volume général</span>
                  <span className="options-sublabel">Ajuste le niveau sonore des répliques</span>
                </div>
              </div>
              <span className="options-val-pill">{Math.round(state.volume * 100)}%</span>
            </div>

            <div className="options-slider-container">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={state.volume}
                onChange={(e) =>
                  dispatch({ type: 'SET_VOLUME', payload: parseFloat(e.target.value) })
                }
                className="options-slider"
                id="volume-slider"
                aria-label="Volume"
                style={{ '--slider-fill': `${Math.round(state.volume * 100)}%` }}
              />
            </div>
          </div>

          {/* Vibration / Haptic Feedback */}
          <div className="settings-row" style={{ justifyContent: 'space-between' }}>
            <div className="options-row__info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="options-icon-btn options-icon-btn--static">
                <Vibrate size={30} />
              </div>
              <div className="options-label-wrap">
                <span className="options-label">Retours haptiques</span>
                <span className="options-sublabel">Vibrations lors des clics sur les sons</span>
              </div>
            </div>

            <label className="options-switch" htmlFor="haptic-toggle">
              <input
                type="checkbox"
                id="haptic-toggle"
                checked={state.hapticFeedback}
                onChange={(e) =>
                  dispatch({ type: 'SET_HAPTIC', payload: e.target.checked })
                }
              />
              <span className="options-switch__track">
                <span className="options-switch__thumb" />
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* 2. STATISTIQUES SECTION */}
      <section className="options-group" aria-label="Statistiques de jeu">
        <div className="settings-block" style={{ padding: '16px' }}>
          <div className="options-card__header" style={{ marginBottom: '16px' }}>
            <BarChart2 size={18} className="options-section-icon" />
            <span className="options-section-title">STATISTIQUES</span>
          </div>

          <div className="options-stats-grid">
            <div className="options-stat-box">
              <div className="options-stat-box__icon">
                <Disc size={18} />
              </div>
              <span className="options-stat-box__val">{totalPlays}</span>
              <span className="options-stat-box__lbl">Lectures totales</span>
            </div>

            <div className="options-stat-box">
              <div className="options-stat-box__icon">
                <Sparkles size={18} />
              </div>
              <span className="options-stat-box__val">{totalSounds}</span>
              <span className="options-stat-box__lbl">Sons officiels</span>
            </div>

            <div className="options-stat-box">
              <div className="options-stat-box__icon">
                <Mic size={18} />
              </div>
              <span className="options-stat-box__val">{state.customSounds?.length || 0}</span>
              <span className="options-stat-box__lbl">Sons enregistrés</span>
            </div>

            <div className="options-stat-box">
              <div className="options-stat-box__icon">
                <Layers size={18} />
              </div>
              <span className="options-stat-box__val">{soundsData.categories.length}</span>
              <span className="options-stat-box__lbl">Catégories</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACTIONS & SYSTEM SECTION */}
      <section className="options-group" aria-label="Gestion de l'application">
        <div className="settings-block" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            className="options-action-btn options-action-btn--primary"
            onClick={handleInstallPWA}
            id="install-pwa-btn"
          >
            <Smartphone size={19} />
            <span>Installer l'application</span>
          </button>

          <button
            type="button"
            className="options-action-btn options-action-btn--danger"
            onClick={handleResetStats}
            id="reset-stats-btn"
          >
            <RotateCcw size={18} />
            <span>Réinitialiser les données</span>
          </button>
        </div>
      </section>

      {/* 4. A PROPOS & CREDITS */}
      <footer className="options-footer">
        <div className="settings-block">
          <div className="options-card--about">
            <div className="options-about-header">
              <span className="options-about-logo">SAVUNAPP</span>
              <span className="options-about-version">v{eventsData.version || '2.0'}</span>
            </div>
            <p className="options-about-credits">
              Hommage soundboard à l'univers et aux répliques cultes de <strong>Savun</strong>.
            </p>
            <div className="options-about-author">
              <Info size={14} />
              <span>Développé avec passion par nvssgoat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

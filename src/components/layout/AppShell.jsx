import BottomNav from './BottomNav';
import ChangelogOverlay from '../features/ChangelogOverlay';
import { useApp } from '../../context/AppContext';

export default function AppShell({ children }) {
  const { state, dispatch } = useApp();

  return (
    <div className="app-shell">
      {/* Aurora animated background */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-grain" />
      </div>

      {/* Main content */}
      <main className="app-shell__content">
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav />

      {/* Global Changelog / MàJ Overlay */}
      <ChangelogOverlay
        isOpen={Boolean(state?.isChangelogOpen)}
        onClose={() => dispatch({ type: 'CLOSE_CHANGELOG' })}
      />
    </div>
  );
}

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import SoundsPage from '../../pages/SoundsPage';
import OptionsPage from '../../pages/OptionsPage';
import ContactPage from '../../pages/ContactPage';
import SoundListPage from '../../pages/SoundListPage';
import './AnimatedRoutes.css';

const ANIM_MS = 400;

/**
 * Tab pane with native iOS savestate preservation:
 * Keeps all 4 tabs mounted so scroll positions, audio playback,
 * and user interactions are preserved with zero unmount flashes.
 */
export function NativeTabPane({ children, isActive }) {
  return (
    <div
      className="native-tab-pane"
      style={{
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
        visibility: isActive ? 'visible' : 'hidden',
        zIndex: isActive ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

// Backward compatibility export
export const NativeTab = NativeTabPane;

/**
 * TabStackView — Ultra-scalable stack navigator per tab
 * Directly ported from BaptisteApp's battle-tested stack navigation.
 * 
 * Features:
 * - Isolated per-tab stack: switching tabs NEVER destroys or pops the drill-down screen!
 * - Zero animation replay when toggling between tabs.
 * - Buttery smooth push / pop CSS transitions (400ms cubic-bezier).
 * - Parallax receding (-25%) & native edge drop shadow.
 * - Interactive 120 FPS edge-swipe back gesture with velocity release.
 */
function TabStackView({
  basePath,
  currentPath,
  rootComponent: RootComponent,
  subRoutes,
  onNavigate,
}) {
  // Check if current route matches any defined sub-route for this tab
  const activeSubRoute = useMemo(() => {
    if (!currentPath.startsWith(basePath) || currentPath === basePath) return null;
    for (const r of subRoutes) {
      const match = currentPath.match(r.pattern);
      if (match) {
        return {
          route: r,
          match,
          key: r.getKey(match),
        };
      }
    }
    return null;
  }, [currentPath, basePath, subRoutes]);

  // Stack of screens for this tab
  const [stack, setStack] = useState(() => {
    const base = [{ key: 'root', type: 'root' }];
    if (activeSubRoute) {
      base.push({
        key: activeSubRoute.key,
        type: 'sub',
        render: () =>
          activeSubRoute.route.render(activeSubRoute.match, {
            onBack: () => onNavigate(basePath),
          }),
      });
    }
    return base;
  });

  // Action determines visual transition state:
  // 'idle' | 'push-init' | 'push-active' | 'pop-init' | 'pop-active' | 'swipe' | 'swipe-cancel' | 'swipe-pop'
  const [action, setAction] = useState('idle');
  const [swipeDx, setSwipeDx] = useState(0);

  const lockRef = useRef(false);
  const swipeRef = useRef({ active: false, startX: 0, startY: 0, startTime: 0 });
  const swipedPopRef = useRef(false);

  // Sync stack when URL changes
  useEffect(() => {
    // If the path does not belong to this tab, DO NOT touch this tab's stack!
    // This achieves 100% native iOS state preservation across tab switches.
    if (!currentPath.startsWith(basePath)) {
      return;
    }

    // Skip if programmatic navigation was triggered by a gesture swipe-pop
    if (swipedPopRef.current) {
      swipedPopRef.current = false;
      return;
    }

    if (activeSubRoute) {
      const currentTop = stack[stack.length - 1];

      // If this screen is already on top of the stack, DO NOT replay animation!
      if (currentTop?.key === activeSubRoute.key) {
        return;
      }

      // PUSH NEW SCREEN
      lockRef.current = true;
      const newScreen = {
        key: activeSubRoute.key,
        type: 'sub',
        render: () =>
          activeSubRoute.route.render(activeSubRoute.match, {
            onBack: () => onNavigate(basePath),
          }),
      };

      setStack((s) => [...s.filter((item) => item.type === 'root'), newScreen]);
      setAction('push-init');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAction('push-active');
          setTimeout(() => {
            setAction('idle');
            lockRef.current = false;
          }, ANIM_MS + 20);
        });
      });
    } else if (currentPath === basePath && stack.length > 1) {
      // POP BACK TO ROOT
      lockRef.current = true;
      setAction('pop-init');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAction('pop-active');
          setTimeout(() => {
            setStack((s) => s.slice(0, 1));
            setAction('idle');
            lockRef.current = false;
          }, ANIM_MS + 20);
        });
      });
    }
  }, [currentPath, basePath, activeSubRoute, stack, onNavigate]);

  // --- INTERACTIVE iOS EDGE-SWIPE GESTURE LOGIC (BaptisteApp) ---
  const handleTouchStart = (e) => {
    if (lockRef.current || stack.length < 2) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    // Edge detection: start within left 45px
    if (x < 45) {
      swipeRef.current = {
        active: true,
        startX: x,
        startY: e.touches ? e.touches[0].clientY : e.clientY,
        startTime: Date.now(),
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!swipeRef.current.active) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - swipeRef.current.startX;
    const dy = clientY - swipeRef.current.startY;

    // Only engage horizontal swipe if moving predominantly to the right
    if (dx > 0 && Math.abs(dx) > Math.abs(dy)) {
      setSwipeDx(dx);
      setAction('swipe');
    }
  };

  const handleTouchEnd = (e) => {
    if (!swipeRef.current.active) return;
    swipeRef.current.active = false;

    if (action === 'swipe') {
      const dx = swipeDx;
      const dt = Date.now() - swipeRef.current.startTime;
      const velocity = dx / (dt || 1);
      const screenW = typeof window !== 'undefined' ? window.innerWidth : 400;

      lockRef.current = true;

      // Threshold: dragged past halfway OR flicked with high velocity
      if (dx > screenW / 2 || velocity > 0.5) {
        setAction('swipe-pop');
        swipedPopRef.current = true;
        setTimeout(() => {
          setStack((s) => s.slice(0, 1));
          setAction('idle');
          setSwipeDx(0);
          lockRef.current = false;
          onNavigate(basePath);
        }, 300);
      } else {
        setAction('swipe-cancel');
        setTimeout(() => {
          setAction('idle');
          setSwipeDx(0);
          lockRef.current = false;
        }, 300);
      }
    }
  };

  const screenW = typeof window !== 'undefined' ? window.innerWidth : 400;

  return (
    <div
      className="tab-stack-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handleTouchStart}
      onPointerMove={handleTouchMove}
      onPointerUp={handleTouchEnd}
    >
      {stack.map((item, index) => {
        const isTop = index === stack.length - 1;
        const isPrev = index === stack.length - 2;

        let transform = 'translateX(100%)';
        let transition = 'none';

        if (action === 'idle') {
          if (isTop) transform = 'translateX(0%)';
          else if (isPrev) transform = 'translateX(-25%)';
          else transform = 'translateX(-100%)';
        } else if (action === 'push-init') {
          if (isTop) transform = 'translateX(100%)';
          else if (isPrev) transform = 'translateX(0%)';
          else transform = 'translateX(-25%)';
        } else if (action === 'push-active') {
          transition = `transform ${ANIM_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`;
          if (isTop) transform = 'translateX(0%)';
          else if (isPrev) transform = 'translateX(-25%)';
          else transform = 'translateX(-25%)';
        } else if (action === 'pop-init') {
          if (isTop) transform = 'translateX(0%)';
          else if (isPrev) transform = 'translateX(-25%)';
          else transform = 'translateX(-25%)';
        } else if (action === 'pop-active') {
          transition = `transform ${ANIM_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`;
          if (isTop) transform = 'translateX(100%)';
          else if (isPrev) transform = 'translateX(0%)';
          else transform = 'translateX(-25%)';
        } else if (action === 'swipe') {
          if (isTop) transform = `translateX(${swipeDx}px)`;
          else if (isPrev) transform = `translateX(${(swipeDx / screenW) * 25 - 25}%)`;
          else transform = 'translateX(-25%)';
        } else if (action === 'swipe-cancel') {
          transition = `transform 300ms cubic-bezier(0.32, 0.72, 0, 1)`;
          if (isTop) transform = 'translateX(0%)';
          else if (isPrev) transform = 'translateX(-25%)';
          else transform = 'translateX(-25%)';
        } else if (action === 'swipe-pop') {
          transition = `transform 300ms cubic-bezier(0.32, 0.72, 0, 1)`;
          if (isTop) transform = 'translateX(100%)';
          else if (isPrev) transform = 'translateX(0%)';
          else transform = 'translateX(-25%)';
        }

        const zIndex = isTop ? 2 : (isPrev ? 1 : 0);
        const boxShadow = isTop && stack.length > 1 ? '-8px 0 24px rgba(0, 0, 0, 0.5)' : 'none';

        return (
          <div
            key={item.key}
            className="nav-screen"
            style={{
              position: 'absolute',
              inset: 0,
              transform,
              transition,
              zIndex,
              boxShadow,
            }}
          >
            {item.type === 'root' ? (
              <div className="native-tab-pane__scroll">
                <RootComponent />
              </div>
            ) : (
              item.render()
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * AnimatedRoutes — Main Native Tab Controller
 * Each tab preserves 100% of its scroll and state.
 * Any tab can hold its own stack without interfering with others.
 */
export default function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract base tab from location (e.g. "/sons" from "/sons/humour")
  const segments = location.pathname.split('/').filter(Boolean);
  const currentTabBase = segments.length > 0 ? `/${segments[0]}` : '/';

  return (
    <div className="app-root-nav">
      {/* Tab 0: Accueil */}
      <NativeTabPane isActive={currentTabBase === '/'}>
        <div className="native-tab-pane__scroll">
          <HomePage />
        </div>
      </NativeTabPane>

      {/* Tab 1: Sons (with BaptisteApp-style stack navigation!) */}
      <NativeTabPane isActive={currentTabBase === '/sons'}>
        <TabStackView
          basePath="/sons"
          currentPath={location.pathname}
          rootComponent={SoundsPage}
          onNavigate={navigate}
          subRoutes={[
            {
              pattern: /^\/sons\/(.+)$/,
              render: (match, handlers) => (
                <SoundListPage
                  categoryId={match[1]}
                  onBack={handlers.onBack}
                />
              ),
              getKey: (match) => `sound-list-${match[1]}`,
            },
          ]}
        />
      </NativeTabPane>

      {/* Tab 2: Options */}
      <NativeTabPane isActive={currentTabBase === '/options'}>
        <div className="native-tab-pane__scroll">
          <OptionsPage />
        </div>
      </NativeTabPane>

      {/* Tab 3: Contact */}
      <NativeTabPane isActive={currentTabBase === '/contact'}>
        <div className="native-tab-pane__scroll">
          <ContactPage />
        </div>
      </NativeTabPane>
    </div>
  );
}

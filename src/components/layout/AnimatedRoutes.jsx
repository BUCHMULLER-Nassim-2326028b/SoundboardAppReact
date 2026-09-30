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
 * Tab pane wrapper ensuring DOM persistence across tab navigation.
 * Keeps inactive views mounted while preventing user interaction and rendering overhead.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} props.isActive
 * @returns {JSX.Element}
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

export const NativeTab = NativeTabPane;

/**
 * Stack navigator managing hierarchical screens within a specific tab.
 * Supports iOS-style push/pop transitions and edge-swipe back gestures.
 *
 * @component
 * @param {object} props
 * @param {string} props.basePath - Tab root URL path.
 * @param {string} props.currentPath - Active router location pathname.
 * @param {React.ComponentType} props.rootComponent - Root view rendered at base path.
 * @param {Array<{ pattern: RegExp, render: Function, getKey: Function }>} props.subRoutes - Route definitions for sub-views.
 * @param {Function} props.onNavigate - Router navigation callback.
 * @returns {JSX.Element}
 */
function TabStackView({
  basePath,
  currentPath,
  rootComponent: RootComponent,
  subRoutes,
  onNavigate,
}) {
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

  const [action, setAction] = useState('idle');
  const [swipeDx, setSwipeDx] = useState(0);

  const lockRef = useRef(false);
  const swipeRef = useRef({ active: false, startX: 0, startY: 0, startTime: 0 });
  const swipedPopRef = useRef(false);

  useEffect(() => {
    if (!currentPath.startsWith(basePath)) {
      return;
    }

    if (swipedPopRef.current) {
      swipedPopRef.current = false;
      return;
    }

    if (activeSubRoute) {
      const currentTop = stack[stack.length - 1];
      if (currentTop?.key === activeSubRoute.key) {
        return;
      }

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

  const handleTouchStart = (e) => {
    if (lockRef.current || stack.length < 2) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
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
 * Root tab controller managing application-level tabs and nested stack state.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split('/').filter(Boolean);
  const currentTabBase = segments.length > 0 ? `/${segments[0]}` : '/';

  return (
    <div className="app-root-nav">
      <NativeTabPane isActive={currentTabBase === '/'}>
        <div className="native-tab-pane__scroll">
          <HomePage />
        </div>
      </NativeTabPane>

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

      <NativeTabPane isActive={currentTabBase === '/options'}>
        <div className="native-tab-pane__scroll">
          <OptionsPage />
        </div>
      </NativeTabPane>

      <NativeTabPane isActive={currentTabBase === '/contact'}>
        <div className="native-tab-pane__scroll">
          <ContactPage />
        </div>
      </NativeTabPane>
    </div>
  );
}

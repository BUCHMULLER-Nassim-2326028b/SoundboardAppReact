import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import SoundsPage from '../../pages/SoundsPage';
import OptionsPage from '../../pages/OptionsPage';
import ContactPage from '../../pages/ContactPage';
import SoundListPage from '../../pages/SoundListPage';
import './AnimatedRoutes.css';

const ANIM_MS = 400;

/**
 * Tab pane with native savestate preservation:
 * Keeps all 4 tabs mounted so scroll positions, audio playback,
 * and user interactions are preserved with zero unmount flashes.
 */
export function NativeTab({ children, isActive }) {
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

/**
 * Deep Navigation Stack ported directly from BaptisteApp:
 * Provides fluid iOS stack transitions (push, pop, parallax receding,
 * dynamic drop shadow) and 60/120fps interactive edge-swipe gestures.
 */
export default function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract base tab from location
  const segments = location.pathname.split('/').filter(Boolean);
  const currentTabBase = segments.length > 0 ? `/${segments[0]}` : '/';
  const isDeepRoute = location.pathname.startsWith('/sons/') && location.pathname !== '/sons';
  const initialCategoryId = isDeepRoute ? location.pathname.replace('/sons/', '') : null;

  // Navigation Stack (Level 0 = Tabs container, Level 1+ = Pushed screens)
  const [stack, setStack] = useState(() => {
    const base = [{ key: 'tabs', type: 'tabs' }];
    if (isDeepRoute) {
      base.push({
        key: `sound-list-${initialCategoryId}`,
        type: 'sound-list',
        categoryId: initialCategoryId,
        path: location.pathname,
      });
    }
    return base;
  });

  // Transition state ported directly from BaptisteApp
  // 'idle' | 'push-init' | 'push-active' | 'pop-init' | 'pop-active' | 'swipe' | 'swipe-cancel' | 'swipe-pop'
  const [action, setAction] = useState('idle');
  const [swipeDx, setSwipeDx] = useState(0);

  const lockRef = useRef(false);
  const swipeRef = useRef({ active: false, startX: 0, startY: 0, startTime: 0 });
  const swipedPopRef = useRef(false);
  const prevPathRef = useRef(location.pathname);

  // Synchronize stack with route changes
  useEffect(() => {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;
    prevPathRef.current = currentPath;

    // If swipe-pop just navigated back, skip programmatic pop animation
    if (swipedPopRef.current) {
      swipedPopRef.current = false;
      return;
    }

    if (currentPath.startsWith('/sons/') && currentPath !== '/sons') {
      const categoryId = currentPath.replace('/sons/', '');
      const currentTop = stack[stack.length - 1];

      if (currentTop?.type === 'sound-list' && currentTop?.categoryId === categoryId) {
        return;
      }

      lockRef.current = true;
      const newScreen = {
        key: `sound-list-${categoryId}`,
        type: 'sound-list',
        categoryId,
        path: currentPath,
      };

      // 1. Add to stack immediately
      setStack((s) => [...s.filter((item) => item.type === 'tabs'), newScreen]);
      // 2. Start in 'push-init' (new screen mounted off-screen right)
      setAction('push-init');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // 3. Trigger transition to slide in
          setAction('push-active');
          setTimeout(() => {
            setAction('idle');
            lockRef.current = false;
          }, ANIM_MS + 20);
        });
      });
    } else if (stack.length > 1) {
      // 1. Keep stack as is, trigger pop transition
      lockRef.current = true;
      setAction('pop-init');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAction('pop-active');
          setTimeout(() => {
            // 2. Only remove from stack after animation completes
            setStack((s) => s.slice(0, 1));
            setAction('idle');
            lockRef.current = false;
          }, ANIM_MS + 20);
        });
      });
    }
  }, [location.pathname, stack]);

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
          navigate('/sons');
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

  // Helper to render screen content
  const renderScreen = (item) => {
    if (item.type === 'tabs') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <NativeTab isActive={currentTabBase === '/'}>
            <HomePage isActive={currentTabBase === '/'} />
          </NativeTab>
          <NativeTab isActive={currentTabBase === '/sons'}>
            <SoundsPage isActive={currentTabBase === '/sons'} />
          </NativeTab>
          <NativeTab isActive={currentTabBase === '/options'}>
            <OptionsPage isActive={currentTabBase === '/options'} />
          </NativeTab>
          <NativeTab isActive={currentTabBase === '/contact'}>
            <ContactPage isActive={currentTabBase === '/contact'} />
          </NativeTab>
        </div>
      );
    }

    if (item.type === 'sound-list') {
      return <SoundListPage categoryId={item.categoryId} />;
    }

    return null;
  };

  const screenW = typeof window !== 'undefined' ? window.innerWidth : 400;

  return (
    <div
      className="app-root-nav"
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
            key={item.key || index}
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
            {renderScreen(item)}
          </div>
        );
      })}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

/* ============================================
   Apple iOS 18 Style Filled Navigation Icons
   ============================================ */
function IconAccueil({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.1a1.2 1.2 0 0 0-.77.28l-8 6.4A1.2 1.2 0 0 0 2.8 9.7V20a1.8 1.8 0 0 0 1.8 1.8h5a.9.9 0 0 0 .9-.9v-5.2a1.5 1.5 0 0 1 1.5-1.5h0a1.5 1.5 0 0 1 1.5 1.5v5.2a.9.9 0 0 0 .9.9h5a1.8 1.8 0 0 0 1.8-1.8V9.7a1.2 1.2 0 0 0-.43-.92l-8-6.4a1.2 1.2 0 0 0-.77-.28z" />
    </svg>
  );
}

function IconSons({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11.2 3.3a1.2 1.2 0 0 0-1.3.2L5.6 7.2H3a1.8 1.8 0 0 0-1.8 1.8v6a1.8 1.8 0 0 0 1.8 1.8h2.6l4.3 3.7a1.2 1.2 0 0 0 2-.9V4.2a1.2 1.2 0 0 0-.7-.9z"
        fill="currentColor"
      />
      <path
        d="M15.5 8.5a5 5 0 0 1 0 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M19 5.2a9.5 9.5 0 0 1 0 13.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconOptions({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.3 2.2a1.2 1.2 0 0 1 1.1-.9h2.2a1.2 1.2 0 0 1 1.1.9l.4 1.7a1.2 1.2 0 0 0 1.2.9 1.2 1.2 0 0 0 .9-.4l1.4-1.2a1.2 1.2 0 0 1 1.5.1l1.6 1.6a1.2 1.2 0 0 1 .1 1.5l-1.2 1.4a1.2 1.2 0 0 0 .5 2.1l1.7.4a1.2 1.2 0 0 1 .9 1.1v2.2a1.2 1.2 0 0 1-.9 1.1l-1.7.4a1.2 1.2 0 0 0-.5 2.1l1.2 1.4a1.2 1.2 0 0 1-.1 1.5l-1.6 1.6a1.2 1.2 0 0 1-1.5.1l-1.4-1.2a1.2 1.2 0 0 0-.9-.4 1.2 1.2 0 0 0-1.2.9l-.4 1.7a1.2 1.2 0 0 1-1.1.9h-2.2a1.2 1.2 0 0 1-1.1-.9l-.4-1.7a1.2 1.2 0 0 0-1.2-.9 1.2 1.2 0 0 0-.9.4l-1.4 1.2a1.2 1.2 0 0 1-1.5-.1l-1.6-1.6a1.2 1.2 0 0 1-.1-1.5l1.2-1.4a1.2 1.2 0 0 0-.5-2.1l-1.7-.4a1.2 1.2 0 0 1-.9-1.1v-2.2a1.2 1.2 0 0 1 .9-1.1l1.7-.4a1.2 1.2 0 0 0 .5-2.1l-1.2-1.4a1.2 1.2 0 0 1 .1-1.5l1.6-1.6a1.2 1.2 0 0 1 1.5-.1l1.4 1.2a1.2 1.2 0 0 0 .9.4 1.2 1.2 0 0 0 1.2-.9l.4-1.7zM12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z"
      />
    </svg>
  );
}

function IconContact({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M21.5 6.5A2.5 2.5 0 0 0 19 4H5a2.5 2.5 0 0 0-2.5 2.5v.7l9.1 6.4a.8.8 0 0 0 .8 0L21.5 7.2v-.7z" />
      <path d="M2 9.2v8.3A2.5 2.5 0 0 0 4.5 20h15a2.5 2.5 0 0 0 2.5-2.5V9.2l-8.7 6.1a2 2 0 0 1-2.6 0L2 9.2z" />
    </svg>
  );
}

const TABS = [
  { id: 'accueil', to: '/', icon: IconAccueil, label: 'Accueil' },
  { id: 'sons', to: '/sons', icon: IconSons, label: 'Sons' },
  { id: 'options', to: '/options', icon: IconOptions, label: 'Options' },
  { id: 'contact', to: '/contact', icon: IconContact, label: 'Contact' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const navInnerRef = useRef(null);
  const pillRef = useRef(null);

  // Determine active index from current URL
  const getActiveIndex = useCallback(() => {
    if (location.pathname === '/') return 0;
    if (location.pathname.startsWith('/sons')) return 1;
    if (location.pathname.startsWith('/options')) return 2;
    if (location.pathname.startsWith('/contact')) return 3;
    return 0;
  }, [location.pathname]);

  const activeIndex = getActiveIndex();
  const [isPressed, setIsPressed] = useState(false);
  const [dragCandidateIndex, setDragCandidateIndex] = useState(activeIndex);
  const tabRefs = useRef([]);
  const tabsGeometryRef = useRef([]);

  // iOS Style Tab History: Remember deep links per tab!
  const tabHistoryRef = useRef({});
  useEffect(() => {
    tabHistoryRef.current[activeIndex] = location.pathname;
  }, [location.pathname, activeIndex]);

  // Cache tab geometry to prevent forced synchronous reflows during 60/120fps drag & slide
  const measureTabs = useCallback(() => {
    if (!navInnerRef.current) return [];

    const geometries = tabRefs.current.map((el, idx) => {
      if (el && el.offsetWidth > 0) {
        return {
          targetX: el.offsetLeft,
          pillW: el.offsetWidth,
          center: el.offsetLeft + el.offsetWidth / 2,
        };
      }
      // Pure symmetric fallback
      const padding = 3;
      const navWidth = navInnerRef.current.clientWidth || 378;
      const colWidth = (navWidth - padding * 2) / 4;
      const targetX = padding + idx * colWidth;
      return {
        targetX,
        pillW: colWidth,
        center: targetX + colWidth / 2,
      };
    });

    tabsGeometryRef.current = geometries;
    return geometries;
  }, []);

  const getPillGeometry = useCallback((targetIndex) => {
    if (tabsGeometryRef.current[targetIndex]) {
      return tabsGeometryRef.current[targetIndex];
    }
    const measured = measureTabs();
    return measured[targetIndex] || { targetX: 3, pillW: 90, center: 48 };
  }, [measureTabs]);

  // Store mutable drag data in ref for zero-latency 60/120fps tracking
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startPillX: 0,
    currentPillX: 0,
    pillWidth: 0,
    minX: 3,
    maxX: 280,
    hasMoved: false,
    initialIndex: activeIndex,
    lastCandidate: activeIndex,
    lastX: 0,
    lastTime: 0,
  });

  // Glide pill smoothly to a tab index (NO POP: continuous GPU translation)
  const glidePillToIndex = useCallback((targetIndex, animated = true) => {
    if (!pillRef.current) return;
    const { pillW, targetX } = getPillGeometry(targetIndex);
    if (!pillW) return;

    dragRef.current.currentPillX = targetX;
    dragRef.current.pillWidth = pillW;

    // Direct DOM width update to avoid React re-render during animations
    pillRef.current.style.width = `${pillW}px`;

    if (animated) {
      pillRef.current.style.transition =
        'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      pillRef.current.style.transition = 'none';
    }
    pillRef.current.style.transform = `translate3d(${targetX}px, 0, 0) scale(1, 1)`;
  }, [getPillGeometry]);

  // When activeIndex changes (navigation, route change, click), smoothly glide to the new tab!
  useEffect(() => {
    measureTabs();
    glidePillToIndex(activeIndex, true);
    setDragCandidateIndex(activeIndex);
  }, [activeIndex, glidePillToIndex, measureTabs]);

  // Window resize handler
  useEffect(() => {
    const onResize = () => {
      measureTabs();
      glidePillToIndex(activeIndex, false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeIndex, glidePillToIndex, measureTabs]);

  // Pointer Down (Press to inflate & prepare drag)
  const handlePointerDown = (e) => {
    if (!navInnerRef.current) return;
    const rect = navInnerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    const geometries = tabsGeometryRef.current.length > 0 ? tabsGeometryRef.current : measureTabs();

    // Detect clicked tab by closest center (cached, no DOM reflow!)
    let clickedIndex = 0;
    let minDistance = Infinity;
    geometries.forEach((geo, idx) => {
      const dist = Math.abs(clickX - geo.center);
      if (dist < minDistance) {
        minDistance = dist;
        clickedIndex = idx;
      }
    });

    const { pillW, targetX } = geometries[clickedIndex] || getPillGeometry(clickedIndex);
    const minX = geometries[0]?.targetX ?? 3;
    const maxX = geometries[geometries.length - 1]?.targetX ?? targetX;

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startPillX: targetX,
      currentPillX: targetX,
      pillWidth: pillW,
      minX,
      maxX,
      hasMoved: false,
      initialIndex: clickedIndex,
      lastCandidate: clickedIndex,
      lastX: e.clientX,
      lastTime: performance.now(),
    };

    setIsPressed(true);
    setDragCandidateIndex(clickedIndex);
    e.currentTarget.setPointerCapture(e.pointerId);

    // Inflate pill on press with a slower, buttery ease and glide to target tab immediately
    if (pillRef.current) {
      pillRef.current.style.width = `${pillW}px`;
      pillRef.current.style.transition =
        'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
      pillRef.current.style.transform = `translate3d(${targetX}px, 0, 0) scale(1.24, 1.24)`;
    }

    // Bar expands subtly and independently at its origin (separated X and Y)
    if (navInnerRef.current) {
      navInnerRef.current.style.transformOrigin = 'center center';
      navInnerRef.current.style.transition =
        'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
      navInnerRef.current.style.transform = 'translateX(0px) translateY(0px) scaleX(1.008) scaleY(1.004)';
    }
  };

  // Pointer Move (Bar stretches elastically + softened vertical squash only on edges)
  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging || !pillRef.current) return;

    const deltaX = e.clientX - dragRef.current.startX;
    if (!dragRef.current.hasMoved) {
      if (Math.abs(deltaX) > 5) {
        dragRef.current.hasMoved = true;
      } else {
        return; // Don't interrupt the transition if pointer barely moved (jitter)
      }
    }

    const { startPillX, minX, maxX, pillWidth: currentPillW } = dragRef.current;
    const rawTargetX = startPillX + deltaX;

    let clampedX = rawTargetX;

    // 1. Directional Bar Stretch: anchors opposite side with subtle, gentle flex
    if (navInnerRef.current) {
      navInnerRef.current.style.transformOrigin = deltaX >= 0 ? 'left center' : 'right center';
      navInnerRef.current.style.transition = 'none';

      // Softened X translation and subtle stretch
      const navTranslateX = deltaX >= 0 ? Math.min(0.8, deltaX * 0.008) : Math.max(-0.8, deltaX * 0.008);
      const stretchAmount = Math.min(0.012, Math.abs(deltaX) * 0.00010);
      const navScaleX = 1.008 + stretchAmount;
      const navScaleY = 1.004;

      navInnerRef.current.style.transform = `translateX(${navTranslateX.toFixed(2)}px) translateY(0px) scaleX(${navScaleX.toFixed(4)}) scaleY(${navScaleY.toFixed(4)})`;
    }

    // 2. Pill Stretch & Softened Vertical Squash on Borders
    let scaleX = 1.24;
    let scaleY = 1.24;

    if (rawTargetX < minX) {
      clampedX = minX;
      const overflow = minX - rawTargetX;
      const squashRatio = Math.min(0.06, overflow / 300);
      scaleX = Math.max(1.18, 1.24 - squashRatio * 0.5);
      scaleY = 1.24 + squashRatio * 0.6;
    } else if (rawTargetX > maxX) {
      clampedX = maxX;
      const overflow = rawTargetX - maxX;
      const squashRatio = Math.min(0.06, overflow / 300);
      scaleX = Math.max(1.18, 1.24 - squashRatio * 0.5);
      scaleY = 1.24 + squashRatio * 0.6;
    }

    dragRef.current.currentPillX = clampedX;

    // Direct GPU transform update on the pill: ZERO reflow, 120fps fluid!
    pillRef.current.style.transition = 'none';
    pillRef.current.style.transform = `translate3d(${clampedX}px, 0, 0) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;

    // Detect candidate tab underneath by cached center distance
    const pillCenter = clampedX + currentPillW / 2;
    let candidate = 0;
    let minDist = Infinity;
    tabsGeometryRef.current.forEach((geo, idx) => {
      const dist = Math.abs(pillCenter - geo.center);
      if (dist < minDist) {
        minDist = dist;
        candidate = idx;
      }
    });

    // Only update React state when candidate index actually changes
    if (dragRef.current.lastCandidate !== candidate) {
      dragRef.current.lastCandidate = candidate;
      setDragCandidateIndex(candidate);
    }
  };

  // Pointer Up (Drop to snap & navigate, or simple click)
  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return;

    const { currentPillX, hasMoved, initialIndex, pillWidth: currentPillW } = dragRef.current;
    dragRef.current.isDragging = false;
    setIsPressed(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    // Release bar with organic spring return
    if (navInnerRef.current) {
      navInnerRef.current.style.transformOrigin = 'center center';
      navInnerRef.current.style.transition =
        'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.32s ease';
      navInnerRef.current.style.transform = 'translateX(0px) translateY(0px) scaleX(1) scaleY(1)';
    }

    // Determine target index:
    let targetIndex = initialIndex;
    if (hasMoved) {
      const pillCenter = currentPillX + currentPillW / 2;
      let minDist = Infinity;
      tabsGeometryRef.current.forEach((geo, idx) => {
        const dist = Math.abs(pillCenter - geo.center);
        if (dist < minDist) {
          minDist = dist;
          targetIndex = idx;
        }
      });
    }

    setDragCandidateIndex(targetIndex);

    // Smoothly glide pill to target position with spring transition
    glidePillToIndex(targetIndex, true);

    // Navigate to target if different or pop to root if same!
    if (TABS[targetIndex]) {
      if (targetIndex !== activeIndex) {
        // Restore previous deep route for this tab, or go to its root
        const targetPath = tabHistoryRef.current[targetIndex] || TABS[targetIndex].to;
        navigate(targetPath);
      } else {
        // iOS pop-to-root: if we click the active tab, we go back to its root
        if (location.pathname !== TABS[targetIndex].to) {
          navigate(TABS[targetIndex].to);
        }
      }
    }
  };

  const handlePointerCancel = () => {
    dragRef.current.isDragging = false;
    setIsPressed(false);
    if (navInnerRef.current) {
      navInnerRef.current.style.transformOrigin = 'center center';
      navInnerRef.current.style.transition =
        'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)';
      navInnerRef.current.style.transform = 'translateX(0px) translateY(0px) scaleX(1) scaleY(1)';
    }
    glidePillToIndex(activeIndex, true);
    setDragCandidateIndex(activeIndex);
  };

  return (
    <nav className="bottom-nav" id="main-navigation" aria-label="Navigation principale">
      <div
        className={`bottom-nav__inner ${isPressed ? 'bottom-nav__inner--pressed' : ''}`}
        ref={navInnerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* Dynamic Draggable Liquid Glass Pill */}
        <div
          ref={pillRef}
          className={`bottom-nav__liquid-pill ${isPressed ? 'bottom-nav__liquid-pill--pressed' : ''}`}
          aria-hidden="true"
        />

        {/* Tab Items */}
        {TABS.map((tab, idx) => {
          const isHighlighted = isPressed ? idx === dragCandidateIndex : idx === activeIndex;
          const isItemPressed = isPressed && idx === dragCandidateIndex;

          return (
            <div
              key={tab.id}
              ref={(el) => (tabRefs.current[idx] = el)}
              className={`bottom-nav__item ${isHighlighted ? 'bottom-nav__item--active' : ''} ${isItemPressed ? 'bottom-nav__item--pressed' : ''}`}
              id={`nav-${tab.id}`}
              role="button"
              tabIndex={0}
              aria-label={tab.label}
              aria-current={idx === activeIndex ? 'page' : undefined}
            >
              <div className="bottom-nav__icon-wrapper">
                <tab.icon size={26} />
              </div>
              <span className="bottom-nav__label">{tab.label}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

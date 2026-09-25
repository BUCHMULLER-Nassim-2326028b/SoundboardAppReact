import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import HomePage from '../../pages/HomePage';
import SoundsPage from '../../pages/SoundsPage';
import SoundListPage from '../../pages/SoundListPage';
import OptionsPage from '../../pages/OptionsPage';
import ContactPage from '../../pages/ContactPage';
import { useState, useEffect, useRef } from 'react';

const tabVariants = {
  initial: { opacity: 1 },
  out: { opacity: 0, transition: { duration: 0 } },
};

/* Ultra-Snappy Transitions */
const deepVariants = {
  initial: (isTabSwitch) => isTabSwitch ? { opacity: 1, x: 0 } : { x: '100%' },
  in: (isTabSwitch) => isTabSwitch
    ? { x: 0, opacity: 1, transition: { duration: 0 } }
    : { x: 0, transition: { type: 'spring', damping: 28, stiffness: 350, mass: 0.5 } },
  out: (isTabSwitch) => isTabSwitch
    ? { opacity: 0, x: 0, transition: { duration: 0 } }
    : { x: '100%', transition: { type: 'spring', damping: 28, stiffness: 350, mass: 0.5 } },
};

function TabPage({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={tabVariants}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
    </motion.div>
  );
}

import { usePresence, animate, useMotionValue } from 'framer-motion';

function DeepPage({ children, isTabSwitch, tabBase }) {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const [isPresent, safeToRemove] = usePresence();
  const x = useMotionValue(window.innerWidth);

  useEffect(() => {
    if (isPresent) {
      // Animate In
      animate(x, 0, { type: 'spring', damping: 28, stiffness: 350, mass: 0.5 });
    } else {
      // Animate Out
      animate(x, window.innerWidth, { 
        type: 'spring', 
        damping: 28, 
        stiffness: 350, 
        mass: 0.5,
        velocity: x.getVelocity(), // Perfect momentum inheritance!
        onComplete: safeToRemove // Tell AnimatePresence it's done
      });
    }
  }, [isPresent, safeToRemove, x]);

  const startDrag = (event) => {
    if (event.clientX <= 45) {
      dragControls.start(event);
    }
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = window.innerWidth * 0.50;
    
    if (info.offset.x > swipeThreshold || info.velocity.x > 1200) {
      // Trigger navigation, which sets isDeepPage=false and triggers usePresence exit
      navigate(tabBase || '/');
    } else {
      // Snap back if threshold not met
      animate(x, 0, { type: 'spring', bounceDamping: 60, bounceStiffness: 600 });
    }
  };

  return (
    <motion.div
      style={{
        x,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'rgba(1, 12, 34, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        paddingTop: 'max(1.5rem, env(safe-area-inset-top, 2rem))',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1rem))',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
      }}
      drag="x"
      dragControls={dragControls}
      dragListener={false}
      onPointerDown={startDrag}
      dragConstraints={{ left: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export default function AnimatedRoutes() {
  const location = useLocation();

  const segments = location.pathname.split('/').filter(Boolean);
  const currentTabBase = segments.length > 0 ? `/${segments[0]}` : '/';

  const prevTabRef = useRef(currentTabBase);
  const isTabSwitch = prevTabRef.current !== currentTabBase;

  useEffect(() => {
    prevTabRef.current = currentTabBase;
  }, [currentTabBase]);

  const isDeepPage = segments.length > 1;
  const backgroundLocation = isDeepPage ? { ...location, pathname: currentTabBase } : location;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* LAYER 1: Main Tabs */}
      <AnimatePresence initial={false}>
        <Routes location={backgroundLocation} key={backgroundLocation.pathname}>
          <Route path="/" element={<TabPage><HomePage /></TabPage>} />
          <Route path="/sons" element={<TabPage><SoundsPage /></TabPage>} />
          <Route path="/options" element={<TabPage><OptionsPage /></TabPage>} />
          <Route path="/contact" element={<TabPage><ContactPage /></TabPage>} />
        </Routes>
      </AnimatePresence>

      {/* LAYER 2: Scalable Deep Pages */}
      <AnimatePresence custom={isTabSwitch}>
        {isDeepPage && (
          <Routes location={location} key="deep-routes">
            <Route path="/sons/:categoryId" element={<DeepPage isTabSwitch={isTabSwitch} tabBase={currentTabBase}><SoundListPage /></DeepPage>} />
          </Routes>
        )}
      </AnimatePresence>
    </div>
  );
}

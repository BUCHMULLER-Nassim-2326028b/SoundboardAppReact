import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from '../../pages/HomePage';
import SoundsPage from '../../pages/SoundsPage';
import SoundListPage from '../../pages/SoundListPage';
import OptionsPage from '../../pages/OptionsPage';
import ContactPage from '../../pages/ContactPage';

/* 
  iOS Tab Switching is instant. No fade, no slide. 
*/
const tabVariants = {
  initial: { opacity: 1 },
  in: { opacity: 1, transition: { duration: 0 } },
  out: { opacity: 0, transition: { duration: 0 } },
};

/* 
  iOS Deep Navigation slides from the right over the previous page.
  When going back, it slides out to the right.
*/
const deepVariants = {
  initial: (isTabSwitch) => isTabSwitch ? { opacity: 1, x: 0 } : { x: '100%', boxShadow: '-15px 0 30px rgba(0,0,0,0.4)' },
  in: (isTabSwitch) => isTabSwitch 
    ? { x: 0, opacity: 1, boxShadow: 'none', transition: { duration: 0 } }
    : { x: 0, boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', transition: { type: 'spring', damping: 26, stiffness: 220 } },
  out: (isTabSwitch) => isTabSwitch
    ? { opacity: 0, x: 0, transition: { duration: 0 } }
    : { x: '100%', boxShadow: '-15px 0 30px rgba(0,0,0,0.4)', transition: { type: 'spring', damping: 26, stiffness: 220 } },
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

function DeepPage({ children, isTabSwitch, tabBase }) {
  const navigate = useNavigate();

  const handleDragEnd = (event, info) => {
    const swipeThreshold = window.innerWidth / 2.5;
    if (info.offset.x > swipeThreshold || info.velocity.x > 400) {
      navigate(tabBase || '/');
    }
  };

  return (
    <motion.div
      custom={isTabSwitch}
      initial="initial"
      animate="in"
      exit="out"
      variants={deepVariants}
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
        zIndex: 10,
        // Frosted glass: hides text underneath but lets aurora shine through!
        background: 'rgba(1, 12, 34, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.8 }}
      dragSnapToOrigin={true}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

import { useState, useEffect, useRef } from 'react';

export default function AnimatedRoutes() {
  const location = useLocation();

  // 1. Dynamic Tab Base Extraction (Scalable)
  // Explode path into segments: "/sons/123" -> ["sons", "123"]
  const segments = location.pathname.split('/').filter(Boolean);
  
  // The tab base is always the first segment, or "/" if at root.
  const currentTabBase = segments.length > 0 ? `/${segments[0]}` : '/';
  
  const prevTabRef = useRef(currentTabBase);
  const isTabSwitch = prevTabRef.current !== currentTabBase;

  useEffect(() => {
    prevTabRef.current = currentTabBase;
  }, [currentTabBase]);

  // 2. Dynamic Depth Detection (Scalable)
  // Anything deeper than 1 segment is considered a deep page / overlay.
  const isDeepPage = segments.length > 1;
  
  // The location used for the main tabs. If we are deep, freeze it at the parent's root!
  const backgroundLocation = isDeepPage 
    ? { ...location, pathname: currentTabBase } 
    : location;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* LAYER 1: Main Tabs. Stays solidly mounted on the root tab! */}
      <AnimatePresence initial={false}>
        <Routes location={backgroundLocation} key={backgroundLocation.pathname}>
          <Route path="/" element={<TabPage><HomePage /></TabPage>} />
          <Route path="/sons" element={<TabPage><SoundsPage /></TabPage>} />
          <Route path="/options" element={<TabPage><OptionsPage /></TabPage>} />
          <Route path="/contact" element={<TabPage><ContactPage /></TabPage>} />
        </Routes>
      </AnimatePresence>

      {/* LAYER 2: Scalable Deep Pages. Add any deep route here! */}
      <AnimatePresence custom={isTabSwitch}>
        {isDeepPage && (
          <Routes location={location} key="deep-routes">
            {/* Any route with multiple segments goes here */}
            <Route path="/sons/:categoryId" element={<DeepPage isTabSwitch={isTabSwitch} tabBase={currentTabBase}><SoundListPage /></DeepPage>} />
          </Routes>
        )}
      </AnimatePresence>
    </div>
  );
}

import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { usePresence, animate, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

import HomePage from '../../pages/HomePage';
import SoundsPage from '../../pages/SoundsPage';
import OptionsPage from '../../pages/OptionsPage';
import ContactPage from '../../pages/ContactPage';

// --- ROBUST SCALABLE SLIDE LOGIC ---
let globalPrevPath = null;
let globalCurrentPath = null;

// Tab wrapper strictly for restoring full-screen scroll layout AND providing native savestates
export function NativeTab({ children, isActive }) {
  return (
    <div
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
        // Native Savestate Logic: Hide visually and block interactions when inactive, but NEVER unmount the DOM!
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

export function DeepPage({ children, tabBase }) {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const [isPresent, safeToRemove] = usePresence();
  const x = useMotionValue(window.innerWidth);

  // Freeze the "wasInternal" check for this specific component mount
  const wasInternalRef = useRef(null);
  if (wasInternalRef.current === null) {
    // If the global tracker saw us coming from the same tabBase, it's an internal slide
    wasInternalRef.current = globalPrevPath ? globalPrevPath.startsWith(tabBase) : false;
  }

  useEffect(() => {
    if (isPresent) {
      if (wasInternalRef.current) {
        // Internal navigation (drill-down): play the slide animation
        animate(x, 0, { type: 'spring', damping: 40, stiffness: 500, mass: 0.5 });
      } else {
        // External navigation (tab switch / restore): instant mount!
        x.set(0);
      }
    } else {
      animate(x, window.innerWidth, { 
        type: 'spring', 
        damping: 40, 
        stiffness: 500, 
        mass: 0.5,
        velocity: x.getVelocity(),
        onComplete: safeToRemove
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
      navigate(tabBase || '/');
    } else {
      animate(x, 0, { type: 'spring', damping: 50, stiffness: 600, mass: 0.5 });
    }
  };

  return (
    <div 
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <motion.div
        style={{
          x,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
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
    </div>
  );
}

export default function AnimatedRoutes() {
  const location = useLocation();

  // ALways-mounted route tracker to keep 100% accurate global history
  if (globalCurrentPath !== location.pathname) {
    globalPrevPath = globalCurrentPath;
    globalCurrentPath = location.pathname;
  }
  
  // Extract the base path of the current tab (e.g., "/sons" from "/sons/123")
  const segments = location.pathname.split('/').filter(Boolean);
  const currentTabBase = segments.length > 0 ? `/${segments[0]}` : '/';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 
        TRUE NATIVE IOS ARCHITECTURE (Savestates)
        Instead of unmounting pages on tab switch, we permanently mount all 4 tabs.
        We only toggle their visibility based on the active route.
        This preserves scroll position, component state, and absolutely guarantees 0 frames of flash.
      */}
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

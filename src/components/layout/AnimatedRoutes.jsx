import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { usePresence, animate, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

import HomePage from '../../pages/HomePage';
import SoundsPage from '../../pages/SoundsPage';
import OptionsPage from '../../pages/OptionsPage';
import ContactPage from '../../pages/ContactPage';

export function DeepPage({ children, tabBase }) {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const [isPresent, safeToRemove] = usePresence();
  const x = useMotionValue(window.innerWidth);

  useEffect(() => {
    if (isPresent) {
      animate(x, 0, { type: 'spring', damping: 40, stiffness: 500, mass: 0.5 });
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 
        Native routing: Tabs are standard Routes. 
        When switching tabs, React synchronously unmounts the old tab and mounts the new one.
        This completely eliminates 1-frame flash bugs since there are no cross-fade states.
      */}
      <Routes location={location} key="main-routes">
        <Route path="/*" element={<HomePage />} />
        <Route path="/sons/*" element={<SoundsPage />} />
        <Route path="/options/*" element={<OptionsPage />} />
        <Route path="/contact/*" element={<ContactPage />} />
      </Routes>
    </div>
  );
}

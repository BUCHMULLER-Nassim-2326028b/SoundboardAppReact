import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from '../../pages/HomePage';
import SoundsPage from '../../pages/SoundsPage';
import SoundListPage from '../../pages/SoundListPage';
import OptionsPage from '../../pages/OptionsPage';
import ContactPage from '../../pages/ContactPage';

/* 
  iOS Tab Switching is generally instant or a crossfade. 
  It DOES NOT slide. 
*/
const tabVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.15 } },
  out: { opacity: 0, transition: { duration: 0.15 } },
};

/* 
  iOS Deep Navigation slides from the right over the previous page.
  When going back, it slides out to the right.
*/
const deepVariants = {
  initial: { x: '100%', boxShadow: '-15px 0 30px rgba(0,0,0,0.4)' },
  in: { x: 0, boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', transition: { type: 'spring', damping: 26, stiffness: 220 } },
  out: { x: '100%', boxShadow: '-15px 0 30px rgba(0,0,0,0.4)', transition: { type: 'spring', damping: 26, stiffness: 220 } },
};

function TabPage({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={tabVariants}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0 }}
    >
      {children}
    </motion.div>
  );
}

function DeepPage({ children }) {
  const navigate = useNavigate();

  const handleDragEnd = (event, info) => {
    const swipeThreshold = window.innerWidth / 2.5; // Dragged more than ~40% of screen
    // If swiped far enough, or swiped fast enough to the right
    if (info.offset.x > swipeThreshold || info.velocity.x > 400) {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={deepVariants}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0, zIndex: 10, background: '#010c22' }}
      // iOS Swipe-to-go-back gesture
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.8 }} // Hard stop on left, stretchy on right
      dragSnapToOrigin={true} // Snaps back if threshold not met
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Main Tabs */}
          <Route path="/" element={<TabPage><HomePage /></TabPage>} />
          <Route path="/sons" element={<TabPage><SoundsPage /></TabPage>} />
          <Route path="/options" element={<TabPage><OptionsPage /></TabPage>} />
          <Route path="/contact" element={<TabPage><ContactPage /></TabPage>} />
          
          {/* Deep Pages */}
          <Route path="/sons/:categoryId" element={<DeepPage><SoundListPage /></DeepPage>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

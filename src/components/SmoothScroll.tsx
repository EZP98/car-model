import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Disable smooth scroll on mobile devices (touch-only devices)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      // Skip smooth scroll on mobile
      return;
    }

    // Initialize Lenis on desktop (now works with proximity snap)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Store lenis instance globally for access from other components
    (window as any).lenis = lenis;

    // RAF loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  // Force scroll to top when location changes
  useEffect(() => {
    const scrollToTop = () => {
      // Reset native scroll
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Reset Lenis scroll if available
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true, lock: true });
      }
    };

    // Execute immediately
    scrollToTop();

    // Also execute after a small delay to ensure DOM is ready
    const timers = [
      setTimeout(scrollToTop, 0),
      setTimeout(scrollToTop, 50),
      setTimeout(scrollToTop, 100)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [location.pathname]);

  return <>{children}</>;
};

export default SmoothScroll;

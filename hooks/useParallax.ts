import { useState, useEffect, useCallback } from 'react';

interface ParallaxOffset {
  x: number;
  y: number;
}

export function useParallax(intensity: number = 1) {
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check system reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -1 to 1 based on viewport center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = ((e.clientX - centerX) / centerX) * intensity;
      targetY = ((e.clientY - centerY) / centerY) * intensity;
    };

    // Smooth lerp for buttery organic floating feel
    const loop = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      setOffset({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, prefersReducedMotion]);

  return { offset, prefersReducedMotion };
}

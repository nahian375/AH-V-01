import React, { useEffect, useRef, useState } from 'react';

export type PerformanceTier = 'high' | 'medium' | 'low';

interface StarLayer1 {
  // Deepest background: microscopic, dim, static, high density
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: string;
}

interface StarLayer2 {
  // Deep space: small, medium distance, gentle parallax
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  color: string;
  driftVx: number;
  driftVy: number;
}

interface StarLayer3 {
  // Midground: slightly brighter anchor points
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  color: string;
  hasBreathe: boolean;
  breatheSpeed: number;
  breatheOffset: number;
}

interface ForegroundDust {
  // Layer 4: foreground micro-motes
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

interface DistantBody {
  id: string;
  relX: number;
  relY: number;
  radius: number;
  driftSpeed: number;
  driftAngle: number;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, time: number) => void;
}

interface SpaceEnvironmentProps {
  isGlobalVideoActive?: boolean;
  parallaxOffset?: { x: number; y: number };
  className?: string;
}

/**
 * ASTRA Deep-Space Multi-Layer Environment
 * Physical Astronomical Depth:
 * - Layer 1: Deepest distant stars (microscopic pinpricks 0.25-0.5px, dim, high density)
 * - Layer 2: Deep space stars (0.55-0.85px, natural astronomical distribution)
 * - Layer 3: Midground field (0.85-1.2px, quiet anchor beacons, tiny celestial bodies)
 * - Layer 4: Foreground cosmic micro-dust (few, slow, imperceptible motes)
 * - Layer-indexed inverse parallax: Applied per layer index creating genuine spacecraft-window depth.
 * - Earth Occlusion: Stars naturally pass behind Earth and are physically occluded by Earth's solid disk.
 */
export const SpaceEnvironment: React.FC<SpaceEnvironmentProps> = ({
  isGlobalVideoActive = true,
  parallaxOffset,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dustCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mouse & Parallax state (damped for photographic realism)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const externalParallaxRef = useRef(parallaxOffset || { x: 0, y: 0 });

  useEffect(() => {
    if (parallaxOffset) {
      externalParallaxRef.current = parallaxOffset;
    }
  }, [parallaxOffset]);

  // Performance tier and reduced motion
  const [performanceTier, setPerformanceTier] = useState<PerformanceTier>('high');
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    const checkPerformance = () => {
      const width = window.innerWidth;
      const cores = navigator.hardwareConcurrency || 4;
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        width < 768;

      if (isMobile || cores <= 2) {
        setPerformanceTier('low');
      } else if (width < 1200 || cores <= 4) {
        setPerformanceTier('medium');
      } else {
        setPerformanceTier('high');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    checkPerformance();
    window.addEventListener('resize', checkPerformance);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkPerformance);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // ============================================================
    // 0. FAINT COSMIC DUST HAZE (Offscreen Canvas Cache)
    // Very subtle, deep navy / slate haze in astronomical voids
    // ============================================================
    if (!dustCanvasRef.current) {
      dustCanvasRef.current = document.createElement('canvas');
    }
    const dustCanvas = dustCanvasRef.current;
    const dustCtx = dustCanvas.getContext('2d');

    const generateCosmicDustCache = (w: number, h: number) => {
      dustCanvas.width = w;
      dustCanvas.height = h;
      if (!dustCtx) return;

      dustCtx.clearRect(0, 0, w, h);

      // Deep space void haze in upper quadrant (low opacity 0.04-0.06)
      const g1 = dustCtx.createRadialGradient(w * 0.2, h * 0.25, 10, w * 0.25, h * 0.28, w * 0.45);
      g1.addColorStop(0, 'rgba(6, 18, 38, 0.06)');
      g1.addColorStop(0.6, 'rgba(3, 10, 24, 0.025)');
      g1.addColorStop(1, 'rgba(1, 3, 10, 0)');
      dustCtx.fillStyle = g1;
      dustCtx.fillRect(0, 0, w, h);

      // Midnight indigo haze across right periphery
      const g2 = dustCtx.createRadialGradient(w * 0.82, h * 0.35, 10, w * 0.8, h * 0.4, w * 0.4);
      g2.addColorStop(0, 'rgba(10, 12, 32, 0.05)');
      g2.addColorStop(0.7, 'rgba(4, 8, 22, 0.02)');
      g2.addColorStop(1, 'rgba(1, 3, 10, 0)');
      dustCtx.fillStyle = g2;
      dustCtx.fillRect(0, 0, w, h);
    };

    generateCosmicDustCache(width, height);

    // Astronomical star palette: predominantly neutral white & faint cool white
    const palette = [
      '#ffffff',
      '#ffffff',
      '#f8fafc',
      '#f1f5f9',
      '#fffdfa',
    ];

    // ============================================================
    // 1. LAYER 1: DEEPEST BACKGROUND STARS
    // Very distant, microscopic (0.25-0.5px), dim (0.08-0.22), high density
    // Concentrated behind and around the Earth with natural clustering
    // ============================================================
    const layer1Count = performanceTier === 'high' ? 320 : performanceTier === 'medium' ? 190 : 110;
    const layer1Stars: StarLayer1[] = [];

    for (let i = 0; i < layer1Count; i++) {
      let x = 0;
      let y = 0;

      if (i < layer1Count * 0.45) {
        // Stellar band passing behind center/Earth region
        const t = Math.random();
        const spread = (Math.random() - 0.5) * height * 0.7;
        x = t * width;
        y = height * 0.5 + (t - 0.5) * (height * 0.4) + spread;
      } else {
        // Deep space distribution with natural dark void pockets
        x = Math.random() * width;
        y = Math.random() * height;
      }

      layer1Stars.push({
        x,
        y,
        size: 0.25 + Math.random() * 0.3,
        alpha: 0.08 + Math.random() * 0.16,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    // ============================================================
    // 2. LAYER 2: DEEP SPACE STARS
    // Medium distance (0.55-0.85px), alpha 0.22-0.42, gentle parallax
    // ============================================================
    const layer2Count = performanceTier === 'high' ? 140 : performanceTier === 'medium' ? 85 : 50;
    const layer2Stars: StarLayer2[] = [];

    for (let i = 0; i < layer2Count; i++) {
      layer2Stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.25 + Math.random() * 0.35,
        size: 0.55 + Math.random() * 0.3,
        alpha: 0.22 + Math.random() * 0.2,
        color: palette[Math.floor(Math.random() * palette.length)],
        driftVx: (Math.random() - 0.5) * 0.015,
        driftVy: (Math.random() - 0.5) * 0.01,
      });
    }

    // ============================================================
    // 3. LAYER 3: MIDGROUND CELESTIAL FIELD
    // Low density anchor beacons (0.85-1.2px), alpha 0.45-0.70
    // ============================================================
    const layer3Count = performanceTier === 'high' ? 38 : performanceTier === 'medium' ? 24 : 14;
    const layer3Stars: StarLayer3[] = [];

    for (let i = 0; i < layer3Count; i++) {
      const hasBreathe = Math.random() > 0.65;
      layer3Stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.65 + Math.random() * 0.3,
        size: 0.85 + Math.random() * 0.35,
        baseAlpha: 0.45 + Math.random() * 0.25,
        color: palette[Math.floor(Math.random() * palette.length)],
        hasBreathe,
        breatheSpeed: 0.2 + Math.random() * 0.4,
        breatheOffset: Math.random() * Math.PI * 2,
      });
    }

    // ============================================================
    // 4. LAYER 4: FOREGROUND MICRO-PARTICLES
    // Very few (8-12), imperceptible motes drifting calmly
    // ============================================================
    const dustCount = performanceTier === 'high' ? 10 : performanceTier === 'medium' ? 6 : 3;
    const foregroundDust: ForegroundDust[] = [];

    for (let i = 0; i < dustCount; i++) {
      foregroundDust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.35) * 0.05,
        vy: (Math.random() - 0.5) * 0.03,
        size: 0.4 + Math.random() * 0.35,
        alpha: 0.06 + Math.random() * 0.08,
      });
    }

    // ============================================================
    // 5. DISTANT CELESTIAL BODIES (Fewer, Better, Truly Distant)
    // 3 small astronomical bodies in safe peripheral voids
    // ============================================================
    const distantBodies: DistantBody[] = [
      // 1. Distant Arid/Mars Analog in Upper-Left Void
      {
        id: 'ares_distant',
        relX: 0.14,
        relY: 0.20,
        radius: 3.5,
        driftSpeed: 0.00006,
        driftAngle: 0.3,
        draw: (c, x, y, r) => {
          const globe = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 0.4, x, y, r);
          globe.addColorStop(0, '#c2410c');
          globe.addColorStop(0.35, '#7c2d12');
          globe.addColorStop(0.75, '#1e0d07');
          globe.addColorStop(1, '#050201');
          c.fillStyle = globe;
          c.beginPath();
          c.arc(x, y, r, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = 'rgba(1, 3, 10, 0.85)';
          c.beginPath();
          c.arc(x, y, r + 0.4, -Math.PI * 0.3, Math.PI * 0.7, false);
          c.fill();

          c.strokeStyle = 'rgba(194, 65, 12, 0.12)';
          c.lineWidth = 0.5;
          c.beginPath();
          c.arc(x, y, r + 0.3, -Math.PI * 0.8, -Math.PI * 0.1);
          c.stroke();
        },
      },

      // 2. Distant Jovian Gas Giant in Upper-Right Periphery
      {
        id: 'jovian_distant',
        relX: 0.86,
        relY: 0.16,
        radius: 5.0,
        driftSpeed: 0.00004,
        driftAngle: 0.7,
        draw: (c, x, y, r) => {
          const globe = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 0.6, x, y, r);
          globe.addColorStop(0, '#7dd3fc');
          globe.addColorStop(0.3, '#0284c7');
          globe.addColorStop(0.7, '#082f49');
          globe.addColorStop(1, '#020617');
          c.fillStyle = globe;
          c.beginPath();
          c.arc(x, y, r, 0, Math.PI * 2);
          c.fill();

          c.strokeStyle = 'rgba(224, 242, 254, 0.12)';
          c.lineWidth = 0.7;
          c.beginPath();
          c.ellipse(x, y - r * 0.15, r * 0.9, r * 0.25, -0.15, 0, Math.PI);
          c.stroke();

          c.fillStyle = 'rgba(1, 3, 10, 0.82)';
          c.beginPath();
          c.arc(x, y, r + 0.4, -Math.PI * 0.2, Math.PI * 0.8, false);
          c.fill();
        },
      },

      // 3. Tiny Cold Moonlet in Lower-Right Edge
      {
        id: 'cryo_moonlet',
        relX: 0.91,
        relY: 0.84,
        radius: 2.0,
        driftSpeed: 0.00005,
        driftAngle: 1.5,
        draw: (c, x, y, r) => {
          const globe = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 0.2, x, y, r);
          globe.addColorStop(0, '#f1f5f9');
          globe.addColorStop(0.4, '#64748b');
          globe.addColorStop(1, '#020617');
          c.fillStyle = globe;
          c.beginPath();
          c.arc(x, y, r, 0, Math.PI * 2);
          c.fill();
        },
      },
    ];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      generateCosmicDustCache(width, height);
    };

    window.addEventListener('resize', handleResize);

    // ============================================================
    // 6. ASTRONOMICAL MULTI-LAYER RENDER LOOP
    // ============================================================
    const render = (currentTime: number) => {
      // Use the inverse parallax offset passed from LiveSpaceBackground
      const pX = prefersReducedMotionRef.current ? 0 : (externalParallaxRef.current.x || 0);
      const pY = prefersReducedMotionRef.current ? 0 : (externalParallaxRef.current.y || 0);

      ctx.clearRect(0, 0, width, height);

      // Calculate Earth geometry for realistic physical occlusion
      const cx = width / 2;
      const cy = height / 2;
      const earthRadius = Math.min(width, height) * 0.28;
      const innerOcclusionRadius = earthRadius * 0.97;
      const outerAtmosphereRadius = earthRadius * 1.08;

      const getEarthOcclusionAlpha = (px: number, py: number) => {
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.hypot(dx, dy);

        if (dist <= innerOcclusionRadius) {
          return 0;
        }
        if (dist >= outerAtmosphereRadius) {
          return 1;
        }
        return (dist - innerOcclusionRadius) / (outerAtmosphereRadius - innerOcclusionRadius);
      };

      // ------------------------------------------------------------
      // LAYER 0: Deep Faint Cosmic Dust Veil (Behind Stars)
      // Layer Index 0: Inverse factor -1.5x
      // ------------------------------------------------------------
      if (dustCanvas) {
        const nebParallaxX = -pX * 1.5;
        const nebParallaxY = -pY * 1.5;
        ctx.drawImage(dustCanvas, nebParallaxX, nebParallaxY);
      }

      // ------------------------------------------------------------
      // LAYER 1: Deepest Background Stars (Microscopic, Dim, Static)
      // Layer Index 1: Inverse transform -2.0x
      // ------------------------------------------------------------
      const l1InvX = -pX * 2.0;
      const l1InvY = -pY * 2.0;
      for (let i = 0; i < layer1Stars.length; i++) {
        const star = layer1Stars[i];
        const px = star.x + l1InvX;
        const py = star.y + l1InvY;

        const occlusion = getEarthOcclusionAlpha(px, py);
        if (occlusion <= 0.01) continue;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha * occlusion;
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ------------------------------------------------------------
      // LAYER 2: Deep Space Stars (Medium distance, subtle drift)
      // Layer Index 2: Inverse transform -4.5x * z
      // ------------------------------------------------------------
      for (let i = 0; i < layer2Stars.length; i++) {
        const star = layer2Stars[i];

        if (!prefersReducedMotionRef.current) {
          star.x += star.driftVx;
          star.y += star.driftVy;
          if (star.x < -10) star.x = width + 10;
          if (star.x > width + 10) star.x = -10;
          if (star.y < -10) star.y = height + 10;
          if (star.y > height + 10) star.y = -10;
        }

        const px = star.x - pX * (star.z * 4.5);
        const py = star.y - pY * (star.z * 4.5);

        const occlusion = getEarthOcclusionAlpha(px, py);
        if (occlusion <= 0.01) continue;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha * occlusion;
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ------------------------------------------------------------
      // LAYER 3: Midground Celestial Field (Anchor Stars + Distant Bodies)
      // Layer Index 3: Inverse transform -8.0x * z
      // ------------------------------------------------------------
      for (let i = 0; i < layer3Stars.length; i++) {
        const star = layer3Stars[i];
        const px = star.x - pX * (star.z * 8.0);
        const py = star.y - pY * (star.z * 8.0);

        const occlusion = getEarthOcclusionAlpha(px, py);
        if (occlusion <= 0.01) continue;

        let alpha = star.baseAlpha;
        if (star.hasBreathe && !prefersReducedMotionRef.current) {
          const breath = Math.sin(currentTime * 0.0006 * star.breatheSpeed + star.breatheOffset);
          alpha = Math.max(0.15, Math.min(0.85, star.baseAlpha + breath * 0.07));
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha * occlusion;
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant Celestial Bodies
      for (let i = 0; i < distantBodies.length; i++) {
        const body = distantBodies[i];
        const driftX = prefersReducedMotionRef.current
          ? 0
          : Math.cos(currentTime * body.driftSpeed + body.driftAngle) * 2.5;
        const driftY = prefersReducedMotionRef.current
          ? 0
          : Math.sin(currentTime * body.driftSpeed + body.driftAngle) * 1.5;

        const bx = body.relX * width + driftX - pX * 5.0;
        const by = body.relY * height + driftY - pY * 5.0;

        const occlusion = getEarthOcclusionAlpha(bx, by);
        if (occlusion <= 0.01) continue;

        ctx.globalAlpha = occlusion;
        body.draw(ctx, bx, by, body.radius, currentTime);
      }

      // ------------------------------------------------------------
      // LAYER 4: Foreground Cosmic Micro-Motes (Few, imperceptible)
      // Layer Index 4: Inverse transform -12.0x
      // ------------------------------------------------------------
      ctx.fillStyle = '#cbd5e1';
      for (let i = 0; i < foregroundDust.length; i++) {
        const mote = foregroundDust[i];
        if (!prefersReducedMotionRef.current) {
          mote.x += mote.vx;
          mote.y += mote.vy;
          if (mote.x < -10) mote.x = width + 10;
          if (mote.x > width + 10) mote.x = -10;
          if (mote.y < -10) mote.y = height + 10;
          if (mote.y > height + 10) mote.y = -10;
        }

        const dpx = mote.x - pX * 12.0;
        const dpy = mote.y - pY * 12.0;

        const occlusion = getEarthOcclusionAlpha(dpx, dpy);
        if (occlusion <= 0.01) continue;

        ctx.globalAlpha = mote.alpha * occlusion;
        ctx.beginPath();
        ctx.arc(dpx, dpy, mote.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ------------------------------------------------------------
      // FALLBACK EARTH RENDERING (Only if live video is inactive)
      // ------------------------------------------------------------
      if (!isGlobalVideoActive) {
        const atmoHalo = ctx.createRadialGradient(cx, cy, earthRadius * 0.96, cx, cy, earthRadius * 1.09);
        atmoHalo.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
        atmoHalo.addColorStop(0.5, 'rgba(14, 116, 144, 0.08)');
        atmoHalo.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = atmoHalo;
        ctx.beginPath();
        ctx.arc(cx, cy, earthRadius * 1.09, 0, Math.PI * 2);
        ctx.fill();

        const oceanGrad = ctx.createRadialGradient(
          cx - earthRadius * 0.4,
          cy - earthRadius * 0.3,
          earthRadius * 0.1,
          cx,
          cy,
          earthRadius
        );
        oceanGrad.addColorStop(0, '#0284c7');
        oceanGrad.addColorStop(0.4, '#0369a1');
        oceanGrad.addColorStop(0.8, '#0f172a');
        oceanGrad.addColorStop(1, '#020617');
        ctx.fillStyle = oceanGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
        ctx.clip();

        const rot = (currentTime * 0.00003) % (Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = earthRadius * 0.1;
        ctx.beginPath();
        ctx.ellipse(cx + Math.sin(rot) * 15, cy - earthRadius * 0.2, earthRadius * 0.85, earthRadius * 0.28, 0.1, 0, Math.PI);
        ctx.stroke();

        ctx.fillStyle = 'rgba(1, 3, 10, 0.88)';
        ctx.beginPath();
        ctx.arc(cx, cy, earthRadius + 1, -Math.PI * 0.5, Math.PI * 0.5, false);
        ctx.bezierCurveTo(cx - earthRadius * 0.35, cy + earthRadius * 0.7, cx - earthRadius * 0.35, cy - earthRadius * 0.7, cx, cy - earthRadius);
        ctx.fill();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
        ctx.beginPath();
        ctx.arc(cx + earthRadius * 0.25, cy - earthRadius * 0.15, 1.2, 0, Math.PI * 2);
        ctx.arc(cx + earthRadius * 0.32, cy + earthRadius * 0.05, 1.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [performanceTier, isGlobalVideoActive]);

  return (
    <div className={`space-environment-container fixed inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default SpaceEnvironment;

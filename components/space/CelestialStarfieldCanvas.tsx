import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  color: string;
  hasSpikes: boolean;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  decay: number;
  thickness: number;
}

export const CelestialStarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Astronomical star spectral classes (O/B blue, A/F white, G yellow, M red-orange)
    const spectralColors = [
      '#e0f2fe', // O/B: luminous blue-white
      '#f8fafc', // A: pure brilliant white
      '#ffffff', // F: diamond white
      '#fef08a', // G: solar warm yellow
      '#fed7aa', // K: pale orange
      '#fca5a5', // M: betelgeuse reddish-orange
    ];

    let stars: Star[] = [];
    const initStars = () => {
      stars = [];
      const count = Math.min(380, Math.floor((width * height) / 3800));
      for (let i = 0; i < count; i++) {
        const hasSpikes = i < 8; // Top 8 major navigational landmark stars have diffraction spikes
        const baseAlpha = hasSpikes ? 0.85 + Math.random() * 0.15 : 0.25 + Math.random() * 0.65;
        const color = hasSpikes 
          ? (i % 2 === 0 ? '#38bdf8' : '#ffffff') 
          : spectralColors[Math.floor(Math.random() * spectralColors.length)];

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: hasSpikes ? 1.8 + Math.random() * 0.8 : 0.5 + Math.random() * 1.2,
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: 0.015 + Math.random() * 0.04,
          color,
          hasSpikes,
        });
      }
    };

    initStars();

    // Meteors / Shooting stars system
    const meteors: Meteor[] = [];
    let nextMeteorTime = Date.now() + 3000 + Math.random() * 5000;

    const spawnMeteor = () => {
      // Spawn from top or upper-right/left quadrant
      const startX = Math.random() * width * 0.8 + width * 0.1;
      const startY = Math.random() * height * 0.35;
      const angle = (Math.PI / 4) + (Math.random() * 0.4 - 0.2); // ~45 deg downward streak
      const length = 90 + Math.random() * 140;
      const speed = 18 + Math.random() * 12;

      meteors.push({
        x: startX,
        y: startY,
        length,
        speed,
        angle,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.025,
        thickness: 1.2 + Math.random() * 1.5,
      });

      nextMeteorTime = Date.now() + 6000 + Math.random() * 9000; // Next meteor in 6-15s
    };

    // Render loop
    let lastTime = performance.now();
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Multi-spectral Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha = star.baseAlpha + Math.sin(time * star.twinkleSpeed * 0.05 + i) * 0.25;
        const currentAlpha = Math.max(0.1, Math.min(1, star.alpha));

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = star.color;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Diffraction spikes on major navigation stars (4-point cross)
        if (star.hasSpikes) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.6;
          const spikeLen = star.radius * 7;

          // Horizontal spike
          ctx.beginPath();
          ctx.moveTo(star.x - spikeLen, star.y);
          ctx.lineTo(star.x + spikeLen, star.y);
          ctx.stroke();

          // Vertical spike
          ctx.beginPath();
          ctx.moveTo(star.x, star.y - spikeLen);
          ctx.lineTo(star.x, star.y + spikeLen);
          ctx.stroke();

          // Delicate star halo
          const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 5);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 2. Check and spawn meteors
      if (Date.now() > nextMeteorTime) {
        spawnMeteor();
      }

      // 3. Render and update meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= m.decay;

        if (m.alpha <= 0 || m.x < -100 || m.x > width + 100 || m.y > height + 100) {
          meteors.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, m.alpha);

        // Ionization head & fading trail
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        grad.addColorStop(0.6, 'rgba(165, 243, 252, 0.4)');
        grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // Glowing ionizing head particle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none select-none z-0"
      style={{
        width: '100%',
        height: '100%',
        mixBlendMode: 'screen',
      }}
    />
  );
};

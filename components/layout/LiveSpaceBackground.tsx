import React, { useState, useEffect, useRef } from 'react';
import spaceOrbitBg from '../../assets/images/space_orbit_background_1789939376378.jpg';
import { SpaceEnvironment } from '../space/SpaceEnvironment';

export const LiveSpaceBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Parallax state for astronomical depth layers
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Mousemove listener with smooth damped interpolation for inverse layer transforms
  useEffect(() => {
    let animId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized offset from center: range -1 to +1
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const updateParallax = () => {
      // Smooth exponential damping (lerp)
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;
      setParallax({ x: currentX, y: currentY });
      animId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.playbackRate = 1.0;

    let isMounted = true;

    const attemptPlay = () => {
      if (!video) return;
      video.muted = true;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (isMounted) {
              setIsPlaying(true);
            }
          })
          .catch(() => {
            const resumeOnInteraction = () => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.play().then(() => {
                  if (isMounted) setIsPlaying(true);
                }).catch(() => {});
              }
              window.removeEventListener('pointerdown', resumeOnInteraction);
              window.removeEventListener('click', resumeOnInteraction);
              window.removeEventListener('touchstart', resumeOnInteraction);
              window.removeEventListener('keydown', resumeOnInteraction);
              window.removeEventListener('scroll', resumeOnInteraction);
            };

            window.addEventListener('pointerdown', resumeOnInteraction, { once: true });
            window.addEventListener('click', resumeOnInteraction, { once: true });
            window.addEventListener('touchstart', resumeOnInteraction, { once: true });
            window.addEventListener('keydown', resumeOnInteraction, { once: true });
            window.addEventListener('scroll', resumeOnInteraction, { once: true });
          });
      }
    };

    attemptPlay();

    const handleVisibilityChange = () => {
      if (!document.hidden && videoRef.current && videoRef.current.paused) {
        attemptPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Compute subtle, inverse-transform values based on layer index
  // Negative sign creates the authentic inverse depth perspective (camera/spacecraft window parallax)
  const getLayerInverseTransform = (layerIndex: number, speedMultiplier: number = 1.0) => {
    const depthScale = layerIndex * 3.5 * speedMultiplier;
    const invX = -parallax.x * depthScale;
    const invY = -parallax.y * depthScale;
    return `translate3d(${invX.toFixed(2)}px, ${invY.toFixed(2)}px, 0)`;
  };

  return (
    <div
      className="live-space-background pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Fallback image with smooth fade out once live video starts */}
      <img
        src={spaceOrbitBg}
        alt=""
        role="presentation"
        referrerPolicy="no-referrer"
        className={`live-space-background-fallback transition-opacity duration-1000 ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* ============================================================ */}
      {/* LAYER 1: DEEP-SPACE CANVAS WITH MULTI-LAYER INVERSE PARALLAX */}
      {/* 4 Distinct Star Layers, Faint Dust, Distant Celestial Bodies */}
      {/* ============================================================ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: getLayerInverseTransform(1, 0.6),
          willChange: 'transform',
        }}
      >
        <SpaceEnvironment
          isGlobalVideoActive={isPlaying && !videoError}
          parallaxOffset={parallax}
        />
      </div>

      {/* ============================================================ */}
      {/* LAYER 2: PRIMARY FOREGROUND EARTH (Continuous Video Loop)    */}
      {/* Inverse transform with gentle foreground anchor factor       */}
      {/* ============================================================ */}
      {!videoError && (
        <video
          ref={videoRef}
          src="/videos/earth_night_rotating_loop.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          preload="auto"
          onPlaying={() => setIsPlaying(true)}
          onCanPlay={(e) => {
            const el = e.currentTarget;
            if (el.paused) {
              el.play().catch(() => {});
            }
          }}
          onError={() => {
            setVideoError(true);
          }}
          onEnded={(e) => {
            const el = e.currentTarget;
            el.currentTime = 0;
            el.play().catch(() => {});
          }}
          style={{
            opacity: isPlaying ? 0.98 : 0,
            mixBlendMode: 'screen',
            transform: `translate(calc(-50% + ${(-parallax.x * 2.5).toFixed(2)}px), calc(-50% + ${(-parallax.y * 2.5).toFixed(2)}px))`,
            willChange: 'transform, opacity',
            transition: 'opacity 0.8s ease-in-out',
          }}
        >
          <source src="/videos/earth_night_rotating_loop.mp4" type="video/mp4" />
          <source src="/videos/earth_night_rotating_loop.webm" type="video/webm" />
        </video>
      )}
    </div>
  );
};

export default LiveSpaceBackground;

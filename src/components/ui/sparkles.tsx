"use client";
import React, { useId, useMemo, useCallback } from "react";
import { useEffect, useState, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, SingleOrMultiple } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "../../lib/utils";
import { motion, useAnimation } from "framer-motion";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

// Global engine initialization to prevent re-initialization
let engineInitialized = false;
let enginePromise: Promise<void> | null = null;

const initializeEngine = () => {
  if (!enginePromise) {
    enginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      engineInitialized = true;
    });
  }
  return enginePromise;
};

export const SparklesCore = React.memo((props: ParticlesProps) => {
  const {
    id,
    className,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  } = props;
  
  const [init, setInit] = useState(engineInitialized);
  const [particlesReady, setParticlesReady] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<Container | null>(null);
  const isVisible = useRef(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    if (!engineInitialized) {
      initializeEngine().then(() => {
        if (isMounted.current) {
          setInit(true);
        }
      });
    } else {
      setInit(true);
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle visibility changes to prevent unnecessary re-renders
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isMounted.current) return;
      
      isVisible.current = !document.hidden;
      
      // Pause/resume particles based on visibility
      if (containerRef.current) {
        if (document.hidden) {
          containerRef.current.pause();
        } else {
          containerRef.current.play();
        }
      }
    };

    const handleFocus = () => {
      if (!isMounted.current) return;
      
      isVisible.current = true;
      if (containerRef.current) {
        containerRef.current.play();
      }
    };

    const handleBlur = () => {
      if (!isMounted.current) return;
      
      isVisible.current = false;
      if (containerRef.current) {
        containerRef.current.pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Trigger animation only after component is mounted and particles are ready
  useEffect(() => {
    if (init && particlesReady && isVisible.current && isMounted.current) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 0.3, // Further reduced duration
        },
      });
    }
  }, [init, particlesReady, controls]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container && isMounted.current) {
      containerRef.current = container;
      setParticlesReady(true);
    }
  }, []);

  const generatedId = useId();
  
  // Memoize particles options to prevent unnecessary re-renders
  const particlesOptions = useMemo(() => ({
    background: {
      color: {
        value: background || "transparent",
      },
    },
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    fpsLimit: 30, // Further reduced FPS for better performance
    interactivity: {
      events: {
        onClick: {
          enable: false, // Disabled for better performance
          mode: "push",
        },
        onHover: {
          enable: false,
          mode: "repulse",
        },
        resize: true as any,
      },
      modes: {
        push: {
          quantity: 1,
        },
        repulse: {
          distance: 100,
          duration: 0.2,
        },
      },
    },
    particles: {
      bounce: {
        horizontal: {
          value: 1,
        },
        vertical: {
          value: 1,
        },
      },
      collisions: {
        enable: false,
      },
      color: {
        value: particleColor || "#ffffff",
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out",
        },
        random: false,
        speed: speed || 0.5, // Reduced speed
        straight: false,
      },
      number: {
        density: {
          enable: true,
          width: 800,
          height: 800,
        },
        value: Math.min(particleDensity || 50, 50), // Reduced particle count
      },
      opacity: {
        value: {
          min: 0.1,
          max: 0.8,
        },
        animation: {
          enable: true,
          speed: speed || 1,
          sync: false,
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: {
          min: minSize || 0.5,
          max: maxSize || 2,
        },
      },
    },
    detectRetina: true,
  }), [background, minSize, maxSize, speed, particleColor, particleDensity]);

  if (!init) {
    return <div className={cn("opacity-0", className)} />;
  }

  return (
    <motion.div 
      animate={controls} 
      className={cn("opacity-0", className)}
      initial={{ opacity: 0 }}
    >
      <Particles
        id={id || generatedId}
        className={cn("h-full w-full")}
        particlesLoaded={particlesLoaded}
        options={particlesOptions}
      />
    </motion.div>
  );
});

SparklesCore.displayName = "SparklesCore";
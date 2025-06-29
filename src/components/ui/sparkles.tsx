"use client";
import React, { useId, useMemo, useRef, useEffect, useCallback } from "react";
import { useState } from "react";
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

// Global initialization state to prevent multiple initializations
let globalInitialized = false;
let globalInitPromise: Promise<void> | null = null;

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
  
  const [init, setInit] = useState(globalInitialized);
  const [particlesReady, setParticlesReady] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<Container | null>(null);

  // Stable ID generation - use provided id or generate once
  const stableId = useMemo(() => id || `sparkles-${Math.random().toString(36).substr(2, 9)}`, [id]);

  useEffect(() => {
    // Use global initialization to prevent multiple engine initializations
    if (globalInitialized) {
      setInit(true);
      return;
    }

    if (globalInitPromise) {
      globalInitPromise.then(() => {
        setInit(true);
      });
      return;
    }

    globalInitPromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      globalInitialized = true;
      setInit(true);
    });
  }, []);

  // Trigger animation only after component is mounted and particles are ready
  useEffect(() => {
    if (init && particlesReady) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 1,
        },
      });
    }
  }, [init, particlesReady, controls]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      containerRef.current = container;
      setParticlesReady(true);
    }
  }, []);

  // Memoize particles options to prevent recreation on every render
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
    fpsLimit: 60, // Reduced from 120 to improve performance
    interactivity: {
      events: {
        onClick: {
          enable: false, // Disabled to reduce complexity
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
          quantity: 2, // Reduced from 4
        },
        repulse: {
          distance: 100, // Reduced from 200
          duration: 0.2, // Reduced from 0.4
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
        speed: {
          min: 0.1,
          max: speed || 1,
        },
        straight: false,
      },
      number: {
        density: {
          enable: true,
          width: 800,
          height: 800,
        },
        value: particleDensity || 80, // Reduced default from 120
      },
      opacity: {
        value: {
          min: 0.1,
          max: 0.8, // Reduced from 1
        },
        animation: {
          enable: true,
          speed: (speed || 4) * 0.5, // Slower animation
          sync: false,
          mode: "auto",
          startValue: "random",
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: {
          min: minSize || 1,
          max: maxSize || 3,
        },
        animation: {
          enable: false, // Disabled size animation for better performance
        },
      },
      stroke: {
        width: 0,
      },
      links: {
        enable: false, // Disabled links for better performance
      },
    },
    detectRetina: true,
  }), [background, particleColor, particleDensity, speed, minSize, maxSize]);

  // Don't render anything until initialized
  if (!init) {
    return null;
  }

  return (
    <motion.div 
      animate={controls} 
      className={cn("opacity-0", className)}
      style={{ pointerEvents: 'none' }} // Prevent interaction issues
    >
      <Particles
        key={stableId}
        id={stableId}
        className={cn("h-full w-full")}
        particlesLoaded={particlesLoaded}
        options={particlesOptions}
      />
    </motion.div>
  );
});

SparklesCore.displayName = 'SparklesCore';
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

// Global state to prevent multiple initializations and reduce complexity
let globalInitialized = false;
let globalInitPromise: Promise<void> | null = null;
const globalContainers = new Map<string, Container>();

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
  const mountedRef = useRef(true);

  // Stable ID generation - use provided id or generate once and cache
  const stableId = useMemo(() => {
    if (id) return id;
    // Create a stable ID based on component position and props
    const propsHash = JSON.stringify({ minSize, maxSize, speed, particleColor, particleDensity });
    return `sparkles-${btoa(propsHash).slice(0, 8)}`;
  }, [id, minSize, maxSize, speed, particleColor, particleDensity]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Use global initialization to prevent multiple engine initializations
    if (globalInitialized) {
      if (mountedRef.current) {
        setInit(true);
      }
      return;
    }

    if (globalInitPromise) {
      globalInitPromise.then(() => {
        if (mountedRef.current) {
          setInit(true);
        }
      });
      return;
    }

    globalInitPromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      globalInitialized = true;
      if (mountedRef.current) {
        setInit(true);
      }
    }).catch((error) => {
      console.warn('Failed to initialize particles engine:', error);
      if (mountedRef.current) {
        setInit(true); // Still set to true to prevent infinite loading
      }
    });
  }, []);

  // Trigger animation only after component is mounted and particles are ready
  useEffect(() => {
    if (init && particlesReady && mountedRef.current) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 0.5, // Faster animation
        },
      });
    }
  }, [init, particlesReady, controls]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container && mountedRef.current) {
      containerRef.current = container;
      globalContainers.set(stableId, container);
      setParticlesReady(true);
    }
  }, [stableId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        globalContainers.delete(stableId);
      }
    };
  }, [stableId]);

  // Simplified and highly optimized particles options
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
    fpsLimit: 30, // Further reduced for better performance
    interactivity: {
      events: {
        onClick: {
          enable: false,
        },
        onHover: {
          enable: false,
        },
        resize: false, // Disable resize events to prevent re-renders
      },
    },
    particles: {
      bounce: {
        horizontal: { value: 1 },
        vertical: { value: 1 },
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
          max: Math.min(speed || 1, 0.8), // Cap speed for better performance
        },
        straight: false,
      },
      number: {
        density: {
          enable: true,
          width: 1200,
          height: 1200,
        },
        value: Math.min(particleDensity || 60, 60), // Cap particle count
      },
      opacity: {
        value: {
          min: 0.1,
          max: 0.6, // Reduced opacity for subtlety
        },
        animation: {
          enable: true,
          speed: Math.min((speed || 4) * 0.3, 1), // Much slower animation
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
          max: Math.min(maxSize || 2, 2), // Cap size
        },
        animation: {
          enable: false, // Completely disable size animation
        },
      },
      stroke: {
        width: 0,
      },
      links: {
        enable: false,
      },
    },
    detectRetina: false, // Disable retina detection for consistency
    smooth: true,
    style: {
      position: "absolute",
    },
  }), [background, particleColor, particleDensity, speed, minSize, maxSize]);

  // Don't render anything until initialized
  if (!init) {
    return (
      <div className={cn("opacity-0", className)} style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full" />
      </div>
    );
  }

  return (
    <motion.div 
      animate={controls} 
      className={cn("opacity-0", className)}
      style={{ 
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    >
      <Particles
        key={stableId}
        id={stableId}
        className="w-full h-full"
        particlesLoaded={particlesLoaded}
        options={particlesOptions}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </motion.div>
  );
});

SparklesCore.displayName = 'SparklesCore';
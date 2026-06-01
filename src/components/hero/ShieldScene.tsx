"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  Environment,
  Icosahedron,
  Sphere,
  ContactShadows,
} from "@react-three/drei";
import { useSpring, useReducedMotion, useInView } from "framer-motion";
import * as THREE from "three";

function AbstractShield() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  const prefersReducedMotion = useReducedMotion();

  // Mouse tracking with spring physics
  const mouseX = useSpring(0, { stiffness: 100, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 100, damping: 20 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, prefersReducedMotion]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!prefersReducedMotion) {
      // Apply spring-based rotation and position
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseX.get() * 0.5,
        0.1
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouseY.get() * 0.5,
        0.1
      );
      
      // Auto-rotation
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x += delta * 0.05;
      
      if (coreRef.current) {
        coreRef.current.rotation.y -= delta * 0.2;
        coreRef.current.rotation.x -= delta * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Float
        speed={prefersReducedMotion ? 0 : 2}
        rotationIntensity={prefersReducedMotion ? 0 : 0.5}
        floatIntensity={prefersReducedMotion ? 0 : 2}
      >
        {/* Outer glass shield */}
        <Icosahedron args={[2.5, 0]} scale={1.2}>
          <MeshTransmissionMaterial
            thickness={1.5}
            roughness={0.1}
            transmission={1}
            ior={1.5}
            chromaticAberration={0.1}
            backside={false}
            samples={4}
          />
        </Icosahedron>

        {/* Inner solid core */}
        <Icosahedron ref={coreRef} args={[1.5, 0]}>
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.2}
            metalness={0.8}
            emissive="#ffffff"
            emissiveIntensity={0.1}
            wireframe
          />
        </Icosahedron>
        
        {/* Inner glowing sphere */}
        <Sphere args={[1, 32, 32]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </Sphere>
      </Float>
    </group>
  );
}

export default function ShieldScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.01 });
  const [mounted, setMounted] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobileOrTablet(window.innerWidth < 1024);
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#09090b]">
        {/* Static fallback */}
        <div className="w-64 h-64 border border-white/10 rounded-full animate-pulse" />
      </div>
    );
  }

  if (isMobileOrTablet) {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#09090b] pointer-events-none -z-10 overflow-hidden flex items-center justify-center">
        {/* Subtle radial glow background */}
        <div className="absolute w-[500px] h-[500px] bg-white/[0.02] border border-white/5 rounded-full blur-[100px] animate-pulse-slow" />
        
        {/* SVG Shield Representation */}
        <div className="relative w-72 h-72 flex items-center justify-center scale-90 sm:scale-100 transition-transform">
          {/* Rotating outer ring wireframe */}
          <div className="absolute inset-0 animate-spin-slow opacity-25">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 6" />
              <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="10" y1="28" x2="90" y2="72" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="10" y1="72" x2="90" y2="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Rotating inner metal wireframe */}
          <div className="absolute w-48 h-48 animate-spin-reverse-slow opacity-40">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white">
              <polygon points="50,15 80,33 80,67 50,85 20,67 20,33" fill="none" stroke="currentColor" strokeWidth="1" />
              <line x1="50" y1="15" x2="80" y2="67" stroke="currentColor" strokeWidth="0.5" />
              <line x1="80" y1="33" x2="20" y2="67" stroke="currentColor" strokeWidth="0.5" />
              <line x1="20" y1="33" x2="50" y2="85" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="15" x2="20" y2="67" stroke="currentColor" strokeWidth="0.5" />
              <line x1="20" y1="33" x2="80" y2="67" stroke="currentColor" strokeWidth="0.5" />
              <line x1="80" y1="33" x2="50" y2="85" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Glowing central sphere */}
          <div className="absolute w-24 h-24 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <div className="w-8 h-8 rounded-full bg-white opacity-65 blur-[2px]" />
          </div>
        </div>

        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)] pointer-events-none" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-[#09090b] pointer-events-none -z-10 overflow-hidden">
      {isInView && (
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 45 }} 
          dpr={1}
          gl={{ 
            antialias: false, 
            powerPreference: "high-performance",
            alpha: true,
            stencil: false,
            depth: false
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <directionalLight position={[-10, -10, -5]} intensity={1} color="#4f46e5" />
          <spotLight position={[0, 10, 0]} intensity={2} penumbra={1} color="#ffffff" />
          
          <React.Suspense fallback={null}>
            <AbstractShield />
            <Environment preset="city" />
            <ContactShadows
              position={[0, -3, 0]}
              opacity={0.4}
              scale={20}
              blur={2}
              far={10}
              color="#ffffff"
            />
          </React.Suspense>
        </Canvas>
      )}
      
      {/* Vignette overlay to blend 3D scene edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)]" />
    </div>
  );
}

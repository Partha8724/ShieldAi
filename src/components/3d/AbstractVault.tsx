"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import { useMotionValue, useSpring, useInView } from "framer-motion";
import * as THREE from "three";

function VaultGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const scale = useMotionValue(1);
  const distort = useMotionValue(0.2);
  const speed = useMotionValue(2);
  
  const scaleSpring = useSpring(scale, { stiffness: 100, damping: 20 });
  const distortSpring = useSpring(distort, { stiffness: 50, damping: 20 });
  const speedSpring = useSpring(speed, { stiffness: 50, damping: 20 });
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
      
      const s = scaleSpring.get();
      meshRef.current.scale.set(s, s, s);
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    scale.set(1.2);
    distort.set(0.5);
    speed.set(5);
  };

  const handlePointerOut = () => {
    setHovered(false);
    scale.set(1);
    distort.set(0.2);
    speed.set(2);
  };

  // We can't easily animate material properties with motion values without tracking them in useFrame.
  // We'll use a local ref for material to update its values.
  const materialRef = useRef<any>(null);
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.distort = distortSpring.get();
      materialRef.current.speed = speedSpring.get();
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <Icosahedron args={[1.5, 2]}>
        <MeshDistortMaterial 
          ref={materialRef}
          color="#ffffff"
          wireframe={true}
          transparent
          opacity={0.6}
        />
      </Icosahedron>
    </mesh>
  );
}

export default function AbstractVault() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.01 });

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-pointer">
      {isInView && (
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 45 }} 
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
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <VaultGeometry />
        </Canvas>
      )}
    </div>
  );
}

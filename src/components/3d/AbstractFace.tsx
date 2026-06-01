"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { TorusKnot, MeshTransmissionMaterial } from "@react-three/drei";
import { useMotionValue, useSpring, useInView } from "framer-motion";
import * as THREE from "three";

function FaceGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const scale = useMotionValue(1);
  const rotationX = useMotionValue(0);
  const rotationY = useMotionValue(0);

  const scaleSpring = useSpring(scale, { stiffness: 150, damping: 15 });
  const rotationSpringX = useSpring(rotationX, { stiffness: 50, damping: 20 });
  const rotationSpringY = useSpring(rotationY, { stiffness: 50, damping: 20 });
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation.z += delta * 0.1;
      
      // Interactive rotation
      meshRef.current.rotation.x = rotationSpringX.get();
      meshRef.current.rotation.y = rotationSpringY.get();
      
      const s = scaleSpring.get();
      meshRef.current.scale.set(s, s, s);
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    scale.set(1.1);
  };

  const handlePointerOut = () => {
    setHovered(false);
    scale.set(1);
    rotationX.set(0);
    rotationY.set(0);
  };

  const handlePointerMove = (e: any) => {
    // e.intersections[0].uv gives us 0-1 values, we can map to rotation
    if (e.intersections.length > 0) {
      const uv = e.intersections[0].uv;
      if (uv) {
        rotationX.set((uv.y - 0.5) * 1.5);
        rotationY.set((uv.x - 0.5) * 1.5);
      }
    }
  };

  return (
    <mesh
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerMove={handlePointerMove}
    >
      <TorusKnot args={[1, 0.3, 128, 32]}>
        <MeshTransmissionMaterial 
          backside={false}
          samples={4}
          thickness={0.5}
          chromaticAberration={0.5}
          anisotropy={0.2}
          distortion={hovered ? 0.5 : 0.1}
          distortionScale={0.5}
          temporalDistortion={hovered ? 0.2 : 0.05}
          color="#ffffff"
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
        />
      </TorusKnot>
    </mesh>
  );
}

export default function AbstractFace() {
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
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={2} />
          <FaceGeometry />
        </Canvas>
      )}
    </div>
  );
}

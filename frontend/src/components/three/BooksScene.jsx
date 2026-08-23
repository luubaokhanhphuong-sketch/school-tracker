import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function Book({ color, page, height, tilt, offset }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = tilt + Math.sin(t * 0.22 + offset.x * 3) * 0.012;
  });
  return (
    <group position={[offset.x, offset.y, offset.z]} rotation={[0, 0.35, tilt]} ref={ref}>
      <mesh>
        <boxGeometry args={[1.15, height, page]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0.583, 0, 0]}>
        <boxGeometry args={[0.015, height * 0.94, page * 0.9]} />
        <meshStandardMaterial color="#f4f1e8" roughness={0.9} />
      </mesh>
    </group>
  );
}

function BookStack() {
  const group = useRef();
  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.25;
  });
  return (
    <group ref={group}>
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.45}>
        <Book color="#2347d2" page={0.5} height={1.45} tilt={-0.12} offset={{ x: -0.95, y: 0.55, z: 0 }} />
        <Book color="#e8a012" page={0.5} height={1.1} tilt={0.05} offset={{ x: 0, y: 0.25, z: 0.25 }} />
        <Book color="#17324d" page={0.55} height={1.8} tilt={0.1} offset={{ x: 0.95, y: 0.75, z: -0.1 }} />
        <Book color="#177a52" page={0.45} height={1.0} tilt={-0.02} offset={{ x: 0.42, y: -0.28, z: 0.55 }} />
      </Float>
    </group>
  );
}

export default function BooksScene({ className }) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.2, 6], fov: 42 }}
      gl={{ antialias: false, alpha: true }}
      style={{ pointerEvents: "none", background: "transparent" }}
      aria-hidden
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, -2, -4]} intensity={0.5} color="#a5b8ff" />
      <BookStack />
    </Canvas>
  );
}
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

const mouse = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  });
}

function Core() {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const scroll = Math.min(window.scrollY / innerHeight, 1.5);
    if (group.current) {
      group.current.rotation.y += dt * 0.15;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, mouse.y * 0.4, 0.05);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -mouse.x * 0.3, 0.05);
      const s = 1 + scroll * 0.9;
      group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, s, 0.1));
    }
    if (shell.current) {
      shell.current.rotation.x -= dt * 0.2;
      shell.current.rotation.y -= dt * 0.1;
    }
    if (inner.current) {
      const t = state.clock.elapsedTime;
      inner.current.scale.setScalar(1 + Math.sin(t * 2) * 0.03);
    }
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.x * 0.8, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mouse.y * 0.5, 0.04);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group} position={[2.2, 0, 0]}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh ref={inner}>
          <icosahedronGeometry args={[1.25, 12]} />
          <MeshDistortMaterial color="#3a1c9c" emissive="#2a0a8f" emissiveIntensity={0.35} roughness={0.12} metalness={0.55} distort={0.45} speed={2.2} />
        </mesh>
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.95, 1]} />
          <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.35} />
        </mesh>
        <Rings />
      </Float>
    </group>
  );
}

function Rings() {
  const rings = useRef<THREE.Group>(null);
  const specs = useMemo(
    () => [
      { r: 2.6, tilt: [1.2, 0.2, 0], color: "#ff2bd6", speed: 0.6 },
      { r: 3.1, tilt: [0.4, 1.1, 0.3], color: "#00e5ff", speed: -0.4 },
      { r: 3.6, tilt: [1.7, -0.6, 0.2], color: "#b6ff3b", speed: 0.3 },
    ],
    [],
  );
  useFrame((_, dt) => {
    rings.current?.children.forEach((c, i) => {
      c.rotation.z += dt * specs[i].speed;
    });
  });
  return (
    <group ref={rings}>
      {specs.map((s, i) => (
        <group key={i} rotation={s.tilt as [number, number, number]}>
          <mesh>
            <torusGeometry args={[s.r, 0.008, 8, 160]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.6} />
          </mesh>
          <mesh position={[s.r, 0, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color={s.color} toneMapped={false} />
          </mesh>
          <mesh position={[-s.r, 0, 0]}>
            <octahedronGeometry args={[0.09]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FloatingShards() {
  const shards = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        pos: [(Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8 - 3] as [number, number, number],
        rot: Math.random() * Math.PI,
        s: 0.06 + Math.random() * 0.16,
        color: ["#00e5ff", "#ff2bd6", "#8b6bff", "#b6ff3b"][Math.floor(Math.random() * 4)],
      })),
    [],
  );
  return (
    <>
      {shards.map((s, i) => (
        <Float key={i} speed={1 + Math.random() * 2} floatIntensity={2} rotationIntensity={3}>
          <mesh position={s.pos} rotation={[s.rot, s.rot, 0]} scale={s.s}>
            <boxGeometry />
            <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export default function HeroScene({ active, mobile }: { active: boolean; mobile: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05050a"]} />
      <fog attach="fog" args={["#05050a", 8, 22]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 4, 5]} intensity={90} color="#00e5ff" />
      <pointLight position={[-1, -3, 3]} intensity={70} color="#ff2bd6" />
      <pointLight position={[3, 3, -2]} intensity={50} color="#b6ff3b" />
      <directionalLight position={[0, 5, 5]} intensity={0.6} />
      <group position={mobile ? [-2.2, 1.4, -2] : [0, 0, 0]}>
        <Core />
      </group>
      <FloatingShards />
      <Stars radius={60} depth={40} count={mobile ? 1500 : 4000} factor={3} fade speed={0.6} />
      <Sparkles count={mobile ? 40 : 90} scale={[16, 9, 6]} size={2.4} speed={0.3} color="#8b6bff" />
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.3} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
        <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0012)} radialModulation={false} modulationOffset={0} />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}

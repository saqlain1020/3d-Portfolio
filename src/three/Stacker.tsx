import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

export type StackerApi = { drop: () => void; start: () => void };
export type Status = "idle" | "playing" | "over";

type Block = { x: number; z: number; w: number; d: number; color: string };
type Debris = { id: number; x: number; y: number; z: number; w: number; d: number; vy: number; vx: number; vz: number; rx: number; rz: number; color: string };

const H = 0.5;
const BASE = 3;
const RANGE = 4.2;
const PERFECT = 0.12;

const colorFor = (n: number) => `hsl(${(190 + n * 9) % 360}, 95%, 58%)`;

type Props = {
  api: React.MutableRefObject<StackerApi | null>;
  active: boolean;
  onStatus: (s: Status) => void;
  onScore: (n: number, perfect: boolean, combo: number) => void;
};

function Game({ api, onStatus, onScore }: Omit<Props, "active">) {
  const [blocks, setBlocks] = useState<Block[]>([{ x: 0, z: 0, w: BASE, d: BASE, color: colorFor(0) }]);
  const [status, setStatus] = useState<Status>("idle");
  const debris = useRef<Debris[]>([]);
  const [, force] = useState(0);
  const mover = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const combo = useRef(0);
  const debrisId = useRef(0);
  const flash = useRef<THREE.Mesh>(null);
  const flashT = useRef(0);
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, 0));

  const level = blocks.length;
  const axis: "x" | "z" = level % 2 ? "x" : "z";
  const top = blocks[blocks.length - 1];
  const speed = 1.6 + Math.min(level, 40) * 0.045;

  const setS = (s: Status) => {
    setStatus(s);
    onStatus(s);
  };

  const addDebris = (d: Omit<Debris, "id" | "vy" | "vx" | "vz" | "rx" | "rz">, dir: number) => {
    debris.current.push({ ...d, id: debrisId.current++, vy: 0, vx: axis === "x" ? dir * 1.2 : 0, vz: axis === "z" ? dir * 1.2 : 0, rx: 0, rz: 0 });
    force((n) => n + 1);
  };

  const drop = () => {
    if (status === "idle" || status === "over") return;
    const m = mover.current!;
    const pos = axis === "x" ? m.position.x : m.position.z;
    const prevC = axis === "x" ? top.x : top.z;
    const size = axis === "x" ? top.w : top.d;
    const delta = pos - prevC;
    const overlap = size - Math.abs(delta);
    const y = level * H;

    if (overlap <= 0) {
      addDebris({ x: m.position.x, y, z: m.position.z, w: top.w, d: top.d, color: colorFor(level) }, Math.sign(delta));
      setS("over");
      return;
    }

    let nb: Block;
    let perfect = false;
    if (Math.abs(delta) < PERFECT) {
      perfect = true;
      combo.current++;
      const grow = combo.current >= 3 ? 0.12 : 0;
      nb = { ...top, w: axis === "x" ? Math.min(BASE, top.w + grow) : top.w, d: axis === "z" ? Math.min(BASE, top.d + grow) : top.d, color: colorFor(level) };
      flashT.current = 1;
    } else {
      combo.current = 0;
      const c = prevC + delta / 2;
      nb = axis === "x" ? { x: c, z: top.z, w: overlap, d: top.d, color: colorFor(level) } : { x: top.x, z: c, w: top.w, d: overlap, color: colorFor(level) };
      const cut = Math.abs(delta);
      const cutC = c + Math.sign(delta) * (overlap / 2 + cut / 2);
      addDebris(
        axis === "x" ? { x: cutC, y, z: top.z, w: cut, d: top.d, color: colorFor(level) } : { x: top.x, y, z: cutC, w: top.w, d: cut, color: colorFor(level) },
        Math.sign(delta),
      );
    }
    setBlocks((b) => [...b, nb]);
    t.current = -Math.PI / 2;
    onScore(level, perfect, combo.current);
  };

  const start = () => {
    setBlocks([{ x: 0, z: 0, w: BASE, d: BASE, color: colorFor(0) }]);
    debris.current = [];
    combo.current = 0;
    t.current = -Math.PI / 2;
    setS("playing");
  };

  api.current = { drop, start };

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const m = mover.current;
    if (m && status === "playing") {
      t.current += dt * speed;
      const off = Math.sin(t.current) * RANGE;
      m.position.set(axis === "x" ? off : top.x, level * H, axis === "z" ? off : top.z);
    }

    // debris physics
    let alive = false;
    for (const d of debris.current) {
      d.vy -= 14 * dt;
      d.y += d.vy * dt;
      d.x += d.vx * dt;
      d.z += d.vz * dt;
      d.rx += d.vz * dt * 1.5;
      d.rz -= d.vx * dt * 1.5;
      if (d.y > -30) alive = true;
    }
    if (!alive && debris.current.length) debris.current = [];

    // perfect flash ring
    if (flash.current) {
      flashT.current = Math.max(0, flashT.current - dt * 2.2);
      const s = 1 + (1 - flashT.current) * 0.6;
      flash.current.scale.set(s, 1, s);
      (flash.current.material as THREE.MeshBasicMaterial).opacity = flashT.current;
      flash.current.position.set(top.x, (level - 1) * H + H / 2 + 0.01, top.z);
    }

    // camera
    const over = status === "over";
    const h = level * H;
    const dist = over ? Math.max(9, h * 1.1 + 6) : 9;
    const target = new THREE.Vector3(dist * 0.72, h + (over ? h * 0.2 + 2 : 5), dist * 0.72);
    camera.position.lerp(target, 1 - Math.exp(-3 * dt));
    look.current.lerp(new THREE.Vector3(0, over ? h / 2 : h - 1, 0), 1 - Math.exp(-5 * dt));
    camera.lookAt(look.current);
  });

  return (
    <>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, i * H, b.z]}>
          <boxGeometry args={[b.w, H, b.d]} />
          <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={i === blocks.length - 1 ? 0.55 : 0.2} roughness={0.35} metalness={0.2} />
          <Edges color="#ffffff" threshold={15} />
        </mesh>
      ))}

      {status === "playing" && (
        <mesh ref={mover} position={[0, level * H, 0]}>
          <boxGeometry args={[top.w, H, top.d]} />
          <meshStandardMaterial color={colorFor(level)} emissive={colorFor(level)} emissiveIntensity={0.8} toneMapped={false} />
          <Edges color="#ffffff" />
        </mesh>
      )}

      {debris.current.map((d) => (
        <DebrisMesh key={d.id} d={d} />
      ))}

      <mesh ref={flash} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(top.w, top.d) * 0.72, Math.max(top.w, top.d) * 0.78, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} toneMapped={false} />
      </mesh>

      <gridHelper args={[40, 40, "#00e5ff", "#1a1a33"]} position={[0, -H / 2 - 0.01, 0]} />
    </>
  );
}

function DebrisMesh({ d }: { d: Debris }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.set(d.x, d.y, d.z);
    ref.current.rotation.set(d.rx, 0, d.rz);
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[d.w, H, d.d]} />
      <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={0.3} transparent opacity={0.85} />
    </mesh>
  );
}

export default function Stacker({ api, active, onStatus, onScore }: Props) {
  useEffect(() => () => void (api.current = null), [api]);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [6.5, 5, 6.5], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onPointerDown={() => api.current?.drop()}
    >
      <color attach="background" args={["#07070f"]} />
      <fog attach="fog" args={["#07070f", 14, 40]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.4} />
      <pointLight position={[-6, 4, -3]} color="#ff2bd6" intensity={40} />
      <pointLight position={[6, 2, -6]} color="#00e5ff" intensity={40} />
      <Sparkles count={60} scale={[14, 20, 14]} position={[0, 8, 0]} size={2} speed={0.3} color="#8b6bff" />
      <Game api={api} onStatus={onStatus} onScore={onScore} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.8} luminanceThreshold={0.35} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

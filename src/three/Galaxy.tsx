import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Sparkles, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Planet } from "../lib/data";
import { sfx } from "../game/sfx";

type Props = {
  planets: Planet[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  active: boolean;
  mobile: boolean;
};

// Shared mutable world positions so the camera can chase a moving planet.
const worldPos: Record<string, THREE.Vector3> = {};
const clock = { t: 0 };

const atmosphereShader = (color: string) => ({
  uniforms: { uColor: { value: new THREE.Color(color) } },
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
    void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6); gl_FragColor = vec4(uColor * 1.6, f); }`,
  transparent: true,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  depthWrite: false,
});

function Sun({ onClick }: { onClick: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y = t * 0.1;
    if (halo.current) halo.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);
  });
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh ref={ref}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial color="#ffffff" emissive="#ff7ae8" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh ref={halo} scale={1.25}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <shaderMaterial args={[atmosphereShader("#ff2bd6")]} />
      </mesh>
      <pointLight intensity={120} distance={60} color="#ffd9f6" />
      <Sparkles count={40} scale={5} size={3} speed={0.4} color="#ffb3f0" />
      <Html center position={[0, -2.5, 0]} className="pointer-events-none select-none">
        <div className="font-mono text-[10px] tracking-[0.3em] text-white/60 whitespace-nowrap">SAQLAIN·CORE</div>
      </Html>
    </group>
  );
}

function PlanetDecor({ p }: { p: Planet }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.5;
  });
  const blocks = useMemo(() => Array.from({ length: 36 }, (_, i) => (i / 36) * Math.PI * 2), []);
  const synapses = useMemo(() => {
    const pts = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(p.size * (1.35 + Math.random() * 0.35));
      pts.set([v.x, v.y, v.z], i * 3);
    }
    return pts;
  }, [p.size]);

  switch (p.id) {
    case "frontend":
      return (
        <group ref={ref}>
          <mesh>
            <icosahedronGeometry args={[p.size * 1.3, 1]} />
            <meshBasicMaterial color={p.color} wireframe transparent opacity={0.4} />
          </mesh>
        </group>
      );
    case "web3":
      return (
        <group ref={ref} rotation={[0.45, 0, 0.15]}>
          {blocks.map((a, i) => (
            <mesh key={i} position={[Math.cos(a) * p.size * 1.9, 0, Math.sin(a) * p.size * 1.9]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.16, 0.16, 0.16]} />
              <meshStandardMaterial
                color={p.color}
                emissive={p.emissive}
                emissiveIntensity={i % 3 === 0 ? 3 : 1}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      );
    case "ai":
      return (
        <group ref={ref}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[synapses, 3]} />
            </bufferGeometry>
            <pointsMaterial color={p.color} size={0.05} toneMapped={false} />
          </points>
        </group>
      );
    case "backend":
      return (
        <group ref={ref} rotation={[1.2, 0, 0]}>
          <mesh>
            <torusGeometry args={[p.size * 1.7, 0.03, 8, 90]} />
            <meshBasicMaterial color={p.color} toneMapped={false} />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[p.size * 2, 0.012, 8, 90]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.5} />
          </mesh>
        </group>
      );
    case "devops":
      return (
        <group ref={ref}>
          <mesh position={[p.size * 1.8, 0.3, 0]}>
            <octahedronGeometry args={[0.16]} />
            <meshStandardMaterial color="#fff" emissive={p.color} emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <mesh position={[-p.size * 1.6, -0.2, 0.4]}>
            <boxGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color="#fff" emissive={p.color} emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function SkillMoons({ p, show }: { p: Planet; show: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12;
  });
  const n = p.skills.length;
  return (
    <group ref={ref}>
      {p.skills.map((s, i) => {
        const a = (i / n) * Math.PI * 2;
        // Three staggered rings + vertical spread give real depth: near chips loom, far ones recede.
        const r = p.size * 2.3 + (i % 3) * 0.95;
        const y = Math.sin(i * 1.7) * 1.4;
        return (
          <Html
            key={s}
            position={[Math.cos(a) * r, y, Math.sin(a) * r]}
            center
            distanceFactor={10}
            zIndexRange={[5, 0]}
          >
            <div
              key={String(show)}
              className="moon-chip whitespace-nowrap font-mono font-bold text-[15px] px-3.5 py-1.5 border-2 flex items-center gap-2"
              style={{
                display: show ? "flex" : "none",
                borderColor: p.color,
                background: "#07070ff2",
                color: p.color,
                boxShadow: `0 0 18px ${p.color}66, inset 0 0 12px ${p.color}22`,
                animationDelay: `${280 + i * 45}ms`, // start as the camera arrives, then ripple out
              }}
            >
              <span
                className="w-1.5 h-1.5 rotate-45 shrink-0"
                style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
              />
              {s}
            </div>
          </Html>
        );
      })}
    </group>
  );
}

function PlanetMesh({
  p,
  index,
  selected,
  onSelect,
  anySelected,
}: {
  p: Planet;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  anySelected: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  // drei <Html> roots don't like being unmounted mid-render, so moons mount on first visit and then stay.
  const [moonsMounted, setMoonsMounted] = useState(false);
  if (selected && !moonsMounted) setMoonsMounted(true);
  const phase = useMemo(() => (index / 6) * Math.PI * 2 + index * 0.6, [index]);
  const tilt = useMemo(() => Math.sin(index * 2.1) * 0.12, [index]);

  useFrame((_, dt) => {
    const a = phase + clock.t * p.speed;
    const g = group.current!;
    g.position.set(Math.cos(a) * p.orbit, Math.sin(a) * p.orbit * tilt, Math.sin(a) * p.orbit);
    if (!worldPos[p.id]) worldPos[p.id] = new THREE.Vector3();
    g.getWorldPosition(worldPos[p.id]);
    if (body.current) body.current.rotation.y += dt * 0.3;
    const target = selected ? 1.25 : hover ? 1.15 : anySelected ? 0.85 : 1;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, target, 0.1));
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
    sfx.hover();
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    setHover(false);
    document.body.style.cursor = "";
  };

  return (
    <group ref={group}>
      <group
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(p.id);
        }}
      >
        <mesh ref={body}>
          <sphereGeometry args={[p.size, 48, 48]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.emissive}
            emissiveIntensity={hover || selected ? 0.9 : 0.45}
            roughness={0.55}
            metalness={0.3}
            flatShading={p.id === "arsenal"}
          />
        </mesh>
        <mesh scale={1.22}>
          <sphereGeometry args={[p.size, 32, 32]} />
          <shaderMaterial args={[atmosphereShader(p.color)]} />
        </mesh>
        {/* larger invisible hit target for small planets and touch */}
        <mesh visible={false}>
          <sphereGeometry args={[Math.max(p.size * 1.8, 1.4), 12, 12]} />
        </mesh>
      </group>
      <PlanetDecor p={p} />
      <Html center position={[0, p.size + 0.9, 0]} className="pointer-events-none select-none" zIndexRange={[5, 0]}>
        <div className={`text-center transition-all duration-300 ${anySelected ? "opacity-0" : "opacity-100"}`}>
          <div
            className="font-display font-bold text-[13px] whitespace-nowrap"
            style={{ color: p.color, textShadow: `0 0 12px ${p.color}` }}
          >
            {p.name}
          </div>
          <div className="font-mono text-[9px] tracking-[0.25em] text-white/60 whitespace-nowrap">
            {p.domain.toUpperCase()}
          </div>
        </div>
      </Html>
      {moonsMounted && <SkillMoons p={p} show={selected} />}
    </group>
  );
}

function Orbits({ planets }: { planets: Planet[] }) {
  return (
    <>
      {planets.map((p, i) => (
        <mesh key={p.id} rotation={[Math.PI / 2 - Math.sin(i * 2.1) * 0.12, 0, 0]}>
          <ringGeometry args={[p.orbit - 0.012, p.orbit + 0.012, 180]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function Rig({
  planets,
  selected,
  mobile,
  drag,
}: {
  planets: Planet[];
  selected: string | null;
  mobile: boolean;
  drag: React.RefObject<{ yaw: number; pitch: number }>;
}) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  const home = useMemo(() => new THREE.Vector3(0, mobile ? 20 : 13, mobile ? 30 : 24), [mobile]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const k = (rate: number) => 1 - Math.exp(-rate * dt);
    clock.t += dt * (selected ? 0.12 : 1);
    const wp = selected ? worldPos[selected] : null;
    const planet = selected ? planets.find((p) => p.id === selected) : null;
    if (wp && planet) {
      const reach = planet.size * 2.6 + (mobile ? 12 : 8);
      const dir = tmp.copy(wp).setY(0).normalize();
      const desired = wp
        .clone()
        .add(dir.clone().multiplyScalar(reach))
        .add(new THREE.Vector3(0, reach * 0.32, 0));
      camera.position.lerp(desired, k(3));
      // Frame the planet off-center so the dossier panel doesn't cover it.
      const toCam = desired.clone().sub(wp).normalize();
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), toCam).normalize();
      const aim = mobile
        ? wp.clone().add(new THREE.Vector3(0, -reach * 0.22, 0))
        : wp.clone().add(right.multiplyScalar(reach * 0.28));
      look.current.lerp(aim, k(5));
    } else {
      const { yaw, pitch } = drag.current!;
      const r = home.length();
      const baseAngle = Math.atan2(home.y, home.z);
      const pa = THREE.MathUtils.clamp(baseAngle + pitch, 0.15, 1.2);
      const desired = tmp.set(Math.sin(yaw) * Math.cos(pa) * r, Math.sin(pa) * r, Math.cos(yaw) * Math.cos(pa) * r);
      camera.position.lerp(desired, k(2.4));
      look.current.lerp(new THREE.Vector3(0, 0, 0), k(3.5));
      if (!(drag.current as { active?: boolean }).active) drag.current!.yaw += dt * 0.03;
    }
    camera.lookAt(look.current);
  });
  return null;
}

export default function Galaxy({ planets, selected, onSelect, active, mobile }: Props) {
  const drag = useRef({ yaw: 0, pitch: 0, active: false, x: 0, y: 0, moved: 0 });

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ position: [0, 13, 24], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onPointerDown={(e) => {
        drag.current.active = true;
        drag.current.x = e.clientX;
        drag.current.y = e.clientY;
        drag.current.moved = 0;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.active || selected) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        d.moved += Math.abs(dx) + Math.abs(dy);
        d.yaw -= dx * 0.005;
        d.pitch = THREE.MathUtils.clamp(d.pitch + dy * 0.003, -0.4, 0.5);
        d.x = e.clientX;
        d.y = e.clientY;
      }}
      onPointerUp={() => (drag.current.active = false)}
      onPointerLeave={() => (drag.current.active = false)}
      onPointerMissed={() => drag.current.moved < 6 && selected && onSelect(null)}
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={["#05050a"]} />
      <ambientLight intensity={0.25} />
      <Stars radius={90} depth={50} count={mobile ? 2000 : 5000} factor={4} fade speed={0.5} />
      <Sun onClick={() => onSelect(null)} />
      <Orbits planets={planets} />
      {planets.map((p, i) => (
        <PlanetMesh
          key={p.id}
          p={p}
          index={i}
          selected={selected === p.id}
          anySelected={!!selected}
          onSelect={(id) => drag.current.moved < 6 && onSelect(id)}
        />
      ))}
      <Rig planets={planets} selected={selected} mobile={mobile} drag={drag} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.1} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}

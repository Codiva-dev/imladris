"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { useMemo, useRef } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  type Mesh,
  type Group,
} from "three";
import type { MapEdge, MapNode } from "@/components/council/map-graph-view";

type Props = {
  nodes: MapNode[];
  edges: MapEdge[];
  selected: string | null;
  onSelect: (id: string | null) => void;
};

function toScene(n: MapNode) {
  const x = (n.positionX - 50) / 12;
  const y = (50 - n.positionY) / 12;
  const z = (n.positionZ ?? 0) * 2.4;
  return [x, y, z] as const;
}

function StarMesh({
  node,
  active,
  onSelect,
  reduce,
}: {
  node: MapNode;
  active: boolean;
  onSelect: () => void;
  reduce: boolean | null;
}) {
  const ref = useRef<Mesh>(null);
  const isTopic = Boolean(node.topicId);
  const size =
    (isTopic ? 0.12 : 0.07) +
    Math.min(0.1, (node.meetingCount + node.reflectionCount) * 0.02);

  useFrame((_, delta) => {
    if (!ref.current || reduce) return;
    ref.current.rotation.y += delta * 0.15;
  });

  const color = active ? "#C8A96B" : isTopic ? "#EFE6D3" : "#4F7A63";
  const [x, y, z] = toScene(node);

  return (
    <mesh
      ref={ref}
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={active ? 0.9 : 0.35}
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}

function EdgeLines({
  nodes,
  edges,
}: {
  nodes: MapNode[];
  edges: MapEdge[];
}) {
  const geometry = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const positions: number[] = [];
    for (const e of edges) {
      const from = byId.get(e.fromId);
      const to = byId.get(e.toId);
      if (!from || !to) continue;
      const a = toScene(from);
      const b = toScene(to);
      positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, [nodes, edges]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={new Color("#C8A96B")}
        transparent
        opacity={0.32}
      />
    </lineSegments>
  );
}

function Constellation({
  nodes,
  edges,
  selected,
  onSelect,
  reduce,
}: Props & { reduce: boolean | null }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!group.current || reduce) return;
    group.current.rotation.y += delta * 0.04;
  });

  return (
    <group ref={group}>
      <EdgeLines nodes={nodes} edges={edges} />
      {nodes.map((n) => (
        <StarMesh
          key={n.id}
          node={n}
          active={selected === n.id}
          reduce={reduce}
          onSelect={() => onSelect(selected === n.id ? null : n.id)}
        />
      ))}
    </group>
  );
}

/** Cielo nocturno 3D - React Three Fiber con propósito narrativo. */
export function MapSkyView(props: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[16/11] rounded-sm overflow-hidden border border-parchment/10 bg-[#0b1210]">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#0b1210"]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[4, 6, 3]} intensity={0.8} color="#C8A96B" />
        <Stars
          radius={40}
          depth={30}
          count={reduce ? 400 : 1200}
          factor={2}
          saturation={0}
          fade
          speed={reduce ? 0 : 0.25}
        />
        <Constellation {...props} reduce={reduce} />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          autoRotate={!reduce}
          autoRotateSpeed={0.35}
        />
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center font-subtitle text-parchment/30 text-xs">
        Arrastra para orbitar
      </p>
    </div>
  );
}

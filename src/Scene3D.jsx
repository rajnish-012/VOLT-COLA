import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FLAVORS } from './flavors.js';

function makeLabelTexture(flavor) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1024;
  const c = canvas.getContext('2d'); const f = FLAVORS[flavor];
  const grad = c.createLinearGradient(0, 0, 1024, 1024); grad.addColorStop(0, f.dark); grad.addColorStop(.5, f.color); grad.addColorStop(1, f.dark);
  c.fillStyle = grad; c.fillRect(0, 0, 1024, 1024);
  c.fillStyle = 'rgba(255,255,255,.055)';
  for (let i = 0; i < 11; i++) { c.beginPath(); c.ellipse(i * 128 - 80, 520, 190, 620, -.31, 0, Math.PI * 2); c.fill(); }
  c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 125); c.lineTo(1024, 125); c.stroke(); c.beginPath(); c.moveTo(0, 892); c.lineTo(1024, 892); c.stroke();
  c.textAlign = 'center'; c.fillStyle = '#fff'; c.shadowColor = 'rgba(255,255,255,.4)'; c.shadowBlur = 24;
  c.font = '900 104px Arial, sans-serif'; c.fillText('VOLT', 512, 446);
  c.shadowBlur = 0; c.font = '700 33px Arial, sans-serif'; c.fillText('C O L A', 512, 500);
  c.fillStyle = f.accent; c.fillRect(370, 547, 284, 8);
  c.fillStyle = '#fff'; c.font = '700 23px Arial, sans-serif'; c.fillText(f.flavor, 512, 605); c.font = '500 14px Arial, sans-serif'; c.fillText('TURN IT UP.  •  EST. AFTER DARK', 512, 642);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; return texture;
}

function CanModel({ flavor = 'original', scale = 1, rotation = 0, selected = true, motion = true }) {
  const group = useRef();
  const dropMesh = useRef();
  const f = FLAVORS[flavor];
  const label = useMemo(() => makeLabelTexture(flavor), [flavor]);
  const drops = useMemo(() => Array.from({ length: 82 }, (_, i) => {
    const a = i * 2.39996, y = ((i * 37) % 100) / 100 * 2.24 - 1.12, r = .416 + .002;
    return [Math.cos(a) * r, y, Math.sin(a) * r, .008 + (i % 4) * .003];
  }), []);
  useEffect(() => {
    if (!dropMesh.current) return;
    const dummy = new THREE.Object3D();
    drops.forEach(([x, y, z, s], i) => { dummy.position.set(x, y, z); dummy.scale.set(s, s * 1.45, s); dummy.updateMatrix(); dropMesh.current.setMatrixAt(i, dummy.matrix); });
    dropMesh.current.instanceMatrix.needsUpdate = true;
  }, [drops]);
  useFrame((state, dt) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, rotation + (motion ? state.clock.elapsedTime * .12 : 0), 3, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, selected ? -.05 : .11, 3, dt);
  });
  return <group ref={group} scale={scale}>
    <mesh castShadow receiveShadow position={[0, 0, 0]}>
      <cylinderGeometry args={[.42, .42, 2.4, 96, 1, false]} />
      <meshPhysicalMaterial map={label} metalness={.47} roughness={.3} clearcoat={.8} clearcoatRoughness={.2} />
    </mesh>
    <mesh position={[0, 1.205, 0]}><cylinderGeometry args={[.405, .405, .055, 96]} /><meshStandardMaterial color="#a5a29d" metalness={.94} roughness={.2} /></mesh>
    <mesh position={[0, -1.205, 0]}><cylinderGeometry args={[.395, .395, .07, 96]} /><meshStandardMaterial color="#777471" metalness={.91} roughness={.23} /></mesh>
    <mesh position={[0, 1.237, 0]}><cylinderGeometry args={[.29, .29, .012, 64]} /><meshStandardMaterial color="#55524e" metalness={.9} roughness={.27} /></mesh>
    <mesh position={[.085, 1.253, .035]} rotation={[0, .25, -.08]}><torusGeometry args={[.085, .018, 8, 28]} /><meshStandardMaterial color="#d5d1cb" metalness={.95} roughness={.19} /></mesh>
    <instancedMesh ref={dropMesh} args={[undefined, undefined, drops.length]} castShadow>
      <sphereGeometry args={[1, 8, 8]} /><meshPhysicalMaterial color="#f8d9d5" roughness={.12} metalness={.08} clearcoat={1} />
    </instancedMesh>
    <mesh position={[0, 0, 0]}><cylinderGeometry args={[.421, .421, 2.4, 96, 1, true]} /><meshPhysicalMaterial color="#ffffff" metalness={.7} roughness={.24} transparent opacity={.17} side={THREE.DoubleSide} /></mesh>
  </group>;
}

function Can({ flavor, scale = 1, rotation = 0, selected = true, motion = true }) {
  return <CanModel flavor={flavor} scale={scale} rotation={rotation} selected={selected} motion={motion} />;
}

function FloatGroup({ children, speed = 1, rotationIntensity = .1, floatIntensity = .12, motion = true }) {
  const group = useRef();
  useFrame((state, dt) => {
    if (!group.current) return;
    const time = motion ? state.clock.elapsedTime * speed : 0;
    const y = motion ? Math.sin(time) * floatIntensity : 0;
    const tilt = motion ? Math.sin(time * .68) * rotationIntensity : 0;
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, y, 2.3, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, tilt, 2.3, dt);
  });
  return <group ref={group}>{children}</group>;
}

function Bubbles({ count = 500, motionState, mobile = false, motion = true }) {
  const mesh = useRef();
  const data = useMemo(() => Array.from({ length: mobile ? Math.floor(count * .42) : count }, (_, i) => ({ x: (Math.random() - .5) * 12, y: (Math.random() - .5) * 15, z: (Math.random() - .5) * 8, s: .012 + Math.random() * .038, speed: .12 + Math.random() * .35, phase: Math.random() * 7 })), [count, mobile]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state, dt) => {
    if (!mesh.current) return;
    const velocityBoost = motion ? Math.min(2, Math.abs(motionState?.velocity ?? 0) * .48) : 0;
    data.forEach((b, i) => {
      const time = motion ? state.clock.elapsedTime : 0;
      const y = ((b.y + time * b.speed * (1 + velocityBoost) + 7.5) % 15) - 7.5;
      dummy.position.set(b.x + Math.sin(time * .45 + b.phase) * (motion ? .13 : 0), y, b.z);
      const s = b.s * (1 + (motion ? .12 * Math.sin(time + b.phase) : 0)); dummy.scale.set(s, s, s); dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix);
    }); mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[undefined, undefined, data.length]}>
    <sphereGeometry args={[1, 10, 10]} /><meshPhysicalMaterial color="#dbe3ea" roughness={.08} metalness={.14} transparent opacity={.46} clearcoat={1} />
  </instancedMesh>;
}

function HeroScene({ motion, mobile, calm }) {
  const product = useRef();
  useFrame((state, dt) => {
    if (!product.current) return;
    const p = calm ? 0 : Math.min(1, motion.y / (window.innerHeight * .9));
    product.current.position.y = THREE.MathUtils.damp(product.current.position.y, -.1 + p * .45, 2, dt);
    product.current.rotation.z = THREE.MathUtils.damp(product.current.rotation.z, -.04 + p * .18, 2, dt);
    product.current.scale.setScalar(THREE.MathUtils.damp(product.current.scale.x, (mobile ? .84 : 1.04) + p * .12, 2, dt));
  });
  return <>
    <color attach="background" args={['#090707']} />
    <ambientLight intensity={1.1} /><spotLight position={[4, 6, 6]} intensity={150} angle={.44} penumbra={1} color="#ffe2d8" />
    <pointLight position={[-4, 1, -1]} intensity={85} color="#fa1628" /><pointLight position={[3, -1, -4]} intensity={34} color="#b8c2dc" />
    <group ref={product}><FloatGroup speed={1.05} rotationIntensity={.12} floatIntensity={.2} motion={!calm}><Can flavor="original" scale={1.03} motion={!calm} /></FloatGroup></group>
  </>;
}

function FizzScene({ motion, mobile, calm }) {
  const rig = useRef();
  useFrame((state, dt) => { if (rig.current) { const energy = calm ? 0 : Math.min(.17, Math.abs(motion.velocity) * .004); const drift = calm ? 0 : Math.sin(state.clock.elapsedTime * .16) * .09; rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, drift + energy, 2, dt); } });
  return <><ambientLight intensity={.5} /><pointLight position={[0, 4, 2]} intensity={38} color="#b91b2b" /><pointLight position={[-4, -2, 3]} intensity={18} color="#df6144" />
    <group ref={rig}><Bubbles motionState={calm ? null : motion} mobile={mobile} motion={!calm} /></group></>;
}

function ShowcaseScene({ active, mobile, calm }) {
  return <><ambientLight intensity={.8} /><spotLight position={[4, 4, 7]} intensity={100} color="#ffe8d4" /><pointLight position={[-5, 0, -3]} intensity={45} color="#e51930" />
    <FloatGroup speed={1.3} rotationIntensity={.1} floatIntensity={.16} motion={!calm}><Can flavor={active} scale={mobile ? .88 : 1.05} motion={!calm} /></FloatGroup>
  </>;
}

function ProductCanvas({ children, camera = [0, 0, 7], dpr, mobile }) {
  return <Canvas fallback={<div className="webgl-fallback"><span>VOLT</span></div>} dpr={dpr} camera={{ position: camera, fov: 34 }} gl={{ antialias: !mobile, alpha: true, powerPreference: mobile ? 'low-power' : 'high-performance', stencil: false }} onCreated={({ gl }) => { gl.setClearColor(0, 0); }}>
    {children}
  </Canvas>;
}

export default function Scene3D({ type, className, camera, dpr, motion, mobile, calm, active }) {
  let scene;
  if (type === 'hero') scene = <HeroScene motion={motion} mobile={mobile} calm={calm} />;
  else if (type === 'fizz') scene = <FizzScene motion={motion} mobile={mobile} calm={calm} />;
  else scene = <ShowcaseScene active={active} mobile={mobile} calm={calm} />;
  return <ProductCanvas camera={camera} dpr={dpr} mobile={mobile}>{scene}</ProductCanvas>;
}

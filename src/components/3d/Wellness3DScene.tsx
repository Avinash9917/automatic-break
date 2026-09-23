import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Wellness3DSceneProps {
  mode?: 'breathing' | 'ambient' | 'hero';
  className?: string;
}

export const Wellness3DScene = ({ mode = 'breathing', className = '' }: Wellness3DSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = mode === 'hero' ? 4.5 : 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // Group for all elements
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // 1. Central Breathing Core Sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(mode === 'hero' ? 1.6 : 1.4, 4);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
      wireframe: mode === 'hero',
    });
    const coreSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sceneGroup.add(coreSphere);

    // 2. Outer Wireframe Harmonic Cage
    const outerGeometry = new THREE.IcosahedronGeometry(mode === 'hero' ? 2.2 : 2.0, 2);
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const outerCage = new THREE.Mesh(outerGeometry, outerMaterial);
    sceneGroup.add(outerCage);

    // 3. Floating Relaxing Particle Cloud
    const particleCount = mode === 'hero' ? 350 : 250;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      particleScales[i] = Math.random() * 0.05 + 0.02;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xa855f7,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    sceneGroup.add(particleSystem);

    // 4. Orbiting Energy Ring / Torus
    const torusGeometry = new THREE.TorusGeometry(2.3, 0.04, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.8,
    });
    const ring1 = new THREE.Mesh(torusGeometry, torusMaterial);
    ring1.rotation.x = Math.PI / 3;
    sceneGroup.add(ring1);

    const ring2 = new THREE.Mesh(torusGeometry, torusMaterial.clone());
    ring2.rotation.y = Math.PI / 3;
    sceneGroup.add(ring2);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 20);
    pointLight2.position.set(-5, -5, -3);
    scene.add(pointLight2);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = -(y / rect.height) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      sceneGroup.rotation.y = elapsedTime * 0.2 + targetX * 0.5;
      sceneGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.2 + targetY * 0.3;

      // Organic Breathing Oscillation (Cycle = ~6 seconds)
      const breathPhase = (Math.sin(elapsedTime * 1.05) + 1) / 2; // 0 to 1
      const scale = 0.92 + breathPhase * 0.22;
      coreSphere.scale.set(scale, scale, scale);

      outerCage.rotation.x -= 0.005;
      outerCage.rotation.z += 0.008;

      ring1.rotation.z += 0.01;
      ring2.rotation.x += 0.012;

      particleSystem.rotation.y = -elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mode]);

  return <div ref={containerRef} className={`w-full h-full min-h-[300px] pointer-events-none select-none ${className}`} />;
};

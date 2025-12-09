
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarConfig } from '../types';
import { useGame } from '../context/GameContext';

interface GameSceneProps {
  config: AvatarConfig;
  hpPercent: number;
  isOverdrive: boolean;
}

export const GameScene: React.FC<GameSceneProps> = ({ config, hpPercent, isOverdrive }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { weather, user } = useGame();
  
  // Use a ref to persist time across re-renders/effect cleanups
  const timeRef = useRef(0);

  // Stabilize dependencies to prevent re-renders on identical object references
  const petKey = JSON.stringify(user?.pet);
  const configKey = JSON.stringify(config);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    
    // Background based on Weather/Mode
    let bg = 0x87CEEB;
    if (isOverdrive) bg = 0x2a0a0a;
    else if (weather === 'Rainy') bg = 0x4a5a6a;
    else if (weather === 'Snowy') bg = 0xe0f7fa;
    else if (weather === 'Heatwave') bg = 0xffcc80; // Orange tint
    else if (weather === 'Foggy') bg = 0x808080;

    scene.background = new THREE.Color(bg); 
    
    // Fog Density
    let fogFar = 100; // Default visibility
    if (weather === 'Foggy') fogFar = 60; // Increased so character is visible (Camera is at dist ~40)
    scene.fog = new THREE.Fog(bg, 10, fogFar);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 20, 30);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block'; // Prevents layout shifts
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, isOverdrive ? 0.2 : (weather === 'Sunny' ? 0.8 : 0.4));
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isOverdrive ? 0xff4444 : 0xffffff, 1.2);
    dirLight.position.set(-10, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Heatwave orange light
    if (weather === 'Heatwave') {
        const heatLight = new THREE.PointLight(0xffaa00, 1, 100);
        heatLight.position.set(0, 10, 0);
        scene.add(heatLight);
    }

    if (isOverdrive) {
       const flickerLight = new THREE.PointLight(0xff0000, 2, 50);
       flickerLight.position.set(0, 10, 0);
       scene.add(flickerLight);
    }

    // Sunny Lens Flare (Fake via simple sprite or bright billboard - skipping complex flare for simplicity)
    if (weather === 'Sunny' && !isOverdrive) {
       // Just increase directional intensity
       dirLight.intensity = 1.5;
    }

    const createBox = (w: number, h: number, d: number, color: number | string, x: number, y: number, z: number) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // --- ENVIRONMENT ---
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorColor = weather === 'Snowy' ? 0xffffff : (isOverdrive ? 0x111111 : 0x5d4037);
    const floorMat = new THREE.MeshStandardMaterial({ color: floorColor });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const counterGroup = new THREE.Group();
    const counterBase = createBox(20, 6, 6, 0x8d6e63, 0, 3, 8);
    const counterTop = createBox(22, 1, 8, 0xd7ccc8, 0, 6.5, 8);
    counterGroup.add(counterBase);
    counterGroup.add(counterTop);
    const machine = createBox(4, 5, 4, 0x333333, 5, 9, 8);
    counterGroup.add(machine);
    scene.add(counterGroup);

    // --- WEATHER PARTICLES ---
    let particles: THREE.Points | undefined;
    if (weather === 'Rainy' || weather === 'Snowy') {
        const particleCount = weather === 'Rainy' ? 1000 : 500;
        const geom = new THREE.BufferGeometry();
        const positions = [];
        for (let i = 0; i < particleCount; i++) {
            positions.push(Math.random() * 100 - 50); // x
            positions.push(Math.random() * 50);       // y
            positions.push(Math.random() * 100 - 50); // z
        }
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: weather === 'Rainy' ? 0xaaaaaa : 0xffffff,
            size: weather === 'Rainy' ? 0.3 : 0.6,
            transparent: true,
            opacity: 0.8
        });
        particles = new THREE.Points(geom, mat);
        scene.add(particles);
    }

    // --- CHARACTER ---
    const charGroup = new THREE.Group();
    
    const parsedConfig = JSON.parse(configKey);
    // Config Colors
    const skinColor = 0xffdbac;
    let clothColor = 0x4ade80; // Default Green
    if (parsedConfig.clothing === 'suit_black') clothColor = 0x111111;

    // Body
    const body = createBox(4, 5, 2, clothColor, 0, 2.5, 0);
    charGroup.add(body);
    
    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 5, 0);
    headGroup.add(createBox(3.5, 3.5, 3.5, skinColor, 0, 1.75, 0));
    
    // Eyes
    if (parsedConfig.eyes === 'sunglasses') {
       headGroup.add(createBox(3.6, 0.8, 0.5, 0x111111, 0, 2, 1.6));
    } else if (parsedConfig.eyes === 'monocle') {
       headGroup.add(createBox(1, 1, 0.2, 0xffd700, -0.8, 2, 1.8)); // Gold monocle
    } else {
       headGroup.add(createBox(0.5, 0.5, 0.2, 0x111111, -0.8, 2, 1.8));
       headGroup.add(createBox(0.5, 0.5, 0.2, 0x111111, 0.8, 2, 1.8));
    }

    // Hat logic
    if (parsedConfig.hat === 'cap_red') {
      const hatColor = 0xf87171;
      headGroup.add(createBox(3.7, 1, 3.7, hatColor, 0, 3.8, 0));
      headGroup.add(createBox(3.7, 0.2, 1.5, hatColor, 0, 3.6, 2));
    } else if (parsedConfig.hat === 'cap_blue') {
      const hatColor = 0x3b82f6;
      headGroup.add(createBox(3.7, 1, 3.7, hatColor, 0, 3.8, 0));
      headGroup.add(createBox(3.7, 0.2, 1.5, hatColor, 0, 3.6, 2));
    } else if (parsedConfig.hat === 'crown_gold') {
       // Crown spikes
       headGroup.add(createBox(3.7, 1.5, 3.7, 0xffd700, 0, 4, 0));
    }

    charGroup.add(headGroup);

    // Limbs
    const leftArm = createBox(1.2, 4, 1.2, skinColor, -2.8, 3, 0);
    const rightArm = createBox(1.2, 4, 1.2, skinColor, 2.8, 3, 0);
    charGroup.add(leftArm);
    charGroup.add(rightArm);
    
    const leftLeg = createBox(1.5, 4, 1.5, 0x111111, -1, -2, 0);
    const rightLeg = createBox(1.5, 4, 1.5, 0x111111, 1, -2, 0);
    charGroup.add(leftLeg);
    charGroup.add(rightLeg);

    charGroup.position.set(0, 4, 0);
    scene.add(charGroup);

    // --- DOG (IF OWNED) ---
    let dogGroup: THREE.Group | undefined;
    const parsedPet = JSON.parse(petKey || 'null');
    
    if (parsedPet) {
        dogGroup = new THREE.Group();
        const dogColor = 0x8D6E63; // Brown
        const dogBody = createBox(2.5, 1.5, 3, dogColor, 0, 1.5, 0);
        const dogHead = createBox(1.5, 1.5, 1.5, dogColor, 0, 2.5, 1.5);
        const dogTail = createBox(0.5, 1, 0.5, 0x5D4037, 0, 2, -1.5);
        
        dogGroup.add(dogBody);
        dogGroup.add(dogHead);
        dogGroup.add(dogTail);
        
        // Position dog near player
        dogGroup.position.set(5, 0, 4);
        scene.add(dogGroup);
    }

    // --- ANIMATION ---
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      // Increment persistent time ref
      timeRef.current += isOverdrive ? 0.1 : 0.03;
      const time = timeRef.current;

      charGroup.scale.y = 1 + Math.sin(time * 2) * 0.02;
      leftArm.rotation.x = Math.sin(time) * 0.1;
      rightArm.rotation.x = -Math.sin(time) * 0.1;

      // Parallax
      camera.position.x = Math.sin(time * 0.2) * 5 + 20;
      camera.position.z = Math.cos(time * 0.2) * 5 + 30;
      camera.lookAt(0, 5, 0);

      // Heatwave Haze (Simulated by camera wobble)
      if (weather === 'Heatwave') {
          camera.position.y = 20 + Math.sin(time * 10) * 0.2;
      } else {
          camera.position.y = 20;
      }

      // Mood
      if (hpPercent < 50) {
          headGroup.rotation.x = 0.4;
      } else {
          headGroup.rotation.x = Math.sin(time * 0.5) * 0.05;
      }

      // Dog Animation
      if (dogGroup) {
          // Wag tail
          const tail = dogGroup.children[2];
          tail.rotation.z = Math.sin(time * 10) * 0.4;
          // Happy jump if full
          if (parsedPet?.hunger && parsedPet.hunger > 80) {
              dogGroup.position.y = Math.abs(Math.sin(time * 5)) * 0.5;
          }
          // Follow player gently
          dogGroup.rotation.y = Math.sin(time) * 0.1;
      }

      // Weather Animation
      if (particles) {
          particles.position.y -= isOverdrive ? 1 : 0.5;
          if (particles.position.y < -20) particles.position.y = 20;
          particles.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [configKey, hpPercent, isOverdrive, weather, petKey]); 

  return <div ref={mountRef} className="fixed inset-0 z-0 bg-black" />;
};

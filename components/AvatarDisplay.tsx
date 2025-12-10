
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { AvatarConfig } from '../types';

interface AvatarProps {
  config: AvatarConfig;
  hpPercent: number;
  isOverdrive: boolean;
}

export const AvatarDisplay: React.FC<AvatarProps> = React.memo(({ config, hpPercent, isOverdrive }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Use refs for values accessed inside the animation loop.
  // This prevents the heavy Three.js setup effect from re-running whenever HP changes.
  const hpRef = useRef(hpPercent);
  const timeRef = useRef(0);

  useEffect(() => {
    hpRef.current = hpPercent;
  }, [hpPercent]);

  // Create a stable key for config to avoid re-renders on shallow object reference changes
  const configKey = useMemo(() => JSON.stringify(config), [config]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    // Background color handled by transparent canvas + CSS, but let's set simple fog
    scene.fog = new THREE.Fog(isOverdrive ? 0x1f2937 : 0xfef3c7, 10, 50);

    // Orthographic Camera for that "Isometric/Retro" look
    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    const frustumSize = 20;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
    );
    
    // Isometric view position
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); // Antialias false for crisp pixels
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, isOverdrive ? 0.4 : 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isOverdrive ? 0xff0000 : 0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    if (isOverdrive) {
        const redLight = new THREE.PointLight(0xff0000, 2, 20);
        redLight.position.set(-5, 5, 5);
        scene.add(redLight);
    }

    // --- VOXEL CHARACTER CONSTRUCTION ---
    const charGroup = new THREE.Group();
    
    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const clothesMat = new THREE.MeshStandardMaterial({ color: 0x4ade80 }); // Green apron
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xf87171 }); // Red Cap

    // Helper to create box mesh
    const createBox = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Body (4x6x2)
    const body = createBox(4, 5, 2, clothesMat, 0, 2.5, 0);
    charGroup.add(body);

    // Head (4x4x4)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 5, 0);
    const head = createBox(3.5, 3.5, 3.5, skinMat, 0, 1.75, 0);
    headGroup.add(head);

    // Eyes
    if (config.eyes === 'sunglasses') {
       const glasses = createBox(3.6, 0.8, 0.5, blackMat, 0, 2, 1.6);
       headGroup.add(glasses);
    } else {
       const leftEye = createBox(0.5, 0.5, 0.2, blackMat, -0.8, 2, 1.8);
       const rightEye = createBox(0.5, 0.5, 0.2, blackMat, 0.8, 2, 1.8);
       headGroup.add(leftEye);
       headGroup.add(rightEye);
    }

    // Hat
    if (config.hat === 'cap_red') {
      const hatBase = createBox(3.7, 1, 3.7, hatMat, 0, 3.8, 0);
      const hatBrim = createBox(3.7, 0.2, 1.5, hatMat, 0, 3.6, 2);
      headGroup.add(hatBase);
      headGroup.add(hatBrim);
    }

    charGroup.add(headGroup);

    // Arms
    const leftArm = createBox(1.2, 4, 1.2, skinMat, -2.8, 3, 0);
    const rightArm = createBox(1.2, 4, 1.2, skinMat, 2.8, 3, 0);
    charGroup.add(leftArm);
    charGroup.add(rightArm);

    // Legs
    const leftLeg = createBox(1.5, 4, 1.5, blackMat, -1, -2, 0);
    const rightLeg = createBox(1.5, 4, 1.5, blackMat, 1, -2, 0);
    charGroup.add(leftLeg);
    charGroup.add(rightLeg);

    scene.add(charGroup);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper for retro feel
    const gridHelper = new THREE.GridHelper(50, 25, 0x000000, 0x000000);
    gridHelper.position.y = -3.9;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // --- ANIMATION LOOP ---
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      timeRef.current += isOverdrive ? 0.15 : 0.05;
      const time = timeRef.current;
      const currentHp = hpRef.current; // Read from ref

      // Bobbing
      charGroup.position.y = Math.sin(time) * 0.2;

      // Breathing (scale)
      charGroup.scale.y = 1 + Math.sin(time * 2) * 0.02;

      // Arm swing
      leftArm.rotation.x = Math.sin(time) * 0.2;
      rightArm.rotation.x = -Math.sin(time) * 0.2;

      // Sad state (Low HP)
      if (currentHp < 50) {
        headGroup.rotation.x = 0.3; // Look down
        charGroup.rotation.z = Math.sin(time * 0.5) * 0.05; // Wobble
      } else {
        headGroup.rotation.x = Math.sin(time * 0.5) * 0.05; // Look around slightly
        charGroup.rotation.z = 0;
      }

      // Overdrive Shake
      if (isOverdrive) {
        camera.position.x = 20 + Math.random() * 0.2;
        camera.position.y = 20 + Math.random() * 0.2;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
        if (!mountRef.current) return;
        const newAspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.left = -frustumSize * newAspect / 2;
        camera.right = frustumSize * newAspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      
      // Robust Cleanup to prevent memory leaks
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
                object.material.forEach((m: THREE.Material) => m.dispose());
            } else {
                object.material.dispose();
            }
        }
      });
      
      renderer.dispose();
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [configKey, isOverdrive]); // Only rebuild if Config or Mode changes. HP changes are handled via ref.

  return (
    <div className="relative mx-auto mt-4 mb-8">
      {/* 3D Container */}
      <div 
        ref={mountRef} 
        className="w-full h-64 md:h-80 border-4 border-black bg-gradient-to-b from-transparent to-black/10 pixel-shadow"
      ></div>
      
      {/* HP Bar Overlay */}
      <div className="absolute -bottom-6 left-0 w-full h-6 border-4 border-black bg-gray-300 z-10">
         <div 
           className={`h-full transition-all duration-500 ${hpPercent < 30 ? 'bg-retro-red' : 'bg-retro-green'}`} 
           style={{ width: `${hpPercent}%` }}
         ></div>
         <span className="absolute inset-0 text-center text-xs font-bold leading-4 text-black pixel-text-shadow">HP {hpPercent}%</span>
      </div>
    </div>
  );
});

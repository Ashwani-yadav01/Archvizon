'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import sceneService from '../../services/sceneService';

export default function WalkthroughMode({ projectId, onExit }) {
  const mountRef = useRef(null);
  const [isLocked, setIsLocked] = useState(false);
  const [sceneLoading, setSceneLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState({ objects: 0, roomName: 'Interior Space' });

  useEffect(() => {
    if (!mountRef.current || !projectId) return;

    let isDisposed = false;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#141824');
    scene.fog = new THREE.FogExp2('#141824', 0.015);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Camera setup for first-person perspective (height 1.7m eye-level)
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0, 1.7, 5);

    // 3. Ambient & Photometric Lighting
    const hemiLight = new THREE.HemisphereLight('#f1f5f9', '#334155', 0.7);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.8);
    sunLight.position.set(12, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // 4. Ground Grid & Floor
    const gridHelper = new THREE.GridHelper(50, 50, '#38bdf8', '#334155');
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Architectural Floor Slab
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.6,
      metalness: 0.1
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 5. Load Project 3D Scene Objects from Backend
    const meshesMap = new Map();

    const buildMeshFromData = (obj) => {
      let geo;
      const gType = obj.geometry?.type || 'CUBE';
      const p = obj.geometry?.parameters || {};

      switch (gType) {
        case 'SPHERE':
          geo = new THREE.SphereGeometry(p.radius || 0.5, 32, 32);
          break;
        case 'CYLINDER':
          geo = new THREE.CylinderGeometry(p.radiusTop || 0.5, p.radiusBottom || 0.5, p.height || 1, 32);
          break;
        case 'PLANE':
          geo = new THREE.PlaneGeometry(p.width || 4, p.height || 4);
          break;
        case 'WALL':
          geo = new THREE.BoxGeometry(p.length || 4, p.height || 2.8, p.thickness || 0.2);
          break;
        case 'FLOOR':
          geo = new THREE.BoxGeometry(p.width || 6, p.thickness || 0.2, p.depth || 6);
          break;
        case 'COLUMN':
          geo = new THREE.CylinderGeometry(p.radius || 0.25, p.radius || 0.25, p.height || 3, 24);
          break;
        case 'DOOR':
          geo = new THREE.BoxGeometry(p.width || 0.9, p.height || 2.1, p.thickness || 0.08);
          break;
        case 'WINDOW':
          geo = new THREE.BoxGeometry(p.width || 1.4, p.height || 1.2, p.thickness || 0.1);
          break;
        case 'CUBE':
        default:
          geo = new THREE.BoxGeometry(p.width || 1, p.height || 1, p.depth || 1);
          break;
      }

      const m = obj.material || {};
      const mat = new THREE.MeshStandardMaterial({
        color: m.color || '#94a3b8',
        roughness: m.roughness ?? 0.5,
        metalness: m.metalness ?? 0.1,
        transparent: m.transparent || (m.opacity && m.opacity < 1),
        opacity: m.opacity ?? 1
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const pos = obj.position || obj.transform?.position;
      if (pos) {
        mesh.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
      }
      const rot = obj.rotation || obj.transform?.rotation;
      if (rot) {
        mesh.rotation.set(rot.x || 0, rot.y || 0, rot.z || 0);
      }
      const scl = obj.scale || obj.transform?.scale;
      if (scl) {
        mesh.scale.set(scl.x ?? 1, scl.y ?? 1, scl.z ?? 1);
      }

      return mesh;
    };

    sceneService.getSceneByProject(projectId)
      .then((res) => {
        if (isDisposed) return;
        const sceneData = res?.objects ? res : (res?.data || res);
        if (sceneData?.objects && sceneData.objects.length > 0) {
          sceneData.objects.forEach((obj) => {
            const mesh = buildMeshFromData(obj);
            scene.add(mesh);
            meshesMap.set(obj.id, mesh);
          });
          setStats({ objects: sceneData.objects.length, roomName: sceneData.name || 'Architectural Space' });
        } else {
          // Add default architectural walls for exploratory walkthrough
          const defaultWall1 = new THREE.Mesh(
            new THREE.BoxGeometry(8, 2.8, 0.2),
            new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 })
          );
          defaultWall1.position.set(0, 1.4, -4);
          scene.add(defaultWall1);

          const defaultWall2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 2.8, 8),
            new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 })
          );
          defaultWall2.position.set(-4, 1.4, 0);
          scene.add(defaultWall2);
          setStats({ objects: 2, roomName: 'Architectural Starter Space' });
        }
        setSceneLoading(false);
      })
      .catch((err) => {
        console.warn('Could not load scene data for walkthrough:', err);
        setSceneLoading(false);
      });

    // 6. First-Person Walkthrough Controls (WASD + Pointer Lock)
    const keysPressed = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, ShiftLeft: false, ShiftRight: false };

    const onKeyDown = (e) => {
      if (keysPressed.hasOwnProperty(e.code)) {
        keysPressed[e.code] = true;
      }
    };

    const onKeyUp = (e) => {
      if (keysPressed.hasOwnProperty(e.code)) {
        keysPressed[e.code] = false;
      }
    };

    // Euler rotation angles for mouse look
    let yaw = 0;
    let pitch = 0;

    const onMouseMove = (e) => {
      if (document.pointerLockElement !== renderer.domElement) return;

      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      yaw -= movementX * 0.0022;
      pitch -= movementY * 0.0022;

      // Clamp vertical pitch to prevent flipping (-85° to +85°)
      pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch));

      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.x = pitch;
      euler.y = yaw;
      camera.quaternion.setFromEuler(euler);
    };

    const onPointerLockChange = () => {
      setIsLocked(document.pointerLockElement === renderer.domElement);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    // 7. Animation Loop with eye-level constraint & velocity
    let animationFrameId;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = performance.now();
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (document.pointerLockElement === renderer.domElement) {
        const speed = (keysPressed.ShiftLeft || keysPressed.ShiftRight) ? 7.5 : 3.8;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0; // Constrain movement to horizontal ground plane
        forward.normalize();

        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        right.y = 0;
        right.normalize();

        const moveDir = new THREE.Vector3();
        if (keysPressed.KeyW) moveDir.add(forward);
        if (keysPressed.KeyS) moveDir.sub(forward);
        if (keysPressed.KeyD) moveDir.add(right);
        if (keysPressed.KeyA) moveDir.sub(right);

        if (moveDir.lengthSq() > 0) {
          moveDir.normalize();
          camera.position.addScaledVector(moveDir, speed * delta);
        }

        // Maintain 1.7m eye-level above ground
        camera.position.y = 1.7;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [projectId]);

  const requestLock = () => {
    if (mountRef.current?.querySelector('canvas')) {
      mountRef.current.querySelector('canvas').requestPointerLock();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-[650px] md:h-[750px] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" onClick={!isLocked ? requestLock : undefined} />

      {/* Loading Overlay */}
      {sceneLoading && (
        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-30">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono text-emerald-400">Loading 3D walkthrough environment...</p>
        </div>
      )}

      {/* Crosshair (visible when locked into first person) */}
      {isLocked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="w-2.5 h-2.5 rounded-full border border-white/60 bg-white/20" />
        </div>
      )}

      {/* Top HUD Overlay */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-800 shadow-lg pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white">First-Person 3D Walkthrough</span>
          <span className="text-[10px] text-neutral-400 font-mono">• {stats.roomName} ({stats.objects} objects)</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            className="bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-medium transition-colors shadow-lg"
          >
            {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="bg-neutral-900/80 hover:bg-red-950/80 text-neutral-300 hover:text-red-400 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-red-800/80 text-xs font-medium transition-colors shadow-lg"
            >
              ✕ Exit Tour
            </button>
          )}
        </div>
      </div>

      {/* Bottom HUD: Controls Instruction / Enter Tour Prompt */}
      {!isLocked && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-auto z-10">
          <button
            onClick={requestLock}
            className="group px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-2xl shadow-emerald-950 flex items-center gap-3 transition-transform hover:scale-105"
          >
            <span className="text-xl">🚶‍♂️</span>
            <span>Click to Enter 3D Walkthrough</span>
          </button>
          <p className="text-xs text-neutral-400 mt-3 font-medium">
            Lock mouse to look around and explore the space in real-time
          </p>
        </div>
      )}

      {/* Floating Keyboard Controls Guide */}
      <div className="absolute bottom-4 left-4 bg-neutral-900/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 text-[11px] shadow-xl pointer-events-none z-20 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-emerald-400 font-bold">W</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-emerald-400 font-bold">A</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-emerald-400 font-bold">S</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-emerald-400 font-bold">D</kbd>
          <span className="ml-1 text-neutral-400">Move</span>
        </div>
        <div className="h-3 w-px bg-neutral-700" />
        <div>
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-emerald-400 font-bold">Shift</kbd>
          <span className="ml-1 text-neutral-400">Sprint</span>
        </div>
        <div className="h-3 w-px bg-neutral-700" />
        <div>
          <span className="text-emerald-400 font-bold">Mouse</span>
          <span className="ml-1 text-neutral-400">Look</span>
        </div>
        <div className="h-3 w-px bg-neutral-700" />
        <div>
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-neutral-300">Esc</kbd>
          <span className="ml-1 text-neutral-400">Unlock Mouse</span>
        </div>
      </div>
    </div>
  );
}

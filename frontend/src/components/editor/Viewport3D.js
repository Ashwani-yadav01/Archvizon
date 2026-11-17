'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import {
  Box,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  Camera,
  RotateCcw,
  Sun,
  Grid
} from 'lucide-react';

export default function Viewport3D({
  objects = [],
  selectedObjectId = null,
  onSelectObject = () => {},
  onUpdateObjectTransforms = () => {},
  transformMode = 'translate', // 'translate', 'rotate', 'scale'
  transformSpace = 'world', // 'world', 'local'
  snapEnabled = true,
  snapStep = 0.5,
  shadingMode = 'MATERIAL', // 'WIREFRAME', 'SOLID', 'MATERIAL', 'RENDERED'
  cameraView = 'PERSPECTIVE',
  onSceneStats = () => {},
  viewportRef = null
}) {
  const mountRef = useRef(null);
  const containerRef = useRef(null);

  // Three.js instances stored in refs to avoid re-instantiation
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const orbitControlsRef = useRef(null);
  const transformControlsRef = useRef(null);
  const meshMapRef = useRef(new Map()); // objectId -> THREE.Object3D
  const boxHelperRef = useRef(null);
  const gridHelperRef = useRef(null);
  const axesHelperRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const ambientLightRef = useRef(null);
  const dirLightRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Three.js WebGL Scene on Mount
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 600;

    // 1. Scene
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? '#090d16' : '#eef2f6');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(9, 7, 9);
    cameraRef.current = camera;

    // 3. Renderer with ACES ToneMapping & Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Secondary fill light
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.4);
    fillLight.position.set(-15, 10, -15);
    scene.add(fillLight);

    // 5. Grid & Axes
    const gridHelper = new THREE.GridHelper(30, 30, 0x0284c7, isDark ? 0x1e293b : 0xcbd5e1);
    gridHelper.position.y = 0;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.position.set(0, 0.01, 0);
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;

    // 6. OrbitControls
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.08;
    orbit.maxPolarAngle = Math.PI / 2 - 0.01; // prevent camera sinking under floor
    orbit.minDistance = 1;
    orbit.maxDistance = 100;
    orbit.target.set(0, 1, 0);
    orbitControlsRef.current = orbit;

    // 7. TransformControls (Blender-style gizmo)
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.85;
    scene.add(transformControls.getHelper());
    transformControlsRef.current = transformControls;

    // Disable OrbitControls while dragging gizmo
    transformControls.addEventListener('dragging-changed', (event) => {
      orbit.enabled = !event.value;
    });

    // Update object transform when gizmo is modified
    transformControls.addEventListener('objectChange', () => {
      const activeObj = transformControls.object;
      if (!activeObj || !activeObj.userData?.id) return;

      const pos = {
        x: parseFloat(activeObj.position.x.toFixed(3)),
        y: parseFloat(activeObj.position.y.toFixed(3)),
        z: parseFloat(activeObj.position.z.toFixed(3))
      };
      const rot = {
        x: parseFloat(THREE.MathUtils.radToDeg(activeObj.rotation.x).toFixed(1)),
        y: parseFloat(THREE.MathUtils.radToDeg(activeObj.rotation.y).toFixed(1)),
        z: parseFloat(THREE.MathUtils.radToDeg(activeObj.rotation.z).toFixed(1))
      };
      const scl = {
        x: parseFloat(activeObj.scale.x.toFixed(3)),
        y: parseFloat(activeObj.scale.y.toFixed(3)),
        z: parseFloat(activeObj.scale.z.toFixed(3))
      };

      onUpdateObjectTransforms(activeObj.userData.id, { position: pos, rotation: rot, scale: scl });

      if (boxHelperRef.current) {
        boxHelperRef.current.update();
      }
    });

    // 8. Selection BoxHelper (Cyan outline)
    const boxHelper = new THREE.BoxHelper(new THREE.Mesh(), 0x38bdf8);
    boxHelper.visible = false;
    scene.add(boxHelper);
    boxHelperRef.current = boxHelper;

    // 9. Raycasting Pointer Handler (Click selection)
    let pointerDownTime = 0;
    const onPointerDown = () => {
      pointerDownTime = Date.now();
    };

    const onPointerUp = (event) => {
      // Only select if it was a quick click, not an orbit drag
      if (Date.now() - pointerDownTime > 250) return;
      if (transformControls.dragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Find all selectable meshes
      const candidates = [];
      meshMapRef.current.forEach((mesh) => {
        if (mesh.visible) {
          if (mesh.isGroup) {
            candidates.push(...mesh.children);
          } else {
            candidates.push(mesh);
          }
        }
      });

      const intersects = raycasterRef.current.intersectObjects(candidates, true);
      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData?.id && hit.parent && hit.parent !== scene) {
          hit = hit.parent;
        }
        if (hit && hit.userData?.id) {
          onSelectObject(hit.userData.id);
          return;
        }
      }

      // If clicked empty space, deselect
      onSelectObject(null);
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointerup', onPointerUp);

    // 10. Resize Observer
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Theme observer for real-time background & grid update
    const themeObserver = new MutationObserver(() => {
      const darkNow = document.documentElement.classList.contains('dark');
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(darkNow ? '#090d16' : '#eef2f6');
      }
      if (gridHelperRef.current && sceneRef.current) {
        sceneRef.current.remove(gridHelperRef.current);
        gridHelperRef.current.geometry?.dispose();
        const newGrid = new THREE.GridHelper(30, 30, 0x0284c7, darkNow ? 0x1e293b : 0xcbd5e1);
        newGrid.position.y = 0;
        sceneRef.current.add(newGrid);
        gridHelperRef.current = newGrid;
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // 11. Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      orbit.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      themeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointerup', onPointerUp);
      transformControls.dispose();
      renderer.dispose();
      if (mount) mount.innerHTML = '';
    };
  }, []);

  // Update TransformControls Mode & Space & Snapping
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc) return;

    tc.setMode(transformMode);
    tc.setSpace(transformSpace);

    if (snapEnabled) {
      tc.setTranslationSnap(snapStep);
      tc.setRotationSnap(THREE.MathUtils.degToRad(15));
      tc.setScaleSnap(0.25);
    } else {
      tc.setTranslationSnap(null);
      tc.setRotationSnap(null);
      tc.setScaleSnap(null);
    }
  }, [transformMode, transformSpace, snapEnabled, snapStep]);

  // Synchronize 3D Meshes from React Objects state
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentMap = meshMapRef.current;
    const incomingIds = new Set(objects.map((o) => o.id));

    // 1. Remove meshes that no longer exist
    currentMap.forEach((mesh, id) => {
      if (!incomingIds.has(id)) {
        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else mesh.material.dispose();
        }
        currentMap.delete(id);
      }
    });

    let totalVertices = 0;
    let totalTriangles = 0;

    // 2. Add or update incoming objects
    objects.forEach((objData) => {
      let mesh = currentMap.get(objData.id);

      // Create material based on shading mode
      let material;
      if (shadingMode === 'WIREFRAME') {
        material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: objData.material?.color || '#38bdf8'
        });
      } else if (shadingMode === 'SOLID') {
        material = new THREE.MeshStandardMaterial({
          color: '#cbd5e1',
          roughness: 0.75,
          metalness: 0.1
        });
      } else {
        // MATERIAL / RENDERED mode
        material = new THREE.MeshStandardMaterial({
          color: objData.material?.color || '#94a3b8',
          roughness: objData.material?.roughness ?? 0.6,
          metalness: objData.material?.metalness ?? 0.1,
          wireframe: Boolean(objData.material?.wireframe),
          transparent: (objData.material?.opacity ?? 1) < 1,
          opacity: objData.material?.opacity ?? 1
        });
      }

      if (!mesh) {
        // Create new mesh/group based on type
        const params = objData.geometry?.parameters || {};

        if (objData.type === 'PRIMITIVE_SPHERE') {
          const geo = new THREE.SphereGeometry(params.radius || 1, 32, 24);
          mesh = new THREE.Mesh(geo, material);
        } else if (objData.type === 'PRIMITIVE_CYLINDER' || objData.type === 'COLUMN') {
          const geo = new THREE.CylinderGeometry(
            params.radiusTop || 0.6,
            params.radiusBottom || 0.6,
            params.height || 2.5,
            32
          );
          mesh = new THREE.Mesh(geo, material);
        } else if (objData.type === 'PRIMITIVE_PLANE') {
          const geo = new THREE.PlaneGeometry(params.width || 6, params.height || 6);
          geo.rotateX(-Math.PI / 2);
          mesh = new THREE.Mesh(geo, material);
        } else if (objData.type === 'PRIMITIVE_CONE') {
          const geo = new THREE.ConeGeometry(params.radius || 1, params.height || 2, 32);
          mesh = new THREE.Mesh(geo, material);
        } else if (objData.type === 'PRIMITIVE_TORUS') {
          const geo = new THREE.TorusGeometry(params.radius || 1.2, params.tube || 0.35, 16, 64);
          mesh = new THREE.Mesh(geo, material);
        } else if (objData.type === 'FURNITURE' && objData.name?.toLowerCase().includes('sofa')) {
          // Compound furniture: detailed modern sofa
          mesh = new THREE.Group();
          // Seat base
          const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.0), material);
          base.position.y = 0.2;
          base.castShadow = true;
          base.receiveShadow = true;
          mesh.add(base);
          // Backrest
          const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.25), material);
          back.position.set(0, 0.65, -0.38);
          back.castShadow = true;
          mesh.add(back);
          // Left arm
          const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 1.0), material);
          armL.position.set(-1.1, 0.45, 0);
          armL.castShadow = true;
          mesh.add(armL);
          // Right arm
          const armR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 1.0), material);
          armR.position.set(1.1, 0.45, 0);
          armR.castShadow = true;
          mesh.add(armR);
        } else if (objData.type === 'FURNITURE' && objData.name?.toLowerCase().includes('table')) {
          // Compound furniture: 4-legged dining/coffee table
          mesh = new THREE.Group();
          const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.9), material);
          top.position.y = 0.5;
          top.castShadow = true;
          top.receiveShadow = true;
          mesh.add(top);
          const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12);
          const legMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3, metalness: 0.8 });
          [
            [-0.7, 0.25, -0.35],
            [0.7, 0.25, -0.35],
            [-0.7, 0.25, 0.35],
            [0.7, 0.25, 0.35]
          ].forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(x, y, z);
            leg.castShadow = true;
            mesh.add(leg);
          });
        } else {
          // Default: Box geometry for CUBE, WALL, FLOOR, DOOR, WINDOW
          const w = params.width || 1.5;
          const h = params.height || 1.5;
          const d = params.depth || 1.5;
          const geo = new THREE.BoxGeometry(w, h, d);
          mesh = new THREE.Mesh(geo, material);
        }

        mesh.userData = { id: objData.id };
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        currentMap.set(objData.id, mesh);
      } else {
        // Update existing mesh material
        if (mesh.isMesh) {
          mesh.material = material;
        } else if (mesh.isGroup) {
          mesh.children.forEach((c) => {
            if (c.isMesh) c.material = material;
          });
        }
      }

      // Update position, rotation, scale, visibility
      mesh.position.set(objData.position?.x || 0, objData.position?.y || 0, objData.position?.z || 0);

      // Rotation stored in degrees, converted to radians for Three.js
      const rx = THREE.MathUtils.degToRad(objData.rotation?.x || 0);
      const ry = THREE.MathUtils.degToRad(objData.rotation?.y || 0);
      const rz = THREE.MathUtils.degToRad(objData.rotation?.z || 0);
      mesh.rotation.set(rx, ry, rz);

      mesh.scale.set(objData.scale?.x || 1, objData.scale?.y || 1, objData.scale?.z || 1);
      mesh.visible = objData.visible !== false;

      // Calculate scene stats
      if (mesh.geometry) {
        totalVertices += mesh.geometry.attributes.position?.count || 0;
        totalTriangles += (mesh.geometry.index ? mesh.geometry.index.count / 3 : mesh.geometry.attributes.position?.count / 3) || 0;
      }
    });

    onSceneStats({
      objectsCount: objects.length,
      verticesCount: Math.round(totalVertices),
      trianglesCount: Math.round(totalTriangles)
    });
  }, [objects, shadingMode]);

  // Synchronize TransformControls Attachment with selectedObjectId
  useEffect(() => {
    const tc = transformControlsRef.current;
    const boxHelper = boxHelperRef.current;
    if (!tc) return;

    if (!selectedObjectId) {
      tc.detach();
      if (boxHelper) boxHelper.visible = false;
      return;
    }

    const mesh = meshMapRef.current.get(selectedObjectId);
    if (mesh) {
      tc.attach(mesh);
      if (boxHelper) {
        boxHelper.setFromObject(mesh);
        boxHelper.visible = true;
      }
    } else {
      tc.detach();
      if (boxHelper) boxHelper.visible = false;
    }
  }, [selectedObjectId]);

  // Handle Preset Camera Views
  const setPresetCamera = useCallback((view) => {
    const camera = cameraRef.current;
    const orbit = orbitControlsRef.current;
    if (!camera || !orbit) return;

    const dist = 14;
    if (view === 'TOP') {
      camera.position.set(0, dist, 0.01);
      orbit.target.set(0, 0, 0);
    } else if (view === 'FRONT') {
      camera.position.set(0, 3, dist);
      orbit.target.set(0, 1.5, 0);
    } else if (view === 'RIGHT') {
      camera.position.set(dist, 3, 0);
      orbit.target.set(0, 1.5, 0);
    } else if (view === 'ISO') {
      camera.position.set(dist, dist * 0.8, dist);
      orbit.target.set(0, 1, 0);
    } else {
      // PERSPECTIVE
      camera.position.set(9, 7, 9);
      orbit.target.set(0, 1, 0);
    }
    camera.lookAt(orbit.target);
    orbit.update();
  }, []);

  // Expose camera controls and export through forwarded ref
  useEffect(() => {
    if (viewportRef) {
      viewportRef.current = {
        setCameraView: setPresetCamera,
        captureScreenshot: () => {
          if (!rendererRef.current) return null;
          return rendererRef.current.domElement.toDataURL('image/jpeg', 0.95);
        },
        exportGLTF: (fileName = 'scene.glb') => {
          if (!sceneRef.current) return;
          const exporter = new GLTFExporter();
          exporter.parse(
            sceneRef.current,
            (gltf) => {
              const blob = new Blob([gltf], { type: 'model/gltf-binary' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
              URL.revokeObjectURL(url);
            },
            (error) => {
              console.error('Failed to export GLTF:', error);
            },
            { binary: true }
          );
        }
      };
    }
  }, [viewportRef, setPresetCamera]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#090d16] overflow-hidden select-none flex flex-col group"
    >
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair active:cursor-grabbing" />

      {/* Floating Overlay Pill (Viewport Mode & Helpers) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-auto">
        <div className="px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-white">3D Viewport</span>
          <span className="text-slate-500">|</span>
          <span className="text-sky-400">{shadingMode}</span>
        </div>

        {/* Camera Preset Quick Buttons */}
        <div className="hidden sm:flex items-center rounded-md bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-0.5 text-[10px] font-mono shadow-lg text-slate-300">
          {['PERSP', 'TOP', 'FRONT', 'ISO'].map((preset) => (
            <button
              key={preset}
              onClick={() => setPresetCamera(preset === 'PERSP' ? 'PERSPECTIVE' : preset)}
              className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-white transition"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Viewport Quick Controls (Top-Right) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setPresetCamera('PERSPECTIVE')}
          className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white shadow-lg transition"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white shadow-lg transition"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Viewport'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Selected Object Indicator Strip */}
      {selectedObjectId && (
        <div className="absolute bottom-3 left-3 z-10 px-3 py-1 rounded-md bg-sky-950/90 backdrop-blur-md border border-sky-600/80 text-[11px] font-mono text-sky-300 shadow-xl flex items-center gap-2">
          <Box className="w-3.5 h-3.5 text-sky-400" />
          <span>Selected: {objects.find((o) => o.id === selectedObjectId)?.name || selectedObjectId}</span>
          <span className="text-sky-500">({transformMode.toUpperCase()} mode)</span>
        </div>
      )}
    </div>
  );
}

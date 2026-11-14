'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function PanoramaViewer({
  panoramaSrc,
  title = '360° Architectural Scene'
}) {
  const mountRef = useRef(null);
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // References for three.js objects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const onPointerDownPointerXRef = useRef(0);
  const onPointerDownPointerYRef = useRef(0);
  const lonRef = useRef(0);
  const onPointerDownLonRef = useRef(0);
  const latRef = useRef(0);
  const onPointerDownLatRef = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0);
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    setIsLoading(true);
    setError('');

    // Dimensions
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);
    cameraRef.current = camera;

    // 3. Inverted Sphere Geometry for equirectangular projection
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // 4. Texture Loader
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    textureLoader.load(
      panoramaSrc,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load 360 panorama texture:', err);
        setError('Failed to load 360° panorama image texture. Please verify source file format.');
        setIsLoading(false);
      }
    );

    // 5. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Interaction handlers
    const onPointerDown = (event) => {
      isUserInteractingRef.current = true;
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      onPointerDownPointerXRef.current = clientX;
      onPointerDownPointerYRef.current = clientY;
      onPointerDownLonRef.current = lonRef.current;
      onPointerDownLatRef.current = latRef.current;
    };

    const onPointerMove = (event) => {
      if (!isUserInteractingRef.current) return;
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      lonRef.current = (onPointerDownPointerXRef.current - clientX) * 0.15 + onPointerDownLonRef.current;
      latRef.current = (clientY - onPointerDownPointerYRef.current) * 0.15 + onPointerDownLatRef.current;
    };

    const onPointerUp = () => {
      isUserInteractingRef.current = false;
    };

    const onWheel = (event) => {
      event.preventDefault();
      if (!cameraRef.current) return;
      const fov = cameraRef.current.fov + event.deltaY * 0.05;
      cameraRef.current.fov = THREE.MathUtils.clamp(fov, 30, 95);
      cameraRef.current.updateProjectionMatrix();
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      if (isAutoRotating && !isUserInteractingRef.current) {
        lonRef.current += 0.08;
      }

      latRef.current = Math.max(-85, Math.min(85, latRef.current));
      phiRef.current = THREE.MathUtils.degToRad(90 - latRef.current);
      thetaRef.current = THREE.MathUtils.degToRad(lonRef.current);

      const targetX = 500 * Math.sin(phiRef.current) * Math.cos(thetaRef.current);
      const targetY = 500 * Math.cos(phiRef.current);
      const targetZ = 500 * Math.sin(phiRef.current) * Math.sin(thetaRef.current);

      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        cameraRef.current.lookAt(targetX, targetY, targetZ);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (dom) {
        dom.removeEventListener('pointerdown', onPointerDown);
        dom.removeEventListener('pointermove', onPointerMove);
        dom.removeEventListener('pointerup', onPointerUp);
        dom.removeEventListener('wheel', onWheel);
      }
      if (rendererRef.current) rendererRef.current.dispose();
      if (mount) mount.innerHTML = '';
    };
  }, [panoramaSrc, isAutoRotating]);

  const handleZoom = (delta) => {
    if (!cameraRef.current) return;
    const fov = cameraRef.current.fov + delta;
    cameraRef.current.fov = THREE.MathUtils.clamp(fov, 30, 95);
    cameraRef.current.updateProjectionMatrix();
  };

  const resetView = () => {
    lonRef.current = 0;
    latRef.current = 0;
    if (cameraRef.current) {
      cameraRef.current.fov = 75;
      cameraRef.current.updateProjectionMatrix();
    }
  };

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
      className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex flex-col group select-none"
    >
      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm border border-purple-500/60 text-purple-300 font-mono text-[11px] font-semibold flex items-center gap-1.5 shadow">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive 360° Panorama</span>
        </span>
      </div>

      {/* WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full h-[480px] bg-black cursor-grab active:cursor-grabbing flex items-center justify-center relative"
      >
        {isLoading && (
          <div className="text-center p-8 space-y-2 text-slate-400">
            <Sparkles className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
            <p className="text-xs font-mono">Loading 360° spherical projection...</p>
          </div>
        )}

        {error && (
          <div className="text-center p-8 space-y-2 text-rose-400 max-w-md">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center gap-2 text-white">
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`p-1.5 rounded-full transition ${
            isAutoRotating ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
          title={isAutoRotating ? 'Pause auto-rotation' : 'Start auto-tour rotation'}
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
        </button>

        <div className="h-4 w-px bg-slate-700" />

        <button
          onClick={() => handleZoom(-10)}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(10)}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={resetView}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 transition"
          title="Reset View Orientation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-700" />

        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 transition"
          title="Fullscreen Mode"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

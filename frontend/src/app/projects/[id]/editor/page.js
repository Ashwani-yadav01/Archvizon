'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import projectService from '../../../../services/projectService';
import sceneService from '../../../../services/sceneService';
import Viewport3D from '../../../../components/editor/Viewport3D';
import TopToolbar from '../../../../components/editor/TopToolbar';
import ModelingToolbar from '../../../../components/editor/ModelingToolbar';
import SceneHierarchy from '../../../../components/editor/SceneHierarchy';
import PropertiesPanel from '../../../../components/editor/PropertiesPanel';
import StatusBar from '../../../../components/editor/StatusBar';
import AssetLibraryDrawer from '../../../../components/editor/AssetLibraryDrawer';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [scene, setScene] = useState(null);

  // Scene state
  const [objects, setObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [environment, setEnvironment] = useState({});
  const [cameraConfig, setCameraConfig] = useState({});

  // Editor controls state
  const [transformMode, setTransformMode] = useState('translate'); // 'translate', 'rotate', 'scale'
  const [transformSpace, setTransformSpace] = useState('world'); // 'world', 'local'
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapStep, setSnapStep] = useState(0.5);
  const [shadingMode, setShadingMode] = useState('MATERIAL'); // 'WIREFRAME', 'SOLID', 'MATERIAL', 'RENDERED'
  const [cameraView, setCameraView] = useState('PERSPECTIVE');
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState('MODEL');
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);

  // Stats
  const [sceneStats, setSceneStats] = useState({ objectsCount: 0, verticesCount: 0, trianglesCount: 0 });

  // Save & Undo/Redo state
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'dirty'
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const autoSaveTimerRef = useRef(null);
  const viewportRef = useRef(null);

  // Fetch project and scene data
  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const projData = await projectService.getProjectById(projectId);
        setProject(projData.project);

        const sceneData = await sceneService.getProjectScene(projectId);
        setScene(sceneData);
        setObjects(sceneData.objects || []);
        setEnvironment(sceneData.environment || {});
        setCameraConfig(sceneData.camera || {});
      } catch (err) {
        console.error('Failed to load 3D scene data:', err);
        setError(err.message || 'Failed to load project 3D workspace');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  // Push undo state before mutations
  const pushUndoSnapshot = useCallback((newObjects) => {
    undoStackRef.current.push(JSON.parse(JSON.stringify(objects)));
    if (undoStackRef.current.length > 30) undoStackRef.current.shift();
    redoStackRef.current = []; // clear redo on new action
    setObjects(newObjects);
    setSaveStatus('dirty');
  }, [objects]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop();
    redoStackRef.current.push(JSON.parse(JSON.stringify(objects)));
    setObjects(prev);
    setSaveStatus('dirty');
  }, [objects]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop();
    undoStackRef.current.push(JSON.parse(JSON.stringify(objects)));
    setObjects(next);
    setSaveStatus('dirty');
  }, [objects]);

  // Save Scene to Backend
  const handleSaveScene = useCallback(async () => {
    if (!scene?._id) return;

    try {
      setSaveStatus('saving');
      await sceneService.updateScene(scene._id, {
        objects,
        environment,
        camera: cameraConfig
      });

      // Capture real-time WebGL snapshot and update project thumbnail
      if (viewportRef.current?.captureScreenshot && project?._id) {
        try {
          const thumb = viewportRef.current.captureScreenshot();
          if (thumb) {
            projectService.updateThumbnail(project._id, thumb).catch(() => {});
          }
        } catch (_) {}
      }

      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to save scene:', err);
      setSaveStatus('dirty');
    }
  }, [scene, objects, environment, cameraConfig, project]);

  // Debounced Auto-save when dirty
  useEffect(() => {
    if (saveStatus !== 'dirty') return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveScene();
    }, 2500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [saveStatus, handleSaveScene]);

  // Update single object transforms from Viewport3D
  const handleUpdateObjectTransforms = useCallback((objectId, transforms) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== objectId) return obj;
        return {
          ...obj,
          position: transforms.position || obj.position,
          rotation: transforms.rotation || obj.rotation,
          scale: transforms.scale || obj.scale
        };
      })
    );
    setSaveStatus('dirty');
  }, []);

  // Update object transform from numeric PropertiesPanel
  const handleUpdateNumericTransform = useCallback((transforms) => {
    if (!selectedObjectId) return;
    pushUndoSnapshot(
      objects.map((obj) => {
        if (obj.id !== selectedObjectId) return obj;
        return {
          ...obj,
          position: transforms.position || obj.position,
          rotation: transforms.rotation || obj.rotation,
          scale: transforms.scale || obj.scale
        };
      })
    );
  }, [selectedObjectId, objects, pushUndoSnapshot]);

  // Update object geometry dimensions
  const handleUpdateGeometry = useCallback((geometryUpdates) => {
    if (!selectedObjectId) return;
    pushUndoSnapshot(
      objects.map((obj) => {
        if (obj.id !== selectedObjectId) return obj;
        return {
          ...obj,
          ...geometryUpdates,
          geometry: geometryUpdates.geometry || obj.geometry,
          scale: geometryUpdates.scale || obj.scale,
          name: geometryUpdates.name || obj.name
        };
      })
    );
  }, [selectedObjectId, objects, pushUndoSnapshot]);

  // Update object material
  const handleUpdateMaterial = useCallback((matUpdates) => {
    if (!selectedObjectId) return;
    pushUndoSnapshot(
      objects.map((obj) => {
        if (obj.id !== selectedObjectId) return obj;
        return {
          ...obj,
          material: { ...obj.material, ...matUpdates }
        };
      })
    );
  }, [selectedObjectId, objects, pushUndoSnapshot]);

  // Add 3D Primitive
  const handleAddPrimitive = useCallback((primitiveType) => {
    const id = `prim-${Date.now()}`;
    let name = 'Cube';
    let geometry = { type: 'BOX', parameters: { width: 1.5, height: 1.5, depth: 1.5 } };
    let color = '#38bdf8';
    let posY = 0.75;

    if (primitiveType === 'PRIMITIVE_SPHERE') {
      name = 'Sphere';
      geometry = { type: 'SPHERE', parameters: { radius: 1 } };
      color = '#f43f5e';
      posY = 1.0;
    } else if (primitiveType === 'PRIMITIVE_CYLINDER') {
      name = 'Cylinder';
      geometry = { type: 'CYLINDER', parameters: { radiusTop: 0.6, radiusBottom: 0.6, height: 2 } };
      color = '#818cf8';
      posY = 1.0;
    } else if (primitiveType === 'PRIMITIVE_PLANE') {
      name = 'Ground Plane';
      geometry = { type: 'PLANE', parameters: { width: 6, height: 6 } };
      color = '#10b981';
      posY = 0.01;
    } else if (primitiveType === 'PRIMITIVE_CONE') {
      name = 'Cone';
      geometry = { type: 'CONE', parameters: { radius: 1, height: 2 } };
      color = '#fbbf24';
      posY = 1.0;
    }

    const newObj = {
      id,
      type: primitiveType,
      name,
      position: { x: 0, y: posY, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      geometry,
      material: { color, roughness: 0.4, metalness: 0.1, wireframe: false },
      visible: true,
      locked: false
    };

    pushUndoSnapshot([...objects, newObj]);
    setSelectedObjectId(id);
  }, [objects, pushUndoSnapshot]);

  // Add Architectural Construct
  const handleAddArchitectural = useCallback((archType) => {
    const id = `arch-${Date.now()}`;
    let name = 'Wall';
    let scale = { x: 6, y: 3, z: 0.25 };
    let posY = 1.5;
    let color = '#e2e8f0';

    if (archType === 'FLOOR') {
      name = 'Floor Slab';
      scale = { x: 8, y: 0.1, z: 8 };
      posY = 0.05;
      color = '#b48a58';
    } else if (archType === 'DOOR') {
      name = 'Door Opening';
      scale = { x: 1.0, y: 2.1, z: 0.28 };
      posY = 1.05;
      color = '#78350f';
    } else if (archType === 'WINDOW') {
      name = 'Window Glazing';
      scale = { x: 2.0, y: 1.4, z: 0.15 };
      posY = 1.7;
      color = '#93c5fd';
    } else if (archType === 'COLUMN') {
      name = 'Architectural Column';
      scale = { x: 0.5, y: 3.0, z: 0.5 };
      posY = 1.5;
      color = '#cbd5e1';
    }

    const newObj = {
      id,
      type: archType,
      name,
      position: { x: 0, y: posY, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale,
      geometry: {
        type: 'BOX',
        parameters: { width: scale.x, height: scale.y, depth: scale.z }
      },
      material: { color, roughness: 0.6, metalness: 0.1, wireframe: false },
      visible: true,
      locked: false
    };

    pushUndoSnapshot([...objects, newObj]);
    setSelectedObjectId(id);
  }, [objects, pushUndoSnapshot]);

  // Duplicate Selected Object (Shift+D)
  const handleDuplicate = useCallback(() => {
    if (!selectedObjectId) return;
    const target = objects.find((o) => o.id === selectedObjectId);
    if (!target) return;

    const dup = {
      ...JSON.parse(JSON.stringify(target)),
      id: `copy-${Date.now()}`,
      name: `${target.name} (Copy)`,
      position: {
        x: (target.position?.x || 0) + 1.0,
        y: target.position?.y || 0,
        z: (target.position?.z || 0) + 1.0
      }
    };

    pushUndoSnapshot([...objects, dup]);
    setSelectedObjectId(dup.id);
  }, [selectedObjectId, objects, pushUndoSnapshot]);

  // Delete Selected Object (Del / X)
  const handleDelete = useCallback((idToDelete = null) => {
    const targetId = idToDelete || selectedObjectId;
    if (!targetId) return;

    pushUndoSnapshot(objects.filter((o) => o.id !== targetId));
    if (selectedObjectId === targetId) {
      setSelectedObjectId(null);
    }
  }, [selectedObjectId, objects, pushUndoSnapshot]);

  // Toggle Visibility
  const handleToggleVisibility = useCallback((objId) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === objId ? { ...o, visible: o.visible === false ? true : false } : o))
    );
    setSaveStatus('dirty');
  }, []);

  // Toggle Lock
  const handleToggleLock = useCallback((objId) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === objId ? { ...o, locked: !o.locked } : o))
    );
    setSaveStatus('dirty');
  }, []);

  // Rename Object
  const handleRename = useCallback((objId, newName) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === objId ? { ...o, name: newName } : o))
    );
    setSaveStatus('dirty');
  }, []);

  // Subdivide Mesh Operation
  const handleSubdivide = useCallback(() => {
    if (!selectedObjectId) return;
    setObjects((prev) =>
      prev.map((o) => {
        if (o.id !== selectedObjectId) return o;
        const currentW = o.geometry?.parameters?.width || 1;
        return {
          ...o,
          geometry: {
            ...o.geometry,
            parameters: { ...o.geometry?.parameters, segments: 2 }
          }
        };
      })
    );
    setSaveStatus('dirty');
  }, [selectedObjectId]);

  // Bevel Modifier
  const handleBevel = useCallback(() => {
    if (!selectedObjectId) return;
    setObjects((prev) =>
      prev.map((o) => {
        if (o.id !== selectedObjectId) return o;
        return {
          ...o,
          material: {
            ...o.material,
            roughness: Math.max(0.1, (o.material?.roughness || 0.6) - 0.15)
          }
        };
      })
    );
    setSaveStatus('dirty');
  }, [selectedObjectId]);

  // Insert catalog asset to scene
  const handleAddAssetToScene = useCallback((asset) => {
    const id = `asset-${Date.now()}`;
    const dims = asset.defaultDimensions || { width: 1.5, height: 1.0, depth: 1.5 };
    const mat = asset.defaultMaterial || { color: '#94a3b8', roughness: 0.6, metalness: 0.1 };

    const newObj = {
      id,
      type: asset.category === 'ARCHITECTURAL' ? 'WALL' : 'FURNITURE',
      name: asset.name,
      position: { x: 0, y: (dims.height || 1) / 2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: dims.width, y: dims.height, z: dims.depth },
      geometry: {
        type: 'BOX',
        parameters: { width: dims.width, height: dims.height, depth: dims.depth }
      },
      material: {
        color: mat.color || '#94a3b8',
        roughness: mat.roughness ?? 0.6,
        metalness: mat.metalness ?? 0.1,
        opacity: mat.opacity ?? 1,
        textureType: mat.textureType || 'DEFAULT',
        wireframe: false
      },
      visible: true,
      locked: false
    };

    pushUndoSnapshot([...objects, newObj]);
    setSelectedObjectId(id);
  }, [objects, pushUndoSnapshot]);

  // Apply PBR material to active selection
  const handleApplyMaterialToSelected = useCallback((mat) => {
    if (!selectedObjectId) return;
    pushUndoSnapshot(
      objects.map((obj) => {
        if (obj.id !== selectedObjectId) return obj;
        return {
          ...obj,
          material: {
            ...obj.material,
            color: mat.color || obj.material?.color,
            roughness: mat.roughness ?? obj.material?.roughness,
            metalness: mat.metalness ?? obj.material?.metalness,
            opacity: mat.opacity ?? obj.material?.opacity ?? 1,
            textureType: mat.id || 'DEFAULT'
          }
        };
      })
    );
  }, [selectedObjectId, objects, pushUndoSnapshot]);

  // Export GLTF
  const handleExportGLTF = useCallback(() => {
    if (!viewportRef.current) return;
    const safeName = (project?.name || 'archvizon_scene').replace(/[^a-z0-9_-]/gi, '_');
    viewportRef.current.exportGLTF(`${safeName}.glb`);
  }, [project]);

  // Export Scene JSON
  const handleExportJSON = useCallback(() => {
    const sceneData = {
      project: project?.name,
      projectCode: project?.projectCode,
      exportedAt: new Date().toISOString(),
      objects,
      environment
    };
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project?.name || 'archvizon_scene').replace(/[^a-z0-9_-]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [project, objects, environment]);

  // Keyboard Shortcuts (Blender Standard: W, E, R, Shift+D, Delete, Ctrl+Z, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'w' || e.key === 'W') {
        setTransformMode('translate');
      } else if (e.key === 'e' || e.key === 'E') {
        setTransformMode('rotate');
      } else if (e.key === 'r' || e.key === 'R') {
        setTransformMode('scale');
      } else if ((e.key === 'Delete' || e.key === 'x' || e.key === 'X') && selectedObjectId) {
        handleDelete();
      } else if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        handleDuplicate();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSaveScene();
      } else if (e.key === 'Escape') {
        setSelectedObjectId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, handleDelete, handleDuplicate, handleUndo, handleRedo, handleSaveScene]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        <p className="text-xs font-mono">Initializing 3D Architectural Workspace...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full arch-card p-8 text-center space-y-4 border-rose-900/60">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Cannot Open 3D Workspace</h2>
          <p className="text-xs text-rose-300">{error}</p>
          <Link href="/dashboard" className="arch-button-primary inline-flex items-center gap-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const selectedObject = objects.find((o) => o.id === selectedObjectId);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100">
      {/* 1. Top Blender-inspired Toolbar */}
      <TopToolbar
        projectName={project?.name || 'Architectural 3D Scene'}
        projectCode={project?.projectCode || 'AV-SCENE'}
        saveStatus={saveStatus}
        onSave={handleSaveScene}
        canUndo={undoStackRef.current.length > 0}
        canRedo={redoStackRef.current.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        transformMode={transformMode}
        onChangeTransformMode={setTransformMode}
        transformSpace={transformSpace}
        onChangeTransformSpace={setTransformSpace}
        snapEnabled={snapEnabled}
        onToggleSnap={() => setSnapEnabled(!snapEnabled)}
        snapStep={snapStep}
        onChangeSnapStep={setSnapStep}
        shadingMode={shadingMode}
        onChangeShadingMode={setShadingMode}
        activeWorkspaceMode={activeWorkspaceMode}
        onChangeWorkspaceMode={setActiveWorkspaceMode}
        onExportGLTF={handleExportGLTF}
        onExportJSON={handleExportJSON}
      />

      {/* 2. Middle Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Modeling Toolbar */}
        <ModelingToolbar
          activeTool={transformMode}
          onChangeActiveTool={setTransformMode}
          onAddPrimitive={handleAddPrimitive}
          onAddArchitectural={handleAddArchitectural}
          onDuplicate={handleDuplicate}
          onDelete={() => handleDelete()}
          onSubdivide={handleSubdivide}
          onBevel={handleBevel}
          onToggleAssetLibrary={() => setIsAssetLibraryOpen(!isAssetLibraryOpen)}
          isAssetLibraryOpen={isAssetLibraryOpen}
          hasSelection={Boolean(selectedObjectId)}
        />

        {/* Center: Interactive 3D Viewport */}
        <main className="flex-1 relative h-full">
          <Viewport3D
            viewportRef={viewportRef}
            objects={objects}
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
            onUpdateObjectTransforms={handleUpdateObjectTransforms}
            transformMode={transformMode}
            transformSpace={transformSpace}
            snapEnabled={snapEnabled}
            snapStep={snapStep}
            shadingMode={shadingMode}
            cameraView={cameraView}
            onSceneStats={setSceneStats}
          />

          {/* Asset & Interior Design Library Drawer */}
          <AssetLibraryDrawer
            isOpen={isAssetLibraryOpen}
            onClose={() => setIsAssetLibraryOpen(false)}
            onAddAssetToScene={handleAddAssetToScene}
            onApplyMaterialToSelected={handleApplyMaterialToSelected}
            hasSelectedObject={Boolean(selectedObjectId)}
          />
        </main>

        {/* Right 1: Scene Hierarchy Outliner */}
        <SceneHierarchy
          objects={objects}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onToggleVisibility={handleToggleVisibility}
          onToggleLock={handleToggleLock}
          onRenameObject={handleRename}
          onDuplicateObject={handleDuplicate}
          onDeleteObject={handleDelete}
          onAddPrimitive={handleAddPrimitive}
        />

        {/* Right 2: Properties Inspector */}
        <PropertiesPanel
          selectedObject={selectedObject}
          onUpdateTransform={handleUpdateNumericTransform}
          onUpdateGeometry={handleUpdateGeometry}
          onUpdateMaterial={handleUpdateMaterial}
          environment={environment}
          onUpdateEnvironment={(env) => {
            setEnvironment((prev) => ({ ...prev, ...env }));
            setSaveStatus('dirty');
          }}
        />
      </div>

      {/* 3. Bottom Blender-style Status Bar */}
      <StatusBar
        objectsCount={sceneStats.objectsCount}
        verticesCount={sceneStats.verticesCount}
        trianglesCount={sceneStats.trianglesCount}
        selectedObject={selectedObject}
        transformMode={transformMode}
        transformSpace={transformSpace}
        snapEnabled={snapEnabled}
        snapStep={snapStep}
      />
    </div>
  );
}

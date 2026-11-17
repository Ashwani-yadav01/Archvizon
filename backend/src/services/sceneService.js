const mongoose = require('mongoose');
const Scene = require('../models/Scene');
const Project = require('../models/Project');
const { ROLES } = require('../constants/roles');

class SceneService {
  /**
   * Helper to verify project access for a user
   */
  async _verifyProjectAccess(user, projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const error = new Error('Invalid project ID format');
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = (user._id || user.id).toString();
    const isOwner = project.clientId.toString() === userId;
    const isStaff = [ROLES.PROJECT_MANAGER, ROLES.ADMIN, ROLES.VISUALIZATION_ARTIST].includes(user.role);

    if (!isOwner && !isStaff) {
      const error = new Error('Access denied: You do not have permission to access this project');
      error.statusCode = 403;
      throw error;
    }

    return project;
  }

  /**
   * Generate initial starter objects based on project template
   */
  _generateStarterObjects(template = 'EMPTY') {
    if (template === 'LIVING_ROOM') {
      return [
        {
          id: 'floor-main',
          type: 'FLOOR',
          name: 'Hardwood Oak Flooring',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 10, y: 0.1, z: 8 },
          geometry: { type: 'BOX', parameters: { width: 10, height: 0.1, depth: 8 } },
          material: {
            color: '#b48a58',
            roughness: 0.4,
            metalness: 0.05,
            wireframe: false,
            textureType: 'WOOD_OAK'
          },
          visible: true,
          locked: true
        },
        {
          id: 'wall-back',
          type: 'WALL',
          name: 'North Feature Wall',
          position: { x: 0, y: 1.5, z: -4 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 10, y: 3, z: 0.2 },
          geometry: { type: 'BOX', parameters: { width: 10, height: 3, depth: 0.2 } },
          material: {
            color: '#e2e8f0',
            roughness: 0.8,
            metalness: 0.02,
            wireframe: false,
            textureType: 'PLASTER_WHITE'
          },
          visible: true,
          locked: false
        },
        {
          id: 'wall-left',
          type: 'WALL',
          name: 'West Perimeter Wall',
          position: { x: -5, y: 1.5, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 0.2, y: 3, z: 8 },
          geometry: { type: 'BOX', parameters: { width: 0.2, height: 3, depth: 8 } },
          material: {
            color: '#e2e8f0',
            roughness: 0.8,
            metalness: 0.02,
            wireframe: false,
            textureType: 'PLASTER_WHITE'
          },
          visible: true,
          locked: false
        },
        {
          id: 'sofa-center',
          type: 'FURNITURE',
          name: 'Modern 3-Seater Sofa',
          position: { x: 0, y: 0.45, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 2.4, y: 0.85, z: 1.0 },
          geometry: { type: 'BOX', parameters: { width: 2.4, height: 0.85, depth: 1.0 } },
          material: {
            color: '#334155',
            roughness: 0.9,
            metalness: 0.0,
            wireframe: false,
            textureType: 'FABRIC_GREY'
          },
          visible: true,
          locked: false
        },
        {
          id: 'coffee-table',
          type: 'FURNITURE',
          name: 'Minimalist Coffee Table',
          position: { x: 0, y: 0.22, z: 1.6 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1.4, y: 0.44, z: 0.8 },
          geometry: { type: 'BOX', parameters: { width: 1.4, height: 0.44, depth: 0.8 } },
          material: {
            color: '#1e293b',
            roughness: 0.2,
            metalness: 0.4,
            wireframe: false,
            textureType: 'MARBLE_BLACK'
          },
          visible: true,
          locked: false
        }
      ];
    }

    if (template === 'STUDIO') {
      return [
        {
          id: 'floor-studio',
          type: 'FLOOR',
          name: 'Concrete Floor Slab',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 8, y: 0.1, z: 8 },
          geometry: { type: 'BOX', parameters: { width: 8, height: 0.1, depth: 8 } },
          material: {
            color: '#64748b',
            roughness: 0.5,
            metalness: 0.1,
            wireframe: false,
            textureType: 'CONCRETE'
          },
          visible: true,
          locked: true
        },
        {
          id: 'wall-back',
          type: 'WALL',
          name: 'Studio Back Wall',
          position: { x: 0, y: 1.5, z: -4 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 8, y: 3, z: 0.2 },
          geometry: { type: 'BOX', parameters: { width: 8, height: 3, depth: 0.2 } },
          material: {
            color: '#f8fafc',
            roughness: 0.7,
            metalness: 0.05,
            wireframe: false
          },
          visible: true,
          locked: false
        }
      ];
    }

    // Default: Starter cube centered on the ground grid
    return [
      {
        id: 'starter-cube-1',
        type: 'PRIMITIVE_CUBE',
        name: 'Default Cube',
        position: { x: 0, y: 0.75, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
        geometry: { type: 'BOX', parameters: { width: 1.5, height: 1.5, depth: 1.5 } },
        material: {
          color: '#38bdf8',
          roughness: 0.4,
          metalness: 0.2,
          wireframe: false
        },
        visible: true,
        locked: false
      }
    ];
  }

  /**
   * Get or automatically initialize the active 3D scene for a project
   */
  async getSceneByProject(user, projectId) {
    const project = await this._verifyProjectAccess(user, projectId);

    let scene = await Scene.findOne({ projectId: project._id });
    if (!scene) {
      const template = project.metadata?.get?.('template') || project.metadata?.template || 'EMPTY';
      const initialObjects = this._generateStarterObjects(template);

      scene = await Scene.create({
        projectId: project._id,
        userId: user._id || user.id,
        name: `${project.name} Scene`,
        version: 1,
        objects: initialObjects
      });

      project.activeSceneId = scene._id;
      await project.save();
    }

    return scene;
  }

  /**
   * Get scene by its direct ID
   */
  async getSceneById(user, sceneId) {
    if (!mongoose.Types.ObjectId.isValid(sceneId)) {
      const error = new Error('Invalid scene ID format');
      error.statusCode = 400;
      throw error;
    }

    const scene = await Scene.findById(sceneId);
    if (!scene) {
      const error = new Error('3D Scene not found');
      error.statusCode = 404;
      throw error;
    }

    await this._verifyProjectAccess(user, scene.projectId);
    return scene;
  }

  /**
   * Save / synchronize entire scene state (objects, transforms, camera, environment)
   */
  async updateScene(user, sceneId, updateData) {
    const scene = await this.getSceneById(user, sceneId);

    if (updateData.objects && Array.isArray(updateData.objects)) {
      scene.objects = updateData.objects;
    }
    if (updateData.environment) {
      scene.environment = { ...scene.environment.toObject(), ...updateData.environment };
    }
    if (updateData.camera) {
      scene.camera = { ...scene.camera.toObject(), ...updateData.camera };
    }
    if (updateData.name) {
      scene.name = updateData.name;
    }

    scene.version = (scene.version || 1) + 1;
    await scene.save();

    return scene;
  }

  /**
   * Add a single 3D object to the scene
   */
  async addObject(user, sceneId, objectData) {
    const scene = await this.getSceneById(user, sceneId);

    if (!objectData.id) {
      objectData.id = `obj-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    if (!objectData.name) {
      objectData.name = objectData.type || 'Object';
    }

    scene.objects.push(objectData);
    scene.version = (scene.version || 1) + 1;
    await scene.save();

    return { scene, newObject: objectData };
  }

  /**
   * Delete an object from the scene
   */
  async deleteObject(user, sceneId, objectId) {
    const scene = await this.getSceneById(user, sceneId);

    const initialLength = scene.objects.length;
    scene.objects = scene.objects.filter((obj) => obj.id !== objectId);

    if (scene.objects.length === initialLength) {
      const error = new Error('Object not found in scene');
      error.statusCode = 404;
      throw error;
    }

    scene.version = (scene.version || 1) + 1;
    await scene.save();

    return { success: true, remainingCount: scene.objects.length };
  }
}

module.exports = new SceneService();

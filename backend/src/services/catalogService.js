const ArchitecturalAsset = require('../models/ArchitecturalAsset');
const { escapeRegex } = require('../utils/regex');

const DEFAULT_PRESET_ASSETS = [
  // ARCHITECTURAL
  {
    name: 'Parametric Concrete Wall',
    category: 'ARCHITECTURAL',
    subCategory: 'WALLS',
    defaultDimensions: { width: 6.0, height: 3.0, depth: 0.25 },
    defaultMaterial: { color: '#e2e8f0', roughness: 0.8, metalness: 0.05, textureType: 'PLASTER_WHITE' },
    tags: ['wall', 'structure', 'interior', 'exterior']
  },
  {
    name: 'Timber Partition Wall',
    category: 'ARCHITECTURAL',
    subCategory: 'WALLS',
    defaultDimensions: { width: 4.0, height: 2.8, depth: 0.15 },
    defaultMaterial: { color: '#b48a58', roughness: 0.45, metalness: 0.02, textureType: 'WOOD_OAK' },
    tags: ['wall', 'timber', 'partition']
  },
  {
    name: 'Floor Slab / Deck',
    category: 'ARCHITECTURAL',
    subCategory: 'FLOORS',
    defaultDimensions: { width: 8.0, height: 0.15, depth: 8.0 },
    defaultMaterial: { color: '#b48a58', roughness: 0.35, metalness: 0.05, textureType: 'WOOD_OAK' },
    tags: ['floor', 'slab', 'ground']
  },
  {
    name: 'Standard Interior Door',
    category: 'ARCHITECTURAL',
    subCategory: 'DOORS',
    defaultDimensions: { width: 0.95, height: 2.1, depth: 0.2 },
    defaultMaterial: { color: '#78350f', roughness: 0.5, metalness: 0.1, textureType: 'WOOD_WALNUT' },
    tags: ['door', 'opening', 'entrance']
  },
  {
    name: 'Double Glazed Window',
    category: 'ARCHITECTURAL',
    subCategory: 'WINDOWS',
    defaultDimensions: { width: 1.8, height: 1.4, depth: 0.18 },
    defaultMaterial: { color: '#93c5fd', roughness: 0.05, metalness: 0.9, opacity: 0.35, textureType: 'GLASS' },
    tags: ['window', 'glazing', 'glass']
  },
  {
    name: 'Structural Column',
    category: 'ARCHITECTURAL',
    subCategory: 'COLUMNS',
    defaultDimensions: { width: 0.5, height: 3.0, depth: 0.5 },
    defaultMaterial: { color: '#cbd5e1', roughness: 0.6, metalness: 0.1, textureType: 'CONCRETE' },
    tags: ['column', 'pillar', 'structure']
  },

  // FURNITURE
  {
    name: 'Modern 3-Seater Sofa',
    category: 'FURNITURE',
    subCategory: 'LIVING',
    defaultDimensions: { width: 2.4, height: 0.85, depth: 1.0 },
    defaultMaterial: { color: '#334155', roughness: 0.9, metalness: 0.0, textureType: 'FABRIC_GREY' },
    tags: ['sofa', 'couch', 'living room', 'seating']
  },
  {
    name: 'Lounge Armchair',
    category: 'FURNITURE',
    subCategory: 'LIVING',
    defaultDimensions: { width: 0.95, height: 0.8, depth: 0.9 },
    defaultMaterial: { color: '#b45309', roughness: 0.8, metalness: 0.0, textureType: 'LEATHER_BROWN' },
    tags: ['armchair', 'chair', 'leather', 'living room']
  },
  {
    name: 'Minimalist Coffee Table',
    category: 'FURNITURE',
    subCategory: 'LIVING',
    defaultDimensions: { width: 1.4, height: 0.44, depth: 0.8 },
    defaultMaterial: { color: '#1e293b', roughness: 0.2, metalness: 0.3, textureType: 'MARBLE_BLACK' },
    tags: ['table', 'coffee table', 'marble']
  },
  {
    name: 'Executive Dining Table (6-Seat)',
    category: 'FURNITURE',
    subCategory: 'DINING',
    defaultDimensions: { width: 2.2, height: 0.76, depth: 1.0 },
    defaultMaterial: { color: '#9a3412', roughness: 0.35, metalness: 0.05, textureType: 'WOOD_WALNUT' },
    tags: ['dining table', 'wood', 'dining room']
  },
  {
    name: 'Contemporary Dining Chair',
    category: 'FURNITURE',
    subCategory: 'DINING',
    defaultDimensions: { width: 0.55, height: 0.85, depth: 0.55 },
    defaultMaterial: { color: '#475569', roughness: 0.7, metalness: 0.2, textureType: 'FABRIC' },
    tags: ['chair', 'dining chair', 'seating']
  },
  {
    name: 'King Size Platform Bed',
    category: 'FURNITURE',
    subCategory: 'BEDROOM',
    defaultDimensions: { width: 2.0, height: 1.1, depth: 2.2 },
    defaultMaterial: { color: '#f1f5f9', roughness: 0.85, metalness: 0.0, textureType: 'LINEN_WHITE' },
    tags: ['bed', 'king bed', 'bedroom', 'mattress']
  },
  {
    name: 'Modular Media Credenza',
    category: 'FURNITURE',
    subCategory: 'STORAGE',
    defaultDimensions: { width: 2.0, height: 0.55, depth: 0.45 },
    defaultMaterial: { color: '#0f172a', roughness: 0.4, metalness: 0.2, textureType: 'DARK_WOOD' },
    tags: ['credenza', 'storage', 'cabinet', 'media unit']
  },

  // LIGHTING
  {
    name: 'Modern Arc Floor Lamp',
    category: 'LIGHTING',
    subCategory: 'FLOOR_LAMPS',
    defaultDimensions: { width: 0.5, height: 2.1, depth: 1.4 },
    defaultMaterial: { color: '#f59e0b', roughness: 0.2, metalness: 0.85, textureType: 'BRASS' },
    tags: ['lamp', 'floor lamp', 'lighting', 'illumination']
  },
  {
    name: 'Architectural Ceiling Downlight',
    category: 'LIGHTING',
    subCategory: 'CEILING',
    defaultDimensions: { width: 0.25, height: 0.15, depth: 0.25 },
    defaultMaterial: { color: '#ffffff', roughness: 0.1, metalness: 0.9, textureType: 'EMISSIVE' },
    tags: ['light', 'downlight', 'spotlight']
  },

  // DECOR
  {
    name: 'Indoor Fiddle Leaf Fig Planter',
    category: 'DECOR',
    subCategory: 'PLANTS',
    defaultDimensions: { width: 0.65, height: 1.7, depth: 0.65 },
    defaultMaterial: { color: '#15803d', roughness: 0.7, metalness: 0.0, textureType: 'LEAF_GREEN' },
    tags: ['plant', 'greenery', 'decor', 'planter']
  }
];

const PRESET_MATERIALS = [
  { id: 'WOOD_OAK', name: 'Natural Oak Hardwood', color: '#b48a58', roughness: 0.38, metalness: 0.05, category: 'WOOD' },
  { id: 'WOOD_WALNUT', name: 'American Walnut', color: '#78350f', roughness: 0.42, metalness: 0.03, category: 'WOOD' },
  { id: 'MARBLE_WHITE', name: 'Polished Calacatta Marble', color: '#f8fafc', roughness: 0.15, metalness: 0.15, category: 'STONE' },
  { id: 'MARBLE_BLACK', name: 'Nero Marquina Black Marble', color: '#1e293b', roughness: 0.18, metalness: 0.2, category: 'STONE' },
  { id: 'CONCRETE', name: 'Poured Architectural Concrete', color: '#64748b', roughness: 0.75, metalness: 0.05, category: 'CONCRETE' },
  { id: 'PLASTER_WHITE', name: 'Fine Venetian Plaster', color: '#f1f5f9', roughness: 0.85, metalness: 0.0, category: 'PLASTER' },
  { id: 'STEEL_BRUSHED', name: 'Brushed Architectural Stainless Steel', color: '#94a3b8', roughness: 0.28, metalness: 0.88, category: 'METAL' },
  { id: 'BRASS_POLISHED', name: 'Satin Architectural Brass', color: '#d97706', roughness: 0.22, metalness: 0.85, category: 'METAL' },
  { id: 'GLASS_CLEAR', name: 'Ultra-Clear Low-Iron Glass', color: '#93c5fd', roughness: 0.04, metalness: 0.9, opacity: 0.35, category: 'GLASS' }
];

class CatalogService {
  /**
   * Seed catalog presets if database is empty
   */
  async seedCatalogIfEmpty() {
    try {
      const count = await ArchitecturalAsset.countDocuments({ isPreset: true });
      if (count === 0) {
        for (const item of DEFAULT_PRESET_ASSETS) {
          await ArchitecturalAsset.create({
            ...item,
            isPreset: true
          });
        }
        console.log(`[Catalog] Seeded ${DEFAULT_PRESET_ASSETS.length} architectural assets`);
      }
    } catch (err) {
      console.warn('[Catalog] Could not verify/seed presets:', err.message);
    }
  }

  /**
   * Retrieve catalog assets with category and search filter
   */
  async getAssets(query = {}) {
    await this.seedCatalogIfEmpty();

    const filter = {};
    if (query.category) {
      filter.category = query.category.toUpperCase();
    }
    if (query.subCategory) {
      filter.subCategory = query.subCategory.toUpperCase();
    }
    if (query.search && query.search.trim()) {
      const escaped = escapeRegex(query.search.trim());
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { name: regex },
        { tags: regex }
      ];
    }

    const assets = await ArchitecturalAsset.find(filter).sort({ category: 1, name: 1 });
    return assets;
  }

  /**
   * Retrieve materials catalog
   */
  async getMaterials() {
    return PRESET_MATERIALS;
  }

  /**
   * Create custom user uploaded asset
   */
  async createCustomAsset(user, assetData) {
    const asset = new ArchitecturalAsset({
      ...assetData,
      isPreset: false,
      createdBy: user._id || user.id
    });
    await asset.save();
    return asset;
  }
}

module.exports = new CatalogService();

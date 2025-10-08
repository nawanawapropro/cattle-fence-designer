import { BarnTemplate } from '../types';

export const defaultBarnTemplates: BarnTemplate[] = [
  {
    template_id: 'open_cattle_barn_small',
    name: '小規模開放型牛舎',
    description: '30頭程度の肉牛用開放型畜舎',
    design_type: 'barn',
    parameters: {
      // 基本寸法
      barn_width: { default: 12000, min: 8000, max: 20000, unit: 'mm' },
      barn_length: { default: 24000, min: 15000, max: 50000, unit: 'mm' },
      eave_height: { default: 3500, min: 2500, max: 5000, unit: 'mm' },
      ridge_height: { default: 5000, min: 3500, max: 7000, unit: 'mm' },
      
      // 構造設計
      column_spacing: { default: 6000, min: 4000, max: 8000, unit: 'mm' },
      beam_type: { default: 'H-200x100', options: ['H-200x100', 'H-250x125', 'H-300x150', 'RC-300x500'] },
      column_type: { default: 'H-200x200', options: ['H-200x200', 'H-250x250', 'H-300x300', 'RC-400x400'] },
      foundation_type: { default: 'concrete_footing', options: ['concrete_footing', 'continuous_footing', 'mat_foundation'] },
      
      // 屋根設計
      roof_type: { default: 'gable', options: ['gable', 'shed', 'hip', 'gambrel'] },
      roof_material: { default: 'galvanized_steel', options: ['galvanized_steel', 'colored_steel', 'fiber_cement', 'tile'] },
      roof_slope: { default: 20, min: 10, max: 45, unit: '度' },
      gutter_type: { default: 'standard', options: ['none', 'standard', 'large_capacity'] },
      
      // 壁面設計
      wall_type: { default: 'open', options: ['open', 'semi_open', 'curtain_wall', 'solid_wall'] },
      wall_height: { default: 2000, min: 1000, max: 4000, unit: 'mm' },
      opening_ratio: { default: 70, min: 30, max: 100, unit: '%' },
      wall_material: { default: 'concrete_block', options: ['concrete_block', 'steel_panel', 'wood_panel', 'brick'] },
      
      // 換気・環境
      ventilation_type: { default: 'natural', options: ['natural', 'forced', 'tunnel', 'hybrid'] },
      fan_count: { default: 2, min: 0, max: 10, unit: '台' },
      natural_light: { default: 'skylight', options: ['none', 'side_window', 'skylight', 'translucent_roof'] },
      insulation_type: { default: 'none', options: ['none', 'roof_only', 'wall_only', 'full'] },
      
      // 飼養設計
      animal_type: { default: 'beef_cattle', options: ['beef_cattle', 'dairy_cattle', 'horse', 'sheep', 'goat'] },
      capacity: { default: 30, min: 10, max: 100, unit: '頭' },
      feeding_system: { default: 'feed_fence', options: ['feed_fence', 'feed_table', 'automatic_feeder', 'pasture'] },
      water_system: { default: 'water_trough', options: ['water_trough', 'automatic_waterer', 'nipple_drinker'] },
      waste_treatment: { default: 'compost_barn', options: ['compost_barn', 'slurry_pit', 'scraper_system', 'deep_litter'] },
      
      // その他
      fire_resistance: { default: 'standard', options: ['none', 'standard', 'enhanced'] },
      seismic_resistance: { default: 'standard', options: ['basic', 'standard', 'enhanced'] },
      maintenance_access: { default: 'good', options: ['basic', 'good', 'excellent'] }
    },
    geometry: {
      columns: [
        { x: 0, y: 0 }, { x: 6000, y: 0 }, { x: 12000, y: 0 }, { x: 18000, y: 0 }, { x: 24000, y: 0 },
        { x: 0, y: 12000 }, { x: 6000, y: 12000 }, { x: 12000, y: 12000 }, { x: 18000, y: 12000 }, { x: 24000, y: 12000 }
      ],
      beams: [
        { x1: 0, y1: 0, x2: 24000, y2: 0 },
        { x1: 0, y1: 12000, x2: 24000, y2: 12000 },
        { x1: 0, y1: 0, x2: 0, y2: 12000 },
        { x1: 24000, y1: 0, x2: 24000, y2: 12000 }
      ],
      roof_outline: [
        { x: 0, y: 0, z: 3500 },
        { x: 24000, y: 0, z: 3500 },
        { x: 24000, y: 6000, z: 5000 },
        { x: 24000, y: 12000, z: 3500 },
        { x: 0, y: 12000, z: 3500 },
        { x: 0, y: 6000, z: 5000 }
      ]
    }
  },
  {
    template_id: 'open_dairy_barn_medium',
    name: '中規模開放型乳牛舎',
    description: '60頭程度の乳牛用開放型畜舎（ミルキングパーラー付き）',
    design_type: 'barn',
    parameters: {
      // 基本寸法
      barn_width: { default: 15000, min: 12000, max: 25000, unit: 'mm' },
      barn_length: { default: 36000, min: 24000, max: 60000, unit: 'mm' },
      eave_height: { default: 4000, min: 3000, max: 6000, unit: 'mm' },
      ridge_height: { default: 6000, min: 4500, max: 8000, unit: 'mm' },
      
      // 構造設計
      column_spacing: { default: 6000, min: 5000, max: 8000, unit: 'mm' },
      beam_type: { default: 'H-250x125', options: ['H-200x100', 'H-250x125', 'H-300x150', 'RC-300x500'] },
      column_type: { default: 'H-250x250', options: ['H-200x200', 'H-250x250', 'H-300x300', 'RC-400x400'] },
      foundation_type: { default: 'continuous_footing', options: ['concrete_footing', 'continuous_footing', 'mat_foundation'] },
      
      // 屋根設計
      roof_type: { default: 'gable', options: ['gable', 'shed', 'hip', 'gambrel'] },
      roof_material: { default: 'colored_steel', options: ['galvanized_steel', 'colored_steel', 'fiber_cement', 'tile'] },
      roof_slope: { default: 22, min: 15, max: 40, unit: '度' },
      gutter_type: { default: 'large_capacity', options: ['none', 'standard', 'large_capacity'] },
      
      // 壁面設計
      wall_type: { default: 'semi_open', options: ['open', 'semi_open', 'curtain_wall', 'solid_wall'] },
      wall_height: { default: 2500, min: 1500, max: 4000, unit: 'mm' },
      opening_ratio: { default: 60, min: 40, max: 80, unit: '%' },
      wall_material: { default: 'steel_panel', options: ['concrete_block', 'steel_panel', 'wood_panel', 'brick'] },
      
      // 換気・環境
      ventilation_type: { default: 'hybrid', options: ['natural', 'forced', 'tunnel', 'hybrid'] },
      fan_count: { default: 4, min: 2, max: 8, unit: '台' },
      natural_light: { default: 'translucent_roof', options: ['none', 'side_window', 'skylight', 'translucent_roof'] },
      insulation_type: { default: 'roof_only', options: ['none', 'roof_only', 'wall_only', 'full'] },
      
      // 飼養設計
      animal_type: { default: 'dairy_cattle', options: ['beef_cattle', 'dairy_cattle', 'horse', 'sheep', 'goat'] },
      capacity: { default: 60, min: 40, max: 120, unit: '頭' },
      feeding_system: { default: 'feed_table', options: ['feed_fence', 'feed_table', 'automatic_feeder', 'pasture'] },
      water_system: { default: 'automatic_waterer', options: ['water_trough', 'automatic_waterer', 'nipple_drinker'] },
      waste_treatment: { default: 'scraper_system', options: ['compost_barn', 'slurry_pit', 'scraper_system', 'deep_litter'] },
      
      // その他
      fire_resistance: { default: 'standard', options: ['none', 'standard', 'enhanced'] },
      seismic_resistance: { default: 'enhanced', options: ['basic', 'standard', 'enhanced'] },
      maintenance_access: { default: 'excellent', options: ['basic', 'good', 'excellent'] }
    },
    geometry: {
      columns: [
        { x: 0, y: 0 }, { x: 6000, y: 0 }, { x: 12000, y: 0 }, { x: 18000, y: 0 }, { x: 24000, y: 0 }, { x: 30000, y: 0 }, { x: 36000, y: 0 },
        { x: 0, y: 7500 }, { x: 6000, y: 7500 }, { x: 12000, y: 7500 }, { x: 18000, y: 7500 }, { x: 24000, y: 7500 }, { x: 30000, y: 7500 }, { x: 36000, y: 7500 },
        { x: 0, y: 15000 }, { x: 6000, y: 15000 }, { x: 12000, y: 15000 }, { x: 18000, y: 15000 }, { x: 24000, y: 15000 }, { x: 30000, y: 15000 }, { x: 36000, y: 15000 }
      ],
      beams: [
        { x1: 0, y1: 0, x2: 36000, y2: 0 },
        { x1: 0, y1: 7500, x2: 36000, y2: 7500 },
        { x1: 0, y1: 15000, x2: 36000, y2: 15000 },
        { x1: 0, y1: 0, x2: 0, y2: 15000 },
        { x1: 36000, y1: 0, x2: 36000, y2: 15000 }
      ],
      roof_outline: [
        { x: 0, y: 0, z: 4000 },
        { x: 36000, y: 0, z: 4000 },
        { x: 36000, y: 7500, z: 6000 },
        { x: 36000, y: 15000, z: 4000 },
        { x: 0, y: 15000, z: 4000 },
        { x: 0, y: 7500, z: 6000 }
      ]
    }
  },
  {
    template_id: 'horse_stable_luxury',
    name: '高級馬房（個別ボックス型）',
    description: '競走馬・乗馬用の個別ボックス馬房',
    design_type: 'barn',
    parameters: {
      // 基本寸法
      barn_width: { default: 8000, min: 6000, max: 12000, unit: 'mm' },
      barn_length: { default: 20000, min: 15000, max: 30000, unit: 'mm' },
      eave_height: { default: 3000, min: 2800, max: 4000, unit: 'mm' },
      ridge_height: { default: 4500, min: 3500, max: 6000, unit: 'mm' },
      
      // 構造設計
      column_spacing: { default: 4000, min: 3000, max: 5000, unit: 'mm' },
      beam_type: { default: 'H-200x100', options: ['H-200x100', 'H-250x125', 'H-300x150', 'RC-300x500'] },
      column_type: { default: 'H-200x200', options: ['H-200x200', 'H-250x250', 'H-300x300', 'RC-400x400'] },
      foundation_type: { default: 'concrete_footing', options: ['concrete_footing', 'continuous_footing', 'mat_foundation'] },
      
      // 屋根設計
      roof_type: { default: 'gable', options: ['gable', 'shed', 'hip', 'gambrel'] },
      roof_material: { default: 'tile', options: ['galvanized_steel', 'colored_steel', 'fiber_cement', 'tile'] },
      roof_slope: { default: 30, min: 20, max: 45, unit: '度' },
      gutter_type: { default: 'large_capacity', options: ['none', 'standard', 'large_capacity'] },
      
      // 壁面設計
      wall_type: { default: 'solid_wall', options: ['open', 'semi_open', 'curtain_wall', 'solid_wall'] },
      wall_height: { default: 3000, min: 2500, max: 3500, unit: 'mm' },
      opening_ratio: { default: 30, min: 20, max: 50, unit: '%' },
      wall_material: { default: 'wood_panel', options: ['concrete_block', 'steel_panel', 'wood_panel', 'brick'] },
      
      // 換気・環境
      ventilation_type: { default: 'natural', options: ['natural', 'forced', 'tunnel', 'hybrid'] },
      fan_count: { default: 1, min: 0, max: 4, unit: '台' },
      natural_light: { default: 'side_window', options: ['none', 'side_window', 'skylight', 'translucent_roof'] },
      insulation_type: { default: 'full', options: ['none', 'roof_only', 'wall_only', 'full'] },
      
      // 飼養設計
      animal_type: { default: 'horse', options: ['beef_cattle', 'dairy_cattle', 'horse', 'sheep', 'goat'] },
      capacity: { default: 8, min: 4, max: 16, unit: '頭' },
      feeding_system: { default: 'feed_fence', options: ['feed_fence', 'feed_table', 'automatic_feeder', 'pasture'] },
      water_system: { default: 'automatic_waterer', options: ['water_trough', 'automatic_waterer', 'nipple_drinker'] },
      waste_treatment: { default: 'deep_litter', options: ['compost_barn', 'slurry_pit', 'scraper_system', 'deep_litter'] },
      
      // その他
      fire_resistance: { default: 'enhanced', options: ['none', 'standard', 'enhanced'] },
      seismic_resistance: { default: 'enhanced', options: ['basic', 'standard', 'enhanced'] },
      maintenance_access: { default: 'excellent', options: ['basic', 'good', 'excellent'] }
    },
    geometry: {
      columns: [
        { x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 8000, y: 0 }, { x: 12000, y: 0 }, { x: 16000, y: 0 }, { x: 20000, y: 0 },
        { x: 0, y: 8000 }, { x: 4000, y: 8000 }, { x: 8000, y: 8000 }, { x: 12000, y: 8000 }, { x: 16000, y: 8000 }, { x: 20000, y: 8000 }
      ],
      beams: [
        { x1: 0, y1: 0, x2: 20000, y2: 0 },
        { x1: 0, y1: 8000, x2: 20000, y2: 8000 },
        { x1: 0, y1: 0, x2: 0, y2: 8000 },
        { x1: 20000, y1: 0, x2: 20000, y2: 8000 }
      ],
      roof_outline: [
        { x: 0, y: 0, z: 3000 },
        { x: 20000, y: 0, z: 3000 },
        { x: 20000, y: 4000, z: 4500 },
        { x: 20000, y: 8000, z: 3000 },
        { x: 0, y: 8000, z: 3000 },
        { x: 0, y: 4000, z: 4500 }
      ]
    }
  }
];

export function getBarnTemplateById(id: string): BarnTemplate | undefined {
  return defaultBarnTemplates.find(template => template.template_id === id);
}

export function createDefaultBarnParameters(template: BarnTemplate): Partial<BarnTemplate> {
  try {
    const params: any = {};
    
    Object.keys(template.parameters).forEach(key => {
      const param = template.parameters[key as keyof typeof template.parameters];
      if ('default' in param) {
        params[key] = param.default;
      }
    });
    
    return params;
  } catch (error) {
    console.error('畜舎テンプレートパラメータの読み込みエラー:', error);
    return {};
  }
}
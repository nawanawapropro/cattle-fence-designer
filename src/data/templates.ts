import { FenceTemplate } from '../types';

export const defaultTemplates: FenceTemplate[] = [
  {
    template_id: 'standard_4_tier',
    name: '標準4段柵',
    description: '一般的な4段構造の牛舎柵',
    design_type: 'fence',
    parameters: {
      // 基本寸法
      overall_width: { default: 5000, min: 1000, max: 20000, unit: 'mm' },
      height: { default: 1200, min: 800, max: 2000, unit: 'mm' },
      embed_depth: { default: 400, min: 300, max: 800, unit: 'mm' },
      post_spacing: { default: 2000, min: 1500, max: 3000, unit: 'mm' },
      rail_count: { default: 4, min: 2, max: 6, unit: '本' },
      bottom_rail_height: { default: 150, min: 50, max: 300, unit: 'mm' },
      
      // 材料規格
      post_spec: { default: 'φ48.6×2.4', options: ['φ48.6×2.4', 'φ60.5×2.8', 'φ76.3×3.2'] },
      rail_spec: { default: 'φ34×2.3', options: ['φ34×2.3', 'φ42.7×2.3', 'φ48.6×2.4'] },
      
      // 追加の実用的項目
      foundation_type: { default: 'direct', options: ['direct', 'concrete', 'block'] },
      gate_enabled: { default: 'false', options: ['true', 'false'] },
      gate_width: { default: 1200, min: 800, max: 2000, unit: 'mm' },
      coating_type: { default: 'galvanized', options: ['galvanized', 'painted', 'powder', 'none'] },
      animal_type: { default: 'cattle', options: ['cattle', 'horse', 'sheep', 'pig', 'mixed'] },
      wind_resistance: { default: 'standard', options: ['basic', 'standard', 'high'] },
      drainage: { default: 'none', options: ['none', 'basic', 'advanced'] },
      safety_margin: { default: 20, min: 10, max: 50, unit: '%' }
    },
    geometry: {
      post_positions: [0, 2000, 4000, 5000],
      rail_heights: [150, 450, 750, 1050]
    }
  },
  {
    template_id: 'standard_3_tier',
    name: '標準3段柵',
    description: '3段構造の牛舎柵（低い柵用）',
    design_type: 'fence',
    parameters: {
      // 基本寸法
      overall_width: { default: 4000, min: 1000, max: 20000, unit: 'mm' },
      height: { default: 1000, min: 800, max: 2000, unit: 'mm' },
      embed_depth: { default: 400, min: 300, max: 800, unit: 'mm' },
      post_spacing: { default: 2000, min: 1500, max: 3000, unit: 'mm' },
      rail_count: { default: 3, min: 2, max: 6, unit: '本' },
      bottom_rail_height: { default: 200, min: 50, max: 300, unit: 'mm' },
      
      // 材料規格
      post_spec: { default: 'φ48.6×2.4', options: ['φ48.6×2.4', 'φ60.5×2.8', 'φ76.3×3.2'] },
      rail_spec: { default: 'φ34×2.3', options: ['φ34×2.3', 'φ42.7×2.3', 'φ48.6×2.4'] },
      
      // 追加の実用的項目
      foundation_type: { default: 'direct', options: ['direct', 'concrete', 'block'] },
      gate_enabled: { default: 'false', options: ['true', 'false'] },
      gate_width: { default: 1000, min: 800, max: 2000, unit: 'mm' },
      coating_type: { default: 'galvanized', options: ['galvanized', 'painted', 'powder', 'none'] },
      animal_type: { default: 'sheep', options: ['cattle', 'horse', 'sheep', 'pig', 'mixed'] },
      wind_resistance: { default: 'basic', options: ['basic', 'standard', 'high'] },
      drainage: { default: 'none', options: ['none', 'basic', 'advanced'] },
      safety_margin: { default: 15, min: 10, max: 50, unit: '%' }
    },
    geometry: {
      post_positions: [0, 2000, 4000],
      rail_heights: [200, 500, 800]
    }
  },
  {
    template_id: 'gate_5_tier',
    name: 'ゲート付き5段柵',
    description: '入口ゲートを含む5段構造の牛舎柵',
    design_type: 'fence',
    parameters: {
      // 基本寸法
      overall_width: { default: 6000, min: 1000, max: 20000, unit: 'mm' },
      height: { default: 1400, min: 800, max: 2000, unit: 'mm' },
      embed_depth: { default: 500, min: 300, max: 800, unit: 'mm' },
      post_spacing: { default: 2000, min: 1500, max: 3000, unit: 'mm' },
      rail_count: { default: 5, min: 2, max: 6, unit: '本' },
      bottom_rail_height: { default: 150, min: 50, max: 300, unit: 'mm' },
      
      // 材料規格
      post_spec: { default: 'φ60.5×2.8', options: ['φ48.6×2.4', 'φ60.5×2.8', 'φ76.3×3.2'] },
      rail_spec: { default: 'φ42.7×2.3', options: ['φ34×2.3', 'φ42.7×2.3', 'φ48.6×2.4'] },
      
      // 追加の実用的項目
      foundation_type: { default: 'concrete', options: ['direct', 'concrete', 'block'] },
      gate_enabled: { default: 'true', options: ['true', 'false'] },
      gate_width: { default: 1500, min: 800, max: 2000, unit: 'mm' },
      coating_type: { default: 'powder', options: ['galvanized', 'painted', 'powder', 'none'] },
      animal_type: { default: 'cattle', options: ['cattle', 'horse', 'sheep', 'pig', 'mixed'] },
      wind_resistance: { default: 'high', options: ['basic', 'standard', 'high'] },
      drainage: { default: 'basic', options: ['none', 'basic', 'advanced'] },
      safety_margin: { default: 25, min: 10, max: 50, unit: '%' }
    },
    geometry: {
      post_positions: [0, 2000, 4000, 6000],
      rail_heights: [150, 400, 650, 900, 1150]
    }
  }
];

export function getTemplateById(id: string): FenceTemplate | undefined {
  return defaultTemplates.find(template => template.template_id === id);
}

export function getAnyTemplateById(id: string): FenceTemplate | undefined {
  return defaultTemplates.find(template => template.template_id === id);
}

export function calculateGeometry(template: FenceTemplate, parameters: any): any {
  const postCount = Math.ceil(parameters.overall_width / parameters.post_spacing) + 1;
  const actualSpacing = parameters.overall_width / (postCount - 1);
  
  const post_positions = [];
  for (let i = 0; i < postCount; i++) {
    post_positions.push(i * actualSpacing);
  }
  
  const rail_heights = [];
  const spacingBetweenRails = (parameters.height - parameters.bottom_rail_height) / (parameters.rail_count - 1);
  
  for (let i = 0; i < parameters.rail_count; i++) {
    rail_heights.push(parameters.bottom_rail_height + (i * spacingBetweenRails));
  }
  
  return {
    post_positions,
    rail_heights
  };
}
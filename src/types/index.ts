export interface FenceTemplate {
  template_id: string;
  name: string;
  description: string;
  design_type: 'fence';
  thumbnail?: string;
  parameters: {
    // 基本寸法
    overall_width: ParameterSpec;
    height: ParameterSpec;
    embed_depth: ParameterSpec;
    post_spacing: ParameterSpec;
    rail_count: ParameterSpec;
    bottom_rail_height: ParameterSpec;
    
    // 材料規格
    post_spec: ParameterSpecWithOptions;
    rail_spec: ParameterSpecWithOptions;
    
    // 追加の実用的項目
    foundation_type: ParameterSpecWithOptions;
    gate_enabled: ParameterSpecWithOptions;
    gate_width: ParameterSpec;
    coating_type: ParameterSpecWithOptions;
    animal_type: ParameterSpecWithOptions;
    wind_resistance: ParameterSpecWithOptions;
    drainage: ParameterSpecWithOptions;
    safety_margin: ParameterSpec;
  };
  geometry: {
    post_positions: number[];
    rail_heights: number[];
  };
}

export interface BarnTemplate {
  template_id: string;
  name: string;
  description: string;
  design_type: 'barn';
  thumbnail?: string;
  parameters: {
    // 基本寸法
    barn_width: ParameterSpec;
    barn_length: ParameterSpec;
    eave_height: ParameterSpec;
    ridge_height: ParameterSpec;
    
    // 構造設計
    column_spacing: ParameterSpec;
    beam_type: ParameterSpecWithOptions;
    column_type: ParameterSpecWithOptions;
    foundation_type: ParameterSpecWithOptions;
    
    // 屋根設計
    roof_type: ParameterSpecWithOptions;
    roof_material: ParameterSpecWithOptions;
    roof_slope: ParameterSpec;
    gutter_type: ParameterSpecWithOptions;
    
    // 壁面設計
    wall_type: ParameterSpecWithOptions;
    wall_height: ParameterSpec;
    opening_ratio: ParameterSpec;
    wall_material: ParameterSpecWithOptions;
    
    // 換気・環境
    ventilation_type: ParameterSpecWithOptions;
    fan_count: ParameterSpec;
    natural_light: ParameterSpecWithOptions;
    insulation_type: ParameterSpecWithOptions;
    
    // 飼養設計
    animal_type: ParameterSpecWithOptions;
    capacity: ParameterSpec;
    feeding_system: ParameterSpecWithOptions;
    water_system: ParameterSpecWithOptions;
    waste_treatment: ParameterSpecWithOptions;
    
    // その他
    fire_resistance: ParameterSpecWithOptions;
    seismic_resistance: ParameterSpecWithOptions;
    maintenance_access: ParameterSpecWithOptions;
  };
  geometry: {
    columns: Array<{ x: number; y: number; }>;
    beams: Array<{ x1: number; y1: number; x2: number; y2: number; }>;
    roof_outline: Array<{ x: number; y: number; z: number; }>;
  };
}

export type Template = FenceTemplate | BarnTemplate;

export interface ParameterSpec {
  default: number;
  min: number;
  max: number;
  unit: string;
}

export interface ParameterSpecWithOptions {
  default: string;
  options: string[];
}

export interface ParameterSpecBoolean {
  default: boolean;
}

export interface FenceParameters {
  // 基本寸法
  overall_width: number;
  height: number;
  embed_depth: number;
  post_spacing: number;
  rail_count: number;
  bottom_rail_height: number;
  
  // 材料規格
  post_spec: string;
  rail_spec: string;
  
  // 追加の実用的項目（8項目）
  foundation_type: string; // 基礎タイプ
  gate_enabled: string; // ゲートの有無
  gate_width: number; // ゲート幅
  coating_type: string; // 防食処理
  animal_type: string; // 対象動物
  wind_resistance: string; // 耐風性能
  drainage: string; // 排水対応
  safety_margin: number; // 安全マージン
}

export interface BarnParameters {
  // 基本寸法
  barn_width: number; // 畜舎幅
  barn_length: number; // 畜舎奥行き
  eave_height: number; // 軒高
  ridge_height: number; // 棟高
  
  // 構造設計
  column_spacing: number; // 柱間隔
  beam_type: string; // 梁材種類
  column_type: string; // 柱材種類
  foundation_type: string; // 基礎タイプ
  
  // 屋根設計
  roof_type: string; // 屋根形状（切妻・片流れ・寄棟）
  roof_material: string; // 屋根材料
  roof_slope: number; // 屋根勾配（度）
  gutter_type: string; // 樋の種類
  
  // 壁面設計
  wall_type: string; // 壁タイプ（開放・半開放・閉鎖）
  wall_height: number; // 壁高さ
  opening_ratio: number; // 開放率（%）
  wall_material: string; // 壁材料
  
  // 換気・環境
  ventilation_type: string; // 換気方式
  fan_count: number; // 換気扇数
  natural_light: string; // 自然採光
  insulation_type: string; // 断熱仕様
  
  // 飼養設計
  animal_type: string; // 対象家畜
  capacity: number; // 収容頭数
  feeding_system: string; // 給餌システム
  water_system: string; // 給水システム
  waste_treatment: string; // 排水処理
  
  // その他
  fire_resistance: string; // 耐火性能
  seismic_resistance: string; // 耐震性能
  maintenance_access: string; // メンテナンス性
}

export interface ProjectData {
  version: string;
  created_date: string;
  modified_date: string;
  template_base: string;
  current_parameters: FenceParameters;
  custom_notes: string;
}

export interface DrawingGeometry {
  posts: Array<{
    x: number;
    y: number;
    spec: string;
  }>;
  rails: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    spec: string;
  }>;
  dimensions: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    value: number;
    unit: string;
  }>;
}

export type ViewMode = 'plan' | 'front' | 'iso';

export type DesignType = 'fence' | 'barn';

export interface AppState {
  currentTemplate: FenceTemplate | null;
  currentParameters: FenceParameters;
  currentProject: ProjectData | null;
  viewMode: ViewMode;
  showDimensions: boolean;
  isDirty: boolean;
}
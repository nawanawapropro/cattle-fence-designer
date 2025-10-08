import { FenceParameters, FenceTemplate, BarnTemplate, Template, BarnParameters } from '../types';

// GEMINI API設定
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface DesignRequest {
  userInput: string;
  currentParameters?: FenceParameters | BarnParameters;
  availableTemplates?: Template[];
  designType?: 'fence' | 'barn' | 'auto'; // auto-detect from input
}

export interface DesignResponse {
  success: boolean;
  parameters?: Partial<FenceParameters> | Partial<BarnParameters>;
  templateId?: string;
  designType?: 'fence' | 'barn';
  explanation?: string;
  error?: string;
}

export class GeminiDesignService {
  private static instance: GeminiDesignService;

  static getInstance(): GeminiDesignService {
    if (!GeminiDesignService.instance) {
      GeminiDesignService.instance = new GeminiDesignService();
    }
    return GeminiDesignService.instance;
  }

  async generateDesign(request: DesignRequest): Promise<DesignResponse> {
    try {
      if (!GEMINI_API_KEY) {
        return {
          success: false,
          error: 'GEMINI API キーが設定されていません。環境変数 REACT_APP_GEMINI_API_KEY を設定してください。'
        };
      }

      const prompt = this.buildPrompt(request);
      console.log('GEMINI APIリクエスト:', prompt);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`GEMINI API エラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('GEMINI APIレスポンス:', data);

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('GEMINI APIから有効なレスポンスが得られませんでした');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      return this.parseGeminiResponse(generatedText);

    } catch (error) {
      console.error('GEMINI API呼び出しエラー:', error);
      return {
        success: false,
        error: `AI設計生成エラー: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private buildPrompt(request: DesignRequest): string {
    const { userInput, currentParameters, availableTemplates, designType } = request;
    
    // 設計タイプの自動判定
    const detectedType = this.detectDesignType(userInput, designType);
    
    const templatesInfo = availableTemplates?.filter(t => 
      detectedType === 'auto' ? true : t.design_type === detectedType
    ).map(t => 
      `- ${t.name} (${t.template_id}): ${t.description}`
    ).join('\n') || '';

    let currentParamsInfo = '';
    let responseFormat = '';
    let designRules = '';

    if (detectedType === 'barn' || detectedType === 'auto') {
      // 畜舎設計のプロンプト
      currentParamsInfo = this.buildBarnParametersInfo(currentParameters as BarnParameters);
      responseFormat = this.getBarnResponseFormat();
      designRules = this.getBarnDesignRules();
      
      return `あなたは畜舎設計のAIエキスパートです。以下のユーザーリクエストを解析し、適切な畜舎設計パラメータを提案してください。

ユーザーリクエスト: "${userInput}"

利用可能なテンプレート:
${templatesInfo}

${currentParamsInfo}

${responseFormat}

${designRules}

JSONのみを返答し、他の文章は含めないでください。`;
    } else {
      // 柵設計のプロンプト（既存）
      currentParamsInfo = this.buildFenceParametersInfo(currentParameters as FenceParameters);
      
      return `あなたは牛舎柵設計のAIアシスタントです。以下のユーザーリクエストを解析し、適切な設計パラメータを提案してください。

ユーザーリクエスト: "${userInput}"

利用可能なテンプレート:
${templatesInfo}

${currentParamsInfo}

以下の形式でJSONレスポンスを生成してください：
{
  "designType": "fence",
  "templateId": "推奨テンプレートID",
  "parameters": {
    "overall_width": 数値（mm、1000-20000）,
    "height": 数値（mm、800-2000）,
    "embed_depth": 数値（mm、300-800）,
    "post_spacing": 数値（mm、1500-3000）,
    "rail_count": 数値（本、2-6）,
    "bottom_rail_height": 数値（mm、50-300）,
    "post_spec": "文字列（φ48.6×2.4など）",
    "rail_spec": "文字列（φ34×2.3など）",
    "foundation_type": "文字列（direct/concrete/block）",
    "gate_enabled": "文字列（true/false）",
    "gate_width": 数値（mm、800-2000）,
    "coating_type": "文字列（galvanized/painted/powder/none）",
    "animal_type": "文字列（cattle/horse/sheep/pig/mixed）",
    "wind_resistance": "文字列（basic/standard/high）",
    "drainage": "文字列（none/basic/advanced）",
    "safety_margin": 数値（%、10-50）
  },
  "explanation": "設計の理由と推奨事項の説明"
}

重要な設計ルール:
- 牛用: 高さ1200-1500mm、桟4-5本、支柱間隔2000-2500mm
- 馬用: 高さ1400-1800mm、桟4-6本、強固な材料
- 羊・豚用: 高さ1000-1200mm、桟3-4本、細かい間隔
- ゲート幅: 動物の種類に応じて800-2000mm
- 耐風性: 高い場所は'high'、標準は'standard'
- 基礎: コンクリート基礎推奨、軟弱地盤は'concrete'

JSONのみを返答し、他の文章は含めないでください。`;
    }
  }

  private detectDesignType(userInput: string, designType?: string): 'fence' | 'barn' | 'auto' {
    if (designType && designType !== 'auto') return designType as 'fence' | 'barn';
    
    const input = userInput.toLowerCase();
    const barnKeywords = ['畜舎', '牛舎', '馬房', '建物', '屋根', '開放型', 'barn', 'stable', 'building'];
    const fenceKeywords = ['柵', 'フェンス', '囲い', 'fence', 'railing'];
    
    const barnMatch = barnKeywords.some(keyword => input.includes(keyword));
    const fenceMatch = fenceKeywords.some(keyword => input.includes(keyword));
    
    if (barnMatch && !fenceMatch) return 'barn';
    if (fenceMatch && !barnMatch) return 'fence';
    return 'auto'; // 判定できない場合は両方対応
  }

  private buildFenceParametersInfo(params?: FenceParameters): string {
    if (!params) return '';
    
    return `現在の柵パラメータ:
    - 全体幅: ${params.overall_width}mm
    - 高さ: ${params.height}mm
    - 支柱間隔: ${params.post_spacing}mm
    - 桟の本数: ${params.rail_count}本
    - 最下段高: ${params.bottom_rail_height}mm
    - 根入深: ${params.embed_depth}mm
    - 支柱規格: ${params.post_spec}
    - 桟規格: ${params.rail_spec}
    - 基礎タイプ: ${params.foundation_type}
    - ゲート: ${params.gate_enabled}
    - 対象動物: ${params.animal_type}
    - 防食処理: ${params.coating_type}
    - 耐風性能: ${params.wind_resistance}
    - 排水対応: ${params.drainage}
    - 安全マージン: ${params.safety_margin}%`;
  }

  private buildBarnParametersInfo(params?: BarnParameters): string {
    if (!params) return '';
    
    return `現在の畜舎パラメータ:
    - 畜舎幅: ${params.barn_width}mm
    - 畜舎奥行き: ${params.barn_length}mm
    - 軒高: ${params.eave_height}mm
    - 棟高: ${params.ridge_height}mm
    - 柱間隔: ${params.column_spacing}mm
    - 梁材種類: ${params.beam_type}
    - 柱材種類: ${params.column_type}
    - 基礎タイプ: ${params.foundation_type}
    - 屋根形状: ${params.roof_type}
    - 屋根材料: ${params.roof_material}
    - 壁タイプ: ${params.wall_type}
    - 開放率: ${params.opening_ratio}%
    - 換気方式: ${params.ventilation_type}
    - 対象家畜: ${params.animal_type}
    - 収容頭数: ${params.capacity}頭
    - 給餌システム: ${params.feeding_system}
    - 給水システム: ${params.water_system}
    - 排水処理: ${params.waste_treatment}`;
  }

  private getBarnResponseFormat(): string {
    return `以下の形式でJSONレスポンスを生成してください：
{
  "designType": "barn",
  "templateId": "推奨テンプレートID",
  "parameters": {
    "barn_width": 数値（mm、8000-25000）,
    "barn_length": 数値（mm、15000-60000）,
    "eave_height": 数値（mm、2500-6000）,
    "ridge_height": 数値（mm、3500-8000）,
    "column_spacing": 数値（mm、4000-8000）,
    "beam_type": "文字列（H-200x100/H-250x125/H-300x150/RC-300x500）",
    "column_type": "文字列（H-200x200/H-250x250/H-300x300/RC-400x400）",
    "foundation_type": "文字列（concrete_footing/continuous_footing/mat_foundation）",
    "roof_type": "文字列（gable/shed/hip/gambrel）",
    "roof_material": "文字列（galvanized_steel/colored_steel/fiber_cement/tile）",
    "roof_slope": 数値（度、10-45）,
    "gutter_type": "文字列（none/standard/large_capacity）",
    "wall_type": "文字列（open/semi_open/curtain_wall/solid_wall）",
    "wall_height": 数値（mm、1000-4000）,
    "opening_ratio": 数値（%、20-100）,
    "wall_material": "文字列（concrete_block/steel_panel/wood_panel/brick）",
    "ventilation_type": "文字列（natural/forced/tunnel/hybrid）",
    "fan_count": 数値（台、0-10）,
    "natural_light": "文字列（none/side_window/skylight/translucent_roof）",
    "insulation_type": "文字列（none/roof_only/wall_only/full）",
    "animal_type": "文字列（beef_cattle/dairy_cattle/horse/sheep/goat）",
    "capacity": 数値（頭、4-120）,
    "feeding_system": "文字列（feed_fence/feed_table/automatic_feeder/pasture）",
    "water_system": "文字列（water_trough/automatic_waterer/nipple_drinker）",
    "waste_treatment": "文字列（compost_barn/slurry_pit/scraper_system/deep_litter）",
    "fire_resistance": "文字列（none/standard/enhanced）",
    "seismic_resistance": "文字列（basic/standard/enhanced）",
    "maintenance_access": "文字列（basic/good/excellent）"
  },
  "explanation": "設計の理由と推奨事項の説明"
}`;
  }

  private getBarnDesignRules(): string {
    return `重要な畜舎設計ルール:
- 肉牛舎: 開放型、軒高3.5m以上、開放率60-80%、自然換気
- 乳牛舎: 半開放型、軒高4m以上、ミルキングエリア考慮、強制換気
- 馬房: 個別ボックス型、軒高3m以上、壁タイプsolid_wall、高級仕上げ
- 羊・ヤギ舎: 開放型、軒高2.5m以上、小規模、経済性重視
- 屋根勾配: 20-30度推奨、雪国は急勾配、温暖地は緩勾配
- 柱間隔: 構造材に応じて4-8m、RC造は大スパン可能
- 基礎: 軟弱地盤は連続基礎またはマット基礎
- 換気: 自然換気優先、夏季対応で強制換気併用
- 採光: 天窓またはトランスルーセント屋根材推奨`;
  }

  private parseGeminiResponse(responseText: string): DesignResponse {
    try {
      // JSONを抽出（```json ブロック内の場合も対応）
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('有効なJSON形式のレスポンスが見つかりません');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        success: true,
        templateId: parsed.templateId,
        designType: parsed.designType || 'fence',
        parameters: parsed.parameters,
        explanation: parsed.explanation || 'AI設計が完了しました。'
      };

    } catch (error) {
      console.error('GEMINI レスポンス解析エラー:', error);
      return {
        success: false,
        error: `AIレスポンス解析エラー: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // デモ用のモックレスポンス（API キーがない場合）
  async generateMockDesign(request: DesignRequest): Promise<DesignResponse> {
    console.log('モックAI設計を生成:', request.userInput);
    
    // 簡単なキーワード解析
    const input = request.userInput.toLowerCase();
    const detectedType = this.detectDesignType(input, request.designType);
    
    // 畜舎設計のモック
    if (detectedType === 'barn' || input.includes('畜舎') || input.includes('牛舎') || input.includes('馬房') || input.includes('開放型')) {
      if (input.includes('馬') || input.includes('horse')) {
        return {
          success: true,
          designType: 'barn',
          templateId: 'horse_stable_luxury',
          parameters: {
            barn_width: 8000,
            barn_length: 20000,
            eave_height: 3000,
            ridge_height: 4500,
            column_spacing: 4000,
            beam_type: 'H-200x100',
            column_type: 'H-200x200',
            foundation_type: 'concrete_footing',
            roof_type: 'gable',
            roof_material: 'tile',
            roof_slope: 30,
            wall_type: 'solid_wall',
            wall_height: 3000,
            opening_ratio: 30,
            ventilation_type: 'natural',
            animal_type: 'horse',
            capacity: 8,
            feeding_system: 'feed_fence',
            water_system: 'automatic_waterer'
          },
          explanation: 'モックAI: 馬用の個別ボックス型馬房を設計しました。高級仕上げで馬の安全性と快適性を重視した設計です。'
        };
      }
      
      if (input.includes('乳牛') || input.includes('dairy')) {
        return {
          success: true,
          designType: 'barn',
          templateId: 'open_dairy_barn_medium',
          parameters: {
            barn_width: 15000,
            barn_length: 36000,
            eave_height: 4000,
            ridge_height: 6000,
            column_spacing: 6000,
            beam_type: 'H-250x125',
            column_type: 'H-250x250',
            foundation_type: 'continuous_footing',
            roof_type: 'gable',
            roof_material: 'colored_steel',
            roof_slope: 22,
            wall_type: 'semi_open',
            wall_height: 2500,
            opening_ratio: 60,
            ventilation_type: 'hybrid',
            animal_type: 'dairy_cattle',
            capacity: 60,
            feeding_system: 'feed_table',
            water_system: 'automatic_waterer'
          },
          explanation: 'モックAI: 60頭規模の乳牛舎を設計しました。ミルキングエリア対応で効率的な管理が可能です。'
        };
      }
      
      // デフォルト肉牛舎
      return {
        success: true,
        designType: 'barn',
        templateId: 'open_cattle_barn_small',
        parameters: {
          barn_width: 12000,
          barn_length: 24000,
          eave_height: 3500,
          ridge_height: 5000,
          column_spacing: 6000,
          beam_type: 'H-200x100',
          column_type: 'H-200x200',
          foundation_type: 'concrete_footing',
          roof_type: 'gable',
          roof_material: 'galvanized_steel',
          roof_slope: 20,
          wall_type: 'open',
          wall_height: 2000,
          opening_ratio: 70,
          ventilation_type: 'natural',
          animal_type: 'beef_cattle',
          capacity: 30,
          feeding_system: 'feed_fence',
          water_system: 'water_trough'
        },
        explanation: 'モックAI: 30頭規模の開放型肉牛舎を設計しました。自然換気で快適な飼育環境を実現します。'
      };
    }
    
    // 柵設計のモック
    if (input.includes('牛') || input.includes('cattle')) {
      return {
        success: true,
        designType: 'fence',
        templateId: 'standard_4_tier',
        parameters: {
          overall_width: 5000,
          height: 1400,
          rail_count: 4,
          post_spacing: 2000,
          animal_type: 'cattle',
          foundation_type: 'concrete',
          wind_resistance: 'standard'
        },
        explanation: 'モックAI: 牛用の標準的な4段柵を設計しました。高さ1.4m、支柱間隔2mで安全性を確保します。'
      };
    }

    if (input.includes('馬') || input.includes('horse')) {
      return {
        success: true,
        designType: 'fence',
        templateId: 'gate_5_tier',
        parameters: {
          overall_width: 6000,
          height: 1600,
          rail_count: 5,
          post_spacing: 2000,
          animal_type: 'horse',
          foundation_type: 'concrete',
          wind_resistance: 'high'
        },
        explanation: 'モックAI: 馬用の高強度5段柵を設計しました。高さ1.6mで馬の飛び越えを防止します。'
      };
    }

    // デフォルト設計
    return {
      success: true,
      designType: 'fence',
      templateId: 'standard_3_tier',
      parameters: {
        overall_width: 4000,
        height: 1200,
        rail_count: 3,
        post_spacing: 2000,
        animal_type: 'mixed',
        foundation_type: 'direct'
      },
      explanation: 'モックAI: 汎用的な3段柵を設計しました。様々な用途に対応できます。'
    };
  }
}
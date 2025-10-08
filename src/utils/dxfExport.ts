import { FenceTemplate, FenceParameters, Template } from '../types';
import { calculateGeometry } from '../data/templates';

// DXF Writer類似の簡易実装
class DXFWriter {
  private entities: string[] = [];
  private layers: Set<string> = new Set();

  constructor() {
    this.addLayer('POST', 1); // 赤色
    this.addLayer('RAIL', 5); // 青色
    this.addLayer('DIMENSION', 3); // 緑色
    this.addLayer('TEXT', 7); // 黒色
    this.addLayer('CENTERLINE', 6); // マゼンタ
  }

  addLayer(name: string, color: number) {
    this.layers.add(name);
  }

  addLine(x1: number, y1: number, x2: number, y2: number, layer: string = '0') {
    this.entities.push(`
  0
LINE
  8
${layer}
 10
${x1.toFixed(3)}
 20
${y1.toFixed(3)}
 11
${x2.toFixed(3)}
 21
${y2.toFixed(3)}`);
  }

  addCircle(x: number, y: number, radius: number, layer: string = '0') {
    this.entities.push(`
  0
CIRCLE
  8
${layer}
 10
${x.toFixed(3)}
 20
${y.toFixed(3)}
 40
${radius.toFixed(3)}`);
  }

  addText(x: number, y: number, height: number, text: string, layer: string = '0') {
    this.entities.push(`
  0
TEXT
  8
${layer}
 10
${x.toFixed(3)}
 20
${y.toFixed(3)}
 40
${height.toFixed(3)}
  1
${text}`);
  }

  addDimension(x1: number, y1: number, x2: number, y2: number, textX: number, textY: number, value: number) {
    // 寸法線として線分とテキストを追加
    this.addLine(x1, y1, x2, y2, 'DIMENSION');
    this.addLine(x1, y1 - 5, x1, y1 + 5, 'DIMENSION');
    this.addLine(x2, y2 - 5, x2, y2 + 5, 'DIMENSION');
    this.addText(textX, textY, 50, `${value}`, 'DIMENSION');
  }

  toDxfString(): string {
    const header = `  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1015
  0
ENDSEC`;

    const tables = `  0
SECTION
  2
TABLES
  0
TABLE
  2
LAYER
 70
${this.layers.size}
${Array.from(this.layers).map(layer => `  0
LAYER
  2
${layer}
 70
0
 62
${this.getLayerColor(layer)}`).join('')}
  0
ENDTAB
  0
ENDSEC`;

    const entities = `  0
SECTION
  2
ENTITIES
${this.entities.join('')}
  0
ENDSEC`;

    const footer = `  0
EOF`;

    return header + '\n' + tables + '\n' + entities + '\n' + footer;
  }

  private getLayerColor(layer: string): number {
    switch (layer) {
      case 'POST': return 1; // 赤
      case 'RAIL': return 5; // 青
      case 'DIMENSION': return 3; // 緑
      case 'CENTERLINE': return 6; // マゼンタ
      default: return 7; // 黒
    }
  }
}

export function exportToDXF(template: Template, parameters: any, viewMode: 'plan' | 'front' | 'iso'): string {
  // 柵以外は未対応（暫定処理）
  if (template.design_type !== 'fence') {
    return '// DXF export not supported for barn templates yet';
  }

  const fenceTemplate = template as FenceTemplate;
  const dxf = new DXFWriter();
  const geometry = calculateGeometry(fenceTemplate, parameters);
  const { post_positions, rail_heights } = geometry;

  if (viewMode === 'plan') {
    // 平面図の出力
    // 支柱（円）
    post_positions.forEach((x: number) => {
      dxf.addCircle(x - parameters.overall_width / 2, 0, 20, 'POST');
    });

    // 桟（線）
    rail_heights.forEach(() => {
      dxf.addLine(-parameters.overall_width / 2, 0, parameters.overall_width / 2, 0, 'RAIL');
    });

    // 全体寸法
    dxf.addDimension(-parameters.overall_width / 2, 100, parameters.overall_width / 2, 100, 0, 120, parameters.overall_width);

  } else {
    // 正面図の出力
    // 支柱（縦線）
    post_positions.forEach((x: number) => {
      dxf.addLine(x - parameters.overall_width / 2, -parameters.embed_depth, x - parameters.overall_width / 2, parameters.height, 'POST');
    });

    // 桟（横線）
    rail_heights.forEach((y: number) => {
      dxf.addLine(-parameters.overall_width / 2, y, parameters.overall_width / 2, y, 'RAIL');
    });

    // 地面線（中心線）
    dxf.addLine(-parameters.overall_width / 2 - 200, 0, parameters.overall_width / 2 + 200, 0, 'CENTERLINE');

    // 寸法線
    dxf.addDimension(-parameters.overall_width / 2, -100, parameters.overall_width / 2, -100, 0, -120, parameters.overall_width);
    dxf.addDimension(parameters.overall_width / 2 + 100, 0, parameters.overall_width / 2 + 100, parameters.height, parameters.overall_width / 2 + 150, parameters.height / 2, parameters.height);
  }

  // タイトルブロック
  const titleX = parameters.overall_width / 2 - 200;
  const titleY = -parameters.height - 100;
  
  dxf.addText(titleX, titleY, 50, template.name, 'TEXT');
  dxf.addText(titleX, titleY - 60, 30, `全体幅: ${parameters.overall_width}mm`, 'TEXT');
  dxf.addText(titleX, titleY - 90, 30, `高さ: ${parameters.height}mm`, 'TEXT');
  dxf.addText(titleX, titleY - 120, 30, `支柱: ${parameters.post_spec}`, 'TEXT');
  dxf.addText(titleX, titleY - 150, 30, `桟: ${parameters.rail_spec}`, 'TEXT');
  dxf.addText(titleX, titleY - 180, 30, `作成日: ${new Date().toLocaleDateString('ja-JP')}`, 'TEXT');

  return dxf.toDxfString();
}
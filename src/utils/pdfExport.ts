import jsPDF from 'jspdf';
import { FenceTemplate, FenceParameters, Template } from '../types';
import { calculateGeometry } from '../data/templates';

export function exportToPDF(template: Template, parameters: any, viewMode: 'plan' | 'front' | 'iso'): jsPDF {
  // 柵以外は未対応（暫定処理）
  if (template.design_type !== 'fence') {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'
    });
    pdf.text('PDF export not supported for barn templates yet', 10, 10);
    return pdf;
  }

  const fenceTemplate = template as FenceTemplate;
  // A3横サイズ (420 x 297 mm)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3'
  });

  const pageWidth = 420;
  const pageHeight = 297;
  
  // 図面領域とマージン設定
  const drawingAreaWidth = 300;
  const drawingAreaHeight = 200;
  const drawingX = 10;
  const drawingY = 40;
  
  // タイトルブロック
  drawTitleBlock(pdf, fenceTemplate, parameters, pageWidth, pageHeight);

  // 図面枠
  pdf.setLineWidth(0.5);
  pdf.rect(drawingX, drawingY, drawingAreaWidth, drawingAreaHeight);

  // 図面描画
  const geometry = calculateGeometry(fenceTemplate, parameters);
  const { post_positions, rail_heights } = geometry;
  
  // スケール計算（図面領域に収まるように）
  const maxDimension = Math.max(parameters.overall_width, parameters.height + parameters.embed_depth);
  const availableSpace = Math.min(drawingAreaWidth - 40, drawingAreaHeight - 40);
  const scale = availableSpace / maxDimension;
  
  // 図面中央配置のためのオフセット
  const offsetX = drawingX + drawingAreaWidth / 2;
  const offsetY = drawingY + drawingAreaHeight / 2;
  
  if (viewMode === 'plan') {
    drawPlanViewPDF(pdf, post_positions, rail_heights, parameters, scale, offsetX, offsetY);
  } else {
    drawFrontViewPDF(pdf, post_positions, rail_heights, parameters, scale, offsetX, offsetY);
  }
  
  // 材料表を描画
  drawMaterialList(pdf, parameters, pageWidth - 110, drawingY);
  
  return pdf;
}

function drawTitleBlock(pdf: jsPDF, template: FenceTemplate, parameters: FenceParameters, pageWidth: number, pageHeight: number) {
  const titleHeight = 30;
  const titleY = pageHeight - titleHeight;
  
  // タイトルブロック枠
  pdf.setLineWidth(1);
  pdf.rect(0, titleY, pageWidth, titleHeight);
  
  // 区切り線
  pdf.line(200, titleY, 200, pageHeight);
  pdf.line(300, titleY, 300, pageHeight);
  
  // タイトル情報
  pdf.setFontSize(16);
  pdf.text('牛舎柵設計図', 10, titleY + 15);
  
  pdf.setFontSize(10);
  pdf.text(template.name, 10, titleY + 25);
  
  // 寸法情報
  pdf.text(`全体幅: ${parameters.overall_width}mm`, 210, titleY + 10);
  pdf.text(`高さ: ${parameters.height}mm`, 210, titleY + 18);
  pdf.text(`支柱間隔: ${parameters.post_spacing}mm`, 210, titleY + 26);
  
  // 作成情報
  const today = new Date().toLocaleDateString('ja-JP');
  pdf.text(`作成日: ${today}`, 310, titleY + 10);
  pdf.text('Scale: 1:100', 310, titleY + 18);
  pdf.text('Version: 1.0', 310, titleY + 26);
}

function drawPlanViewPDF(pdf: jsPDF, post_positions: number[], rail_heights: number[], parameters: FenceParameters, scale: number, offsetX: number, offsetY: number) {
  // 支柱（円）
  pdf.setFillColor(139, 69, 19); // 茶色
  post_positions.forEach((x: number) => {
    const pdfX = offsetX + (x - parameters.overall_width / 2) * scale;
    const pdfY = offsetY;
    pdf.circle(pdfX, pdfY, 2, 'F');
  });
  
  // 桟（線）
  pdf.setDrawColor(70, 130, 180); // 青色
  pdf.setLineWidth(2);
  const railY = offsetY;
  pdf.line(
    offsetX - (parameters.overall_width / 2) * scale,
    railY,
    offsetX + (parameters.overall_width / 2) * scale,
    railY
  );
  
  // 寸法線
  drawDimensionsPDF(pdf, parameters, scale, offsetX, offsetY, true);
}

function drawFrontViewPDF(pdf: jsPDF, post_positions: number[], rail_heights: number[], parameters: FenceParameters, scale: number, offsetX: number, offsetY: number) {
  // 支柱（縦線）
  pdf.setDrawColor(139, 69, 19); // 茶色
  pdf.setLineWidth(3);
  post_positions.forEach((x: number) => {
    const pdfX = offsetX + (x - parameters.overall_width / 2) * scale;
    const topY = offsetY - parameters.height * scale / 2;
    const bottomY = offsetY + parameters.embed_depth * scale / 2;
    pdf.line(pdfX, topY, pdfX, bottomY);
  });
  
  // 桟（横線）
  pdf.setDrawColor(70, 130, 180); // 青色
  pdf.setLineWidth(2);
  rail_heights.forEach((y: number) => {
    const pdfY = offsetY - (y - parameters.height / 2) * scale;
    pdf.line(
      offsetX - (parameters.overall_width / 2) * scale,
      pdfY,
      offsetX + (parameters.overall_width / 2) * scale,
      pdfY
    );
  });
  
  // 地面線
  pdf.setDrawColor(139, 69, 19);
  pdf.setLineWidth(1);
  pdf.setLineDashPattern([2, 1], 0);
  const groundY = offsetY + (parameters.height / 2) * scale;
  pdf.line(
    offsetX - (parameters.overall_width / 2 + 50) * scale,
    groundY,
    offsetX + (parameters.overall_width / 2 + 50) * scale,
    groundY
  );
  pdf.setLineDashPattern([], 0);
  
  // 寸法線
  drawDimensionsPDF(pdf, parameters, scale, offsetX, offsetY, false);
}

function drawDimensionsPDF(pdf: jsPDF, parameters: FenceParameters, scale: number, offsetX: number, offsetY: number, isPlan: boolean) {
  pdf.setDrawColor(0, 170, 0); // 緑色
  pdf.setLineWidth(0.5);
  pdf.setFontSize(8);
  
  if (isPlan) {
    // 全体寸法（平面図）
    const dimY = offsetY + 20;
    const leftX = offsetX - (parameters.overall_width / 2) * scale;
    const rightX = offsetX + (parameters.overall_width / 2) * scale;
    
    pdf.line(leftX, dimY, rightX, dimY);
    pdf.line(leftX, dimY - 3, leftX, dimY + 3);
    pdf.line(rightX, dimY - 3, rightX, dimY + 3);
    pdf.text(`${parameters.overall_width}`, offsetX - 10, dimY - 5);
  } else {
    // 全体寸法（正面図）
    const dimY = offsetY + (parameters.height / 2) * scale + 15;
    const leftX = offsetX - (parameters.overall_width / 2) * scale;
    const rightX = offsetX + (parameters.overall_width / 2) * scale;
    
    pdf.line(leftX, dimY, rightX, dimY);
    pdf.line(leftX, dimY - 3, leftX, dimY + 3);
    pdf.line(rightX, dimY - 3, rightX, dimY + 3);
    pdf.text(`${parameters.overall_width}`, offsetX - 10, dimY + 8);
    
    // 高さ寸法
    const dimX = offsetX + (parameters.overall_width / 2) * scale + 15;
    const topY = offsetY - (parameters.height / 2) * scale;
    const bottomY = offsetY + (parameters.height / 2) * scale;
    
    pdf.line(dimX, topY, dimX, bottomY);
    pdf.line(dimX - 3, topY, dimX + 3, topY);
    pdf.line(dimX - 3, bottomY, dimX + 3, bottomY);
    
    // 縦書きテキストの代替実装
    pdf.text(`${parameters.height}mm`, dimX + 8, offsetY);
  }
}

function drawMaterialList(pdf: jsPDF, parameters: FenceParameters, x: number, y: number) {
  const tableWidth = 100;
  const rowHeight = 8;
  
  // 材料表タイトル
  pdf.setFontSize(12);
  pdf.text('材料一覧', x, y - 5);
  
  // 表ヘッダー
  pdf.setFontSize(9);
  pdf.setLineWidth(0.3);
  pdf.rect(x, y, tableWidth, rowHeight);
  
  const colWidths = [25, 25, 25, 25];
  let currentX = x;
  
  // ヘッダー描画
  ['部品名', '規格', '長さ', '数量'].forEach((header, i) => {
    pdf.rect(currentX, y, colWidths[i], rowHeight);
    pdf.text(header, currentX + 2, y + 6);
    currentX += colWidths[i];
  });
  
  // データ行
  const geometry = calculateGeometry({ parameters } as any, parameters);
  const postCount = geometry.post_positions.length;
  const railCount = parameters.rail_count;
  
  const materials = [
    ['支柱', parameters.post_spec, `${parameters.height + parameters.embed_depth}mm`, `${postCount}本`],
    ['桟', parameters.rail_spec, `${parameters.overall_width}mm`, `${railCount}本`]
  ];
  
  materials.forEach((row, rowIndex) => {
    const rowY = y + (rowIndex + 1) * rowHeight;
    currentX = x;
    
    row.forEach((cell, colIndex) => {
      pdf.rect(currentX, rowY, colWidths[colIndex], rowHeight);
      pdf.text(cell, currentX + 2, rowY + 6);
      currentX += colWidths[colIndex];
    });
  });
}
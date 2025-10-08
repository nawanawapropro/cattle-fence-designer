import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FenceTemplate, FenceParameters, ViewMode, DrawingGeometry, Template, BarnTemplate } from '../types';
import { calculateGeometry } from '../data/templates';

interface DrawingCanvasProps {
  template: Template | null;
  parameters: FenceParameters | any;
  viewMode: ViewMode;
  showDimensions: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  template,
  parameters,
  viewMode,
  showDimensions
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(0.1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // 3D表示用の回転角度
  const [rotation, setRotation] = useState({ x: 20, y: 30, z: 0 });

  useEffect(() => {
    drawFence();
  }, [template, parameters, viewMode, showDimensions, scale, panOffset, rotation]);

  const drawFence = () => {
    const canvas = canvasRef.current;
    if (!canvas || !template) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 座標変換設定
    ctx.save();
    ctx.translate(canvas.width / 2 + panOffset.x, canvas.height / 2 + panOffset.y);
    ctx.scale(scale, scale);

    // 図面を描画
    const geometry = template.design_type === 'fence'
      ? calculateGeometry(template as FenceTemplate, parameters)
      : template.geometry;
    
    if (viewMode === 'plan') {
      drawPlanView(ctx, geometry, parameters);
    } else if (viewMode === 'front') {
      drawFrontView(ctx, geometry, parameters);
    } else if (viewMode === 'iso') {
      drawIsoView(ctx, geometry, parameters);
    }

    ctx.restore();
  };

  const drawPlanView = (ctx: CanvasRenderingContext2D, geometry: any, params: FenceParameters) => {
    const { post_positions, rail_heights } = geometry;

    // 支柱を描画（上面図なので円）
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;

    post_positions.forEach((x: number) => {
      ctx.beginPath();
      ctx.arc(x - params.overall_width / 2, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 桟を描画（上面図なので線）
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = 8;

    rail_heights.forEach(() => {
      ctx.beginPath();
      ctx.moveTo(-params.overall_width / 2, 0);
      ctx.lineTo(params.overall_width / 2, 0);
      ctx.stroke();
    });

    // 寸法線を描画
    if (showDimensions) {
      drawPlanDimensions(ctx, post_positions, params);
    }
  };

  const drawFrontView = (ctx: CanvasRenderingContext2D, geometry: any, params: FenceParameters) => {
    const { post_positions, rail_heights } = geometry;

    // 支柱を描画（正面図なので縦線）
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 12;

    post_positions.forEach((x: number) => {
      ctx.beginPath();
      ctx.moveTo(x - params.overall_width / 2, -params.embed_depth);
      ctx.lineTo(x - params.overall_width / 2, params.height);
      ctx.stroke();
    });

    // 桟を描画（正面図なので横線）
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = 6;

    rail_heights.forEach((y: number) => {
      ctx.beginPath();
      ctx.moveTo(-params.overall_width / 2, y);
      ctx.lineTo(params.overall_width / 2, y);
      ctx.stroke();
    });

    // 地面線を描画
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(-params.overall_width / 2 - 200, 0);
    ctx.lineTo(params.overall_width / 2 + 200, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // 寸法線を描画
    if (showDimensions) {
      drawFrontDimensions(ctx, post_positions, rail_heights, params);
    }
  };

  const drawPlanDimensions = (ctx: CanvasRenderingContext2D, post_positions: number[], params: FenceParameters) => {
    ctx.strokeStyle = '#00AA00';
    ctx.fillStyle = '#00AA00';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';

    // 全体寸法
    const y = 80;
    ctx.beginPath();
    ctx.moveTo(-params.overall_width / 2, y);
    ctx.lineTo(params.overall_width / 2, y);
    ctx.moveTo(-params.overall_width / 2, y - 10);
    ctx.lineTo(-params.overall_width / 2, y + 10);
    ctx.moveTo(params.overall_width / 2, y - 10);
    ctx.lineTo(params.overall_width / 2, y + 10);
    ctx.stroke();

    ctx.fillText(`${params.overall_width}mm`, -30, y - 15);
  };

  const drawFrontDimensions = (ctx: CanvasRenderingContext2D, post_positions: number[], rail_heights: number[], params: FenceParameters) => {
    ctx.strokeStyle = '#00AA00';
    ctx.fillStyle = '#00AA00';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';

    // 高さ寸法
    const x = params.overall_width / 2 + 100;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, params.height);
    ctx.moveTo(x - 10, 0);
    ctx.lineTo(x + 10, 0);
    ctx.moveTo(x - 10, params.height);
    ctx.lineTo(x + 10, params.height);
    ctx.stroke();

    ctx.save();
    ctx.translate(x + 15, params.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${params.height}mm`, -30, 0);
    ctx.restore();

    // 全体幅寸法
    const y = -50;
    ctx.beginPath();
    ctx.moveTo(-params.overall_width / 2, y);
    ctx.lineTo(params.overall_width / 2, y);
    ctx.moveTo(-params.overall_width / 2, y - 10);
    ctx.lineTo(-params.overall_width / 2, y + 10);
    ctx.moveTo(params.overall_width / 2, y - 10);
    ctx.lineTo(params.overall_width / 2, y + 10);
    ctx.stroke();

    ctx.fillText(`${params.overall_width}mm`, -30, y - 15);
  };

  // 3D座標変換関数（X軸とY軸の回転を正しく適用）
  const projectToIso = (x: number, y: number, z: number) => {
    // 回転角度をラジアンに変換
    const rotX = (rotation.x * Math.PI) / 180;
    const rotY = (rotation.y * Math.PI) / 180;
    
    // まずX軸周りの回転（上下ドラッグ）
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    
    // 次にY軸周りの回転（左右ドラッグ）
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    
    // アイソメトリック投影（簡単版）
    const isoX = x2 * 0.866 + z2 * 0.5;  // cos(30°) ≈ 0.866, sin(30°) = 0.5
    const isoY = y1 - z2 * 0.5;
    
    return { 
      x: isoX, 
      y: -isoY  // Y軸反転（画面座標系）
    };
  };

  // 3D描画関数（統合版）
  const drawIsoView = useCallback((ctx: CanvasRenderingContext2D, geometry: any, params: any) => {
    if (!template) return;

    console.log('3D描画開始:', { design_type: template.design_type, rotation, geometry, params });
    
    // キャンバスをクリア（デバッグ用）
    ctx.fillStyle = '#F0F8FF';
    ctx.fillRect(-2000, -2000, 4000, 4000);

    if (template.design_type === 'fence') {
      // 柵の3D描画処理
      const { post_positions, rail_heights } = geometry;
      
      // 地面を描画（3D平面）
      const groundDepth = 200;
      ctx.fillStyle = '#8FBC8F60';
      ctx.strokeStyle = '#228B22';
      ctx.lineWidth = 2;
      
      const groundCorners = [
        projectToIso(-params.overall_width / 2 - 100, 0, -groundDepth / 2),
        projectToIso(params.overall_width / 2 + 100, 0, -groundDepth / 2),
        projectToIso(params.overall_width / 2 + 100, 0, groundDepth / 2),
        projectToIso(-params.overall_width / 2 - 100, 0, groundDepth / 2)
      ];
      
      ctx.beginPath();
      ctx.moveTo(groundCorners[0].x, groundCorners[0].y);
      groundCorners.forEach(corner => ctx.lineTo(corner.x, corner.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 支柱を描画（3D円柱）
      post_positions.forEach((x: number, index: number) => {
        const postX = x - params.overall_width / 2;
        drawIsoPost(ctx, postX, params.height, params.embed_depth);
      });

      // 桟を描画（3D円柱）
      rail_heights.forEach((y: number, index: number) => {
        drawIsoRail(ctx, -params.overall_width / 2, params.overall_width / 2, y);
      });

    } else if (template.design_type === 'barn') {
      // 畜舎の3D描画処理
      const barnTemplate = template as BarnTemplate;
      
      if (!barnTemplate.geometry) return;

      // 地面の描画（畜舎用）
      const barnWidth = params.barn_width || 12000;
      const barnLength = params.barn_length || 24000;
      
      ctx.fillStyle = 'rgba(139, 195, 74, 0.3)';
      ctx.strokeStyle = '#7cb342';
      ctx.lineWidth = 2;
      const groundCorners = [
        projectToIso(-500, -500, 0),
        projectToIso(barnLength + 500, -500, 0),
        projectToIso(barnLength + 500, barnWidth + 500, 0),
        projectToIso(-500, barnWidth + 500, 0)
      ];
      
      ctx.beginPath();
      ctx.moveTo(groundCorners[0].x, groundCorners[0].y);
      groundCorners.forEach(corner => ctx.lineTo(corner.x, corner.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 柱の描画
      if (barnTemplate.geometry.columns) {
        barnTemplate.geometry.columns.forEach((column: { x: number; y: number }) => {
          drawBarnColumn(ctx, column.x, column.y, params.eave_height || 3500);
        });
      }

      // 梁の描画
      if (barnTemplate.geometry.beams) {
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 4;
        barnTemplate.geometry.beams.forEach((beam: { x1: number; y1: number; x2: number; y2: number }) => {
          const start = projectToIso(beam.x1, beam.y1, params.eave_height || 3500);
          const end = projectToIso(beam.x2, beam.y2, params.eave_height || 3500);
          
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        });
      }

      // 屋根の描画
      if (barnTemplate.geometry.roof_outline) {
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(128, 128, 128, 0.6)';
        
        const roofPoints = barnTemplate.geometry.roof_outline.map((point: { x: number; y: number; z: number }) => 
          projectToIso(point.x, point.y, point.z)
        );
        
        ctx.beginPath();
        ctx.moveTo(roofPoints[0].x, roofPoints[0].y);
        roofPoints.slice(1).forEach((point: { x: number; y: number }) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 壁面の描画（開放度に応じて）
      const openingRatio = params.opening_ratio || 70;
      const wallHeight = params.wall_height || 2000;
      
      if (openingRatio < 90) {
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 2;
        ctx.fillStyle = `rgba(149, 165, 166, ${(100 - openingRatio) / 100 * 0.4})`;
        
        // 前面壁
        const frontWallCorners = [
          projectToIso(0, 0, 0),
          projectToIso(barnLength, 0, 0),
          projectToIso(barnLength, 0, wallHeight),
          projectToIso(0, 0, wallHeight)
        ];
        
        ctx.beginPath();
        ctx.moveTo(frontWallCorners[0].x, frontWallCorners[0].y);
        frontWallCorners.forEach(corner => ctx.lineTo(corner.x, corner.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 背面壁
        const backWallCorners = [
          projectToIso(0, barnWidth, 0),
          projectToIso(barnLength, barnWidth, 0),
          projectToIso(barnLength, barnWidth, wallHeight),
          projectToIso(0, barnWidth, wallHeight)
        ];
        
        ctx.beginPath();
        ctx.moveTo(backWallCorners[0].x, backWallCorners[0].y);
        backWallCorners.forEach(corner => ctx.lineTo(corner.x, corner.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 3D座標軸を描画
    if (showDimensions) {
      drawIso3DAxis(ctx);
    }
  }, [template, rotation, showDimensions]);

  // 3D支柱描画（簡素化版）
  const drawIsoPost = (ctx: CanvasRenderingContext2D, x: number, height: number, embedDepth: number) => {
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    
    // 支柱の主要なポイントを計算
    const topCenter = projectToIso(x, height, 0);
    const bottomCenter = projectToIso(x, 0, 0);
    const undergroundCenter = projectToIso(x, -embedDepth, 0);
    
    // 支柱の左右のエッジ
    const topLeft = projectToIso(x - 15, height, 0);
    const topRight = projectToIso(x + 15, height, 0);
    const bottomLeft = projectToIso(x - 15, 0, 0);
    const bottomRight = projectToIso(x + 15, 0, 0);
    const underLeft = projectToIso(x - 15, -embedDepth, 0);
    const underRight = projectToIso(x + 15, -embedDepth, 0);
    
    // 地上部分（四角形）
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 地下部分（破線）
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(bottomLeft.x, bottomLeft.y);
    ctx.lineTo(underLeft.x, underLeft.y);
    ctx.lineTo(underRight.x, underRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 中央線（デバッグ用）
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(topCenter.x, topCenter.y);
    ctx.lineTo(undergroundCenter.x, undergroundCenter.y);
    ctx.stroke();
  };

  // 3D桟描画（簡素化版）
  const drawIsoRail = (ctx: CanvasRenderingContext2D, startX: number, endX: number, y: number) => {
    ctx.fillStyle = '#4682B4';
    ctx.strokeStyle = '#1E90FF';
    ctx.lineWidth = 4;

    // 桟の上下のエッジ
    const startTop = projectToIso(startX, y + 8, 0);
    const startBottom = projectToIso(startX, y - 8, 0);
    const endTop = projectToIso(endX, y + 8, 0);
    const endBottom = projectToIso(endX, y - 8, 0);
    
    // 桟本体（四角形）
    ctx.beginPath();
    ctx.moveTo(startTop.x, startTop.y);
    ctx.lineTo(endTop.x, endTop.y);
    ctx.lineTo(endBottom.x, endBottom.y);
    ctx.lineTo(startBottom.x, startBottom.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 中央線（デバッグ用）
    const startCenter = projectToIso(startX, y, 0);
    const endCenter = projectToIso(endX, y, 0);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startCenter.x, startCenter.y);
    ctx.lineTo(endCenter.x, endCenter.y);
    ctx.stroke();
  };

  // 3D座標軸表示（強化版）
  const drawIso3DAxis = (ctx: CanvasRenderingContext2D) => {
    const axisLength = 120;
    const origin = projectToIso(-200, -200, 0); // 左下に配置
    
    // X軸（赤）- 水平方向
    const xEnd = projectToIso(-200 + axisLength, -200, 0);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xEnd.x, xEnd.y);
    ctx.stroke();
    
    // Y軸（緑）- 垂直方向
    const yEnd = projectToIso(-200, -200 + axisLength, 0);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yEnd.x, yEnd.y);
    ctx.stroke();
    
    // Z軸（青）- 奥行き方向
    const zEnd = projectToIso(-200, -200, axisLength);
    ctx.strokeStyle = '#0000FF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zEnd.x, zEnd.y);
    ctx.stroke();
    
    // 軸の先端に矢印
    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string) => {
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const arrowLength = 10;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - arrowLength * Math.cos(angle - 0.3), toY - arrowLength * Math.sin(angle - 0.3));
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - arrowLength * Math.cos(angle + 0.3), toY - arrowLength * Math.sin(angle + 0.3));
      ctx.stroke();
    };
    
    drawArrow(origin.x, origin.y, xEnd.x, xEnd.y, '#FF0000');
    drawArrow(origin.x, origin.y, yEnd.x, yEnd.y, '#00FF00');
    drawArrow(origin.x, origin.y, zEnd.x, zEnd.y, '#0000FF');
    
    // 軸ラベル
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('X', xEnd.x + 15, xEnd.y);
    ctx.fillText('Y', yEnd.x + 15, yEnd.y);
    ctx.fillText('Z', zEnd.x + 15, zEnd.y);
    
    // 回転情報
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(`X軸回転: ${rotation.x.toFixed(1)}°`, origin.x - 50, origin.y + 40);
    ctx.fillText(`Y軸回転: ${rotation.y.toFixed(1)}°`, origin.x - 50, origin.y + 55);
  };

  // 畜舎用の柱描画関数
  const drawBarnColumn = (ctx: CanvasRenderingContext2D, x: number, y: number, height: number) => {
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 6;
    
    const bottom = projectToIso(x, y, 0);
    const top = projectToIso(x, y, height);
    
    // 柱の主線
    ctx.beginPath();
    ctx.moveTo(bottom.x, bottom.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    
    // 柱の頭部と足部のマーク
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(top.x, top.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(bottom.x, bottom.y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 柱の3D効果（影）
    const shadowOffset = projectToIso(x + 50, y + 50, height / 2);
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(bottom.x + 2, bottom.y + 2);
    ctx.lineTo(top.x + 2, top.y + 2);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // デフォルト動作を防止
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    console.log(`Mouse down - Mode: ${viewMode}, Dragging: true`);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      if (viewMode === 'iso') {
        // 3D表示時は回転操作
        const sensitivity = 0.5; // 回転感度を上げる
        const newRotation = {
          x: Math.max(-90, Math.min(90, rotation.x + deltaY * sensitivity)), // 制限を広げる
          y: (rotation.y + deltaX * sensitivity) % 360,
          z: rotation.z
        };
        setRotation(newRotation);
        
        // デバッグ用：コンソールに回転角度を出力
        console.log(`3D Rotation: X=${newRotation.x.toFixed(1)}°, Y=${newRotation.y.toFixed(1)}°, deltaY=${deltaY}`);
      } else {
        // 2D表示時はパン操作
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      }
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    console.log('Mouse up - Dragging: false');
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    setScale(Math.max(0.01, Math.min(2, newScale)));
  };

  const resetView = () => {
    setScale(0.1);
    setPanOffset({ x: 0, y: 0 });
    setRotation({ x: 20, y: 30, z: 0 });
  };

  return (
    <div className="drawing-canvas-container">
      <div className="canvas-toolbar">
        <button
          className={`view-button ${viewMode === 'plan' ? 'active' : ''}`}
          onClick={() => {}} // This will be handled by parent component
        >
          平面図
        </button>
        <button
          className={`view-button ${viewMode === 'front' ? 'active' : ''}`}
          onClick={() => {}} // This will be handled by parent component
        >
          正面図
        </button>
        <button className="zoom-reset" onClick={resetView}>
          表示リセット
        </button>
        <div className="zoom-info">
          ズーム: {Math.round(scale * 100)}%
          {viewMode === 'iso' && (
            <span className="rotation-info">
              | 上下: X={rotation.x.toFixed(0)}° 左右: Y={rotation.y.toFixed(0)}°
            </span>
          )}
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ 
          cursor: isDragging ? 'grabbing' : (viewMode === 'iso' ? 'move' : 'grab'),
          touchAction: 'none' // タッチスクロールを無効化
        }}
      />
      
      {!template && (
        <div className="no-template-message">
          テンプレートを選択して図面を表示してください
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
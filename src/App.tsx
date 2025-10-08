import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

import TemplateSelector from './components/TemplateSelector';
import ParameterInput from './components/ParameterInput';
import DrawingCanvas from './components/DrawingCanvas';
import AIDesignAssistant from './components/AIDesignAssistant';

import { FenceTemplate, FenceParameters, BarnParameters, ProjectData, ViewMode, AppState, Template, BarnTemplate } from './types';
import { defaultTemplates, getTemplateById } from './data/templates';
import { defaultBarnTemplates } from './data/barnTemplates';
import { exportToDXF } from './utils/dxfExport';
import { exportToPDF } from './utils/pdfExport';
import { FileOperations } from './utils/fileOperations';

// Electron環境でのみipcRendererを使用
const isElectron = false; // Web版として動作
const ipcRenderer: any = null; // 型エラー回避用

// デフォルトパラメータを生成するヘルパー関数
function createDefaultParameters(template: FenceTemplate): FenceParameters {
  try {
    return {
      // 基本寸法
      overall_width: template.parameters.overall_width?.default || 5000,
      height: template.parameters.height?.default || 1200,
      embed_depth: template.parameters.embed_depth?.default || 400,
      post_spacing: template.parameters.post_spacing?.default || 2000,
      rail_count: template.parameters.rail_count?.default || 4,
      bottom_rail_height: template.parameters.bottom_rail_height?.default || 150,
      
      // 材料規格
      post_spec: template.parameters.post_spec?.default || 'φ48.6×2.4',
      rail_spec: template.parameters.rail_spec?.default || 'φ34×2.3',
      
      // 追加の実用的項目
      foundation_type: template.parameters.foundation_type?.default || 'direct',
      gate_enabled: template.parameters.gate_enabled?.default || 'false',
      gate_width: template.parameters.gate_width?.default || 1200,
      coating_type: template.parameters.coating_type?.default || 'galvanized',
      animal_type: template.parameters.animal_type?.default || 'cattle',
      wind_resistance: template.parameters.wind_resistance?.default || 'standard',
      drainage: template.parameters.drainage?.default || 'none',
      safety_margin: template.parameters.safety_margin?.default || 20
    };
  } catch (error) {
    console.error('テンプレートパラメータの読み込みエラー:', error);
    // フォールバック用のデフォルト値を返す
    return {
      overall_width: 5000,
      height: 1200,
      embed_depth: 400,
      post_spacing: 2000,
      rail_count: 4,
      bottom_rail_height: 150,
      post_spec: 'φ48.6×2.4',
      rail_spec: 'φ34×2.3',
      foundation_type: 'direct',
      gate_enabled: 'false',
      gate_width: 1200,
      coating_type: 'galvanized',
      animal_type: 'cattle',
      wind_resistance: 'standard',
      drainage: 'none',
      safety_margin: 20
    };
  }
}

function App() {
  const [appState, setAppState] = useState<{
    currentTemplate: Template;
    currentParameters: FenceParameters | BarnParameters | any;
    currentProject: ProjectData | null;
    viewMode: ViewMode;
    showDimensions: boolean;
    isDirty: boolean;
  }>({
    currentTemplate: defaultTemplates[0] as Template,
    currentParameters: createDefaultParameters(defaultTemplates[0]),
    currentProject: null,
    viewMode: 'plan' as ViewMode,
    showDimensions: true,
    isDirty: false
  });

  const [statusMessage, setStatusMessage] = useState('標準4段柵を編集中');

  // IPC事件監聽（Electron環境のみ）
  useEffect(() => {
    if (!isElectron || !ipcRenderer) return;

    const handleMenuNewFile = () => {
      handleNewProject();
    };

    const handleMenuOpenFile = (event: any, filePath: string) => {
      handleLoadProject(filePath);
    };

    const handleMenuSaveFile = () => {
      handleSaveProject();
    };

    const handleMenuSaveFileAs = () => {
      handleSaveProjectAs();
    };

    const handleMenuExportDXF = () => {
      handleExportDXF();
    };

    const handleMenuExportPDF = () => {
      handleExportPDF();
    };

    const handleMenuViewPlan = () => {
      setAppState(prev => ({ ...prev, viewMode: 'plan' }));
    };

    const handleMenuViewFront = () => {
      setAppState(prev => ({ ...prev, viewMode: 'front' }));
    };

    const handleMenuToggleDimensions = (event: any, checked: boolean) => {
      setAppState(prev => ({ ...prev, showDimensions: checked }));
    };

    ipcRenderer.on('menu-new-file', handleMenuNewFile);
    ipcRenderer.on('menu-open-file', handleMenuOpenFile);
    ipcRenderer.on('menu-save-file', handleMenuSaveFile);
    ipcRenderer.on('menu-save-file-as', handleMenuSaveFileAs);
    ipcRenderer.on('menu-export-dxf', handleMenuExportDXF);
    ipcRenderer.on('menu-export-pdf', handleMenuExportPDF);
    ipcRenderer.on('menu-view-plan', handleMenuViewPlan);
    ipcRenderer.on('menu-view-front', handleMenuViewFront);
    ipcRenderer.on('menu-toggle-dimensions', handleMenuToggleDimensions);

    return () => {
      ipcRenderer.removeListener('menu-new-file', handleMenuNewFile);
      ipcRenderer.removeListener('menu-open-file', handleMenuOpenFile);
      ipcRenderer.removeListener('menu-save-file', handleMenuSaveFile);
      ipcRenderer.removeListener('menu-save-file-as', handleMenuSaveFileAs);
      ipcRenderer.removeListener('menu-export-dxf', handleMenuExportDXF);
      ipcRenderer.removeListener('menu-export-pdf', handleMenuExportPDF);
      ipcRenderer.removeListener('menu-view-plan', handleMenuViewPlan);
      ipcRenderer.removeListener('menu-view-front', handleMenuViewFront);
      ipcRenderer.removeListener('menu-toggle-dimensions', handleMenuToggleDimensions);
    };
  }, []);

  // 自動保存設定
  useEffect(() => {
    const stopAutoSave = FileOperations.startAutoSave(() => {
      if (appState.currentProject && appState.isDirty) {
        return FileOperations.updateProject(
          appState.currentProject,
          appState.currentParameters
        );
      }
      return null;
    });

    return stopAutoSave;
  }, [appState.currentProject, appState.currentParameters, appState.isDirty]);

  const handleTemplateSelect = useCallback((template: Template) => {
    let newParameters: any;
    if (template.design_type === 'fence') {
      newParameters = createDefaultParameters(template as FenceTemplate);
    } else {
      // 畜舎用パラメータの生成（簡単版）
      const barnTemplate = template as BarnTemplate;
      newParameters = {
        barn_width: barnTemplate.parameters.barn_width.default,
        barn_length: barnTemplate.parameters.barn_length.default,
        eave_height: barnTemplate.parameters.eave_height.default,
        ridge_height: barnTemplate.parameters.ridge_height.default,
        column_spacing: barnTemplate.parameters.column_spacing.default,
        beam_type: barnTemplate.parameters.beam_type.default,
        column_type: barnTemplate.parameters.column_type.default,
        foundation_type: barnTemplate.parameters.foundation_type.default,
        roof_type: barnTemplate.parameters.roof_type.default,
        roof_material: barnTemplate.parameters.roof_material.default,
        roof_slope: barnTemplate.parameters.roof_slope.default,
        gutter_type: barnTemplate.parameters.gutter_type.default,
        wall_type: barnTemplate.parameters.wall_type.default,
        wall_height: barnTemplate.parameters.wall_height.default,
        opening_ratio: barnTemplate.parameters.opening_ratio.default,
        wall_material: barnTemplate.parameters.wall_material.default,
        ventilation_type: barnTemplate.parameters.ventilation_type.default,
        fan_count: barnTemplate.parameters.fan_count.default,
        natural_light: barnTemplate.parameters.natural_light.default,
        insulation_type: barnTemplate.parameters.insulation_type.default,
        animal_type: barnTemplate.parameters.animal_type.default,
        capacity: barnTemplate.parameters.capacity.default,
        feeding_system: barnTemplate.parameters.feeding_system.default,
        water_system: barnTemplate.parameters.water_system.default,
        waste_treatment: barnTemplate.parameters.waste_treatment.default,
        fire_resistance: barnTemplate.parameters.fire_resistance.default,
        seismic_resistance: barnTemplate.parameters.seismic_resistance.default,
        maintenance_access: barnTemplate.parameters.maintenance_access.default
      };
    }

    setAppState(prev => ({
      ...prev,
      currentTemplate: template,
      currentParameters: newParameters,
      isDirty: true
    }));

    setStatusMessage(`${template.name}を編集中`);
  }, []);

  const handleParameterChange = useCallback((key: string, value: number | string) => {
    setAppState(prev => ({
      ...prev,
      currentParameters: {
        ...prev.currentParameters,
        [key]: value
      },
      isDirty: true
    }));

    // ステータス更新
    const currentTemplate = appState.currentTemplate;
    if (currentTemplate) {
      if (currentTemplate.design_type === 'fence') {
        const fenceParams = appState.currentParameters as FenceParameters;
        setStatusMessage(`${currentTemplate.name}を編集中 | 全体幅:${fenceParams.overall_width}mm 高さ:${fenceParams.height}mm`);
      } else {
        const barnParams = appState.currentParameters as BarnParameters;
        setStatusMessage(`${currentTemplate.name}を編集中 | 幅:${barnParams.barn_width}mm 長さ:${barnParams.barn_length}mm`);
      }
    }
  }, [appState.currentTemplate, appState.currentParameters]);

  const handleNewProject = useCallback(() => {
    if (appState.isDirty) {
      // 未保存の変更があることを警告（実装簡略化のため省略）
    }

    const firstTemplate = defaultTemplates[0];
    handleTemplateSelect(firstTemplate);
    setAppState(prev => ({
      ...prev,
      currentProject: null,
      isDirty: false
    }));

    setStatusMessage('新規プロジェクト開始');
  }, [appState.isDirty, handleTemplateSelect]);

  const handleLoadProject = useCallback(async (filePath?: string) => {
    const projectData = await FileOperations.loadProject(filePath);
    
    if (projectData) {
      const template = getTemplateById(projectData.template_base);
      if (template) {
        setAppState(prev => ({
          ...prev,
          currentTemplate: template,
          currentParameters: projectData.current_parameters,
          currentProject: projectData,
          isDirty: false
        }));

        if (filePath) {
          FileOperations.addRecentFile(filePath);
        }

        setStatusMessage(`${template.name}を読み込み完了`);
      }
    }
  }, []);

  const handleSaveProject = useCallback(async () => {
    if (!appState.currentTemplate) return;

    let projectData = appState.currentProject;
    
    if (!projectData) {
      projectData = FileOperations.createNewProject(
        appState.currentTemplate.template_id,
        appState.currentParameters
      );
    } else {
      projectData = FileOperations.updateProject(
        projectData,
        appState.currentParameters
      );
    }

    const success = await FileOperations.saveProject(projectData);
    
    if (success) {
      setAppState(prev => ({
        ...prev,
        currentProject: projectData,
        isDirty: false
      }));
      setStatusMessage('プロジェクトを保存しました');
    }
  }, [appState.currentTemplate, appState.currentParameters, appState.currentProject]);

  const handleSaveProjectAs = useCallback(async () => {
    if (!appState.currentTemplate) return;

    const projectData = FileOperations.createNewProject(
      appState.currentTemplate.template_id,
      appState.currentParameters
    );

    const success = await FileOperations.saveProject(projectData);
    
    if (success) {
      setAppState(prev => ({
        ...prev,
        currentProject: projectData,
        isDirty: false
      }));
      setStatusMessage('プロジェクトを保存しました');
    }
  }, [appState.currentTemplate, appState.currentParameters]);

  const handleExportDXF = useCallback(async () => {
    if (!appState.currentTemplate) return;

    const dxfContent = exportToDXF(
      appState.currentTemplate,
      appState.currentParameters,
      appState.viewMode
    );

    const success = await FileOperations.exportDXF(dxfContent);
    
    if (success) {
      setStatusMessage('DXFファイルを出力しました');
    }
  }, [appState.currentTemplate, appState.currentParameters, appState.viewMode]);

  const handleExportPDF = useCallback(async () => {
    if (!appState.currentTemplate) return;

    const pdf = exportToPDF(
      appState.currentTemplate,
      appState.currentParameters,
      appState.viewMode
    );

    const pdfBlob = pdf.output('blob');
    const success = await FileOperations.exportPDF(pdfBlob);
    
    if (success) {
      setStatusMessage('PDFファイルを出力しました');
    }
  }, [appState.currentTemplate, appState.currentParameters, appState.viewMode]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setAppState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const handleAIDesignGenerated = useCallback((templateId: string, aiParameters: Partial<FenceParameters>) => {
    // 指定されたテンプレートを取得
    const selectedTemplate = getTemplateById(templateId);
    if (!selectedTemplate) {
      console.error('AI生成で指定されたテンプレートが見つかりません:', templateId);
      return;
    }

    // 現在のパラメータとAI生成パラメータをマージ
    const updatedParameters = {
      ...appState.currentParameters,
      ...aiParameters
    };

    // テンプレートとパラメータを更新
    setAppState(prev => ({
      ...prev,
      currentTemplate: selectedTemplate,
      currentParameters: updatedParameters,
      isDirty: true
    }));

    setStatusMessage(`AI設計完了: ${selectedTemplate.name}が自動生成されました`);
  }, [appState.currentParameters]);

  return (
    <div className="App">
      <div className="toolbar">
        <button className="toolbar-button" onClick={handleNewProject}>新規</button>
        <button className="toolbar-button" onClick={() => handleLoadProject()}>開く</button>
        <button className="toolbar-button" onClick={handleSaveProject}>保存</button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-button export-button" onClick={handleExportDXF}>DXF出力</button>
        <button className="toolbar-button export-button" onClick={handleExportPDF}>PDF出力</button>
      </div>

      <div className="main-content">
        <div className="left-panel">
          <TemplateSelector
            fenceTemplates={defaultTemplates}
            barnTemplates={defaultBarnTemplates}
            selectedTemplate={appState.currentTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
        </div>

        <div className="center-panel">
          <div className="view-controls">
            <button
              className={`view-button ${appState.viewMode === 'plan' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('plan')}
            >
              平面図
            </button>
            <button
              className={`view-button ${appState.viewMode === 'front' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('front')}
            >
              正面図
            </button>
            <button
              className={`view-button ${appState.viewMode === 'iso' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('iso')}
            >
              3D図
            </button>
          </div>

          <DrawingCanvas
            template={appState.currentTemplate}
            parameters={appState.currentParameters}
            viewMode={appState.viewMode}
            showDimensions={appState.showDimensions}
          />
        </div>

        <div className="right-panel">
          <AIDesignAssistant
            templates={defaultTemplates}
            currentParameters={appState.currentParameters}
            onDesignGenerated={handleAIDesignGenerated}
          />
          
          <ParameterInput
            template={appState.currentTemplate}
            parameters={appState.currentParameters}
            onParameterChange={handleParameterChange}
          />
        </div>
      </div>

      <div className="status-bar">
        <span className="status-text">{statusMessage}</span>
        <span className="status-info">
          {appState.isDirty && '● '}
          {appState.currentTemplate && appState.currentTemplate.design_type === 'fence' && (() => {
            const fenceParams = appState.currentParameters as FenceParameters;
            return `全体幅:${fenceParams.overall_width}mm 高さ:${fenceParams.height}mm`;
          })()}
          {appState.currentTemplate && appState.currentTemplate.design_type === 'barn' && (() => {
            const barnParams = appState.currentParameters as BarnParameters;
            return `畜舎:${barnParams.barn_width/1000}m×${barnParams.barn_length/1000}m 収容:${barnParams.capacity}頭`;
          })()}
        </span>
      </div>
    </div>
  );
}

export default App;
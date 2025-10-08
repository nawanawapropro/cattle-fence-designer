import { ProjectData, FenceParameters } from '../types';

// Electron環境でのみipcRendererを使用
const isElectron = false; // Web版として動作
const ipcRenderer: any = null; // 型エラー回避用

export class FileOperations {
  static async saveProject(projectData: ProjectData, filePath?: string): Promise<boolean> {
    try {
      if (!isElectron) {
        // Web版：ブラウザのダウンロード機能を使用
        const jsonContent = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath || `fence_project_${Date.now()}.cfp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
      }

      // Electron版の処理
      let targetPath = filePath;
      
      if (!targetPath) {
        const result = await ipcRenderer!.invoke('save-file-dialog');
        if (result.canceled) return false;
        targetPath = result.filePath;
      }

      // .cfp 拡張子を確保
      if (targetPath && !targetPath.endsWith('.cfp')) {
        targetPath += '.cfp';
      }

      const jsonContent = JSON.stringify(projectData, null, 2);
      const writeResult = await ipcRenderer!.invoke('write-file', targetPath, jsonContent);
      
      return writeResult.success;
    } catch (error) {
      console.error('Failed to save project:', error);
      return false;
    }
  }

  static async loadProject(filePath?: string): Promise<ProjectData | null> {
    try {
      if (!isElectron) {
        // Web版：ファイル入力ダイアログを使用
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.cfp,.json';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
              resolve(null);
              return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const content = event.target?.result as string;
                const projectData: ProjectData = JSON.parse(content);
                
                if (this.validateProjectData(projectData)) {
                  resolve(projectData);
                } else {
                  console.error('Invalid project file format');
                  resolve(null);
                }
              } catch (error) {
                console.error('Failed to parse project file:', error);
                resolve(null);
              }
            };
            reader.readAsText(file);
          };
          input.click();
        });
      }

      // Electron版の処理
      let targetPath = filePath;
      
      if (!targetPath) {
        const result = await ipcRenderer!.invoke('open-file-dialog');
        if (result.canceled) return null;
        targetPath = result.filePaths[0];
      }

      const readResult = await ipcRenderer!.invoke('read-file', targetPath);
      
      if (!readResult.success) {
        throw new Error(readResult.error);
      }

      const projectData: ProjectData = JSON.parse(readResult.content);
      
      // バージョン互換性チェック
      if (!this.validateProjectData(projectData)) {
        throw new Error('Invalid project file format');
      }

      return projectData;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  static async exportDXF(dxfContent: string): Promise<boolean> {
    try {
      if (!isElectron) {
        // Web版：ブラウザのダウンロード機能を使用
        const blob = new Blob([dxfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `fence_design_${Date.now()}.dxf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
      }

      // Electron版の処理
      const result = await ipcRenderer!.invoke('save-file-dialog', {
        defaultPath: 'fence_design.dxf',
        filters: [
          { name: 'DXF Files', extensions: ['dxf'] }
        ]
      });

      if (result.canceled) return false;

      const writeResult = await ipcRenderer!.invoke('write-file', result.filePath, dxfContent);
      return writeResult.success;
    } catch (error) {
      console.error('Failed to export DXF:', error);
      return false;
    }
  }

  static async exportPDF(pdfBlob: Blob): Promise<boolean> {
    try {
      if (!isElectron) {
        // Web版：ブラウザのダウンロード機能を使用
        const url = URL.createObjectURL(pdfBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `fence_design_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
      }

      // Electron版の処理
      const result = await ipcRenderer!.invoke('save-file-dialog', {
        defaultPath: 'fence_design.pdf',
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] }
        ]
      });

      if (result.canceled) return false;

      // BlobをArrayBufferに変換
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const writeResult = await ipcRenderer!.invoke('write-file', result.filePath, buffer);
      return writeResult.success;
    } catch (error) {
      console.error('Failed to export PDF:', error);
      return false;
    }
  }

  private static validateProjectData(data: any): data is ProjectData {
    return (
      data &&
      typeof data.version === 'string' &&
      typeof data.created_date === 'string' &&
      typeof data.modified_date === 'string' &&
      typeof data.template_base === 'string' &&
      data.current_parameters &&
      this.validateParameters(data.current_parameters)
    );
  }

  private static validateParameters(params: any): params is FenceParameters {
    return (
      params &&
      typeof params.overall_width === 'number' &&
      typeof params.height === 'number' &&
      typeof params.embed_depth === 'number' &&
      typeof params.post_spacing === 'number' &&
      typeof params.rail_count === 'number' &&
      typeof params.bottom_rail_height === 'number' &&
      typeof params.post_spec === 'string' &&
      typeof params.rail_spec === 'string'
    );
  }

  static createNewProject(templateId: string, parameters: FenceParameters, notes: string = ''): ProjectData {
    const now = new Date().toISOString();
    
    return {
      version: '1.0',
      created_date: now,
      modified_date: now,
      template_base: templateId,
      current_parameters: { ...parameters },
      custom_notes: notes
    };
  }

  static updateProject(project: ProjectData, parameters: FenceParameters, notes?: string): ProjectData {
    return {
      ...project,
      modified_date: new Date().toISOString(),
      current_parameters: { ...parameters },
      custom_notes: notes !== undefined ? notes : project.custom_notes
    };
  }

  // 自動保存機能
  static startAutoSave(getProjectData: () => ProjectData | null, interval: number = 300000): () => void {
    const autoSaveInterval = setInterval(async () => {
      const projectData = getProjectData();
      if (projectData) {
        try {
          // 自動保存ファイル名
          const autoSavePath = `autosave_${Date.now()}.cfp`;
          await this.saveProject(projectData, autoSavePath);
          console.log('Auto-saved project');
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, interval);

    // 停止関数を返す
    return () => clearInterval(autoSaveInterval);
  }

  // 最近使用したファイルの管理
  static getRecentFiles(): string[] {
    const recent = localStorage.getItem('recent_files');
    return recent ? JSON.parse(recent) : [];
  }

  static addRecentFile(filePath: string): void {
    const recent = this.getRecentFiles();
    const filtered = recent.filter(path => path !== filePath);
    filtered.unshift(filePath);
    
    // 最大10件まで保持
    const trimmed = filtered.slice(0, 10);
    localStorage.setItem('recent_files', JSON.stringify(trimmed));
  }

  static removeRecentFile(filePath: string): void {
    const recent = this.getRecentFiles();
    const filtered = recent.filter(path => path !== filePath);
    localStorage.setItem('recent_files', JSON.stringify(filtered));
  }
}
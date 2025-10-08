import React, { useState, useCallback } from 'react';
import { FenceTemplate, FenceParameters } from '../types';
import { GeminiDesignService, DesignRequest, DesignResponse } from '../services/geminiService';

interface AIDesignAssistantProps {
  templates: FenceTemplate[];
  currentParameters: FenceParameters;
  onDesignGenerated: (templateId: string, parameters: Partial<FenceParameters>) => void;
}

const AIDesignAssistant: React.FC<AIDesignAssistantProps> = ({
  templates,
  currentParameters,
  onDesignGenerated
}) => {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResponse, setLastResponse] = useState<DesignResponse | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const geminiService = GeminiDesignService.getInstance();

  const handleGenerateDesign = useCallback(async () => {
    if (!userInput.trim()) return;

    setIsGenerating(true);
    setLastResponse(null);

    try {
      const request: DesignRequest = {
        userInput: userInput.trim(),
        currentParameters,
        availableTemplates: templates
      };

      // 実際のGEMINI APIを使用（API キーが設定されている場合）
      const response = await geminiService.generateDesign(request);
      
      // API キーがない場合はモック使用
      if (!response.success && response.error?.includes('API キー')) {
        const mockResponse = await geminiService.generateMockDesign(request);
        setLastResponse(mockResponse);
        
        if (mockResponse.success && mockResponse.parameters && mockResponse.templateId) {
          onDesignGenerated(mockResponse.templateId, mockResponse.parameters);
        }
      } else {
        setLastResponse(response);
        
        if (response.success && response.parameters && response.templateId) {
          onDesignGenerated(response.templateId, response.parameters);
        }
      }

    } catch (error) {
      setLastResponse({
        success: false,
        error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsGenerating(false);
    }
  }, [userInput, currentParameters, templates, onDesignGenerated, geminiService]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateDesign();
    }
  }, [handleGenerateDesign]);

  const examplePrompts = [
    '牛用の高さ1.5mで5段の柵を作って',
    '馬場用の強度の高い柵が欲しい',
    '風の強い地域用の耐風性能を重視した設計',
    '羊用の細かい間隔の低い柵',
    'ゲート付きで幅6mの牛舎柵',
    '軟弱地盤用のコンクリート基礎の柵'
  ];

  return (
    <div className="ai-design-assistant">
      <div className="ai-assistant-header">
        <button 
          className={`ai-toggle-button ${isExpanded ? 'active' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          🤖 AI設計アシスタント
          <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="ai-assistant-content">
          <div className="ai-input-section">
            <label className="ai-input-label">
              自然言語で設計を依頼してください
            </label>
            <textarea
              className="ai-input-textarea"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="例: 牛用の高さ1.5mで5段の柵を作って..."
              disabled={isGenerating}
              rows={3}
            />
            
            <div className="ai-input-actions">
              <button 
                className="ai-generate-button"
                onClick={handleGenerateDesign}
                disabled={isGenerating || !userInput.trim()}
              >
                {isGenerating ? '🔄 AI設計中...' : '🚀 AI設計生成'}
              </button>
              
              <button 
                className="ai-clear-button"
                onClick={() => setUserInput('')}
                disabled={isGenerating}
              >
                クリア
              </button>
            </div>
          </div>

          <div className="ai-examples-section">
            <h4>サンプル依頼</h4>
            <div className="ai-example-buttons">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="ai-example-button"
                  onClick={() => setUserInput(prompt)}
                  disabled={isGenerating}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {lastResponse && (
            <div className={`ai-response-section ${lastResponse.success ? 'success' : 'error'}`}>
              <h4>{lastResponse.success ? '✅ AI設計完了' : '❌ AI設計エラー'}</h4>
              
              {lastResponse.success ? (
                <div className="ai-success-content">
                  <p className="ai-explanation">{lastResponse.explanation}</p>
                  
                  {lastResponse.parameters && (
                    <div className="ai-generated-params">
                      <h5>生成されたパラメータ:</h5>
                      <div className="param-grid">
                        {Object.entries(lastResponse.parameters).map(([key, value]) => (
                          <div key={key} className="param-item">
                            <span className="param-key">{key}:</span>
                            <span className="param-value">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ai-error-content">
                  <p className="ai-error-message">{lastResponse.error}</p>
                  
                  {lastResponse.error?.includes('API キー') && (
                    <div className="ai-api-key-help">
                      <h5>GEMINI API キーの設定方法:</h5>
                      <ol>
                        <li>Google AI StudioでAPIキーを取得</li>
                        <li>.envファイルに REACT_APP_GEMINI_API_KEY=your_key_here を追加</li>
                        <li>アプリを再起動</li>
                      </ol>
                      <p><strong>現在はモックAIで動作しています。</strong></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="ai-help-section">
            <details>
              <summary>💡 AI設計アシスタントの使い方</summary>
              <div className="ai-help-content">
                <h5>対応可能な設計要素:</h5>
                <ul>
                  <li><strong>動物種類</strong>: 牛、馬、羊、豚</li>
                  <li><strong>寸法</strong>: 高さ、幅、支柱間隔</li>
                  <li><strong>構造</strong>: 桟の本数、材料規格</li>
                  <li><strong>機能</strong>: ゲート、基礎タイプ</li>
                  <li><strong>環境</strong>: 耐風性能、排水対応</li>
                </ul>
                
                <h5>効果的な依頼例:</h5>
                <ul>
                  <li>「風の強い地域で牛用の頑丈な柵」</li>
                  <li>「軟弱地盤にコンクリート基礎で建てたい」</li>
                  <li>「予算を抑えた簡易的な羊用柵」</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDesignAssistant;
import React, { useState, useCallback } from 'react';
import { FenceParameters, FenceTemplate, Template, BarnTemplate, BarnParameters } from '../types';

interface ParameterInputProps {
  template: Template | null;
  parameters: FenceParameters | BarnParameters | any;
  onParameterChange: (key: string, value: number | string) => void;
}

type UnitType = 'mm' | 'm' | '尺';

interface NumericInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  step?: number;
  presets?: number[];
  onChange: (value: number) => void;
  smartCorrection?: boolean;
  unitConversion?: boolean;
}

// 高機能数値入力コンポーネント
const SmartNumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  min,
  max,
  unit,
  step = 1,
  presets = [],
  onChange,
  smartCorrection = false,
  unitConversion = false
}) => {
  const [currentUnit, setCurrentUnit] = useState<UnitType>('mm');
  const [inputValue, setInputValue] = useState(value.toString());
  const [isSliderActive, setIsSliderActive] = useState(false);

  // 単位変換関数
  const convertValue = useCallback((val: number, from: UnitType, to: UnitType): number => {
    if (from === to) return val;
    
    // まずmm基準に変換
    let mmValue = val;
    if (from === 'm') mmValue = val * 1000;
    else if (from === '尺') mmValue = val * 303; // 1尺 ≈ 303mm
    
    // 目標単位に変換
    if (to === 'm') return mmValue / 1000;
    else if (to === '尺') return mmValue / 303;
    return mmValue;
  }, []);

  // スマート補正（5mm刻み等）
  const smartCorrectValue = useCallback((val: number): number => {
    if (!smartCorrection) return val;
    if (unit === 'mm') return Math.round(val / 5) * 5;
    if (unit === 'm') return Math.round(val * 20) / 20; // 0.05m刻み
    return val;
  }, [smartCorrection, unit]);

  // 値変更ハンドラー
  const handleValueChange = useCallback((newValue: number) => {
    const correctedValue = smartCorrectValue(Math.max(min, Math.min(max, newValue)));
    setInputValue(correctedValue.toString());
    onChange(correctedValue);
  }, [min, max, smartCorrectValue, onChange]);

  // スライダー変更
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    handleValueChange(newValue);
    setIsSliderActive(true);
  }, [handleValueChange]);

  // 直接入力変更
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      handleValueChange(numValue);
    }
  }, [handleValueChange]);

  // プリセット値選択
  const handlePresetClick = useCallback((presetValue: number) => {
    handleValueChange(presetValue);
  }, [handleValueChange]);

  const displayValue = convertValue(value, 'mm', currentUnit);
  const displayMin = convertValue(min, 'mm', currentUnit);
  const displayMax = convertValue(max, 'mm', currentUnit);
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="smart-numeric-input">
      <div className="input-header">
        <label className="input-label">{label}</label>
        {unitConversion && (
          <div className="unit-selector">
            {(['mm', 'm', '尺'] as UnitType[]).map((u) => (
              <button
                key={u}
                className={`unit-button ${currentUnit === u ? 'active' : ''}`}
                onClick={() => setCurrentUnit(u)}
              >
                {u}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="input-controls">
        <div className="slider-container">
          <input
            type="range"
            min={displayMin}
            max={displayMax}
            step={step}
            value={displayValue}
            onChange={handleSliderChange}
            onMouseDown={() => setIsSliderActive(true)}
            onMouseUp={() => setIsSliderActive(false)}
            className={`value-slider ${isSliderActive ? 'active' : ''}`}
          />
          <div 
            className="slider-progress" 
            style={{ width: `${progress}%` }}
          />
          <div className="slider-labels">
            <span className="min-label">{displayMin.toFixed(currentUnit === 'mm' ? 0 : 2)}</span>
            <span className="max-label">{displayMax.toFixed(currentUnit === 'mm' ? 0 : 2)}</span>
          </div>
        </div>
        
        <div className="input-group">
          <input
            type="number"
            value={displayValue.toFixed(currentUnit === 'mm' ? 0 : 2)}
            onChange={handleInputChange}
            min={displayMin}
            max={displayMax}
            step={step}
            className="numeric-input"
          />
          <span className="unit-display">{currentUnit}</span>
        </div>
      </div>
      
      {presets.length > 0 && (
        <div className="preset-buttons">
          <span className="preset-label">よく使う値:</span>
          {presets.map((preset) => {
            const displayPreset = convertValue(preset, 'mm', currentUnit);
            return (
              <button
                key={preset}
                className={`preset-button ${value === preset ? 'active' : ''}`}
                onClick={() => handlePresetClick(preset)}
              >
                {displayPreset.toFixed(currentUnit === 'mm' ? 0 : 2)}
              </button>
            );
          })}
        </div>
      )}
      
      <div className="input-feedback">
        <div className="value-indicator">
          現在値: <strong>{value}mm</strong>
        </div>
        {smartCorrection && (
          <div className="correction-hint">
            {unit === 'mm' ? '5mm' : '0.05m'}刻みで自動調整
          </div>
        )}
      </div>
    </div>
  );
};

const ParameterInput: React.FC<ParameterInputProps> = ({
  template,
  parameters,
  onParameterChange
}) => {
  if (!template) {
    return (
      <div className="parameter-input">
        <div className="no-template">
          テンプレートを選択してください
        </div>
      </div>
    );
  }

  const handleNumericChange = useCallback((key: string) => (
    (value: number) => {
      onParameterChange(key, value);
    }
  ), [onParameterChange]);
  
  const handleSelectChange = useCallback((key: string) => (
    (value: string) => {
      onParameterChange(key, value);
    }
  ), [onParameterChange]);

  // プリセット値の定義
  const presets = {
    overall_width: [2000, 3000, 4000, 5000, 6000, 8000, 10000],
    height: [1000, 1200, 1400, 1500, 1800, 2000],
    embed_depth: [300, 400, 500, 600, 800],
    post_spacing: [1500, 2000, 2500, 3000],
    rail_count: [3, 4, 5, 6],
    bottom_rail_height: [100, 150, 200, 250, 300],
    foundation_width: [200, 250, 300, 350, 400],
    foundation_depth: [400, 500, 600, 700, 800],
    gate_width: [800, 1000, 1200, 1500, 1800],
    feeding_port_count: [1, 2, 3, 4, 6],
    inspection_interval: [3, 6, 12, 24, 36],
    site_slope: [0, 2, 5, 10, 15],
    safety_margin: [10, 15, 20, 25, 30]
  };

  // チェックボックス用コンポーネント
  const BooleanInput: React.FC<{
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    description?: string;
  }> = ({ label, value, onChange, description }) => (
    <div className="boolean-input">
      <div className="boolean-header">
        <label className="boolean-label">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="boolean-checkbox"
          />
          <span className="checkbox-custom"></span>
          {label}
        </label>
      </div>
      {description && (
        <div className="boolean-description">{description}</div>
      )}
    </div>
  );

  // セレクト入力用コンポーネント
  const SelectInput: React.FC<{
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
  }> = ({ label, value, options, onChange }) => (
    <div className="select-input">
      <label className="select-label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-dropdown"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );


  return (
    <div className="parameter-input">
      <div className="parameter-header">
        <h3>パラメータ入力</h3>
        <div className="quick-actions">
          <button className="quick-button" onClick={() => {
            // クイックリセット機能
            Object.keys(template.parameters).forEach(key => {
              const param = template.parameters[key as keyof typeof template.parameters];
              if ('default' in param) {
                onParameterChange(key, param.default);
              }
            });
          }}>
            🔄 初期値に戻す
          </button>
        </div>
      </div>

      {template.design_type === 'fence' ? renderFenceParameters() : renderBarnParameters()}
    </div>
  );

  function renderFenceParameters() {
    const fenceTemplate = template as FenceTemplate;
    const fenceParams = parameters as FenceParameters;
    
    return (
      <>
        <div className="parameter-group">
          <h4>📏 基本寸法</h4>
          
          <SmartNumericInput
            label="全体幅"
            value={fenceParams.overall_width}
            min={fenceTemplate.parameters.overall_width.min}
            max={fenceTemplate.parameters.overall_width.max}
            unit={fenceTemplate.parameters.overall_width.unit}
            step={100}
            presets={presets.overall_width}
            onChange={handleNumericChange('overall_width')}
            smartCorrection={true}
            unitConversion={true}
          />

          <SmartNumericInput
            label="高さ"
            value={fenceParams.height}
            min={fenceTemplate.parameters.height.min}
            max={fenceTemplate.parameters.height.max}
            unit={fenceTemplate.parameters.height.unit}
            step={50}
            presets={presets.height}
            onChange={handleNumericChange('height')}
            smartCorrection={true}
            unitConversion={true}
          />
        </div>

        <div className="parameter-group">
          <h4>🏗️ 構造</h4>
          
          <SmartNumericInput
            label="支柱間隔"
            value={fenceParams.post_spacing}
            min={fenceTemplate.parameters.post_spacing.min}
            max={fenceTemplate.parameters.post_spacing.max}
            unit={fenceTemplate.parameters.post_spacing.unit}
            step={50}
            presets={presets.post_spacing}
            onChange={handleNumericChange('post_spacing')}
            smartCorrection={true}
            unitConversion={true}
          />

          <SmartNumericInput
            label="桟の本数"
            value={fenceParams.rail_count}
            min={fenceTemplate.parameters.rail_count.min}
            max={fenceTemplate.parameters.rail_count.max}
            unit={fenceTemplate.parameters.rail_count.unit}
            step={1}
            presets={presets.rail_count}
            onChange={handleNumericChange('rail_count')}
            smartCorrection={false}
            unitConversion={false}
          />

          <SmartNumericInput
            label="最下段高"
            value={fenceParams.bottom_rail_height}
            min={fenceTemplate.parameters.bottom_rail_height.min}
            max={fenceTemplate.parameters.bottom_rail_height.max}
            unit={fenceTemplate.parameters.bottom_rail_height.unit}
            step={25}
            presets={presets.bottom_rail_height}
            onChange={handleNumericChange('bottom_rail_height')}
            smartCorrection={true}
            unitConversion={true}
          />
        </div>

        <div className="parameter-group">
          <h4>🔧 材料</h4>
          
          <div className="material-selector">
            <label className="material-label">支柱規格</label>
            <div className="material-options">
              {fenceTemplate.parameters.post_spec.options.map((option) => (
                <button
                  key={option}
                  className={`material-button ${
                    fenceParams.post_spec === option ? 'active' : ''
                  }`}
                  onClick={() => handleSelectChange('post_spec')(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="material-selector">
            <label className="material-label">桟規格</label>
            <div className="material-options">
              {fenceTemplate.parameters.rail_spec.options.map((option) => (
                <button
                  key={option}
                  className={`material-button ${
                    fenceParams.rail_spec === option ? 'active' : ''
                  }`}
                  onClick={() => handleSelectChange('rail_spec')(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderBarnParameters() {
    const barnTemplate = template as BarnTemplate;
    const barnParams = parameters as BarnParameters;
    
    return (
      <>
        <div className="parameter-group">
          <h4>🏗️ 畜舎基本寸法</h4>
          
          <SmartNumericInput
            label="畜舎幅"
            value={barnParams.barn_width || 12000}
            min={barnTemplate.parameters.barn_width?.min || 8000}
            max={barnTemplate.parameters.barn_width?.max || 25000}
            unit={barnTemplate.parameters.barn_width?.unit || 'mm'}
            step={500}
            presets={[8000, 10000, 12000, 15000, 18000, 20000, 24000]}
            onChange={handleNumericChange('barn_width')}
            smartCorrection={true}
            unitConversion={true}
          />

          <SmartNumericInput
            label="畜舎奥行き"
            value={barnParams.barn_length || 24000}
            min={barnTemplate.parameters.barn_length?.min || 15000}
            max={barnTemplate.parameters.barn_length?.max || 60000}
            unit={barnTemplate.parameters.barn_length?.unit || 'mm'}
            step={1000}
            presets={[15000, 20000, 24000, 30000, 36000, 40000, 48000]}
            onChange={handleNumericChange('barn_length')}
            smartCorrection={true}
            unitConversion={true}
          />

          <SmartNumericInput
            label="軒高"
            value={barnParams.eave_height || 3500}
            min={barnTemplate.parameters.eave_height?.min || 2500}
            max={barnTemplate.parameters.eave_height?.max || 6000}
            unit={barnTemplate.parameters.eave_height?.unit || 'mm'}
            step={100}
            presets={[2500, 3000, 3500, 4000, 4500, 5000]}
            onChange={handleNumericChange('eave_height')}
            smartCorrection={true}
            unitConversion={true}
          />

          <SmartNumericInput
            label="棟高"
            value={barnParams.ridge_height || 5000}
            min={barnTemplate.parameters.ridge_height?.min || 3500}
            max={barnTemplate.parameters.ridge_height?.max || 8000}
            unit={barnTemplate.parameters.ridge_height?.unit || 'mm'}
            step={100}
            presets={[3500, 4000, 4500, 5000, 6000, 7000]}
            onChange={handleNumericChange('ridge_height')}
            smartCorrection={true}
            unitConversion={true}
          />

          <SmartNumericInput
            label="収容頭数"
            value={barnParams.capacity || 30}
            min={barnTemplate.parameters.capacity?.min || 4}
            max={barnTemplate.parameters.capacity?.max || 120}
            unit={barnTemplate.parameters.capacity?.unit || '頭'}
            step={1}
            presets={[8, 15, 30, 50, 60, 80, 100]}
            onChange={handleNumericChange('capacity')}
            smartCorrection={true}
            unitConversion={false}
          />
        </div>

        <div className="parameter-group">
          <h4>🏛️ 構造設計</h4>
          
          <SmartNumericInput
            label="柱間隔"
            value={barnParams.column_spacing || 6000}
            min={barnTemplate.parameters.column_spacing?.min || 4000}
            max={barnTemplate.parameters.column_spacing?.max || 8000}
            unit={barnTemplate.parameters.column_spacing?.unit || 'mm'}
            step={500}
            presets={[4000, 5000, 6000, 7000, 8000]}
            onChange={handleNumericChange('column_spacing')}
            smartCorrection={true}
            unitConversion={true}
          />

          <SelectInput
            label="梁材種類"
            value={barnParams.beam_type || 'H-200x100'}
            options={barnTemplate.parameters.beam_type?.options || ['H-200x100', 'H-250x125', 'H-300x150']}
            onChange={handleSelectChange('beam_type')}
          />

          <SelectInput
            label="柱材種類"
            value={barnParams.column_type || 'H-200x200'}
            options={barnTemplate.parameters.column_type?.options || ['H-200x200', 'H-250x250', 'H-300x300']}
            onChange={handleSelectChange('column_type')}
          />

          <SelectInput
            label="基礎タイプ"
            value={barnParams.foundation_type || 'concrete_footing'}
            options={barnTemplate.parameters.foundation_type?.options || ['concrete_footing', 'continuous_footing', 'mat_foundation']}
            onChange={handleSelectChange('foundation_type')}
          />
        </div>

        <div className="parameter-group">
          <h4>🏠 屋根・壁面設計</h4>
          
          <SelectInput
            label="屋根形状"
            value={barnParams.roof_type || 'gable'}
            options={barnTemplate.parameters.roof_type?.options || ['gable', 'shed', 'hip', 'gambrel']}
            onChange={handleSelectChange('roof_type')}
          />

          <SelectInput
            label="壁タイプ"
            value={barnParams.wall_type || 'open'}
            options={barnTemplate.parameters.wall_type?.options || ['open', 'semi_open', 'curtain_wall', 'solid_wall']}
            onChange={handleSelectChange('wall_type')}
          />

          <SmartNumericInput
            label="開放率"
            value={barnParams.opening_ratio || 70}
            min={barnTemplate.parameters.opening_ratio?.min || 20}
            max={barnTemplate.parameters.opening_ratio?.max || 100}
            unit={barnTemplate.parameters.opening_ratio?.unit || '%'}
            step={5}
            presets={[30, 50, 60, 70, 80, 90, 100]}
            onChange={handleNumericChange('opening_ratio')}
            smartCorrection={true}
            unitConversion={false}
          />

          <SelectInput
            label="換気方式"
            value={barnParams.ventilation_type || 'natural'}
            options={barnTemplate.parameters.ventilation_type?.options || ['natural', 'forced', 'tunnel', 'hybrid']}
            onChange={handleSelectChange('ventilation_type')}
          />

          <SelectInput
            label="対象動物"
            value={barnParams.animal_type || 'beef_cattle'}
            options={barnTemplate.parameters.animal_type?.options || ['beef_cattle', 'dairy_cattle', 'horse', 'sheep', 'goat']}
            onChange={handleSelectChange('animal_type')}
          />
        </div>
      </>
    );
  }
};

export default ParameterInput;
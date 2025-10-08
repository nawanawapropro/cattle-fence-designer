import React, { useState } from 'react';
import { FenceTemplate, BarnTemplate, Template } from '../types';

interface TemplateSelectorProps {
  fenceTemplates: FenceTemplate[];
  barnTemplates: BarnTemplate[];
  selectedTemplate: Template | null;
  onTemplateSelect: (template: Template) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  fenceTemplates,
  barnTemplates,
  selectedTemplate,
  onTemplateSelect
}) => {
  const [activeTab, setActiveTab] = useState<'fence' | 'barn'>('fence');

  const renderFenceIcon = (template: FenceTemplate) => (
    <div className="fence-icon">
      <div className="post"></div>
      <div className="rails">
        {Array.from({ length: template.parameters.rail_count.default }, (_, i) => (
          <div key={i} className="rail"></div>
        ))}
      </div>
      <div className="post"></div>
      <div className="post"></div>
    </div>
  );

  const renderBarnIcon = (template: BarnTemplate) => (
    <div className="barn-icon">
      <div className="barn-roof">
        <div className="roof-left"></div>
        <div className="roof-right"></div>
      </div>
      <div className="barn-walls">
        <div className="wall-left"></div>
        <div className="wall-right"></div>
        <div className="wall-front"></div>
      </div>
      <div className="barn-columns">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="column"></div>
        ))}
      </div>
    </div>
  );

  const renderTemplateSpecs = (template: Template) => {
    if (template.design_type === 'fence') {
      const fenceTemplate = template as FenceTemplate;
      return (
        <div className="template-specs">
          <span className="spec">
            {fenceTemplate.parameters.rail_count.default}段構造
          </span>
          <span className="spec">
            標準幅: {fenceTemplate.parameters.overall_width.default}mm
          </span>
        </div>
      );
    } else {
      const barnTemplate = template as BarnTemplate;
      return (
        <div className="template-specs">
          <span className="spec">
            {barnTemplate.parameters.capacity.default}頭収容
          </span>
          <span className="spec">
            {barnTemplate.parameters.barn_width.default / 1000}m × {barnTemplate.parameters.barn_length.default / 1000}m
          </span>
        </div>
      );
    }
  };

  const currentTemplates = activeTab === 'fence' ? fenceTemplates : barnTemplates;

  return (
    <div className="template-selector">
      <h3>テンプレート選択</h3>
      
      <div className="template-tabs">
        <button 
          className={`tab-button ${activeTab === 'fence' ? 'active' : ''}`}
          onClick={() => setActiveTab('fence')}
        >
          柵設計
        </button>
        <button 
          className={`tab-button ${activeTab === 'barn' ? 'active' : ''}`}
          onClick={() => setActiveTab('barn')}
        >
          畜舎設計
        </button>
      </div>

      <div className="template-grid">
        {currentTemplates.map((template) => (
          <div
            key={template.template_id}
            className={`template-item ${template.design_type} ${
              selectedTemplate?.template_id === template.template_id ? 'selected' : ''
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <div className="template-thumbnail">
              {template.thumbnail ? (
                <img src={template.thumbnail} alt={template.name} />
              ) : (
                <div className="thumbnail-placeholder">
                  {template.design_type === 'fence' ? 
                    renderFenceIcon(template as FenceTemplate) : 
                    renderBarnIcon(template as BarnTemplate)
                  }
                </div>
              )}
            </div>
            <div className="template-info">
              <h4>{template.name}</h4>
              <p className="template-description">{template.description}</p>
              {renderTemplateSpecs(template)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
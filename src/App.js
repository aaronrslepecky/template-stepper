import React, { useState, useEffect } from 'react';
import { ConfigurationProvider, useConfiguration } from './context/ConfigurationContext';
import StepflowContainer from './components/core/StepflowContainer/StepflowContainer';
import StepflowStep from './components/core/StepflowContainer/StepflowStep';
import './App.css';

function StepperContent() {
  const [isDirty, setIsDirty] = useState(false);
  const { template, loading, error } = useConfiguration();

  if (loading) {
    return <div>Loading template...</div>;
  }

  if (error) {
    return <div>Error loading template: {error}</div>;
  }

  if (!template || !template.steps || !Array.isArray(template.steps)) {
    return <div>No valid template data available</div>;
  }

  return (
    <div className="App">
      <StepflowContainer isDirty={isDirty} setIsDirty={setIsDirty}>
        {template.steps.map((step) => (
          <StepflowStep
            key={step.stepNumber}
            title={step.title}
            decorator={step.decorator}
            dependent={step.type === 'dependent'}
            validation={step.validation}
          >
            <div>
              <h4>{step.title}</h4>
              {/* Render step content based on template configuration */}
              {step.content && <div dangerouslySetInnerHTML={{ __html: step.content }} />}
            </div>
          </StepflowStep>
        ))}
      </StepflowContainer>
    </div>
  );
}

function App() {
  const templateId = process.env.REACT_APP_TEMPLATE_ID;
  const companyId = process.env.REACT_APP_COMPANY_ID;

  if (!templateId || !companyId) {
    return <div>Error: Template ID and Company ID are required</div>;
  }

  return (
    <ConfigurationProvider templateId={templateId} companyId={companyId}>
      <StepperContent />
    </ConfigurationProvider>
  );
}

export default App;

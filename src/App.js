import React, { useState } from 'react';
import StepflowContainer from './components/core/StepflowContainer/StepflowContainer';
import StepflowStep from './components/core/StepflowContainer/StepflowStep';
import './App.css';

function App() {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <div className="App">
      <StepflowContainer isDirty={isDirty} setIsDirty={setIsDirty}>
        <StepflowStep
          title="Step 1"
          decorator="Basic Information"
        >
          <div>
            <h4>Step 1 Content</h4>
            <p>This is the content for step 1.</p>
          </div>
        </StepflowStep>

        <StepflowStep
          title="Step 2"
          decorator="Additional Details"
        >
          <div>
            <h4>Step 2 Content</h4>
            <p>This is the content for step 2.</p>
          </div>
        </StepflowStep>

        <StepflowStep
          title="Step 3"
          decorator="Final Review"
          dependent
        >
          <div>
            <h4>Step 3 Content</h4>
            <p>This is the content for step 3.</p>
          </div>
        </StepflowStep>
      </StepflowContainer>
    </div>
  );
}

export default App;

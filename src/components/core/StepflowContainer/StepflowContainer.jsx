import React, {
    useCallback, useMemo, useState
} from 'react';

import './StepflowContainer.scss';

export default function StepflowContainer({
    setIsDirty, isDirty, children, activeStep = 1
}) {
    const [activeStepInternal, setActiveStepInternal] = useState(activeStep);
    const [continueFunctions, setContinueFunctions] = useState({});
    const [completedSteps, setCompletedSteps] = useState([]);

    const handleStepChange = useCallback(async (step, bypassModal) => {
        if (!isDirty || !setIsDirty || !!bypassModal) {
            setActiveStepInternal(step);
            return;
        }

        // This is here for testing support
        console.debug(`template-stepper-dirty-save-${activeStepInternal}`);

        const result = window.confirm('You have unsaved changes. Would you like to save them?');

        if (result && continueFunctions[activeStepInternal]?.fn) {
            await continueFunctions[activeStepInternal].fn();
        }
    }, [activeStepInternal, continueFunctions, isDirty, setIsDirty]);

    const dependentSteps = useMemo(() => (
        React.Children.toArray(children)
            .map((x, i) => ({ step: i + 1, dependent: x.props.dependent }))
            .filter(x => x.dependent === true)
            .map(x => x.step)
    ), [children]);

    const registerContinueFunction = useCallback((registration) => {
        const updatedRegistrations = {
            ...continueFunctions,
            [registration.key]: registration
        };
        setContinueFunctions(updatedRegistrations);
    }, [continueFunctions]);

    const renderedChildren = useMemo(() => {
        const arrayChildren = React.Children.toArray(children);

        // some steps may not need interaction
        const completed = [...completedSteps];
        let outsideUpdate = false;
        for (let i = 0; i < arrayChildren.length; i++) {
            const child = arrayChildren[i];
            const stepNumber = i + 1;
            if (child.props.completed && !completed.find(x => x === stepNumber)) {
                outsideUpdate = true;
                completed.push(stepNumber);
            }
        }
        if (outsideUpdate) {
            setCompletedSteps(completed);

            // if default active step is pre-completed, find first uncompleted step, if any, to make active
            if (completed.indexOf(activeStepInternal) > -1) {
                let newActiveStep = -1;
                for (let i = 0; i < arrayChildren.length; i++) {
                    const stepNumber = i + 1;
                    if (completed.indexOf(stepNumber) === -1) {
                        newActiveStep = stepNumber;
                        break;
                    }
                }
                setActiveStepInternal(newActiveStep);
            }
        }

        return arrayChildren.map((child, i) => {
            let childProps = child.props;
            childProps = { ...childProps };
            const stepNumber = i + 1;
            const active = stepNumber === activeStepInternal;
            const dependent = !!dependentSteps.find(x => x === stepNumber);
            const isCompleted = !!completed.find(x => x === stepNumber);
            const onContinueExternal = childProps.onContinue;

            return React.cloneElement(child, {
                ...childProps,
                setIsDirty: setIsDirty,
                isDirty: isDirty,
                registerContinueFunction: registerContinueFunction,
                continueFunctionRegistered: !!continueFunctions[stepNumber],
                stepNumber,
                showIconBar: stepNumber < arrayChildren.length,
                active,
                completed: isCompleted,
                disabled: dependent && !isCompleted && (completedSteps.length < (arrayChildren.length - dependentSteps.length)),
                onContinue: async (step, { incomingChanges }) => {
                    if (onContinueExternal) {
                        await Promise.resolve(onContinueExternal(incomingChanges));
                    }

                    const stepsCompleted = [...completedSteps];
                    if (!stepsCompleted.find(x => x === step)) {
                        stepsCompleted.push(step);
                        setCompletedSteps(stepsCompleted);
                    }

                    const uncompletedSteps = arrayChildren
                        .map((_, j) => (j + 1))
                        .filter(x => !stepsCompleted.find(y => y === x) && !dependentSteps.find(y => y === x));

                    if (uncompletedSteps.find(x => x > step) !== undefined) {
                        return setActiveStepInternal(uncompletedSteps.find(x => x > step));
                    }
                    if (uncompletedSteps.length > 0) {
                        return setActiveStepInternal(uncompletedSteps[0]);
                    }
                    if (dependentSteps.length > 0) {
                        const uncompletedDependentSteps = arrayChildren
                            .map((_, j) => (j + 1))
                            .filter(x => !stepsCompleted.find(y => y === x) && dependentSteps.find(y => y === x));
                        if (uncompletedDependentSteps.find(x => x > step) !== undefined) {
                            return setActiveStepInternal(uncompletedDependentSteps.find(x => x > step));
                        }
                        if (uncompletedDependentSteps.length > 0) {
                            return setActiveStepInternal(uncompletedDependentSteps[0]);
                        }
                    }

                    return setActiveStepInternal(-1);
                },
                onActiveChange: handleStepChange
            });
        });
    }, [children, completedSteps, activeStepInternal, dependentSteps, setIsDirty, isDirty, registerContinueFunction, continueFunctions, handleStepChange]);

    return (
        <div className="stepflow-container">
            {renderedChildren}
        </div>
    );
} 
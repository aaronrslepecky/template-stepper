import React, {
    useMemo, useCallback, useState,
    useEffect
} from 'react';
import './StepflowStep.scss';

function StepflowIcon({
    stepNumber,
    showIconBar,
    active,
    completed,
    disabled,
    onIconClick,
    dataTestId = ''
}) {
    const barStyle = useMemo(() => ({
        ...(active && !disabled ? {
            backgroundColor: '#007bff',
            borderColor: '#007bff'
        } : {})
    }), [active, disabled]);

    const btnClasses = useMemo(() => {
        const classes = ['stepflow-icon-btn'];
        if ((!active && !completed) || disabled) { classes.push('not-active'); }
        if (!active && completed && !disabled) { classes.push('completed'); }

        return classes.join(' ').trim();
    }, [active, completed, disabled]);

    const handleIconClick = useCallback(() => onIconClick(active ? -1 : stepNumber), [active, stepNumber, onIconClick]);

    return (
        <div className="stepflow-icon" data-testid={`${dataTestId}-icon`}>
            <button
                disabled={disabled}
                className={btnClasses}
                onClick={handleIconClick}
                onKeyPress={e => e.key === 13 && handleIconClick}
            >
                { !completed ? stepNumber : <span className="fa fa-check" /> }
            </button>
            {showIconBar && (
                <div
                    className={`stepflow-icon-bar${disabled ? ' step-disabled' : ''}`}
                    role="button"
                    tabIndex={stepNumber}
                    onClick={handleIconClick}
                    onKeyPress={e => e.key === 13 && handleIconClick}
                >
                    <div className={`stepflow-icon-bar-line${completed ? ' completed' : ''}`} style={barStyle} />
                </div>
            )}
        </div>
    );
}

function StepflowTitle({
    title,
    decorator,
    hideDecoratorOnActive,
    active,
    completed,
    disabled,
    stepNumber,
    onTitleClick,
    dataTestId = ''
}) {
    const titleTextStyle = useMemo(() => ({
        ...(active && !disabled ? { color: '#007bff' } : { })
    }), [active, disabled]);

    const handleTitleText = useCallback(() => onTitleClick(active ? -1 : stepNumber), [active, stepNumber, onTitleClick]);

    const titleProps = useMemo(() => {
        const props = { className: `stepflow-title${disabled ? ' step-disabled' : ''}${completed ? ' step-completed' : ''}` };
        if (!disabled) {
            props.role = 'button';
            props.tabIndex = -1;
            props.onClick = handleTitleText;
            props.onKeyPress = e => e.key === 13 && handleTitleText();
        }

        return props;
    }, [disabled, completed, handleTitleText]);
    return (
        <div {...titleProps} data-testid={`${dataTestId}-title`}>
            <div className="stepflow-title-text">
                <h3 style={titleTextStyle}>{title}</h3>
            </div>
            {decorator && (!hideDecoratorOnActive || (hideDecoratorOnActive && !active)) && (
                <div className="stepflow-title-decorator">
                    <div style={titleTextStyle}>{decorator}</div>
                </div>
            )}
        </div>
    );
}

export default function StepflowStep({
    children,
    stepNumber,
    active = false,
    completed = false,
    disabled = false,
    title = '',
    decorator = null,
    showIconBar = true,
    showActionButtons = true,
    disableContinue = false,
    hideDecoratorOnActive = false,
    onContinue = () => false,
    onCancel = () => false,
    onActiveChange = () => false,
    dataTestId = '',
    setIsDirty = () => false,
    isDirty = false,
    registerContinueFunction = null,
    continueFunctionRegistered = false,
    ...props
}) {
    const [validateFn, setValidateFn] = useState();
    const [validationArgs, setValidationArgs] = useState();
    const [cancelFn, setCancelFn] = useState();
    const [continueFn, setContinueFn] = useState();
    const [continuing, setContinuing] = useState(false);
    const [forceContinueRegistration, setForceContinueRegistration] = useState(false);

    const contentClasses = useMemo(() => {
        const classes = [''];
        if (active) {
            classes.push('step-active');
        }

        return classes.join(' ').trim();
    }, [active]);

    const handleContinue = useCallback(async () => {
        if (validateFn && !(await Promise.resolve(validateFn(...(validationArgs || []))))) { return; }

        setContinuing(true);
        try {
            const incomingChanges = continueFn && await Promise.resolve(continueFn());
            onContinue && await Promise.resolve(onContinue(stepNumber, { incomingChanges: incomingChanges || {} }));
        } finally {
            setContinuing(false);
        }
    }, [validateFn, validationArgs, continueFn, onContinue, stepNumber]);

    const handleSetContinueFn = useCallback((continueFunction, validateArgs) => {
        setContinueFn(continueFunction);
        setForceContinueRegistration(true);
        setValidationArgs(validateArgs);
    }, []);

    const handleCancel = useCallback(() => {
        cancelFn && cancelFn();
        onCancel();
        onActiveChange(-1, true);
    }, [cancelFn, onCancel, onActiveChange]);

    const renderedChildren = useMemo(() => React.Children.toArray(children).map((child) => {
        let childProps = child.props;
        childProps = { ...childProps };

        // Getting rid of annoying console errors
        if (child.type !== 'div') {
            childProps = {
                ...childProps,
                setIsDirty,
                isDirty,
                setValidateCallback: setValidateFn,
                setCancelCallback: setCancelFn,
                setContinueCallback: handleSetContinueFn
            };
        }

        return React.cloneElement(child, {
            ...childProps
        });
    }), [children, handleSetContinueFn, isDirty, setIsDirty]);

    const stepClassNames = useMemo(() => {
        const classNames = ['stepflow-step'];
        if (props?.className) { classNames.push(props.className); }
        if (!showActionButtons) { classNames.push('action-buttons-hidden'); }
        return classNames.join(' ').trim();
    }, [props, showActionButtons]);

    const dataTestIdAppend = useMemo(() => (title ? `-${title.toLowerCase()}` : ''), [title]);

    useEffect(() => {
        if (!continueFunctionRegistered || forceContinueRegistration) {
            registerContinueFunction({ key: stepNumber, title, fn: handleContinue });
            setForceContinueRegistration(false);
        }
    }, [continueFunctionRegistered, forceContinueRegistration, handleContinue, registerContinueFunction, stepNumber, title]);

    return (
        <div className={stepClassNames} data-testid={dataTestId}>
            <div className="stepflow-step-index">
                <StepflowIcon
                    stepNumber={stepNumber}
                    showIconBar={showIconBar}
                    active={active}
                    completed={completed}
                    disabled={disabled}
                    onIconClick={onActiveChange}
                    dataTestId={dataTestId}
                />
            </div>
            <div className="stepflow-step-content">
                <StepflowTitle
                    title={title}
                    decorator={decorator}
                    hideDecoratorOnActive={hideDecoratorOnActive}
                    active={active}
                    stepNumber={stepNumber}
                    completed={completed}
                    disabled={disabled}
                    onTitleClick={onActiveChange}
                    dataTestId={dataTestId}
                />
                <div style={{ opacity: active ? 1 : 0 }} className={`stepflow-step-content-body ${contentClasses}`} data-testid={`step-flow-step-content-body${dataTestIdAppend}`}>
                    {renderedChildren}
                </div>
                {showActionButtons && active && (
                    <div className="stepflow-step-content-body-submit">
                        <button data-testid={`${dataTestId}-continue`} className="stepflow-continue" onClick={handleContinue} disabled={disableContinue || continuing}>
                            Continue
                        </button>
                        <button data-testid={`${dataTestId}-cancel`} className="stepflow-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 
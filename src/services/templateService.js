// Template types and validation
export const TEMPLATE_TYPES = {
    STANDARD: 'standard',
    CUSTOM: 'custom',
    DEPENDENT: 'dependent'
};

export class TemplateService {
    constructor(companyId) {
        this.companyId = companyId;
        this.baseUrl = '/api/templates'; // Update this with your actual API endpoint
    }

    async loadTemplate(templateId) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.companyId}/${templateId}`);
            if (!response.ok) {
                throw new Error('Failed to load template');
            }
            const template = await response.json();
            return this.validateTemplate(template);
        } catch (error) {
            console.error('Error loading template:', error);
            throw error;
        }
    }

    validateTemplate(template) {
        if (!template || !template.steps || !Array.isArray(template.steps)) {
            throw new Error('Invalid template format');
        }

        // Validate each step
        template.steps = template.steps.map((step, index) => ({
            ...step,
            stepNumber: index + 1,
            type: step.type || TEMPLATE_TYPES.STANDARD,
            validation: step.validation || {},
            dependencies: step.dependencies || []
        }));

        return template;
    }

    processTemplateStep(step, data) {
        // Process step based on type and data
        switch (step.type) {
            case TEMPLATE_TYPES.DEPENDENT:
                return this.processDependentStep(step, data);
            case TEMPLATE_TYPES.CUSTOM:
                return this.processCustomStep(step, data);
            default:
                return this.processStandardStep(step, data);
        }
    }

    processDependentStep(step, data) {
        // Check if dependencies are satisfied
        const dependenciesMet = step.dependencies.every(dep => {
            return data[dep.field] === dep.value;
        });

        return {
            ...step,
            isEnabled: dependenciesMet
        };
    }

    processCustomStep(step, data) {
        // Handle custom step logic
        return {
            ...step,
            // Add custom processing logic here
        };
    }

    processStandardStep(step, data) {
        // Handle standard step logic
        return {
            ...step,
            // Add standard processing logic here
        };
    }
}

export default TemplateService; 
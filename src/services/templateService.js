// Template types and validation
export const TEMPLATE_TYPES = {
    STANDARD: 'standard',
    CUSTOM: 'custom',
    DEPENDENT: 'dependent'
};

export class TemplateService {
    constructor(companyId) {
        this.companyId = companyId;
        this.baseUrl = '/api'; // Base URL for template endpoints
    }

    async loadTemplate(templateId) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.companyId}/templates/${templateId}`, {
                headers: {
                    'Authorization': `Token ${process.env.REACT_APP_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',
                    'Culture': 'en-US',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Template loading failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
            }
            const template = await response.json();
            return this.transformTemplate(template);
        } catch (error) {
            console.error('Error loading template:', error);
            throw error;
        }
    }

    transformTemplate(template) {
        // If the template already has steps, validate and return it
        if (template.steps && Array.isArray(template.steps)) {
            return this.validateTemplate(template);
        }

        // Transform the template into the expected format with all necessary steps
        return {
            ...template,
            steps: [
                {
                    stepNumber: 1,
                    title: 'Campaign Details',
                    decorator: 'Basic campaign information',
                    type: TEMPLATE_TYPES.STANDARD,
                    content: `<div class='step-content'>
                        <h3>${template.name}</h3>
                        <p>Campaign: ${template.campaignName}</p>
                        <p>Company ID: ${template.companyId}</p>
                        ${template.customName ? `<p>Custom Name: ${template.customName}</p>` : ''}
                    </div>`,
                    validation: {
                        required: ['name', 'campaignName']
                    }
                },
                {
                    stepNumber: 2,
                    title: 'Budget & Schedule',
                    decorator: 'Set your campaign budget and timeline',
                    type: TEMPLATE_TYPES.STANDARD,
                    content: `<div class='step-content'>
                        <form>
                            <div class='form-group'>
                                <label>Budget</label>
                                <input type='number' placeholder='Enter your budget' />
                            </div>
                            <div class='form-group'>
                                <label>Start Date</label>
                                <input type='date' />
                            </div>
                            <div class='form-group'>
                                <label>End Date</label>
                                <input type='date' />
                            </div>
                        </form>
                    </div>`,
                    validation: {
                        required: ['budget', 'startDate', 'endDate']
                    }
                },
                {
                    stepNumber: 3,
                    title: 'Locations',
                    decorator: 'Select target locations',
                    type: TEMPLATE_TYPES.STANDARD,
                    content: `<div class='step-content'>
                        <form>
                            <div class='form-group'>
                                <label>Target Locations</label>
                                <select multiple>
                                    <option>New York</option>
                                    <option>Los Angeles</option>
                                    <option>Chicago</option>
                                    <option>Houston</option>
                                </select>
                            </div>
                        </form>
                    </div>`,
                    validation: {
                        required: ['locations']
                    }
                },
                {
                    stepNumber: 4,
                    title: 'Copy & Media',
                    decorator: 'Create your ad content',
                    type: TEMPLATE_TYPES.STANDARD,
                    content: `<div class='step-content'>
                        <form>
                            <div class='form-group'>
                                <label>Ad Copy</label>
                                <textarea placeholder='Enter your ad copy'></textarea>
                            </div>
                            <div class='form-group'>
                                <label>Media</label>
                                <input type='file' accept='image/*' />
                            </div>
                        </form>
                    </div>`,
                    validation: {
                        required: ['adCopy']
                    }
                },
                {
                    stepNumber: 5,
                    title: 'Call to Action',
                    decorator: 'Set your campaign goals',
                    type: TEMPLATE_TYPES.STANDARD,
                    content: `<div class='step-content'>
                        <form>
                            <div class='form-group'>
                                <label>CTA Type</label>
                                <select>
                                    <option>Learn More</option>
                                    <option>Shop Now</option>
                                    <option>Sign Up</option>
                                    <option>Contact Us</option>
                                </select>
                            </div>
                            <div class='form-group'>
                                <label>CTA URL</label>
                                <input type='url' placeholder='Enter your landing page URL' />
                            </div>
                        </form>
                    </div>`,
                    validation: {
                        required: ['ctaType', 'ctaUrl']
                    }
                },
                {
                    stepNumber: 6,
                    title: 'Audience',
                    decorator: 'Define your target audience',
                    type: TEMPLATE_TYPES.STANDARD,
                    content: `<div class='step-content'>
                        <form>
                            <div class='form-group'>
                                <label>Age Range</label>
                                <select>
                                    <option>18-24</option>
                                    <option>25-34</option>
                                    <option>35-44</option>
                                    <option>45-54</option>
                                    <option>55+</option>
                                </select>
                            </div>
                            <div class='form-group'>
                                <label>Interests</label>
                                <select multiple>
                                    <option>Technology</option>
                                    <option>Fashion</option>
                                    <option>Sports</option>
                                    <option>Food</option>
                                </select>
                            </div>
                        </form>
                    </div>`,
                    validation: {
                        required: ['ageRange', 'interests']
                    }
                },
                {
                    stepNumber: 7,
                    title: 'Review',
                    decorator: 'Review your campaign settings',
                    type: TEMPLATE_TYPES.DEPENDENT,
                    dependencies: [
                        { field: 'name', value: '*' },
                        { field: 'budget', value: '*' },
                        { field: 'locations', value: '*' },
                        { field: 'adCopy', value: '*' },
                        { field: 'ctaType', value: '*' },
                        { field: 'ageRange', value: '*' }
                    ],
                    content: `<div class='step-content'>
                        <h3>Please review your campaign settings</h3>
                        <div id='review-content'></div>
                        <button class='submit-button'>Launch Campaign</button>
                    </div>`
                }
            ]
        };
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
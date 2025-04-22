import React, { createContext, useContext, useState, useEffect } from 'react';
import { TemplateService } from '../services/templateService';

export const ConfigurationContext = createContext();

export function ConfigurationProvider({ children, companyId, templateId }) {
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const templateService = new TemplateService(companyId);

    useEffect(() => {
        const loadTemplate = async () => {
            try {
                console.log('Loading template with:', {
                    templateId,
                    companyId,
                    apiKey: process.env.REACT_APP_API_KEY ? 'Present' : 'Missing'
                });

                const data = await templateService.loadTemplate(templateId);
                console.log('Template loaded successfully:', data);
                setTemplate(data);
                setLoading(false);
            } catch (err) {
                console.error('Error loading template:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        if (templateId && companyId) {
            loadTemplate();
        }
    }, [templateId, companyId]);

    const value = {
        companyId,
        templateId,
        template,
        loading,
        error,
        setTemplate
    };

    return (
        <ConfigurationContext.Provider value={value}>
            {children}
        </ConfigurationContext.Provider>
    );
}

export function useConfiguration() {
    const context = useContext(ConfigurationContext);
    if (!context) {
        throw new Error('useConfiguration must be used within a ConfigurationProvider');
    }
    return context;
} 
import React, { createContext, useContext, useState, useEffect } from 'react';

export const ConfigurationContext = createContext();

export function ConfigurationProvider({ children, companyId, templateId }) {
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTemplate = async () => {
            try {
                console.log('Loading template with:', {
                    templateId,
                    companyId,
                    apiKey: process.env.REACT_APP_API_KEY ? 'Present' : 'Missing'
                });

                // Using the proxied API endpoint
                const response = await fetch(`/api/templates/${templateId}?companyId=${companyId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Response:', {
                        status: response.status,
                        statusText: response.statusText,
                        headers: Object.fromEntries(response.headers.entries()),
                        body: errorText
                    });
                    throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
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
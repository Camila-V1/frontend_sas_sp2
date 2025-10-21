// src/config/tenants.js

// Configuración de dominios multi-tenant
export const TENANT_CONFIG = {
    // Dominios de desarrollo local
    'bienestar.localhost': {
        name: 'Clínica Bienestar',
        theme: 'bienestar',
        logo: '/logos/bienestar.png',
        colors: {
            primary: '#0066CC',
            secondary: '#00AA44'
        }
    },
    'mindcare.localhost': {
        name: 'MindCare Psicología',
        theme: 'mindcare',
        logo: '/logos/mindcare.png',
        colors: {
            primary: '#6B46C1',
            secondary: '#EC4899'
        }
    },
    // Configuración para Admin Global
    'localhost': {
        name: 'Administrador General - Psico SAS',
        theme: 'global-admin',
        logo: '/logos/global-admin.png',
        colors: {
            primary: '#1F2937',
            secondary: '#3B82F6'
        },
        isGlobalAdmin: true
    }
};

// Función para obtener la configuración del tenant actual
export const getCurrentTenant = () => {
    const hostname = window.location.hostname;
    return TENANT_CONFIG[hostname] || TENANT_CONFIG['localhost'];
};

// Función para obtener la URL base de la API
export const getApiBaseURL = () => {
    const hostname = window.location.hostname;
    if (hostname.includes('localhost')) {
        return `http://${hostname}:8000/api`;
    }
    // Para producción
    return `https://${hostname}/api`;
};


// Función para verificar si estamos en modo admin global
export const isGlobalAdmin = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost';
};

// Función para verificar si estamos en modo multi-tenant (clínica específica)
export const isMultiTenant = () => {
    const hostname = window.location.hostname;
    return hostname !== 'localhost' && hostname.includes('localhost');
};
// src/config/tenants.js

// Configuración de tenants (simplificada - NO depende del hostname exacto)
export const TENANT_CONFIG = {
    bienestar: {
        name: 'Clínica Bienestar',
        theme: 'bienestar',
        logo: '/logos/bienestar.png',
        colors: {
            primary: '#0066CC',
            secondary: '#00AA44'
        }
    },
    mindcare: {
        name: 'MindCare Psicología',
        theme: 'mindcare',
        logo: '/logos/mindcare.png',
        colors: {
            primary: '#6B46C1',
            secondary: '#EC4899'
        }
    },
    'global-admin': {
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

// Función para detectar tenant desde el hostname
export const getTenantFromHostname = () => {
    const hostname = window.location.hostname;
    
    // Detectar tenant desde el subdomain
    // Ejemplos:
    // - bienestar-app.psicoadmin.xyz → bienestar
    // - mindcare-app.psicoadmin.xyz → mindcare
    // - psico-app.vercel.app → bienestar (default)
    
    if (hostname.includes('mindcare')) {
        return 'mindcare';
    } else if (hostname.includes('bienestar')) {
        return 'bienestar';
    }
    
    // Desarrollo local
    if (hostname.includes('localhost')) {
        const subdomain = hostname.split('.')[0];
        if (subdomain === 'mindcare') return 'mindcare';
        if (subdomain === 'bienestar') return 'bienestar';
        if (subdomain === 'localhost') return 'global-admin'; // localhost puro = admin global
        return 'bienestar'; // Default
    }
    
    // Default para cualquier otro caso
    return 'bienestar';
};

// Función para obtener la configuración del tenant actual
export const getCurrentTenant = () => {
    const tenant = getTenantFromHostname();
    return TENANT_CONFIG[tenant] || TENANT_CONFIG.bienestar;
};

// Función helper más descriptiva (alias de getCurrentTenant)
export const getCurrentTenantConfig = getCurrentTenant;

// Función para obtener la URL base de la API (construcción dinámica según tenant)
export const getApiBaseURL = () => {
    const tenant = getTenantFromHostname();
    const hostname = window.location.hostname;
    
    // Desarrollo local
    if (hostname.includes('localhost')) {
        // Admin global usa localhost sin subdomain
        if (tenant === 'global-admin') {
            return 'http://localhost:8000/api';
        }
        // Otros tenants usan subdomain
        return `http://${tenant}.localhost:8000/api`;
    }
    
    // Producción: construcción automática según tenant
    return `https://${tenant}.psicoadmin.xyz/api`;
};


// Función para verificar si estamos en modo admin global
export const isGlobalAdmin = () => {
    const tenant = getTenantFromHostname();
    return tenant === 'global-admin';
};

// Función para verificar si estamos en modo multi-tenant (clínica específica)
export const isMultiTenant = () => {
    const tenant = getTenantFromHostname();
    return tenant !== 'global-admin';
};
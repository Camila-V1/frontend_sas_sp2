// src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, userType }) {
    const token = localStorage.getItem('authToken');
    const storedUserType = localStorage.getItem('userType');

    // DEBUG: Agregar logs para entender qué está pasando
    console.log('🔒 ProtectedRoute Debug:');
    console.log('- Token:', token ? 'Existe' : 'NO EXISTE');
    console.log('- Stored User Type:', storedUserType);
    console.log('- Required User Type:', userType);
    console.log('- URL:', window.location.pathname);

    // 1. Si no hay token, siempre se redirige a login.
    if (!token) {
        console.log('❌ Sin token -> Redirigiendo a /login');
        return <Navigate to="/login" replace />;
    }

    // 2. Si no se requiere un tipo específico, permitir acceso
    if (!userType) {
        console.log('✅ Sin restricción de tipo de usuario');
        return children;
    }

    // 3. Verificar permisos por tipo de usuario
    const hasAccess = (() => {
        // Admin y superuser pueden acceder a rutas de admin
        if (userType === 'admin') {
            return storedUserType === 'admin' || storedUserType === 'superuser';
        }
        
        // Para otros tipos, debe coincidir exactamente
        return userType === storedUserType;
    })();

    if (hasAccess) {
        console.log('✅ Acceso concedido');
        return children;
    } else {
        console.log('❌ Acceso denegado -> Redirigiendo a /');
        return <Navigate to="/" replace />;
    }
}

export default ProtectedRoute;
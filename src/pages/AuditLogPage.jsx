// src/pages/AuditLogPage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'react-toastify';

function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ level: '', search: '' });

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                // Construimos los parámetros para enviar al backend
                const params = new URLSearchParams();
                if (filters.level) params.append('level', filters.level);
                if (filters.search) params.append('search', filters.search);

                const response = await apiClient.get(`/auditlog/logs/?${params.toString()}`);
                
                // ✨ LA CORRECCIÓN CLAVE ESTÁ AQUÍ ✨
                // Siempre usamos response.data.results porque la ViewSet siempre pagina
                setLogs(response.data.results || []);

            } catch (error) {
                console.error("Error al cargar la bitácora:", error);
                toast.error("No se pudo cargar la bitácora.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [filters]); // El hook se ejecuta de nuevo si los filtros cambian

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ level: '', search: '' });
    };

    const getSummary = (level) => {
        // Contamos los logs del estado actual, no del total, para reflejar los filtros
        return logs.filter(log => log.level === level).length;
    };
    
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Bitácora del Sistema</h1>
                    <p className="text-gray-600 mt-2">
                        Registro de las acciones importantes realizadas en la clínica.
                    </p>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            name="search"
                            placeholder="Buscar por acción, usuario o IP..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="p-2 border border-gray-300 rounded-md"
                        />
                        <select
                            name="level"
                            value={filters.level}
                            onChange={handleFilterChange}
                            className="p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Todos los niveles</option>
                            <option value="INFO">Info</option>
                            <option value="WARNING">Warning</option>
                            <option value="ERROR">Error</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                        <button onClick={clearFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg">
                            Limpiar Filtros
                        </button>
                    </div>
                </div>

                {/* Tabla de Registros */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-10">Cargando...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No se encontraron registros.</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(log.timestamp).toLocaleString('es-ES')}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{log.user_email || 'Sistema'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{log.ip_address || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    log.level === 'ERROR' || log.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                    log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{log.action}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                 {/* Estadísticas de Resumen */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-100 p-4 rounded-lg">INFO: <span className="font-bold">{getSummary('INFO')}</span></div>
                    <div className="bg-yellow-100 p-4 rounded-lg">WARNING: <span className="font-bold">{getSummary('WARNING')}</span></div>
                    <div className="bg-red-100 p-4 rounded-lg">ERROR: <span className="font-bold">{getSummary('ERROR') + getSummary('CRITICAL')}</span></div>
                </div>
            </div>
        </div>
    );
}

export default AuditLogPage;
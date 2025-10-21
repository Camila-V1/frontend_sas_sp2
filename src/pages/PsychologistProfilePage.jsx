// src/pages/PsychologistProfilePage.jsx

import { useState, useEffect } from 'react';
import apiClient from '../api';
import { toast } from 'sonner';
import { User, Save, X, Edit, DollarSign, Brain, BookOpen, Clock, MapPin } from 'lucide-react';

// --- Constantes de Estilo ---
const btnPrimary = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center";
const btnOutline = "px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors";

// --- Componente de Input (para modo edición) ---
function ProfileInput({ label, name, value, onChange, disabled = false, type = "text" }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/50"
      />
    </div>
  );
}

// --- Componente de Textarea (para modo edición) ---
function ProfileTextarea({ label, name, value, onChange, disabled = false, rows = 3 }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/50"
      />
    </div>
  );
}

function PsychologistProfilePage() {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false); // <-- Estado de edición

    // --- Carga de Datos ---
    const fetchProfile = async () => {
        try {
            const response = await apiClient.get('/professionals/profile/');
            setProfile(response.data);
        } catch (err) {
            setError('No se pudo cargar tu perfil profesional.');
            toast.error('No se pudo cargar tu perfil profesional.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // --- Manejador de Cambios ---
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    // --- Manejador de Envío ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // El backend espera los specialization_ids para actualizar
            const dataToSubmit = {
                ...profile,
                specialization_ids: profile.specializations.map(s => s.id) 
            };
            
            await apiClient.put('/professionals/profile/', dataToSubmit);
            toast.success('¡Perfil actualizado con éxito!');
            setIsEditing(false);
            fetchProfile(); // Recargamos
        } catch (err) {
            toast.error('Hubo un error al guardar tu perfil.');
        }
    };

    // --- Cancelar Edición ---
    const handleCancel = () => {
        setIsEditing(false);
        fetchProfile(); // Restaura los datos originales
    }

    if (loading) return <p className="text-center text-muted-foreground">Cargando perfil...</p>;
    if (error) return <p className="text-center text-destructive">{error}</p>;

    // --- JSX REFACTORIZADO ---
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-primary">Mi Perfil Profesional</h1>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className={`${btnPrimary} flex items-center gap-2`}>
                      <Edit className="h-4 w-4" />
                      <span>Editar Perfil</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                      <button onClick={handleCancel} className={`${btnOutline} flex items-center gap-2`}>
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                      </button>
                      <button onClick={handleSubmit} className={`${btnPrimary} flex items-center gap-2`}>
                          <Save className="h-4 w-4" />
                          <span>Guardar Cambios</span>
                      </button>
                  </div>
                )}
            </div>

            {/* Tarjeta de Perfil Profesional */}
            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileInput label="Nombre Completo" name="full_name" value={profile.full_name} disabled={true} />
                        <ProfileInput label="Email" name="email" value={profile.email} disabled={true} />
                        <ProfileInput label="Número de Licencia" name="license_number" value={profile.license_number} onChange={handleChange} disabled={!isEditing} />
                        <ProfileInput label="Ciudad" name="city" value={profile.city} onChange={handleChange} disabled={!isEditing} />
                        <ProfileInput label="Años de Experiencia" name="experience_years" value={profile.experience_years} onChange={handleChange} disabled={!isEditing} type="number" />
                        <ProfileInput label="Tarifa por Consulta (Bs.)" name="consultation_fee" value={profile.consultation_fee} onChange={handleChange} disabled={!isEditing} type="number" />
                    </div>
                    
                    <ProfileTextarea label="Biografía" name="bio" value={profile.bio} onChange={handleChange} disabled={!isEditing} rows={4} />
                    <ProfileTextarea label="Formación Académica" name="education" value={profile.education} onChange={handleChange} disabled={!isEditing} rows={3} />

                    {/* Mostrar Especialidades (Modo lectura) */}
                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Especialidades</label>
                            <div className="flex flex-wrap gap-2">
                                {profile.specializations && profile.specializations.length > 0 ? (
                                    profile.specializations.map(spec => (
                                        <span key={spec.id} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                                            {spec.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay especialidades asignadas.</p>
                                )}
                            </div>
                        </div>
                    )}
                    
                </form>
            </div>
        </div>
    );
}

export default PsychologistProfilePage;
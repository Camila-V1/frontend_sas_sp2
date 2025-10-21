// src/pages/ProfessionalDetailPage.jsx
import { toast } from 'react-toastify';
// ... (tus otras importaciones)
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api';
// Importamos los iconos que acabas de instalar
import { Star, MapPin, Clock, BookOpen, Briefcase, ChevronLeft, Calendar, CheckCircle } from 'lucide-react';
// Importamos el componente de reseñas
import ReviewsList from '../components/ReviewsList';
// Importamos el componente de pago
import PaymentButton from '../components/PaymentButton';
// Importamos el componente de información de pago
import PaymentInfo from '../components/PaymentInfo';
// --- Constantes de Estilo ---
const btnBookable = "px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm text-center cursor-pointer";
const btnBooked = "px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed text-sm text-center";
const btnPrimary = "w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center";

// --- Componente de Estrellas ---
function StarRating({ rating = 0 }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// --- Componente de Pestañas (Tabs) ---
function Tabs({ activeTab, setActiveTab }) {
  const tabs = ["Acerca de", "Experiencia", "Especialidades", "Reseñas"];
  const getClasses = (tabName) => {
    return activeTab === tabName
      ? "pb-2 border-b-2 border-primary text-primary font-semibold"
      : "pb-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground";
  };

  return (
    <nav className="flex space-x-8 border-b border-border mb-6">
      {tabs.map(tab => (
        <button key={tab} className={getClasses(tab)} onClick={() => setActiveTab(tab)}>
          {tab}
        </button>
      ))}
    </nav>
  );
}

// --- Componente Principal ---
function ProfessionalDetailPage() {
    const [professional, setProfessional] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [reviewsData, setReviewsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const { id } = useParams();

    // Estado para la nueva UI
    const [activeTab, setActiveTab] = useState("Acerca de");
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // --- Función para obtener el horario (separada para reutilización) ---
    const fetchSchedule = async (userId) => {
        if (!userId) return;
        
        try {
            const scheduleResponse = await apiClient.get(`/appointments/psychologist/${userId}/schedule/`);
            setSchedule(scheduleResponse.data);
            
            // Si no hay fecha seleccionada, selecciona la primera disponible
            if (!selectedDate) {
                const firstAvailableDay = scheduleResponse.data?.schedule.find(d => d.is_available);
                if (firstAvailableDay) {
                    setSelectedDate(firstAvailableDay);
                }
            } else {
                // Actualiza la fecha seleccionada con los nuevos datos
                const updatedSelectedDay = scheduleResponse.data?.schedule.find(d => d.date === selectedDate.date);
                if (updatedSelectedDay) {
                    setSelectedDate(updatedSelectedDay);
                }
            }
            
            return scheduleResponse.data;
        } catch (err) {
            console.error("Error al cargar el horario:", err);
            throw err;
        }
    };

    // --- Lógica de Carga de Datos (CORREGIDA) ---
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // 1. Obtener información del usuario actual
                try {
                    const userResponse = await apiClient.get('/users/profile/');
                    setCurrentUser(userResponse.data);
                } catch (userError) {
                    console.error("Error al cargar perfil del usuario:", userError);
                }

                // 2. Primero obtenemos el perfil profesional usando el ID de la URL
                const profResponse = await apiClient.get(`/professionals/${id}/`);
                setProfessional(profResponse.data);
                
                // 3. Extraemos el user_id del perfil para la segunda llamada
                const userId = profResponse.data.user_id;
                
                if (userId) {
                    // 4. Usamos la función separada para obtener el horario
                    await fetchSchedule(userId);
                }

                // 5. Carga las reseñas usando el ID del PERFIL
                try {
                    const reviewsResponse = await apiClient.get(`/professionals/${id}/reviews/`);
                    setReviewsData(reviewsResponse.data);
                } catch (reviewsError) {
                    console.error("Error al cargar reseñas:", reviewsError);
                    // No es crítico, continúa aunque no se puedan cargar las reseñas
                    setReviewsData({ total_reviews: 0, reviews: [], average_rating: 0 });
                }

                if (!userId) {
                    console.error("El user_id no fue encontrado en la respuesta del perfil.");
                    setError('No se pudo obtener la información de disponibilidad del profesional.');
                }

            } catch (err) {
                console.error("Error al cargar los datos del profesional:", err);
                setError('No se pudo cargar la información del profesional.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    // --- Lógica de Agendar Cita (modificada para la nueva UI) ---
    const handleBookAppointment = async () => {
        console.log('=== INICIANDO RESERVA DE CITA ===');
        console.log('selectedDate:', selectedDate);
        console.log('selectedTime:', selectedTime);
        console.log('professional:', professional);
        
        if (!selectedDate || !selectedTime) {
            toast.warning('Por favor, selecciona una fecha y hora disponibles.');
            return;
        }

        if (!professional || !professional.user_id) {
            toast.error('Error: Información del profesional no disponible.');
            return;
        }

        try {
            const appointmentData = {
                psychologist: professional.user_id,
                appointment_date: selectedDate.date,
                start_time: selectedTime,
            };

            console.log('Datos a enviar:', appointmentData);
            console.log('URL completa:', '/appointments/appointments/');

            const response = await apiClient.post('/appointments/appointments/', appointmentData);
            
            console.log('Respuesta exitosa:', response.data);
            toast.success(`¡Cita reservada exitosamente! Tu cita el ${selectedDate.date} a las ${selectedTime} ha sido registrada.`);

            // ¡AQUÍ ESTÁ LA SOLUCIÓN! 
            // Refresca el horario después de la reserva exitosa
            console.log('Refrescando horario...');
            await fetchSchedule(professional.user_id);
            
            // Resetea la hora seleccionada para que el usuario pueda hacer otra reserva
            setSelectedTime(null); 
            console.log('Horario actualizado exitosamente');
            
        } catch (err) {
            console.error('=== ERROR AL AGENDAR CITA ===');
            console.error('Error completo:', err);
            console.error('Response data:', err.response?.data);
            console.error('Response status:', err.response?.status);
            console.error('Request config:', err.config);
            
            const errorMessage = err.response?.data?.detail || 
                               err.response?.data?.error || 
                               err.response?.data || 
                               'Es posible que el horario ya no esté disponible. Por favor, refresca la página.';
            
            toast.error(`Error al agendar la cita: ${typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage}`);
        }
    };

    if (loading) return <p className="text-center text-muted-foreground">Cargando perfil y disponibilidad...</p>;
    if (error) return <p className="text-center text-destructive">{error}</p>;
    if (!professional || !schedule) return <p className="text-center text-muted-foreground">No hay datos para mostrar.</p>;

    // --- JSX REFACTORIZADO ---
    return (
        <main className="max-w-7xl mx-auto p-4">
            <Link to="/dashboard" className="flex items-center gap-1 text-primary font-medium hover:underline mb-6">
                <ChevronLeft className="h-4 w-4" />
                Volver a resultados
            </Link>

            {/* Encabezado del Perfil (como image_5492c7.png) */}
            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border mb-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-5xl font-semibold text-primary">
                            {professional.full_name.split(" ").map(n => n[0]).join("")}
                        </span>
                        {/* <AvatarImage src={professional.photo || "/placeholder.svg"} /> */}
                    </div>
                    <div className="flex-1 space-y-3">
                        <h1 className="text-3xl font-bold text-foreground">{professional.full_name}</h1>
                        <p className="text-lg font-medium text-primary">{professional.specializations.map(s => s.name).join(', ')}</p>
                        <div className="flex items-center gap-2">
                            <StarRating rating={professional.average_rating || 0} />
                            <span className="text-sm font-medium">{professional.average_rating || 0}</span>
                            <span className="text-sm text-muted-foreground">({professional.total_reviews || 0} reseñas)</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Disponible hoy</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{professional.city || 'Ubicación no especificada'}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {professional.accepts_online_sessions && <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">Online</span>}
                            {professional.accepts_in_person_sessions && <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">Presencial</span>}
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end justify-between gap-4 sm:min-w-[170px]">
                        <div className="text-left sm:text-right">
                            <div className="flex items-center gap-1 text-3xl font-bold text-primary">
                                <span>Bs. {professional.consultation_fee}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">por consulta</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal (Pestañas y Agenda) */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Columna Izquierda: Pestañas de Info (como image_5492c7.png) */}
                <div className="flex-1 lg:max-w-2xl">
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    
                    {activeTab === "Acerca de" && (
                        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                            <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Biografía
                            </h2>
                            <p className="text-foreground whitespace-pre-line">{professional.bio}</p>
                        </div>
                    )}
                    {activeTab === "Experiencia" && (
                        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                            <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Educación y Experiencia
                            </h2>
                            <p className="text-foreground font-semibold">Años de experiencia: {professional.experience_years}</p>
                            <p className="text-foreground whitespace-pre-line mt-2">{professional.education}</p>
                        </div>
                    )}
                    {activeTab === "Especialidades" && (
                        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
                            <h2 className="text-xl font-semibold text-primary mb-3">Especialidades</h2>
                            <ul className="list-disc list-inside space-y-2 text-foreground">
                                {professional.specializations.map(s => <li key={s.id}>{s.name}</li>)}
                            </ul>
                        </div>
                    )}
                    {activeTab === "Reseñas" && (
                        <ReviewsList data={reviewsData} />
                    )}
                    {/* Nota: No hay sección de "Idiomas" porque no existe en tu backend */}
                </div>

                {/* Columna Derecha: Agenda (como image_5492e6.png) */}
                <div className="w-full lg:w-96 flex-shrink-0">
                    {/* Información de Pago */}
                    <PaymentInfo />
                    
                    <div className="bg-card p-6 rounded-xl shadow-lg border border-border sticky top-24">
                        <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Seleccionar Fecha y Hora
                        </h2>
                        
                        {/* Selección de Fecha */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {schedule.schedule.map(day => {
                                const isSelected = day.date === selectedDate?.date;
                                const baseClasses = "p-2 rounded-lg text-center cursor-pointer border";
                                const stateClasses = isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-input text-foreground border-border hover:bg-muted";
                                const disabledClasses = !day.is_available ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : stateClasses;

                                return (
                                    <button 
                                        key={day.date} 
                                        disabled={!day.is_available}
                                        className={`${baseClasses} ${disabledClasses}`}
                                        onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                                    >
                                        <span className="text-xs font-medium uppercase">{day.day_name.substring(0,3)}</span>
                                        <span className="block text-sm font-bold">{day.date.substring(8, 10)}</span>
                                        <span className="block text-xs">{day.date.substring(5, 7)}</span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Selección de Hora */}
                        <div className="border-t border-border pt-4 mb-4">
                            <h3 className="font-semibold text-foreground mb-3">Horas disponibles</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedDate && selectedDate.time_slots.length > 0 ? (
                                    selectedDate.time_slots.map((slot, index) => (
                                        slot.is_available ? (
                                            <button 
                                                key={`${slot.start_time}-${index}`} 
                                                className={`
                                                  ${btnBookable} 
                                                  ${selectedTime === slot.start_time ? 'ring-2 ring-offset-2 ring-primary' : ''}
                                                `}
                                                onClick={() => setSelectedTime(slot.start_time)}
                                            >
                                                {slot.start_time}
                                            </button>
                                        ) : (
                                            <button key={`${slot.start_time}-${index}`} className={btnBooked} disabled>
                                                Ocupado
                                            </button>
                                        )
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay horarios disponibles este día.</p>
                                )}
                            </div>
                        </div>

                        {/* Resumen de la Cita */}
                        {selectedTime && (
                            <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-4">
                                <h3 className="font-semibold text-primary">Resumen de la Cita</h3>
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-semibold text-primary">
                                            {professional.full_name.split(" ").map(n => n[0]).join("")}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{professional.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{professional.specializations[0].name}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-t border-border pt-2">
                                    <span className="text-muted-foreground">Total:</span>
                                    <span className="text-xl font-bold text-primary">Bs. {professional.consultation_fee}</span>
                                </div>
                                <PaymentButton
                                    appointmentData={{
                                        psychologist: professional.user_id,
                                        appointment_date: selectedDate.date,
                                        start_time: selectedTime,
                                        price: professional.consultation_fee
                                    }}
                                    user={currentUser}
                                    onSuccess={() => {
                                        toast.success('¡Pago exitoso! Tu cita ha sido confirmada.');
                                        // Refresca el horario después del pago exitoso
                                        fetchSchedule(professional.user_id);
                                        setSelectedTime(null);
                                    }}
                                    onError={(error) => {
                                        toast.error(`Error en el pago: ${error}`);
                                    }}
                                    className="w-full"
                                >
                                    Pagar y Confirmar Cita
                                </PaymentButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ProfessionalDetailPage;
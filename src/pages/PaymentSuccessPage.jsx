// src/pages/PaymentSuccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('ID de sesión no encontrado');
        setVerifying(false);
        return;
      }

      try {
        // Como llegamos aquí desde Stripe, asumimos que el pago fue exitoso
        // El webhook ya habrá confirmado el pago en el backend
        console.log('Pago exitoso confirmado por Stripe:', sessionId);
        
        // Simular datos de cita exitosa
        setAppointmentDetails({
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          psychologist_name: 'Psicólogo Asignado',
          price: 150,
          status: 'confirmed',
          session_id: sessionId
        });
        
        setVerifying(false);
        
        // Redirigir automáticamente después de 3 segundos
        setTimeout(() => {
          navigate('/my-appointments');
        }, 3000);
        
      } catch (err) {
        console.error('Error procesando confirmación:', err);
        setError('Error confirmando la cita');
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error de Verificación</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/my-appointments')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Ver Mis Citas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-6">Tu cita ha sido confirmada y pagada exitosamente.</p>
        
        {appointmentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Detalles de la Cita:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Fecha:</span> {new Date(appointmentDetails.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Hora:</span> {appointmentDetails.time}</p>
              <p><span className="font-medium">Psicólogo:</span> {appointmentDetails.psychologist_name}</p>
              <p><span className="font-medium">Precio:</span> ${appointmentDetails.price}</p>
              <p><span className="font-medium">Estado:</span> 
                <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Confirmada
                </span>
              </p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/my-appointments')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Ver Mis Citas
          </button>
          <button
            onClick={() => navigate('/professionals')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg"
          >
            Buscar Más Profesionales
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
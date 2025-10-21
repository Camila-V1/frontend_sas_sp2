// src/components/Chatbot.jsx
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { toast } from 'react-toastify';

// Motor de respuestas inteligente basado en reglas
class ChatbotEngine {
    constructor() {
        // Base de conocimiento con patrones y respuestas
        this.knowledgeBase = [
            // Saludos
            {
                patterns: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'saludos'],
                responses: [
                    '¡Hola! 👋 Soy tu asistente virtual de PsicoAdmin. ¿En qué puedo ayudarte hoy?',
                    '¡Bienvenido! Estoy aquí para ayudarte con cualquier duda sobre nuestro sistema.',
                    '¡Hola! ¿Necesitas ayuda con el agendamiento de citas o información sobre nuestros servicios?'
                ],
                category: 'greeting'
            },
            
            // Agendamiento de citas
            {
                patterns: ['agendar', 'cita', 'reservar', 'turno', 'hora', 'disponibilidad', 'cupo'],
                responses: [
                    'Para agendar una cita: 1) Ve a "Profesionales" 2) Selecciona tu psicólogo preferido 3) Elige fecha y hora disponible 4) Confirma tu reserva. ¿Necesitas ayuda con algún paso específico?',
                    'Puedes agendar tu cita desde la sección "Profesionales". Verás el calendario de disponibilidad de cada psicólogo. ¿Quieres que te guíe paso a paso?'
                ],
                category: 'appointment'
            },
            
            // Pagos
            {
                patterns: ['pagar', 'pago', 'precio', 'costo', 'tarjeta', 'stripe', 'cobro'],
                responses: [
                    'Los pagos se procesan de forma segura a través de Stripe. Después de agendar tu cita, serás redirigido al checkout donde podrás pagar con tarjeta. ¿Tienes alguna duda sobre el proceso?',
                    'Aceptamos pagos con tarjeta de crédito/débito a través de Stripe. El precio depende del profesional que elijas. ¿Necesitas más información?'
                ],
                category: 'payment'
            },
            
            // Documentos
            {
                patterns: ['documento', 'descargar', 'archivo', 'pdf', 'informe', 'material'],
                responses: [
                    'Puedes ver y descargar todos tus documentos clínicos en la sección "Mis Documentos". Tus psicólogos subirán allí material de apoyo e informes. ¿Necesitas ayuda para encontrar algo?',
                    'En "Mis Documentos" encontrarás todo el material que tus profesionales te han compartido. Puedes descargarlo haciendo clic en el botón "Descargar". ¿Hay algo específico que busques?'
                ],
                category: 'documents'
            },
            
            // Profesionales
            {
                patterns: ['psicólogo', 'profesional', 'terapeuta', 'especialista', 'doctor'],
                responses: [
                    'Contamos con profesionales especializados en diferentes áreas. Puedes ver sus perfiles, especialidades y disponibilidad en la sección "Profesionales". ¿Buscas alguna especialidad en particular?',
                    'Todos nuestros psicólogos están certificados y cuentan con amplia experiencia. En la sección "Profesionales" puedes ver su información, reseñas y horarios disponibles.'
                ],
                category: 'professionals'
            },
            
            // Historial clínico
            {
                patterns: ['historial', 'historia clínica', 'expediente', 'antecedentes', 'registro'],
                responses: [
                    'Tu historial clínico es confidencial y solo accesible para ti y tus profesionales asignados. Contiene notas de sesión, diagnósticos y evolución de tu tratamiento.',
                    'El historial clínico se actualiza después de cada sesión. Tu psicólogo registra notas importantes que ayudan a dar seguimiento a tu proceso terapéutico.'
                ],
                category: 'history'
            },
            
            // Cuenta y perfil
            {
                patterns: ['perfil', 'cuenta', 'contraseña', 'email', 'datos', 'información personal'],
                responses: [
                    'Puedes actualizar tu información personal en la sección "Mi Perfil". Allí también puedes cambiar tu contraseña y foto de perfil.',
                    'Para modificar tus datos: Ve a "Mi Perfil" → Edita la información que necesites → Guarda los cambios. ¿Necesitas ayuda específica con algo?'
                ],
                category: 'profile'
            },
            
            // Ayuda general
            {
                patterns: ['ayuda', 'help', 'no entiendo', 'no funciona', 'error', 'problema'],
                responses: [
                    'Estoy aquí para ayudarte. ¿Podrías contarme más detalles sobre lo que necesitas? Por ejemplo: ¿quieres agendar una cita, ver documentos, o tienes un problema técnico?',
                    'Claro, con gusto te ayudo. ¿Es sobre: agendamiento de citas, pagos, documentos, o algo más? Cuéntame para orientarte mejor.'
                ],
                category: 'help'
            },
            
            // Despedida
            {
                patterns: ['gracias', 'bye', 'adiós', 'chao', 'hasta luego', 'ok gracias'],
                responses: [
                    '¡De nada! Si necesitas más ayuda, aquí estaré. Que tengas un excelente día. 😊',
                    '¡Un placer ayudarte! No dudes en volver si necesitas algo más. ¡Cuídate! 👋',
                    '¡Gracias a ti! Estoy disponible cuando me necesites. ¡Hasta pronto! ✨'
                ],
                category: 'farewell'
            }
        ];
        
        // Historial de conversación para contexto
        this.conversationContext = [];
    }
    
    // Función para normalizar texto (quitar acentos, minúsculas)
    normalize(text) {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }
    
    // Encontrar la mejor respuesta basada en el mensaje del usuario
    findResponse(userMessage) {
        const normalized = this.normalize(userMessage);
        let bestMatch = null;
        let maxScore = 0;
        
        // Buscar coincidencias en los patrones
        for (const entry of this.knowledgeBase) {
            let score = 0;
            
            for (const pattern of entry.patterns) {
                if (normalized.includes(this.normalize(pattern))) {
                    score += 10;
                }
            }
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = entry;
            }
        }
        
        // Si encontramos coincidencia, retornar respuesta aleatoria
        if (bestMatch && maxScore > 0) {
            const responses = bestMatch.responses;
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // Respuesta por defecto si no hay coincidencia
        return this.getDefaultResponse(userMessage);
    }
    
    // Respuestas por defecto cuando no hay coincidencia
    getDefaultResponse(userMessage) {
        const defaultResponses = [
            'Interesante pregunta. ¿Podrías reformularla? Por ejemplo: "¿Cómo agendar una cita?" o "¿Dónde veo mis documentos?"',
            'No estoy seguro de haber entendido. ¿Tu pregunta es sobre citas, pagos, documentos o profesionales?',
            'Hmm, no encontré información específica sobre eso. ¿Podrías ser más específico? Puedo ayudarte con: citas, pagos, documentos, perfil.',
            'Esa es una buena pregunta, pero necesito más contexto. ¿Es sobre el uso de la plataforma? Cuéntame más detalles.'
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Agregar mensaje al contexto
    addToContext(role, message) {
        this.conversationContext.push({ role, message, timestamp: Date.now() });
        
        // Mantener solo los últimos 10 mensajes para contexto
        if (this.conversationContext.length > 10) {
            this.conversationContext.shift();
        }
    }
    
    // Obtener respuesta considerando contexto
    getResponse(userMessage) {
        this.addToContext('user', userMessage);
        const response = this.findResponse(userMessage);
        this.addToContext('bot', response);
        return response;
    }
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: '¡Hola! 👋 Soy tu asistente virtual de PsicoAdmin. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const engineRef = useRef(null);
    
    // Inicializar el motor del chatbot
    useEffect(() => {
        engineRef.current = new ChatbotEngine();
    }, []);
    
    // Auto-scroll al último mensaje
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // Manejar envío de mensaje
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!inputMessage.trim()) return;
        
        // Agregar mensaje del usuario
        const userMessage = {
            role: 'user',
            text: inputMessage,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        
        // Simular tiempo de "pensamiento" del bot (300-800ms)
        const thinkingTime = 300 + Math.random() * 500;
        
        setTimeout(() => {
            // Obtener respuesta del motor
            const botResponse = engineRef.current.getResponse(inputMessage);
            
            const botMessage = {
                role: 'bot',
                text: botResponse,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, thinkingTime);
    };
    
    // Atajos rápidos
    const quickActions = [
        { text: '¿Cómo agendar una cita?', emoji: '📅' },
        { text: '¿Dónde veo mis documentos?', emoji: '📄' },
        { text: '¿Cómo pagar?', emoji: '💳' },
        { text: 'Ver profesionales', emoji: '👨‍⚕️' }
    ];
    
    const handleQuickAction = (actionText) => {
        setInputMessage(actionText);
    };
    
    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
                aria-label="Abrir chatbot"
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
            </button>
            
            {/* Ventana del chat */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">Asistente Virtual</h3>
                            <p className="text-xs text-blue-100">Siempre disponible para ayudarte</p>
                        </div>
                    </div>
                    
                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-2 ${
                                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                }`}
                            >
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    message.role === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-300 text-gray-700'
                                }`}>
                                    {message.role === 'user' ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>
                                
                                {/* Mensaje */}
                                <div className={`max-w-[75%] ${
                                    message.role === 'user' ? 'items-end' : 'items-start'
                                } flex flex-col`}>
                                    <div className={`rounded-lg p-3 ${
                                        message.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 rounded-tl-none shadow'
                                    }`}>
                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1">
                                        {message.timestamp.toLocaleTimeString('es-ES', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Indicador de escritura */}
                        {isTyping && (
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-gray-700">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-white rounded-lg rounded-tl-none p-3 shadow">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Acciones rápidas */}
                    {messages.length === 1 && (
                        <div className="p-3 bg-gray-100 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">Preguntas frecuentes:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickAction(action.text)}
                                        className="text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full border border-gray-300 transition-colors"
                                    >
                                        {action.emoji} {action.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Escribe tu pregunta..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isTyping}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

# Próximas Tareas y Mejoras para AeroGym 🚀

## 🤖 Integración de IA (Gemini API)
- [ ] **Entrenador Virtual (Chat)**: Implementar un asistente que responda dudas sobre técnica, ejercicios sustitutos y nutrición.
- [ ] **Generador de Rutinas Inteligente**: Crear una función que genere rutinas personalizadas basadas en el perfil del usuario (objetivo, nivel, equipo disponible) usando prompts de IA.
- [ ] **Análisis de Progresión**: Analizar los datos de las sesiones para sugerir ajustes de peso y volumen (descargas, aumentos de intensidad).
- [ ] **Optimización de Macros**: Refinar el plan nutricional permitiendo consultas dinámicas sobre alimentos y recetas.

## 📱 Interfaz y UX/UI
- [ ] **Histórico Visual**: Añadir gráficos de progresión de 1RM por ejercicio principal (Bench Press, Squat, etc.).
- [ ] **Temporizador de Descanso**: Añadir un cronómetro automático que se active al completar una serie.
- [ ] **Modo Offline**: Asegurar que la aplicación sea una PWA (Progressive Web App) funcional sin conexión a internet.
- [ ] **Sonidos y Notificaciones**: Avisos sonoros al terminar descansos o alcanzar nuevos PRs (Personal Records).

## 🛠️ Infraestructura y Despliegue
- [ ] **Configuración de Secretos en GitHub**: Añadir `GEMINI_API_KEY` como secreto en el repositorio para que los despliegues de Pages puedan usarla en el futuro.
- [ ] **Testing**: Añadir tests básicos para los cálculos de ingeniería (E1RM, TDEE).

## ✅ Tareas Completadas
- [x] Inicialización del entorno de desarrollo.
- [x] Corrección de layout en inputs de KG y Repeticiones (evitando solapamiento).
- [x] Configuración de despliegue automático a GitHub Pages mediante Actions.
- [x] Soporte para rutas en producción (cambiado a `base: '/Aerogym/'`).

# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **AI Coach**: Fixed response truncation by increasing `maxOutputTokens` from 500 to 1024.
- **AI Coach**: Resolved persona issues by correctly integrating `systemInstruction` with user profile and session data.
- **Safety Settings**: Configured `BLOCK_NONE` thresholds for fitness categories to prevent accidental AI blocks on exercise advice.
- **TypeScript**: Fixed missing `vite/client` types in `tsconfig.json` and corrected `HarmCategory` enums in `CoachView.tsx`.
- **Dependencies**: Re-installed missing `vite-plugin-pwa` to enable successful local server startup.

### Added
- **Generador de Rutinas IA**: Nueva funcionalidad que crea rutinas personalizadas basadas en el perfil del usuario (objetivo, nivel) y ejercicios disponibles.
- **Sabiduría de Aero**: Sistema de asesoramiento estoico en estadísticas y nutrición.
- **Sugerencias de Carga IA**: Recomendaciones de peso discretas en tiempo real durante el entrenamiento.
- **Alertas de Récord (PR)**: Notificaciones sonoras especiales al batir récords estimados.
- **Infraestructura de Testing**: Configuración de Vitest y tests unitarios para la lógica del motor de cálculos.
- **Servicio IA Centralizado**: Implementación de `aiService.ts` para gestionar llamadas a Gemini de forma reutilizable.
- **Environment**: Created `.env.local` template for `VITE_GEMINI_API_KEY`.
- **Infrastructure**: Configured development server to run on port 3001 to avoid conflicts with other local projects.

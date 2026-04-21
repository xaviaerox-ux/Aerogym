# 🩺 Integración de Salud y Readiness Score (AeroGym)

Este documento detalla el sistema de importación de datos de salud y el motor de recomendación de entrenamiento basado en fatiga y recuperación.

## 🚀 Guía para el Usuario (Lo que tú tienes que hacer)

Para alimentar a Aero con tus datos de salud sin coste y con total privacidad, sigue estos pasos:

### 1. Exportar datos desde Xiaomi (Zepp Life)
1. Abre la app **Zepp Life** (antigua Mi Fit) en tu móvil.
2. Ve a **Perfil** -> **Ajustes** -> **Acerca de** -> **Ejercicio de derechos del usuario** -> **Exportar datos**.
3. Selecciona los datos (Sueño y Actividad) y el rango de fechas.
4. Recibirás un enlace por email para descargar un archivo `.zip`.

### 2. Importar en AeroGym
1. En el Dashboard de AeroGym, verás una nueva sección llamada **"Estado de Recuperación"**.
2. Haz clic en **"Importar datos de Zepp"**.
3. Selecciona el archivo `.zip` que descargaste.
4. Aero procesará los archivos `SLEEP_XXX.json` y `ACTIVITY_XXX.csv` automáticamente.

---

## 🧠 El Motor de Readiness (Arquitectura Técnica)

Aero utiliza un algoritmo de 3 pilares para calcular tu **Readiness Score (0-100)**:

### 1. Puntuación de Sueño (40%)
Analiza:
- **Duración**: Objetivo de 7.5 horas.
- **Eficiencia**: Tiempo real dormido vs. tiempo en cama.
- **Calidad**: Ratio de sueño Profundo + REM sobre el total.

### 2. Puntuación de Actividad (30%)
Analiza la fatiga del día anterior:
- Utiliza los pasos como proxy de carga sistémica.
- **Óptimo**: ~8,000 pasos.
- **Penalización**: < 2,000 (sedentarismo) o > 15,000 (sobrecarga).

### 3. Tendencia de Recuperación (30%)
- Compara los últimos 3 días contra la media de los últimos 7 días.
- Detecta si estás acumulando "deuda de sueño" o si te estás recuperando de una semana intensa.

---

## 🎢 Niveles de Recomendación Antigravity

Basándose en el score, Aero ajusta tu entrenamiento:

- **0-30 (Rojo)**: **Recuperación Total**. Evitar inversiones. Riesgo de mareos o pérdida de agarre.
- **31-50 (Naranja)**: **Suave**. Enfoque en movilidad y estiramientos bajos.
- **51-70 (Verde)**: **Moderado**. Sesión técnica estándar.
- **71-100 (Azul/Púrpura)**: **Óptimo / Día de PR**. Momento ideal para intentar nuevas figuras o máximos.

---

## 🛠️ Tecnologías Utilizadas
- **JSZip**: Para procesar el archivo exportado directamente en tu navegador (sin subirlo a ningún servidor).
- **LocalStorage**: Los datos se guardan solo en tu dispositivo.
- **ReadinessEngine**: Lógica pura de TypeScript para el cálculo de scores.

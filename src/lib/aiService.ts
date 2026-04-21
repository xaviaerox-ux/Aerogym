import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { AppState, Routine, UserProfile, Exercise } from '../types';
import { BASE_EXERCISES } from '../constants/exercises';

const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const generateRoutineWithAI = async (profile: UserProfile): Promise<Routine> => {
  if (!genAI) throw new Error("API Key no configurada");

  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  const exercisesContext = BASE_EXERCISES.map(e => `- ID: ${e.id}, Nombre: ${e.name}, Tipo: ${e.type}, Músculo: ${e.muscleGroup}`).join('\n');

  const prompt = `
    Eres un experto en entrenamiento de fuerza y director técnico de AeroGym. 
    Tu tarea es diseñar UNA rutina de entrenamiento óptima para este perfil de usuario:
    
    PERFIL DE USUARIO:
    - Nombre: ${profile.name}
    - Nivel: ${profile.level}
    - Objetivo: ${profile.goal}
    - Frecuencia Semanal: ${profile.weeklyFrequency} días
    
    REGLAS DE ORO:
    1. Solo puedes usar ejercicios de esta lista exacta (usa el ID exacto):
    ${exercisesContext}
    
    2. Responde EXCLUSIVAMENTE con un objeto JSON válido que siga esta estructura:
    {
      "name": "Nombre creativo de la rutina",
      "description": "Breve explicación de por qué es buena para el usuario",
      "exercises": [
        { "exerciseId": "ID_DEL_EJERCICIO", "defaultSets": número, "defaultReps": "rango (ej: 8-12)", "defaultWeight": número_opcional }
      ]
    }

    3. No incluyas texto antes o después del JSON. 
    4. Selecciona de 5 a 7 ejercicios que tengan sentido para su nivel y objetivo.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Limpiar posibles bloques de código markdown
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    const generated = JSON.parse(jsonStr);
    return {
      id: Math.random().toString(36).substring(2, 11),
      ...generated
    };
  } catch (err) {
    console.error("Error al parsear la rutina generada por IA:", text);
    throw new Error("La IA no devolvió un formato válido. Inténtalo de nuevo.");
  }
};

export const analyzeProgressionWithAI = async (sessions: any[], profile: UserProfile): Promise<string> => {
  if (!genAI) throw new Error("API Key no configurada");

  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest" 
  });

  // Resumir sesiones para no saturar el prompt
  const sessionsSummary = sessions.slice(0, 5).map(s => ({
    date: s.date,
    volume: s.totalVolume,
    exercises: s.exercises.map((e: any) => ({
      id: e.exerciseId,
      bestWeight: Math.max(...e.sets.map((set: any) => set.weight))
    }))
  }));

  const prompt = `
    Eres Aero, el coach estoico de AeroGym. 
    Tu misión es analizar el progreso de ${profile.name} y dar un consejo corto, motivador y basado en la filosofía estoica.
    
    HISTORIAL RECIENTE:
    ${JSON.stringify(sessionsSummary)}

    CONTEXTO:
    - Nivel: ${profile.level}
    - Objetivo: ${profile.goal}

    INSTRUCCIONES:
    1. Mantente fiel a la filosofía estoica (Séneca, Marco Aurelio, Epicteto).
    2. Sé breve (máximo 3 frases).
    3. Si el volumen sube, felicita con sobriedad.
    4. Si hay estancamiento, motiva a la disciplina y a controlar lo que está en su mano (esfuerzo, no resultado).
    5. No uses formatos markdown exagerados.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (err) {
    console.error("Error en análisis de progresión:", err);
    return "La disciplina es el puente entre las metas y los logros. Sigue adelante.";
  }
};

export const getNutritionalAdviceWithAI = async (profile: UserProfile, macros: any): Promise<string> => {
  if (!genAI) throw new Error("API Key no configurada");

  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest" 
  });

  const prompt = `
    Eres Aero, el coach estoico y experto en nutrición de AeroGym. 
    Tu misión es dar un consejo nutricional breve y motivador para ${profile.name}.
    
    DATOS NUTRICIONALES:
    - Calorías Objetivo: ${macros.targetCalories} kcal
    - Proteínas: ${macros.macros.protein}g
    - Grasas: ${macros.macros.fat}g
    - Carbohidratos: ${macros.macros.carbs}g
    - Objetivo: ${profile.goal}

    INSTRUCCIONES:
    1. Mantente fiel a la filosofía estoica. Habla sobre la nutrición como combustible para la virtud y el templo del cuerpo.
    2. Sé extremadamente breve (máximo 2-3 frases).
    3. Sugiere un tipo de alimento o hábito que ayude a cumplir esas macros hoy.
    4. No uses listas ni markdown complejo.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (err) {
    console.error("Error en asesoramiento nutricional:", err);
    return "Come para vivir, no vivas para comer. La moderación es la clave de la virtud.";
  }
};

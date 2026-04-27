import { DailyHealthMetric, WorkoutRecommendation, HealthSleepEntry } from '../../types/health';

const STOIC_PHRASES = {
  rest: "\"A veces, incluso el vivir es un acto de coraje.\" — Séneca. Hoy tu coraje es el descanso.",
  light: "\"La salud es lo que hace que sientas que el ahora es el mejor momento del año.\" — Franklin P. Adams. Mantén el movimiento, pero con suavidad.",
  moderate: "\"La constancia es el fundamento de todas las virtudes.\" — Séneca. Un día sólido para avanzar con paso firme.",
  full: "\"No busques que las cosas sucedan como deseas, sino desea que las cosas sucedan como suceden.\" — Epicteto. Aprovecha este flujo de energía.",
  peak: "\"Confía en tus fuerzas: el que duda, ya ha perdido.\" — Séneca. Tienes el control total, conquista el cielo."
};

export class ReadinessEngine {
  calculateScore(metrics: DailyHealthMetric[]): WorkoutRecommendation {
    if (metrics.length === 0) return this.getNoDataRecommendation();

    const today = metrics[metrics.length - 1];
    const history = metrics.slice(-7);

    const sleepScore = this.calculateSleepScore(today.sleep);
    const activityScore = this.calculateActivityScore(history);
    const trendScore = this.calculateTrendScore(history);

    const total = Math.round(sleepScore + activityScore + trendScore);
    return this.getRecommendation(total);
  }

  private calculateSleepScore(sleep?: HealthSleepEntry): number {
    if (!sleep || sleep.totalSleepMin === 0) return 15; // Score base neutral

    const durationHrs = sleep.totalSleepMin / 60;
    const targetHrs = 7.5;
    
    // Duración (0-15 pts)
    const durationPts = Math.min(15, (durationHrs / targetHrs) * 15);
    
    // Calidad (Deep + REM) (0-15 pts)
    const qualityRatio = (sleep.deepSleepMin + sleep.remSleepMin) / sleep.totalSleepMin;
    const qualityPts = Math.min(15, (qualityRatio / 0.4) * 15); // 40% de calidad es óptimo

    // Eficiencia (vs despierto) (0-10 pts)
    const totalBedTime = sleep.totalSleepMin + sleep.awakeSleepMin;
    const efficiency = totalBedTime > 0 ? sleep.totalSleepMin / totalBedTime : 0;
    const efficiencyPts = Math.min(10, (efficiency / 0.9) * 10);

    return durationPts + qualityPts + efficiencyPts;
  }

  private calculateActivityScore(history: DailyHealthMetric[]): number {
    if (history.length < 2) return 15;
    const yesterday = history[history.length - 2];
    const steps = yesterday.steps || 0;

    // 8000 pasos es el equilibrio. Más allá de 15k penaliza.
    if (steps < 8000) return 30 - (steps / 8000 * 5); // Poca carga = mucha energía
    if (steps > 15000) return Math.max(0, 20 - ((steps - 15000) / 5000 * 20)); // Fatiga
    return 25;
  }

  private calculateTrendScore(history: DailyHealthMetric[]): number {
    if (history.length < 4) return 15;
    const recent = history.slice(-3);
    const avgSleepRecent = recent.reduce((acc, m) => acc + (m.sleep?.totalSleepMin || 0), 0) / 3;
    const avgSleepHistory = history.reduce((acc, m) => acc + (m.sleep?.totalSleepMin || 0), 0) / history.length;

    // Si duermes más que tu media reciente, score positivo
    return Math.min(30, (avgSleepRecent / (avgSleepHistory || 1)) * 15);
  }

  private getRecommendation(score: number): WorkoutRecommendation {
    if (score < 35) return {
      score, level: 'rest', label: '🔴 Recuperación Estratégica', color: 'text-red-500',
      description: 'Tu cuerpo está reclamando descanso. La fatiga acumulada es alta. En antigravity, esto aumenta el riesgo de caídas o tirones.',
      exercises: ['Estiramientos de descarga (suelo)', 'Respiración diafragmática', 'Movilidad articular pasiva'],
      avoid: ['Inversiones (especialmente libres)', 'Drop sets de fuerza', 'Nuevas acrobacias'],
      aeroMessage: STOIC_PHRASES.rest
    };

    if (score < 55) return {
      score, level: 'light', label: '🟡 Sesión de Conservación', color: 'text-yellow-400',
      description: 'Energía moderada-baja. Mantén el hábito pero reduce la intensidad. Enfócate en la fluidez más que en el esfuerzo explosivo.',
      exercises: ['Flow terapéutico', 'Flexibilidad asistida con hamaca', 'Posturas de equilibrio bajo'],
      avoid: ['Power moves', 'Entrenamiento de alta intensidad'],
      aeroMessage: STOIC_PHRASES.light
    };

    if (score < 75) return {
      score, level: 'moderate', label: '🟢 Sesión Equilibrada', color: 'text-brand-green',
      description: 'Estás en un buen punto. Tu recuperación ha sido efectiva. Puedes realizar tu entrenamiento planeado con confianza.',
      exercises: ['Inversiones controladas', 'Ejercicios de fuerza (series estándar)', 'Enlace de figuras conocidas'],
      avoid: ['Llegar al fallo muscular absoluto'],
      aeroMessage: STOIC_PHRASES.moderate
    };

    if (score < 90) return {
      score, level: 'full', label: '🔵 Estado de Poder', color: 'text-brand-blue',
      description: 'Óptima condición física y mental. Un día excelente para desafiar tus límites y trabajar en esa figura que se te resiste.',
      exercises: ['Progresiones para figuras avanzadas', 'Entrenamiento de fuerza máxima', 'Inversiones dinámicas'],
      avoid: [],
      aeroMessage: STOIC_PHRASES.full
    };

    return {
      score, level: 'peak', label: '🟣 Nivel Élite', color: 'text-purple-400',
      description: 'Has alcanzado el estado de "supercompensación". Tu recuperación es total. Hoy es el día para buscar nuevas marcas personales.',
      exercises: ['Habilidades de alto impacto', 'Sesión intensiva de nuevos trucos', 'Máxima expresión creativa'],
      avoid: [],
      aeroMessage: STOIC_PHRASES.peak
    };
  }

  private getNoDataRecommendation(): WorkoutRecommendation {
    return {
      score: 50, level: 'moderate', label: 'Modo Estándar', color: 'text-slate-400',
      description: 'No tengo datos de salud recientes para calcular tu fatiga. Entrena según tus sensaciones actuales.',
      exercises: ['Tu rutina habitual'],
      avoid: [],
      aeroMessage: '"El ignorante afirma, el sabio duda y reflexiona." — Aristóteles.'
    };
  }
}

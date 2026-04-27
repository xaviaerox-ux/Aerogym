import { DailyHealthMetric } from '../../types/health';
import { HealthImporter } from './types';

/**
 * Clase base que centraliza utilidades comunes de parsing.
 * Aplicamos el principio DRY para que los importadores específicos
 * solo se preocupen de su lógica de negocio.
 */
export abstract class BaseHealthImporter implements HealthImporter {
  abstract getName(): string;
  abstract canHandle(filename: string, firstLine: string): boolean;
  abstract parse(content: string, filename?: string): Promise<DailyHealthMetric[]>;

  /**
   * Parser de CSV robusto con soporte para comillas anidadas y escapes.
   */
  protected smartSplit(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; 
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}

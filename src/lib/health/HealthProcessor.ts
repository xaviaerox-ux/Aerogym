import JSZip from 'jszip';
import { DailyHealthMetric } from '../../types/health';
import { HealthImporter, mergeHealthMetrics } from './types';

/**
 * Orquestador principal de importación.
 * Desacoplado de las implementaciones específicas de cada marca.
 */
export class HealthProcessor {
  constructor(private importers: HealthImporter[]) {}

  /**
   * Punto de entrada principal para cualquier tipo de archivo de salud.
   */
  async processFile(file: File): Promise<DailyHealthMetric[]> {
    if (file.name.endsWith('.zip')) {
      return this.processZip(file);
    }
    return this.processSingleFile(file);
  }

  private async processZip(file: File): Promise<DailyHealthMetric[]> {
    const zip = await JSZip.loadAsync(file);
    let allMetrics: DailyHealthMetric[] = [];

    for (const [path, zipFile] of Object.entries(zip.files)) {
      if (zipFile.dir) continue;
      
      // Solo leemos el contenido si algún importador puede manejarlo
      // Para optimizar, podríamos leer solo el principio, pero JSZip
      // requiere el async('text') para acceder a los datos.
      const content = await zipFile.async('text');
      const metrics = await this.parseContent(path, content);
      
      if (metrics.length > 0) {
        allMetrics = mergeHealthMetrics(allMetrics, metrics);
      }
    }
    return allMetrics;
  }

  private async processSingleFile(file: File): Promise<DailyHealthMetric[]> {
    const content = await file.text();
    return this.parseContent(file.name, content);
  }

  private async parseContent(path: string, content: string): Promise<DailyHealthMetric[]> {
    const firstLine = content.split('\n')[0] || '';
    const importer = this.importers.find(i => i.canHandle(path, firstLine));
    
    if (importer) {
      return await importer.parse(content, path);
    }
    return [];
  }
}

import { ZeppImporter } from './importers/ZeppImporter';
import { GoogleTakeoutImporter } from './importers/GoogleTakeoutImporter';
import { MiFitnessImporter } from './importers/MiFitnessImporter';
import { DailyHealthMetric } from '../../types/health';
import { HealthProcessor } from './HealthProcessor';

export class HealthImporterFactory {
  private static readonly processor = new HealthProcessor([
    new GoogleTakeoutImporter(),
    new ZeppImporter(),
    new MiFitnessImporter()
  ]);

  static async import(file: File): Promise<DailyHealthMetric[]> {
    const metrics = await this.processor.processFile(file);
    if (metrics.length === 0) {
      throw new Error('No se detectaron datos de salud compatibles.');
    }
    return metrics.sort((a, b) => a.date.localeCompare(b.date));
  }

  static async importSingleFile(file: File): Promise<DailyHealthMetric[]> {
    return this.import(file); // El procesador ya maneja ambos casos internamente
  }
}

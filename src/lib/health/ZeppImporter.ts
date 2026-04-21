import JSZip from 'jszip';
import { ZeppSleepEntry, ZeppActivityEntry } from '../../types/health';

export class ZeppImporter {
  async importFromZip(file: File): Promise<{
    sleep: ZeppSleepEntry[];
    activity: ZeppActivityEntry[];
  }> {
    const zip = await JSZip.loadAsync(file);
    const sleep: ZeppSleepEntry[] = [];
    const activity: ZeppActivityEntry[] = [];

    for (const [filename, zipFile] of Object.entries(zip.files)) {
      // Ignorar archivos que no sean CSV o JSON
      if (!filename.endsWith('.csv') && !filename.endsWith('.json')) continue;

      const raw = await zipFile.async('text');
      
      // Intentar identificar el contenido por sus columnas
      if (filename.endsWith('.json')) {
        const parsedSleep = this.parseSleepJSON(raw);
        if (parsedSleep.length > 0) sleep.push(...parsedSleep);
      } else {
        // Es un CSV
        const lines = raw.trim().split('\n');
        if (lines.length < 2) continue;
        
        const header = lines[0].toLowerCase();
        
        // ¿Es un archivo de actividad/pasos?
        if (header.includes('steps') || header.includes('distance')) {
          const parsedActivity = this.parseGenericActivityCSV(raw);
          activity.push(...parsedActivity);
        }
        
        // ¿Es un archivo de sueño?
        if (header.includes('sleep') || header.includes('deep') || header.includes('shallow')) {
          const parsedSleep = this.parseGenericSleepCSV(raw);
          if (parsedSleep.length > 0) sleep.push(...parsedSleep);
        }
      }
    }

    return {
      sleep: this.uniqueByDate(sleep),
      activity: this.uniqueByDate(activity)
    };
  }

  private parseGenericActivityCSV(raw: string): ZeppActivityEntry[] {
    const lines = raw.trim().split('\n');
    const header = lines[0].toLowerCase().split(',');
    
    const dateIdx = header.findIndex(h => h.includes('date') || h.includes('time'));
    const stepsIdx = header.findIndex(h => h.includes('steps'));
    const distIdx = header.findIndex(h => h.includes('dist'));
    const calIdx = header.findIndex(h => h.includes('cal'));

    if (dateIdx === -1 || stepsIdx === -1) return [];

    return lines.slice(1).map(line => {
      const cols = line.split(',');
      return {
        date: this.normalizeDate(cols[dateIdx]),
        steps: parseInt(cols[stepsIdx]) || 0,
        distance: parseFloat(cols[distIdx]) || 0,
        calories: parseInt(cols[calIdx]) || 0
      };
    }).filter(e => e.date);
  }

  private parseGenericSleepCSV(raw: string): ZeppSleepEntry[] {
    const lines = raw.trim().split('\n');
    const header = lines[0].toLowerCase().split(',');
    
    const dateIdx = header.findIndex(h => h.includes('date'));
    const deepIdx = header.findIndex(h => h.includes('deep'));
    const lightIdx = header.findIndex(h => h.includes('shallow') || h.includes('light'));
    const remIdx = header.findIndex(h => h.includes('rem'));
    const awakeIdx = header.findIndex(h => h.includes('awake') || h.includes('wake'));

    if (dateIdx === -1) return [];

    return lines.slice(1).map(line => {
      const cols = line.split(',');
      const d = parseInt(cols[deepIdx]) || 0;
      const l = parseInt(cols[lightIdx]) || 0;
      const r = parseInt(cols[remIdx]) || 0;
      const a = parseInt(cols[awakeIdx]) || 0;
      
      return {
        date: this.normalizeDate(cols[dateIdx]),
        bedtime: '', // No siempre disponible en CSV agregado
        wakeup: '',
        deepSleepMin: d,
        lightSleepMin: l,
        remSleepMin: r,
        awakeSleepMin: a,
        totalSleepMin: d + l + r
      };
    }).filter(e => e.date && e.totalSleepMin > 0);
  }

  private normalizeDate(rawDate: string): string {
    if (!rawDate) return '';
    const clean = rawDate.trim().replace(/"/g, '');
    // Soporta YYYY-MM-DD o YYYY/MM/DD o Timestamps
    if (clean.includes('-')) return clean.split(' ')[0];
    if (clean.includes('/')) return clean.replace(/\//g, '-').split(' ')[0];
    if (clean.length > 10 && !isNaN(Number(clean))) {
       return new Date(Number(clean) * 1000).toISOString().split('T')[0];
    }
    return clean;
  }

  private parseSleepJSON(raw: string): ZeppSleepEntry[] {
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];

      return data.map((entry: any) => ({
        date: entry.date,
        bedtime: new Date(entry.start * 1000).toISOString(),
        wakeup: new Date(entry.stop * 1000).toISOString(),
        deepSleepMin: entry.deepSleepTime ?? 0,
        lightSleepMin: entry.shallowSleepTime ?? 0,
        remSleepMin: entry.remTime ?? 0,
        awakeSleepMin: entry.wakeTime ?? 0,
        totalSleepMin: (entry.deepSleepTime ?? 0) + (entry.shallowSleepTime ?? 0) + (entry.remTime ?? 0)
      }));
    } catch (e) {
      console.error('Error parsing Zepp Sleep JSON', e);
      return [];
    }
  }

  private uniqueByDate<T extends { date: string }>(items: T[]): T[] {
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.date)) return false;
      seen.add(item.date);
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }
}

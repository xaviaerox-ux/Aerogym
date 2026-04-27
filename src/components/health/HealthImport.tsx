import React from 'react';
import { X, Upload, Info, FileArchive, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HealthImporterFactory } from '../../lib/health/HealthImporterFactory';
import { DailyHealthMetric } from '../../types/health';

interface HealthImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (metrics: DailyHealthMetric[]) => void;
}

export function HealthImport({ isOpen, onClose, onImport }: HealthImportProps) {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus('idle');
    setErrorMsg(null);

    try {
      let metrics: DailyHealthMetric[] = [];
      
      if (file.name.endsWith('.zip')) {
        metrics = await HealthImporterFactory.import(file);
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        // Procesar archivo individual
        metrics = await HealthImporterFactory.importSingleFile(file);
      } else {
        throw new Error('Formato no soportado. Usa .zip, .csv o .json');
      }
      
      if (metrics.length === 0) {
        throw new Error('No se encontraron datos compatibles en el archivo');
      }

      onImport(metrics);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass w-full max-w-md p-8 rounded-3xl relative border border-white/10"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-brand-blue/20 rounded-2xl flex items-center justify-center text-brand-blue mx-auto">
                <FileArchive size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-50 tracking-tight">Sincronizar Salud</h2>
              <p className="text-sm text-slate-400">
                Sube el archivo <code className="text-brand-blue">.zip</code>, <code className="text-brand-blue">.csv</code> o <code className="text-brand-blue">.json</code>.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-brand-blue shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400 leading-relaxed">
                    <p className="font-bold text-slate-300 mb-1">Fuentes compatibles:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><span className="text-brand-blue">ZIP</span>: Google Takeout / Zepp</li>
                      <li><span className="text-brand-blue">Archivos sueltos</span>: .csv / .json</li>
                    </ul>
                  </div>
                </div>
              </div>

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2 text-brand-green">
                  <CheckCircle2 size={48} />
                  <p className="font-bold">¡Datos sincronizados!</p>
                </div>
              ) : (
                <label className="relative group block cursor-pointer">
                  <input 
                    type="file" 
                    accept=".zip,.csv,.json" 
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <div className={`
                    w-full py-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all
                    ${loading ? 'border-brand-blue/20 bg-brand-blue/5' : 'border-white/10 hover:border-brand-blue/50 hover:bg-white/5'}
                    ${status === 'error' ? 'border-red-500/50 bg-red-500/5' : ''}
                  `}>
                    {loading ? (
                      <Loader2 size={32} className="text-brand-blue animate-spin" />
                    ) : (
                      <Upload size={32} className="text-slate-500 group-hover:text-brand-blue transition-colors" />
                    )}
                    <span className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                      {loading ? 'Procesando el ZIP...' : 'Seleccionar archivo .zip'}
                    </span>
                  </div>
                  {status === 'error' && (
                    <p className="text-center text-xs text-red-400 mt-2 font-bold animate-pulse px-4">
                      {errorMsg || 'Error al procesar. Verifica el archivo.'}
                    </p>
                  )}
                </label>
              )}

              <button 
                onClick={onClose}
                className="w-full py-4 text-slate-500 text-sm font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

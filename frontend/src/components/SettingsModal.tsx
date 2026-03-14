import { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Save, Info, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [ollamaIp, setOllamaIp] = useState('127.0.0.1:11434');
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/settings').then(res => {
      if (res.data) { setOllamaIp(res.data.ollama_ip || '127.0.0.1:11434'); setGeminiKey(res.data.gemini_api_key || ''); }
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('http://localhost:8000/settings', { ollama_ip: ollamaIp, gemini_api_key: geminiKey });
      setSaveSuccess(true); setTimeout(() => { setSaveSuccess(false); onClose(); }, 1500);
    } catch (error) { alert("Fehler beim Speichern"); } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center rounded-t-lg shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-lg"><SettingsIcon size={20} className="text-slate-600" /><span>Globale Einstellungen</span></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8 flex-1">
          <section className="flex flex-col gap-3">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Lokale KI (Ollama)</h3>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-slate-600">Ollama IP-Adresse & Port</label><input type="text" value={ollamaIp} onChange={(e) => setOllamaIp(e.target.value)} className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </section>
          <section className="flex flex-col gap-3">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Cloud KI (Google Gemini)</h3>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-slate-600">Google Gemini API-Schlüssel</label><input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} className="w-full px-3 py-2 border rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-900 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-blue-800 mb-2"><Info size={16} />Wichtige Hinweise zur Gemini API</div>
              <ul className="list-disc pl-5 space-y-2">
                <li>Stellen Sie sicher, dass in der Cloud Console die <strong>Generative Language API</strong> aktiviert ist.</li>
                <li>Verwenden Sie <strong>keine IP-Beschränkungen</strong> für den Anfang.</li>
                <li>Das AG2 Backend regelt die Authentifizierung automatisch über die offiziellen SDKs.</li>
              </ul>
            </div>
          </section>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-lg shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded">Abbrechen</button>
          <button onClick={handleSave} disabled={isSaving || saveSuccess} className={`px-4 py-2 text-sm font-medium text-white rounded flex items-center gap-2 ${saveSuccess ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-900'}`}>{saveSuccess ? <><CheckCircle size={16} /> Gespeichert!</> : <><Save size={16} /> Einstellungen speichern</>}</button>
        </div>
      </div>
    </div>
  );
}
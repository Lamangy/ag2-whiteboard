import { useState } from 'react';
import type { Node } from '@xyflow/react';
import { X, Code, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface CodeGenModalProps { node: Node; onClose: () => void; }

export default function CodeGenModal({ node, onClose }: CodeGenModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverType, setServerType] = useState('outlook');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post('http://localhost:8000/generate-code', { nodeType: node.type, nodeId: node.id, config: { serverType, endpoints: ["get_emails", "send_reply"] }});
      if (response.status === 200) { setSuccess(true); setTimeout(() => onClose(), 2000); }
    } catch (error: any) {
      alert("Fehler bei der Code-Generierung: " + (error.response?.data?.detail || error.message));
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white border border-slate-300 rounded-lg shadow-xl w-[450px] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-slate-700"><Code size={18} className="text-indigo-600" /><span>Code generieren für {node.data.label as string}</span></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-green-600 gap-3"><CheckCircle size={48} /><p className="font-semibold text-center">Code erfolgreich generiert!</p></div>
          ) : (
            <>
              <p className="text-sm text-slate-600">Python-Code für diesen Server erstellen lassen?</p>
              <select value={serverType} onChange={(e) => setServerType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="outlook">Outlook (Microsoft Graph)</option><option value="blender">Blender 3D-API</option><option value="custom">Benutzerdefiniert</option>
              </select>
              <div className="flex gap-3 mt-2 justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Abbrechen</button>
                <button onClick={handleGenerate} disabled={isGenerating} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">{isGenerating ? "Generiere..." : "Code generieren"}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
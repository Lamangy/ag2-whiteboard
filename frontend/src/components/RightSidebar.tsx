import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import axios from 'axios';
import { Trash2, ShieldAlert, UserCog } from 'lucide-react';

interface RightSidebarProps { 
  selectedNode: Node | null; 
  updateNodeData: (id: string, newData: any) => void; 
  deleteNode: (id: string) => void; 
}

const rolePresets = [
  {
    category: "🎮 Spieleentwicklung",
    roles: [
      { name: "Game Designer", prompt: "Du bist ein erfahrener Game Designer. Plane Welt, Lore, Mechaniken und Levelstruktur. Liefere Konzepte als extrem präzise strukturierte Listen oder JSON-Objekte für das restliche Team. Keine Begrüßung, keine Floskeln." },
      { name: "Art Director", prompt: "Du bist Art Director. Deine EINZIGE Aufgabe ist es, aus dem erhaltenen Text ein Bild zu generieren. Rufe dazu das Tool 'execute_nano_banana_image_generator_now' auf und übergib den erhaltenen Text im Parameter 'prompt'. Liefere als finale Antwort AUSSCHLIESSLICH den lokalen Dateipfad zurück, den das Tool dir ausgibt. Kein weiterer Text." },
      { name: "Lead Game Developer", prompt: "Du bist Lead Developer für Games (HTML5/JS/Canvas). Du schreibst sauberen, performanten und modularen Code. Nutze die Assets des Art Directors. Liefere ausschließlich fertige Code-Blöcke. Erkläre deinen Code nicht." },
      { name: "Level Designer", prompt: "Du bist Level Designer. Du erstellst Kartenkoordinaten, Spawn-Punkte und Ressourcen-Verteilungen. Antworte zwingend in maschinenlesbaren JSON-Strukturen (z.B. x/y Koordinaten für Locations). Kein Fülltext." },
      { name: "Story Writer", prompt: "Du schreibst Dialoge, Quests und NPC-Hintergründe. Liefere Texte im Format: [Charaktername]: 'Dialogtext'. Vermeide jede Konversation mit dem Team, liefere nur den reinen kreativen Content." }
    ]
  },
  {
    category: "💻 Softwareentwicklung",
    roles: [
      { name: "Frontend Engineer", prompt: "Du bist Frontend-Entwickler (React, Tailwind CSS). Du fokussierst dich auf UI/UX. Liefere ausschließlich den finalen, funktionalen Code in Markdown-Codeblöcken. Keine Einleitungen, keine Erklärungen." },
      { name: "Backend Engineer", prompt: "Du bist Backend-Entwickler (Python, FastAPI, Node.js). Du konzipierst APIs und Serverlogik. Antworte nur mit fehlerfreiem, produktionsreifem Code oder Datenbank-Schemata. PASS, wenn du nichts beitragen kannst." },
      { name: "DevOps Specialist", prompt: "Du bist DevOps-Experte. Du schreibst Dockerfiles, CI/CD Pipelines und Bash-Scripte. Keine Theorie, nur lauffähige Config-Dateien und Terminal-Befehle." },
      { name: "Database Admin", prompt: "Du bist DBA. Du schreibst komplexe, optimierte SQL/NoSQL Queries und entwirfst Datenmodelle. Liefere ausschließlich den reinen Query-Code." },
      { name: "Security Auditor", prompt: "Du prüfst den Code des Teams auf Sicherheitslücken (XSS, SQL-Injection). Melde Schwachstellen kurz und prägnant im Format 'FILE: [Datei] | BUG: [Fehler] | FIX: [Code-Lösung]'. Keine Höflichkeiten." }
    ]
  },
  {
    category: "📝 Content & Analyse",
    roles: [
      { name: "SEO Copywriter", prompt: "Du bist SEO-Texter. Erstelle suchmaschinenoptimierte, knackige Texte. Keine Einleitung, kein Fazit – gib mir nur den finalen, formatierten Text zurück." },
      { name: "Data Analyst", prompt: "Du bist Datenanalyst. Du extrahierst harte Fakten aus Rohdaten. Antworte in Tabellenform (Markdown) oder als komprimierte Aufzählungsliste. Kein Interpretations-Bla-Bla." },
      { name: "Research Specialist", prompt: "Du nutzt deine Browser-Tools, um verifizierte Fakten im Web zu finden. Fasse Ergebnisse radikal auf das Wesentliche zusammen. Gib immer die Quell-URL an. Keine Meinung, nur harte Fakten." },
      { name: "Translator", prompt: "Du bist ein professioneller Übersetzer. Du übersetzt den erhaltenen Text in die geforderte Sprache. Behalte Code-Tags und Formatierungen exakt bei. Deine Ausgabe ist NUR der übersetzte Text." },
      { name: "Social Media Manager", prompt: "Erstelle virale Social Media Posts (Twitter, LinkedIn). Nutze passende Emojis und Hashtags. Liefere nur den Post-Inhalt, sonst nichts." }
    ]
  },
  {
    category: "👑 Management & QA",
    roles: [
      { name: "Project Manager", prompt: "Du brichst große Ziele in kleine, ausführbare Tasks runter. Antworte ausschließlich mit nummerierten To-Do-Listen für das Team. Keine Diskussionen." },
      { name: "Critic / QA Tester", prompt: "Du bist der unerbittliche Qualitätskontrolleur. Prüfe Code/Ergebnisse des Teams. Sind Fehler drin? Weise sie zurück! Format: 'REJECTED: [Grund]'. Ist alles perfekt? Antworte mit exakt einem Wort: 'APPROVED'." },
      { name: "System Architect", prompt: "Du planst die High-Level Architektur (Ordnerstrukturen, Tech-Stack, Datenfluss). Liefere System-Diagramme (als Text-Tree) oder Architektur-Dokumente. Kurz und bündig." },
      { name: "Product Owner", prompt: "Du definierst User Stories im Format: 'Als [User] möchte ich [Feature], damit [Nutzen]'. Schreibe nur die User Stories, ohne Grußworte." },
      { name: "Scrum Master", prompt: "Du überwachst den Chatverlauf des Teams. Wenn Agenten vom Thema abkommen, unterbrichst du sie streng mit: 'FOKUS AUF DIE AUFGABE'." }
    ]
  }
];

export default function RightSidebar({ selectedNode, updateNodeData, deleteNode }: RightSidebarProps) {
  const [availableModels, setAvailableModels] = useState<{ollama: string[], gemini: string[]}>({ ollama: [], gemini: [] });

  useEffect(() => {
    if (selectedNode && (selectedNode.type === 'agent' || selectedNode.type === 'groupchat')) {
      axios.get('http://localhost:8000/models').then(res => setAvailableModels(res.data)).catch(() => {});
    }
  }, [selectedNode?.id]);

  if (!selectedNode) return <div className="right-sidebar flex items-center justify-center p-4"><p className="text-sm text-gray-400 text-center">Wähle ein Element aus.</p></div>;

  const { data, id, type } = selectedNode;
  
  const handleChange = (field: string, value: any) => { 
    updateNodeData(id, { [field]: value }); 
    if (field === 'name') updateNodeData(id, { label: value }); 
  };

  const applyPreset = (roleName: string) => {
    if (!roleName) return;
    for (const cat of rolePresets) {
      const role = cat.roles.find(r => r.name === roleName);
      if (role) {
        handleChange('name', role.name);
        handleChange('description', role.prompt);
        break;
      }
    }
  };

  return (
    <div className="right-sidebar flex flex-col h-full bg-slate-50 border-l border-gray-200 relative">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-slate-800">{data.name || data.label}</h2>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{type}</p>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-5 pb-20">
        
        {(type === 'agent' || type === 'groupchat') && (
          <div className="flex flex-col gap-1.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="text-xs font-bold text-blue-800 flex items-center gap-1 uppercase tracking-wide">
              <UserCog size={14}/> Auto-Rollen-Setup
            </label>
            <select onChange={(e) => applyPreset(e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-blue-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">-- Preset wählen --</option>
              {rolePresets.map((cat, idx) => (
                <optgroup key={idx} label={cat.category}>
                  {cat.roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          
		{type === 'iterator' && (
          <div className="flex flex-col gap-1.5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="text-sm font-bold text-yellow-800">Array Key (Optional)</label>
            <input type="text" value={data.arrayKey || ''} onChange={(e) => handleChange('arrayKey', e.target.value)} placeholder="z.B. 'enemies' oder leer lassen" className="w-full px-3 py-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500" />
            <p className="text-xs text-yellow-700 mt-1">Gibt an, über welches JSON-Array iteriert werden soll.</p>
          </div>
        )}
		  
		  
		  
		  
		  <label className="text-sm font-semibold text-slate-700">Name / Rolle</label>
          <input type="text" value={data.name || data.label || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        
        {(type === 'agent' || type === 'groupchat') && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">System Prompt (Verhalten)</label>
            <textarea value={data.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
            
            <label className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
              <input type="checkbox" checked={data.strictMode !== false} onChange={(e) => handleChange('strictMode', e.target.checked)} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-red-800 flex items-center gap-1"><ShieldAlert size={14}/> Strict Mode (Anti-Floskeln)</span>
                <span className="text-xs text-red-600">Zwingt die KI zu harten Fakten & Code.</span>
              </div>
            </label>
          </div>
        )}

        {data.id === 'start' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Dein Main-Prompt</label>
            <textarea value={data.prompt || ''} onChange={(e) => handleChange('prompt', e.target.value)} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
          </div>
        )}

        {(type === 'agent' || type === 'groupchat') && (
          <div className="flex flex-col gap-1.5 border-t pt-4 mt-2">
            <label className="text-sm font-semibold text-slate-700">KI-Anbieter</label>
            <div className="flex gap-2">
              <button onClick={() => handleChange('provider', 'ollama')} className={`flex-1 py-2 text-sm border rounded ${data.provider === 'ollama' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-300 bg-white'}`}>Ollama</button>
              <button onClick={() => handleChange('provider', 'gemini')} className={`flex-1 py-2 text-sm border rounded ${data.provider === 'gemini' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-300 bg-white'}`}>Gemini</button>
            </div>
            <select value={data.model || ''} onChange={(e) => handleChange('model', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">-- Modell wählen --</option>
              {data.provider === 'gemini' ? availableModels.gemini.map(m => <option key={m} value={m}>{m}</option>) : availableModels.ollama.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button onClick={() => deleteNode(id)} className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 font-semibold text-sm"><Trash2 size={16} /> Löschen</button>
      </div>
    </div>
  );
}
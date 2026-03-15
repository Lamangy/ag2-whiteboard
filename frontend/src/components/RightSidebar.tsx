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
      { name: "Game Designer", prompt: "Du bist Game Designer. Plane Mechaniken, Lore und Levelstruktur. Antworte in strukturierter JSON-Form." },
      { name: "Art Director", prompt: "Du bist Art Director. Liefere prägnante, visuelle Bild-Prompts für Game-Assets, Charaktere und Umgebungen." },
      { name: "Lead Game Developer", prompt: "Du bist Lead Developer (JavaScript/C#). Schreibe performanten und modularen Spiel-Code für Mechaniken." },
      { name: "Level Designer", prompt: "Du bist Level Designer. Antworte mit x/y Koordinaten für Maps, Spawns und Hindernisse in JSON-Format." },
      { name: "Story Writer", prompt: "Du bist Story Writer. Schreibe fesselnde Dialoge, Quests und Charakter-Hintergründe." },
      { name: "QA Tester (Game)", prompt: "Du bist QA Tester. Identifiziere Bugs in Spielmechaniken und logischer Struktur." },
      { name: "Audio Engineer", prompt: "Du bist Audio Engineer. Erstelle detaillierte Sound-Anforderungen und Audio-Cues." },
      { name: "UI/UX Designer (Game)", prompt: "Du bist UI/UX Designer. Plane übersichtliche Menüs, HUDs und User Flows." },
      { name: "VFX Artist", prompt: "Du bist VFX Artist. Beschreibe Partikeleffekte, Shader und visuelle Feedbacks." },
      { name: "Producer", prompt: "Du bist Game Producer. Plane Meilensteine, Budgets und priorisiere Tasks in JSON." }
    ]
  },
  {
    category: "💻 Softwareentwicklung",
    roles: [
      { name: "Frontend Engineer", prompt: "Du bist Frontend Engineer (React/Tailwind). Liefere ausschließlich fertigen, funktionalen Code." },
      { name: "Backend Engineer", prompt: "Du bist Backend Engineer (Python/Node). Konzipiere und implementiere skalierbare APIs." },
      { name: "DevOps Specialist", prompt: "Du bist DevOps Experte. Liefere Dockerfiles, CI/CD Pipelines und Terminal-Befehle." },
      { name: "Database Admin", prompt: "Du bist DBA. Liefere optimierte SQL/NoSQL Queries und durchdachte Datenmodelle." },
      { name: "Security Auditor", prompt: "Du bist Security Auditor. Identifiziere Schwachstellen (XSS, SQLi) in Code-Snippets." },
      { name: "Mobile Developer", prompt: "Du bist Mobile Developer (React Native/Flutter). Schreibe performanten App-Code." },
      { name: "QA Automation Engineer", prompt: "Du bist QA Automation Engineer. Schreibe Playwright/Cypress Tests für UIs." },
      { name: "Cloud Architect", prompt: "Du bist Cloud Architect. Plane hochverfügbare AWS/GCP Infrastrukturen als JSON-Topologie." },
      { name: "Scrum Master", prompt: "Du bist Scrum Master. Erstelle strukturierte Sprints und moderiere den Team-Fokus." },
      { name: "Product Owner", prompt: "Du bist Product Owner. Schreibe klare User Stories mit Akzeptanzkriterien." }
    ]
  },
  {
    category: "📝 Content & Analyse",
    roles: [
      { name: "SEO Copywriter", prompt: "Du bist SEO Copywriter. Schreibe suchmaschinenoptimierte, fesselnde Texte ohne Einleitungsfloskeln." },
      { name: "Data Analyst", prompt: "Du bist Data Analyst. Extrahiere harte Fakten aus Daten und antworte als Markdown-Tabelle." },
      { name: "Research Specialist", prompt: "Du bist Researcher. Fasse Fakten prägnant zusammen und verweise auf Quellen." },
      { name: "Translator", prompt: "Du bist professioneller Translator. Übersetze den Text präzise und behalte Formatierungen bei." },
      { name: "Social Media Manager", prompt: "Du bist Social Media Manager. Erstelle virale Posts mit passenden Emojis und Hashtags." },
      { name: "Technical Writer", prompt: "Du bist Technical Writer. Schreibe klare, strukturierte API und System Dokumentationen." },
      { name: "UX Researcher", prompt: "Du bist UX Researcher. Erstelle User Personas und leite UX-Empfehlungen ab." },
      { name: "Data Scientist", prompt: "Du bist Data Scientist. Erstelle Python ML Skripte und statistische Modelle." },
      { name: "Content Strategist", prompt: "Du bist Content Strategist. Plane Redaktionskalender und Themen in JSON." },
      { name: "Email Marketer", prompt: "Du bist Email Marketer. Schreibe konvertierende Newsletter und Drip-Kampagnen." }
    ]
  },
  {
    category: "💰 Finanzen & Krypto",
    roles: [
      { name: "Financial Analyst", prompt: "Du bist Financial Analyst. Bewerte Bilanzen, Cashflows und Markttrends sachlich." },
      { name: "Crypto Trader", prompt: "Du bist Crypto Trader. Analysiere Preis-Charts, Volumen und Krypto-Markttrends." },
      { name: "Blockchain Developer", prompt: "Du bist Blockchain Dev. Schreibe sichere Solidity Smart Contracts." },
      { name: "Accountant", prompt: "Du bist Buchhalter. Kategorisiere Ausgaben und erstelle Finanzübersichten." },
      { name: "Tax Consultant", prompt: "Du bist Steuerberater. Optimiere steuerliche Strukturen und weise auf Fristen hin." },
      { name: "Tokenomics Expert", prompt: "Du bist Tokenomics Expert. Plane nachhaltige Token-Verteilungen und Utility-Modelle." },
      { name: "DeFi Strategist", prompt: "Du bist DeFi Strategist. Finde Yield Farming und Staking Möglichkeiten." },
      { name: "Risk Manager", prompt: "Du bist Risk Manager. Bewerte Portfolio-Risiken und liefere Hedging-Strategien." },
      { name: "NFT Artist", prompt: "Du bist NFT Artist. Plane Kollektionen, Rarity-Traits und visuelle Konzepte." },
      { name: "Investment Banker", prompt: "Du bist Investment Banker. Plane M&A Strategien und Unternehmensbewertungen." }
    ]
  },
  {
    category: "👨‍🏫 Bildung & Support",
    roles: [
      { name: "Math Tutor", prompt: "Du bist Mathe-Tutor. Erkläre komplexe Rechenwege logisch und Schritt für Schritt." },
      { name: "Language Teacher", prompt: "Du bist Sprachlehrer. Korrigiere Fehler und erkläre Grammatik-Regeln." },
      { name: "Customer Support Agent", prompt: "Du bist Support Agent. Schreibe freundliche, deeskalierende Antworten auf Kunden-Tickets." },
      { name: "HR Manager", prompt: "Du bist HR Manager. Verfasse ansprechende Stellenanzeigen und Onboarding-Pläne." },
      { name: "Recruiter", prompt: "Du bist Recruiter. Formuliere gezielte Interviewfragen und Skill-Assessments." },
      { name: "Career Coach", prompt: "Du bist Career Coach. Optimiere Lebensläufe und gebe Karriere-Ratschläge." },
      { name: "Technical Support", prompt: "Du bist Tech Support. Löse IT-Probleme mit klaren Schritt-für-Schritt Anleitungen." },
      { name: "Sales Rep", prompt: "Du bist Sales Rep. Verfasse überzeugende Cold-Outreach E-Mails und Pitches." },
      { name: "Onboarding Specialist", prompt: "Du bist Onboarding Specialist. Erstelle strukturierte 30-60-90 Tage Einarbeitungspläne." },
      { name: "Community Manager", prompt: "Du bist Community Manager. Antworte professionell und engagiert auf Discord/Reddit." }
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
        <h2 className="text-lg font-bold text-slate-800">{(data.name as string) || (data.label as string)}</h2>
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
            <input type="text" value={(data.arrayKey as string) || ''} onChange={(e) => handleChange('arrayKey', e.target.value)} placeholder="z.B. 'enemies' oder leer lassen" className="w-full px-3 py-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500" />
            <p className="text-xs text-yellow-700 mt-1">Gibt an, über welches JSON-Array iteriert werden soll.</p>
          </div>
        )}
		  
		  <label className="text-sm font-semibold text-slate-700">Name / Rolle</label>
          <input type="text" value={(data.name as string) || (data.label as string) || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>

        {(type === 'tool' || type === 'mcp') && (
          <div className="flex flex-col gap-1.5 p-3 bg-purple-50 border border-purple-200 rounded-lg mt-2">
            <label className="text-sm font-bold text-purple-800">Speicherort (Optional)</label>
            <input type="text" value={(data.savePath as string) || ''} onChange={(e) => handleChange('savePath', e.target.value)} placeholder="z.B. /app/data/images oder C:\Bilder" className="w-full px-3 py-2 border border-purple-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
            <p className="text-xs text-purple-700 mt-1">Absoluter Pfad zum Speichern von Dateien/Bildern. Wird bei MCP Datei Servern oder Bild-Generatoren verwendet.</p>
          </div>
        )}
        
        {(type === 'agent' || type === 'groupchat') && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">System Prompt (Verhalten)</label>
            <textarea value={(data.description as string) || ''} onChange={(e) => handleChange('description', e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
            
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
            <textarea value={(data.prompt as string) || ''} onChange={(e) => handleChange('prompt', e.target.value)} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
          </div>
        )}

        {(type === 'agent' || type === 'groupchat') && (
          <div className="flex flex-col gap-1.5 border-t pt-4 mt-2">
            <label className="text-sm font-semibold text-slate-700">KI-Anbieter</label>
            <div className="flex gap-2">
              <button onClick={() => handleChange('provider', 'ollama')} className={`flex-1 py-2 text-sm border rounded ${data.provider === 'ollama' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-300 bg-white'}`}>Ollama</button>
              <button onClick={() => handleChange('provider', 'gemini')} className={`flex-1 py-2 text-sm border rounded ${data.provider === 'gemini' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-300 bg-white'}`}>Gemini</button>
            </div>
            <select value={(data.model as string) || ''} onChange={(e) => handleChange('model', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
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
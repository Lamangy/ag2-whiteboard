import { useState } from 'react';
import { Bot, Network, Server, FileText, Globe, Image as ImageIcon, Edit3, Layers, Users, Repeat } from 'lucide-react';

const categories = [
  {
    id: 'agents',
    name: 'Agenten',
    items: [
      { id: 'agent-conversable', type: 'agent', name: 'ConversableAgent', description: 'Basis-Agent – kann chatten, Tools nutzen', icon: Bot },
      { id: 'agent-assistant', type: 'agent', name: 'AssistantAgent', description: 'Standard-LLM-Agent (plant, antwortet, nutzt Tools)', icon: Bot },
      { id: 'agent-userproxy', type: 'agent', name: 'UserProxyAgent', description: 'Simuliert User (Code ausführen, bestätigen)', icon: Bot },
      { id: 'agent-websurfer', type: 'agent', name: 'WebSurferAgent', description: 'Surft real im Browser (klickt, liest)', icon: Bot },
      { id: 'agent-groupchat', type: 'groupchat', name: 'GroupChat (Team-Hub)', description: 'Konferenzraum für Multi-Agenten-Teams', icon: Users },
    ]
  },
  {
    id: 'tools',
    name: 'Tools',
    items: [
      { id: 'browser-tool', type: 'tool', name: 'Browser-Automatisierung', description: 'Surft im Web (Playwright)', icon: Globe },
      { id: 'pdf-tool', type: 'tool', name: 'PDF-Analyse', description: 'Liest und extrahiert Text aus lokalen PDFs', icon: FileText },
      { id: 'image-generation', type: 'tool', name: 'Bild-Generierung', description: 'Text-to-Image via Nano Banana 2', icon: ImageIcon },
      { id: 'image-edit', type: 'tool', name: 'Bild-Editor', description: 'Image+Text-to-Image via Nano Banana 2', icon: Edit3 },
      { id: 'style-transfer', type: 'tool', name: 'Style-Transfer', description: 'Multi-Image-to-Image Composition', icon: Layers },
    ]
  },
  {
    id: 'mcp',
    name: 'MCP',
    items: [
      { id: 'mcp-math', type: 'mcp', name: 'Mathe Server', description: 'MCP: Berechnet komplexe mathematische Formeln', icon: Server },
      { id: 'mcp-time', type: 'mcp', name: 'Zeit Server', description: 'MCP: Liefert aktuelle Systemzeit und Datum', icon: Server },
      { id: 'mcp-system', type: 'mcp', name: 'System Server', description: 'MCP: Liefert OS und Python Versionsdaten', icon: Server },
      { id: 'mcp-weather', type: 'mcp', name: 'Wetter Server', description: 'MCP: Liefert aktuelle Wetterdaten', icon: Server },
      { id: 'mcp-file', type: 'mcp', name: 'Datei Server', description: 'MCP: Listet Dateien im Workspace-Verzeichnis auf', icon: Server },
    ]
  },
  {
    id: 'flow',
    name: 'Flow',
    items: [
      { id: 'start', type: 'node', name: 'Starttrigger', description: 'Startpunkt der Pipeline', icon: Network },
	  { id: 'iterator', type: 'iterator', name: 'Iterator (Loop)', description: 'Verarbeitet Listen Element für Element', icon: Repeat },
      { id: 'end', type: 'node', name: 'Endnode', description: 'Beendet den Prozess', icon: Network },
    ]
  }
];

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState('agents');

  const onDragStart = (event: React.DragEvent, type: string, item: any) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.setData('application/elementData', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <div className="left-sidebar w-80 bg-slate-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex flex-col gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Bausteine</h2>
          <p className="text-xs text-slate-500">Drag & Drop aufs Whiteboard</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${ activeTab === cat.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50' }`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 overflow-y-auto h-full">
        {activeCategory?.items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} draggable onDragStart={(e) => onDragStart(e, item.type, item)} className="flex items-start gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl cursor-grab hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shadow-sm">
              <div className={`mt-0.5 ${item.type === 'agent' ? 'text-green-600' : item.type === 'groupchat' ? 'text-purple-600' : item.type === 'tool' ? 'text-orange-500' : 'text-slate-600'}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">{item.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
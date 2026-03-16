import { X, Bot, Network, Wrench, Server, FileText, Image as ImageIcon, Users, Repeat, Table, Mail, Box } from 'lucide-react';

export default function DocsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-center p-6 sm:p-12 overflow-hidden">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm"><FileText size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Umfassende Anleitung: AG2 Pipeline Builder</h2>
              <p className="text-sm text-slate-500">Alles über Agenten, Module, Tools und MCP-Server</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar scroll-smooth bg-slate-50/50">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Section 1: Grundkonzept */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Network className="text-blue-500"/> Das Grundkonzept (Flow)</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Der AG2 Pipeline Builder verbindet <strong>Start-Trigger</strong>, <strong>Agenten (KI)</strong> und <strong>Tools (Werkzeuge)</strong> zu automatisierten Workflows. Die KI-Agenten analysieren die Eingaben und entscheiden selbstständig, welche der verbundenen Tools sie verwenden müssen, um die Aufgabe zu erfüllen.
              </p>

              <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 mb-6">
                <h4 className="font-bold text-slate-700 mb-3">Wie baue ich einen Workflow?</h4>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">Starttrigger</span>
                  <span>➔</span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg border border-green-200">Agent (KI)</span>
                  <span>➔</span>
                  <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-200">Tool / MCP</span>
                  <span>➔</span>
                  <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg border border-red-200">Endnode</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
                  <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2"><Network size={18}/> Starttrigger</h4>
                  <p className="text-sm text-slate-600 mb-3">Definiert die erste Anweisung oder die Quelldaten (JSON).</p>
                  <div className="bg-slate-800 p-3 rounded-lg text-green-400 text-xs font-mono">
                    "Erstelle ein 3D-Modell eines roten Autos und sende mir eine E-Mail, wenn du fertig bist."
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-5 hover:border-yellow-400 transition-colors">
                  <h4 className="font-bold text-yellow-700 mb-2 flex items-center gap-2"><Repeat size={18}/> Iterator (Loop)</h4>
                  <p className="text-sm text-slate-600 mb-3">Nimmt ein JSON-Array und führt für jedes Element einen eigenen Prozess (Loop) aus. Am Ende geht es beim "Next"-Ausgang weiter.</p>
                  <div className="bg-slate-800 p-3 rounded-lg text-yellow-400 text-xs font-mono">
                    {'{ "dateien": ["daten1.csv", "daten2.csv"] }'}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Agenten */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Bot className="text-green-500"/> KI-Agenten & Teams</h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 p-3 bg-green-100 text-green-600 rounded-xl h-fit border border-green-200"><Bot size={24}/></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Single Agenten (z.B. AssistantAgent)</h4>
                    <p className="text-slate-600 text-sm mt-1 mb-2">Ein einzelner KI-Agent, der eine spezifische Rolle (System Prompt) einnimmt. Er kann Tools ausführen.</p>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm">
                      <strong className="text-slate-700">Prompt-Beispiel:</strong> <span className="text-slate-600 italic">"Du bist ein Python-Entwickler. Schreibe ein Skript zur Datenanalyse. Nutze keine Tools, antworte nur mit Code."</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 p-3 bg-purple-100 text-purple-600 rounded-xl h-fit border border-purple-200"><Users size={24}/></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">GroupChat (Team-Hub)</h4>
                    <p className="text-slate-600 text-sm mt-1 mb-2">Ein Konferenzraum für mehrere Agenten. Verbinden Sie mehrere Agenten mit diesem Hub. Der GroupChat-Manager wählt dynamisch aus, wer als nächstes sprechen soll, bis die Aufgabe gelöst ist. <strong>Wichtig:</strong> Kommunikation erfolgt intern strikt in JSON.</p>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm">
                      <strong className="text-slate-700">Workflow:</strong> <span className="text-slate-600">Start ➔ GroupChat ➔ (Agent 1, Agent 2, Agent 3) ➔ Endnode</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: MCP Server */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Server className="text-indigo-500"/> Die neuen MCP Server (Mächtige Tools)</h3>
              <p className="text-slate-600 mb-6">MCP (Model Context Protocol) Server sind tief ins System integrierte Werkzeuge, die der KI weitreichende Handlungsfreiheit auf Ihrem PC geben. Verbinden Sie sie einfach mit einem Agenten.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* File Server */}
                <div className="border border-indigo-100 bg-indigo-50/30 p-5 rounded-xl">
                  <h4 className="font-bold text-indigo-800 flex items-center gap-2 mb-2"><FileText size={18}/> Datei Server</h4>
                  <p className="text-sm text-slate-700 mb-3">Erlaubt der KI, Dateien zu erstellen, Ordner zu analysieren, Dateien umzubenennen, Logs zu durchsuchen und Backups (ZIP) zu erstellen.</p>
                  <div className="bg-white border border-indigo-200 p-3 rounded-lg text-xs text-slate-600">
                    <strong>Prompt:</strong> "Agent, analysiere den Ordner C:\Projekte und erstelle ein ZIP-Backup aller Dateien darin."
                  </div>
                </div>

                {/* Data Server */}
                <div className="border border-emerald-100 bg-emerald-50/30 p-5 rounded-xl">
                  <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2"><Table size={18}/> Excel / CSV Analyzer</h4>
                  <p className="text-sm text-slate-700 mb-3">Liest Excel (.xlsx) oder .csv Dateien mittels Pandas ein. Die KI schreibt und führt im Hintergrund Python-Code aus, um Ihre Fragen zu den Daten zu beantworten.</p>
                  <div className="bg-white border border-emerald-200 p-3 rounded-lg text-xs text-slate-600">
                    <strong>Prompt:</strong> "Agent, lies 'kunden.xlsx'. Welcher Kunde hat den höchsten Umsatz gemacht?"
                  </div>
                </div>

                {/* Email Server */}
                <div className="border border-amber-100 bg-amber-50/30 p-5 rounded-xl">
                  <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2"><Mail size={18}/> Email Integration</h4>
                  <p className="text-sm text-slate-700 mb-3">Liest ungelesene Mails, erstellt Entwürfe oder versendet finalisierte E-Mails direkt (aktuell im Simulationsmodus für Sicherheit).</p>
                  <div className="bg-white border border-amber-200 p-3 rounded-lg text-xs text-slate-600">
                    <strong>Prompt:</strong> "Agent, lies die letzten 3 E-Mails, fasse sie zusammen und sende mir einen Bericht an chef@firma.de."
                  </div>
                </div>

                {/* Blender Server */}
                <div className="border border-rose-100 bg-rose-50/30 p-5 rounded-xl">
                  <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-2"><Box size={18}/> Blender 3D Automation</h4>
                  <p className="text-sm text-slate-700 mb-3">Der Agent schreibt ein <code>bpy</code> (Blender Python) Skript und führt Blender im Hintergrund (Headless) aus, um 3D-Modelle zu generieren oder zu rendern.</p>
                  <div className="bg-white border border-rose-200 p-3 rounded-lg text-xs text-slate-600">
                    <strong>Prompt:</strong> "Agent, schreibe ein Blender Skript, das einen leuchtenden, roten Würfel erstellt und ihn rendert."
                  </div>
                </div>

              </div>
            </section>

            {/* Section 4: Standard Tools */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Wrench className="text-orange-500"/> Standard-Tools & Bilder (Nano Banana)</h3>

              <div className="space-y-4 text-slate-600">
                <p>
                  Zusätzlich zu den MCP-Servern gibt es Tools für Web-Browsing (Playwright), PDF-Analyse und vor allem <strong>Bildgenerierung via Nano Banana 2 (Google Gemini)</strong>.
                </p>
                <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl">
                  <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><ImageIcon size={18}/> Speicherort definieren (WICHTIG!)</h4>
                  <p className="text-sm text-slate-700">
                    Wenn Sie ein Bild-Tool oder einen MCP-Dateiserver auf das Board ziehen, können Sie in der <strong>rechten Seitenleiste</strong> den exakten <strong>Speicherort (Absoluter Pfad)</strong> festlegen (z.B. <code>/app/data/images</code> oder <code>C:\Bilder</code>).
                    Das Tool wird diese Information priorisiert nutzen und dem Agenten nach der Ausführung den exakten Dateipfad des gespeicherten Bildes/Dokuments zurückmelden.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0 flex justify-center">
          <button onClick={onClose} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Verstanden, los geht's!
          </button>
        </div>
      </div>
    </div>
  );
}
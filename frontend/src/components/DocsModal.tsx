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

            {/* Section 2: Alle Nodes im Detail */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Network className="text-blue-500"/> Alle Nodes im Detail</h3>

              <div className="space-y-6">
                <div className="border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-blue-700 mb-2">Starttrigger</h4>
                  <p className="text-sm text-slate-600 mb-2">Definiert die erste Anweisung oder die Quelldaten (JSON) für den Workflow. Jeder Flow benötigt exakt einen Starttrigger.</p>
                  <p className="text-sm text-slate-500 italic">Beispiel: "Generiere ein Bild von einem Hund." oder "[\"Hund\", \"Katze\"]"</p>
                </div>
                <div className="border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-red-700 mb-2">Endnode</h4>
                  <p className="text-sm text-slate-600 mb-2">Markiert das finale Ende des Workflows. Hier wird das Ergebnis in der UI ausgegeben. Wenn der Flow das Endnode erreicht, stoppt die Pipeline.</p>
                </div>
                <div className="border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-yellow-700 mb-2">Iterator (Loop)</h4>
                  <p className="text-sm text-slate-600 mb-2">Nimmt ein JSON-Array als Eingabe und führt für jedes Element einen eigenen Loop aus. Verbinden Sie den "Loop"-Ausgang mit der Logik, die wiederholt werden soll. Am Ende geht es beim "Next"-Ausgang weiter.</p>
                  <p className="text-sm text-slate-500 italic">Beispiel-Eingabe: "[\"Thema 1\", \"Thema 2\"]"</p>
                </div>
                <div className="border border-slate-200 p-4 rounded-xl bg-green-50/50">
                  <h4 className="font-bold text-green-700 mb-2"><Bot size={16} className="inline"/> KI-Agent</h4>
                  <p className="text-sm text-slate-600 mb-2">Ein einzelner KI-Agent, der eine spezifische Rolle (System Prompt) einnimmt. Er kann Tools ausführen. Wenn ein Agent seine Aufgabe erledigt hat, muss er mit dem Wort <strong>TERMINATE</strong> beenden.</p>
                  <p className="text-sm text-slate-500 italic">Beispiel-Systemprompt: "Du bist ein Python-Entwickler. Schreibe Code. Nutze keine Tools, antworte nur mit Code. Beende mit TERMINATE."</p>
                </div>
                <div className="border border-slate-200 p-4 rounded-xl bg-purple-50/50">
                  <h4 className="font-bold text-purple-700 mb-2"><Users size={16} className="inline"/> GroupChat (Team-Hub)</h4>
                  <p className="text-sm text-slate-600 mb-2">Ein Hub für mehrere Agenten. Verbinden Sie mehrere Agent-Nodes mit diesem Hub. Der GroupChat-Manager wählt dynamisch aus, wer als nächstes sprechen soll, bis die Aufgabe gelöst ist. <strong>Wichtig:</strong> Die Agenten im Team kommunizieren strikt in JSON miteinander.</p>
                  <p className="text-sm text-slate-500 italic">Workflow: Start ➔ GroupChat ➔ (Agent 1, Agent 2, Agent 3) ➔ Endnode</p>
                </div>
              </div>
            </section>

            {/* Section 3: Standard Tools */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Wrench className="text-orange-500"/> Standard-Tools & Bilder (Nano Banana)</h3>

              <div className="space-y-6">
                <div className="border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-700 mb-2">Web Browser (tool_browser_search)</h4>
                  <p className="text-sm text-slate-600 mb-2">Liest URLs oder sucht im Web über DuckDuckGo Lite. Nutzt Headless Chromium.</p>
                  <p className="text-sm text-slate-500 italic">Prompt für Agenten: "Suche im Web nach 'Aktuelle KI News 2024'."</p>
                </div>
                <div className="border border-slate-200 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-700 mb-2">PDF Reader (tool_pdf_analysis)</h4>
                  <p className="text-sm text-slate-600 mb-2">Extrahiert Text aus PDF-Dateien (die ersten 5 Seiten).</p>
                  <p className="text-sm text-slate-500 italic">Prompt für Agenten: "Lies die Datei 'rechnung.pdf' und extrahiere den Gesamtbetrag."</p>
                </div>
                <div className="border border-slate-200 p-4 rounded-xl bg-orange-50/50">
                  <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2"><ImageIcon size={16}/> Nano Banana 2 (Bildgenerierung)</h4>
                  <p className="text-sm text-slate-600 mb-2">Nutzt Google Gemini, um Bilder zu generieren, zu bearbeiten oder Stile zu übertragen. <strong>WICHTIG:</strong> Sie können in der rechten Seitenleiste den Speicherpfad definieren.</p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 mb-2 space-y-1">
                    <li><strong>tool_image_generation:</strong> Erstellt ein neues Bild. <br/><span className="italic text-slate-500">Prompt: "Generiere ein Bild eines Cyberpunk-Autos."</span></li>
                    <li><strong>tool_image_edit:</strong> Bearbeitet ein bestehendes Bild. <br/><span className="italic text-slate-500">Prompt: "Füge dem Bild 'auto.png' Schnee hinzu."</span></li>
                    <li><strong>tool_style_transfer:</strong> Überträgt den Stil eines Bildes auf ein anderes. <br/><span className="italic text-slate-500">Prompt: "Übertrage den Stil von 'monalisa.png' auf 'foto.png'."</span></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: MCP Server */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Server className="text-indigo-500"/> Die neuen MCP Server (Mächtige Tools)</h3>
              <p className="text-slate-600 mb-6">MCP Server bieten tief ins System integrierte Werkzeuge. Jeder Server stellt spezifische Funktionen bereit.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* File Server */}
                <div className="border border-indigo-200 bg-indigo-50/50 p-5 rounded-xl col-span-1 md:col-span-2">
                  <h4 className="font-bold text-indigo-800 flex items-center gap-2 mb-3"><FileText size={18}/> MCP File Server (Dateiverwaltung)</h4>
                  <p className="text-sm text-slate-700 mb-4">Ermöglicht der KI, das Dateisystem zu lesen und zu schreiben. Der Speicherpfad wird in der UI konfiguriert.</p>

                  <div className="space-y-3 bg-white p-4 rounded border border-indigo-100">
                    <div>
                      <strong className="text-sm text-indigo-700">1. tool_save_file(content, filename)</strong>
                      <p className="text-xs text-slate-600 mt-1">Speichert Text/Code in einer Datei. Der Agent MUSS dieses Tool rufen, um Code zu speichern!</p>
                      <p className="text-xs text-slate-500 italic">Agenten-Anweisung: "Wenn du den HTML-Code fertig hast, rufe das Tool 'tool_save_file' auf und übergib den HTML-String als 'content' und 'index.html' als 'filename'."</p>
                    </div>
                    <hr className="border-indigo-50"/>
                    <div>
                      <strong className="text-sm text-indigo-700">2. tool_list_files(path)</strong>
                      <p className="text-xs text-slate-600 mt-1">Listet Dateien in einem Verzeichnis auf.</p>
                      <p className="text-xs text-slate-500 italic">Agenten-Anweisung: "Liste alle Dateien im Ordner C:/Projekte auf."</p>
                    </div>
                    <hr className="border-indigo-50"/>
                    <div>
                      <strong className="text-sm text-indigo-700">3. tool_analyze_folder(path)</strong>
                      <p className="text-xs text-slate-600 mt-1">Analysiert Struktur und Größen eines Ordners.</p>
                    </div>
                    <hr className="border-indigo-50"/>
                    <div>
                      <strong className="text-sm text-indigo-700">4. tool_rename_file(old_path, new_path)</strong>
                      <p className="text-xs text-slate-600 mt-1">Benennt Dateien um oder verschiebt sie.</p>
                    </div>
                    <hr className="border-indigo-50"/>
                    <div>
                      <strong className="text-sm text-indigo-700">5. tool_search_logs(keyword, file_path)</strong>
                      <p className="text-xs text-slate-600 mt-1">Sucht nach Text in einer großen Datei.</p>
                    </div>
                    <hr className="border-indigo-50"/>
                    <div>
                      <strong className="text-sm text-indigo-700">6. tool_create_backup(folder_path, backup_name)</strong>
                      <p className="text-xs text-slate-600 mt-1">Erstellt ein ZIP-Archiv des Ordners.</p>
                    </div>
                  </div>
                </div>

                {/* Math & Time & System & Weather */}
                <div className="border border-slate-200 p-5 rounded-xl">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-2">Math / Time / System / Weather</h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                    <li><strong>tool_math_calculate(expression):</strong> Berechnet sichere Mathe-Ausdrücke (z.B. "2 + 2 * 4").</li>
                    <li><strong>tool_get_time():</strong> Gibt Datum und Uhrzeit zurück.</li>
                    <li><strong>tool_get_system_info():</strong> Zeigt OS und Python-Version.</li>
                    <li><strong>tool_get_weather(city):</strong> Holt Wetterdaten für eine Stadt.</li>
                  </ul>
                </div>

                {/* Data Server */}
                <div className="border border-emerald-200 bg-emerald-50/50 p-5 rounded-xl">
                  <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2"><Table size={18}/> MCP Data Server (Pandas)</h4>
                  <p className="text-sm text-slate-700 mb-2"><strong>tool_excel_csv_analyzer(file_path, query):</strong><br/>Liest Excel (.xlsx) oder .csv Dateien mittels Pandas ein. Die KI generiert und führt im Hintergrund Python-Code aus, um die Daten zu analysieren.</p>
                  <p className="text-xs text-slate-500 italic">Agenten-Anweisung: "Nutze den Data Server für 'kunden.xlsx' mit der Query: 'Welcher Kunde hat den höchsten Umsatz gemacht?'"</p>
                </div>

                {/* Email Server */}
                <div className="border border-amber-200 bg-amber-50/50 p-5 rounded-xl">
                  <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2"><Mail size={18}/> MCP Email Server</h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                    <li><strong>tool_read_emails(limit):</strong> Liest ungelesene Mails (Simuliert).</li>
                    <li><strong>tool_draft_email(to, subject, body):</strong> Erstellt einen Mail-Entwurf.</li>
                    <li><strong>tool_send_email(to, subject, body):</strong> Versendet eine E-Mail (Simuliert).</li>
                  </ul>
                  <p className="text-xs text-slate-500 italic mt-2">Agenten-Anweisung: "Lies die letzten 3 E-Mails und sende eine Zusammenfassung an chef@firma.de."</p>
                </div>

                {/* Blender Server */}
                <div className="border border-rose-200 bg-rose-50/50 p-5 rounded-xl">
                  <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-2"><Box size={18}/> MCP Blender Server</h4>
                  <p className="text-sm text-slate-700 mb-2"><strong>tool_run_blender_script(script_content):</strong><br/>Der Agent schreibt ein <code>bpy</code> (Blender Python) Skript und führt Blender im Hintergrund (Headless) aus, um 3D-Modelle zu generieren.</p>
                  <p className="text-xs text-slate-500 italic">Agenten-Anweisung: "Schreibe ein Blender Skript, das einen leuchtenden, roten Würfel erstellt und ihn rendert. Führe das Skript über das Tool aus."</p>
                </div>

                {/* WhatsApp Server */}
                <div className="border border-green-200 bg-green-50/50 p-5 rounded-xl">
                  <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2">MCP WhatsApp Server (FastAgency)</h4>
                  <p className="text-sm text-slate-700 mb-2"><strong>tool_send_whatsapp_message(phone_number, message):</strong><br/>Nutzt die FastAgency Laufzeitumgebung, um Agenten um Kommunikationsfähigkeiten zu erweitern und WhatsApp Nachrichten zu senden.</p>
                  <p className="text-xs text-slate-500 italic">Agenten-Anweisung: "Sende eine WhatsApp Nachricht mit dem Text 'Hallo Welt' an die Nummer '+4912345678'."</p>
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
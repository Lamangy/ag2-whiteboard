# 💎 AG2 Whiteboard Pipeline Builder (KI-Entwicklerstudio)

Ein visuelles, Node-basiertes Entwicklerstudio zum Erstellen von autonomen KI-Agenten-Pipelines. Das System unterstützt sowohl lineare Single-Agent-Workflows als auch komplexe Multi-Agenten-Teams (GroupChats) auf Basis des AG2 (AutoGen) Frameworks.

## 🌟 Kernfunktionen

* **Visueller Node-Editor:** Drag & Drop Interface basierend auf ReactFlow.
* **Hybrid-Architektur (Smart Router):**
  * *Single-Agent-Modus:* Direkte 1-zu-1 Ausführung von Aufgaben.
  * *Multi-Agent-Modus (GroupChat):* Sternförmige Topologie, bei der ein `GroupChatManager` ein Team von spezialisierten Agenten orchestriert.
* **Auto-Rollen-Setup:** 20 vorgefertigte Rollen-Presets (z.B. Game Designer, Art Director, Lead Developer) zur sofortigen Spezialisierung von Agenten.
* **Strict Mode (Anti-Floskel-Direktive):** Zwingt Agenten dazu, auf Höflichkeitsfloskeln zu verzichten und ausschließlich harten Code, JSON oder Dateipfade zu liefern.
* **Integrierte Tools:**
  * 🌐 **Browser-Automatisierung:** Web-Suche und Scraping via Playwright & DuckDuckGo.
  * 📄 **PDF-Analyse:** Lokales Einlesen und Extrahieren von PDF-Texten.
  * 🎨 **Bild-Generierung (Nano Banana 2):** Hochauflösende Text-to-Image Generierung direkt über das offizielle Google GenAI SDK (Gemini 3.1 Flash Image Preview).
* **Lokale & Cloud LLMs:** Unterstützung für Ollama (lokal) und Google Gemini (API).
* **Live-Preview:** Schönes, Markdown-gerendertes Ergebnis-Fenster direkt im Whiteboard.

---

## 📦 Abhängigkeiten (Dependencies)

Während der Entwicklung haben wir das Basis-Setup um mehrere spezifische Pakete erweitert. Hier ist die komplette Liste der benötigten Pakete.

### Backend (Python 3.10+)
Das Backend läuft über FastAPI und Uvicorn.

**Basis-Pakete:**
```bash
pip install fastapi uvicorn pydantic httpx jinja2 playwright
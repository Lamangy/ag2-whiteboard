import os
import json
import uuid
import re
import urllib.parse
from pathlib import Path
from typing import List, Dict, Any, Annotated

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import logging

from autogen import ConversableAgent, UserProxyAgent, GroupChat, GroupChatManager

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'mcp_servers'))
from math_server import tool_math_calculate
from time_server import tool_get_time
from system_server import tool_get_system_info
from weather_server import tool_get_weather
from file_server import tool_list_files

from playwright.sync_api import sync_playwright

# Filter out /pipeline/status polling logs
class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return "/pipeline/status" not in record.getMessage()

logging.getLogger("uvicorn.access").addFilter(EndpointFilter())

app = FastAPI(title="AG2 Whiteboard Pipeline Builder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "data"
BLUEPRINTS_DIR = os.path.join(DATA_DIR, "blueprints")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")
IMAGE_DIR = os.path.join(DATA_DIR, "images")

os.makedirs(BLUEPRINTS_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)

if not os.path.exists(SETTINGS_FILE):
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump({"ollama_ip": "127.0.0.1:11434", "gemini_api_key": ""}, f)

class Settings(BaseModel):
    ollama_ip: str
    gemini_api_key: str

class NodeElement(BaseModel):
    id: str
    type: str 
    position: Dict[str, float]
    data: Dict[str, Any]

class Blueprint(BaseModel):
    id: str
    name: str
    nodes: List[NodeElement]
    edges: List[Dict[str, Any]]

pipeline_tasks: Dict[str, Dict[str, Any]] = {}

def get_gemini_key():
    with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
        return json.load(f).get("gemini_api_key", "")

def get_llm_config(provider: str, model_name: str):
    with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
        settings = json.load(f)

    if provider == "ollama":
        ip = settings.get("ollama_ip", "127.0.0.1:11434")
        return {"config_list": [{"model": model_name if model_name else "llama3", "base_url": f"http://{ip}/v1", "api_key": "NULL"}]}
    elif provider == "gemini":
        api_key = settings.get("gemini_api_key", "")
        if not api_key: raise ValueError("Gemini API-Schlüssel fehlt!")
        return {"config_list": [{"model": model_name if model_name else "gemini-1.5-flash", "api_key": api_key, "api_type": "google"}]}
    raise ValueError(f"Unbekannter Provider: {provider}")


# ==========================================
# TOOL-DEFINITIONEN
# ==========================================

def tool_browser_search(query: Annotated[str, "Suchbegriff oder URL (www...)"]) -> str:
    print(f"\n[Tool] Browser: '{query}'\n")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(user_agent="Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36")
            if query.startswith("http") or "www." in query or ".de" in query or ".com" in query:
                url = query if query.startswith("http") else f"https://{query}"
                page.goto(url, timeout=15000)
                texts = page.locator("p, h1, h2, h3").all_inner_texts()
                clean_text = "\n".join([t.strip() for t in texts if len(t.strip()) > 20])
                browser.close()
                return f"Inhalt Webseite '{url}':\n{clean_text[:4000]}"
            else:
                encoded_query = urllib.parse.quote_plus(query)
                page.goto(f"https://lite.duckduckgo.com/lite/", timeout=15000)
                page.fill("input[name='q']", query)
                page.click("input[type='submit']")
                snippets = page.locator(".result-snippet").all_inner_texts()
                browser.close()
                return f"Suchergebnisse:\n" + "\n\n".join(snippets[:5]) if snippets else "Nichts gefunden."
    except Exception as e:
        return f"Fehler Browser: {str(e)}"

def tool_pdf_analysis(file_path: Annotated[str, "Der Dateiname oder Pfad der PDF (z.B. rechnung.pdf)"]) -> str:
    print(f"\n[Tool] Lese PDF: '{file_path}'\n")
    try:
        from pypdf import PdfReader
        if not os.path.exists(file_path):
            file_path = os.path.join(os.getcwd(), file_path)
            if not os.path.exists(file_path):
                return f"Fehler: Die Datei '{os.path.basename(file_path)}' wurde nicht gefunden."
        
        reader = PdfReader(file_path)
        text = "".join([page.extract_text() + "\n" for i, page in enumerate(reader.pages) if i < 5])
        if len(reader.pages) > 5: text += "\n[... weitere Seiten aus Token-Gründen abgeschnitten ...]"
        return f"Inhalt der PDF:\n{text[:5000]}"
    except Exception as e:
        return f"Fehler beim PDF-Lesen: {str(e)}"

# --- NANO BANANA 2 TOOLS (Google GenAI SDK) ---

def tool_image_generation(prompt: Annotated[str, "Englische Beschreibung für das Bild"], save_path: str = "") -> str:
    print(f"\n[Nano Banana 2] Generiere Bild: '{prompt}' (Ziel: '{save_path}')\n")
    api_key = get_gemini_key()
    if not api_key: return "Fehler: Gemini API-Key fehlt."
    
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        response = client.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=[prompt]
        )
        
        if save_path:
            if os.path.isdir(save_path) or save_path.endswith("/") or save_path.endswith("\\"):
                os.makedirs(save_path, exist_ok=True)
                filepath = os.path.join(save_path, f"gen_{uuid.uuid4().hex[:8]}.png")
            else:
                os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else ".", exist_ok=True)
                filepath = save_path
        else:
            filepath = os.path.join(IMAGE_DIR, f"gen_{uuid.uuid4().hex[:8]}.png")

        filepath = os.path.abspath(filepath)
        
        for part in response.parts:
            if getattr(part, 'inline_data', None) is not None:
                image = part.as_image()
                image.save(filepath)
                return f"Erfolg! Bild generiert und gespeichert unter: {filepath}"
                
        return "Fehler: Die API hat kein Bild in der Antwort zurückgegeben."
    except ImportError:
        return "Fehler: Bitte installiere 'google-genai' und 'pillow' via pip."
    except Exception as e:
        return f"Nano Banana 2 API Fehler: {str(e)}"

def tool_image_edit(prompt: Annotated[str, "Was soll am Bild geändert werden?"], image_filename: Annotated[str, "Dateiname des Quellbildes"], save_path: str = "") -> str:
    print(f"\n[Nano Banana 2] Editiere Bild '{image_filename}' mit: '{prompt}'\n")
    api_key = get_gemini_key()
    if not api_key: return "Fehler: Gemini API-Key fehlt."
    
    try:
        from google import genai
        from PIL import Image
        
        img_path = image_filename if os.path.exists(image_filename) else os.path.join(IMAGE_DIR, image_filename)
        if not os.path.exists(img_path): return f"Fehler: Bild '{image_filename}' nicht gefunden."
        
        client = genai.Client(api_key=api_key)
        source_image = Image.open(img_path)
        
        response = client.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=[source_image, prompt]
        )
        
        if save_path:
            if os.path.isdir(save_path) or save_path.endswith("/") or save_path.endswith("\\"):
                os.makedirs(save_path, exist_ok=True)
                filepath = os.path.join(save_path, f"edit_{uuid.uuid4().hex[:8]}.png")
            else:
                os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else ".", exist_ok=True)
                filepath = save_path
        else:
            filepath = os.path.join(IMAGE_DIR, f"edit_{uuid.uuid4().hex[:8]}.png")

        filepath = os.path.abspath(filepath)

        for part in response.parts:
            if getattr(part, 'inline_data', None) is not None:
                image = part.as_image()
                image.save(filepath)
                return f"Erfolg! Bearbeitetes Bild gespeichert unter: {filepath}"
                
        return "Fehler: Die API hat kein bearbeitetes Bild zurückgegeben."
    except Exception as e:
        return f"Nano Banana 2 Edit Fehler: {str(e)}"

def tool_style_transfer(prompt: Annotated[str, "Anweisung zur Kombination"], content_image: Annotated[str, "Hauptbild"], style_image: Annotated[str, "Stil-Vorlagen Bild"], save_path: str = "") -> str:
    print(f"\n[Nano Banana 2] Style Transfer... \n")
    api_key = get_gemini_key()
    if not api_key: return "Fehler: Gemini API-Key fehlt."
    
    try:
        from google import genai
        from PIL import Image
        
        c_path = content_image if os.path.exists(content_image) else os.path.join(IMAGE_DIR, content_image)
        s_path = style_image if os.path.exists(style_image) else os.path.join(IMAGE_DIR, style_image)
        
        client = genai.Client(api_key=api_key)
        img_content = Image.open(c_path)
        img_style = Image.open(s_path)
        
        response = client.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=[img_content, img_style, prompt]
        )
        
        if save_path:
            if os.path.isdir(save_path) or save_path.endswith("/") or save_path.endswith("\\"):
                os.makedirs(save_path, exist_ok=True)
                filepath = os.path.join(save_path, f"style_{uuid.uuid4().hex[:8]}.png")
            else:
                os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else ".", exist_ok=True)
                filepath = save_path
        else:
            filepath = os.path.join(IMAGE_DIR, f"style_{uuid.uuid4().hex[:8]}.png")

        filepath = os.path.abspath(filepath)

        for part in response.parts:
            if getattr(part, 'inline_data', None) is not None:
                image = part.as_image()
                image.save(filepath)
                return f"Erfolg! Style-Transfer Bild gespeichert unter: {filepath}"
                
        return "Fehler: Die API hat kein Style-Transfer Bild zurückgegeben."
    except Exception as e:
        return f"Nano Banana 2 Style-Transfer Fehler: {str(e)}"


# ==========================================
# PIPELINE LOGIK
# ==========================================

def run_ag2_pipeline_task(task_id: str, blueprint_data: dict):
    pipeline_tasks[task_id]["status"] = "running"
    pipeline_tasks[task_id]["logs"] = ["[System] Starte Pipeline..."]
    
    try:
        nodes = {n["id"]: n for n in blueprint_data.get("nodes", [])}
        edges = blueprint_data.get("edges", [])
        
        start_nodes = [n for n in nodes.values() if n["data"].get("id") == "start"]
        if not start_nodes: raise ValueError("Kein Starttrigger gefunden!")
            
        start_node = start_nodes[0]
        current_payload = start_node["data"].get("prompt", "")
        pipeline_tasks[task_id]["logs"].append(f"[Start] Anweisung: '{current_payload}'")
        
        current_node_id = start_node["id"]
        chat_result = None
        agent = None 
        
        def run_agent_node(next_node, current_payload, nodes, edges, task_id):
            node_name = next_node["data"].get("name", next_node["type"])
            provider = next_node["data"].get("provider", "ollama")
            model_name = next_node["data"].get("model", "")

            try:
                llm_config = get_llm_config(provider, model_name)
                system_msg = f"{next_node['data'].get('description', 'Assistant')}\n\nWICHTIG: Wenn du die gestellte Aufgabe vollständig erfüllt hast, beende deine finale Antwort ZWINGEND mit dem exakten Wort TERMINATE."

                agent = ConversableAgent(name=node_name.replace(" ", "_"), system_message=system_msg, llm_config=llm_config, human_input_mode="NEVER")
                user_proxy = UserProxyAgent(name="System_Proxy", human_input_mode="NEVER", max_consecutive_auto_reply=2, is_termination_msg=lambda x: x.get("content", "") and "TERMINATE" in x.get("content", ""), code_execution_config={"use_docker": False})

                for e in edges:
                    target_id = e["target"] if e["source"] == next_node["id"] else e["source"] if e["target"] == next_node["id"] else None
                    if target_id and nodes[target_id]["type"] == "tool":
                        tool_id = nodes[target_id]["data"].get("id")
                        if tool_id == "browser-tool":
                            agent.register_for_llm(name="tool_browser_search", description="Liest URLs oder sucht im Web")(tool_browser_search)
                            user_proxy.register_for_execution(name="tool_browser_search")(tool_browser_search)
                        elif tool_id == "pdf-tool":
                            agent.register_for_llm(name="tool_pdf_analysis", description="Liest Text aus PDF Dateien")(tool_pdf_analysis)
                            user_proxy.register_for_execution(name="tool_pdf_analysis")(tool_pdf_analysis)
                        elif tool_id == "image-generation":
                            agent.register_for_llm(name="tool_image_generation", description="Erstellt ein komplett neues Bild aus einem englischen Text-Prompt via Nano Banana 2")(tool_image_generation)
                            user_proxy.register_for_execution(name="tool_image_generation")(tool_image_generation)
                        elif tool_id == "image-edit":
                            agent.register_for_llm(name="tool_image_edit", description="Bearbeitet ein bestehendes Quellbild anhand einer Text-Anweisung via Nano Banana 2")(tool_image_edit)
                            user_proxy.register_for_execution(name="tool_image_edit")(tool_image_edit)
                        elif tool_id == "style-transfer":
                            agent.register_for_llm(name="tool_style_transfer", description="Überträgt den Stil eines Vorlagen-Bildes auf ein Hauptbild via Nano Banana 2")(tool_style_transfer)
                            user_proxy.register_for_execution(name="tool_style_transfer")(tool_style_transfer)
                    elif target_id and nodes[target_id]["type"] == "mcp":
                        # Register all MCP tools to the agent
                        agent.register_for_llm(name="tool_math_calculate", description="Calculates math expressions")(tool_math_calculate)
                        user_proxy.register_for_execution(name="tool_math_calculate")(tool_math_calculate)

                        agent.register_for_llm(name="tool_get_time", description="Returns current date and time")(tool_get_time)
                        user_proxy.register_for_execution(name="tool_get_time")(tool_get_time)

                        agent.register_for_llm(name="tool_get_system_info", description="Returns system OS and Python version")(tool_get_system_info)
                        user_proxy.register_for_execution(name="tool_get_system_info")(tool_get_system_info)

                        agent.register_for_llm(name="tool_get_weather", description="Returns the weather for a given city")(tool_get_weather)
                        user_proxy.register_for_execution(name="tool_get_weather")(tool_get_weather)

                        agent.register_for_llm(name="tool_list_files", description="Lists files in a given directory")(tool_list_files)
                        user_proxy.register_for_execution(name="tool_list_files")(tool_list_files)

                pipeline_tasks[task_id]["logs"].append(f"[{node_name}] Chat startet...")
                chat_result = user_proxy.initiate_chat(agent, message=current_payload, summary_method="last_msg")

                final_text = chat_result.summary if chat_result.summary else ""
                return final_text.replace("TERMINATE", "").strip(), chat_result
            except Exception as e:
                pipeline_tasks[task_id]["logs"].append(f"[{node_name}] ❌ Fehler: {str(e)}")
                raise e

        while current_node_id:
            outgoing_edges = [e for e in edges if e["source"] == current_node_id]
            if not outgoing_edges:
                pipeline_tasks[task_id]["logs"].append("[System] Ende des Ausführungspfads erreicht.")
                break
                
            next_edge = outgoing_edges[0]
            next_node_id = next_edge["target"]
            next_node = nodes[next_node_id]
            node_name = next_node["data"].get("name", next_node["type"])
            node_type = next_node["type"]
            
            if node_type == "node" and next_node["data"].get("id") == "end":
                pipeline_tasks[task_id]["logs"].append("[System] End node reached.")
                current_node_id = None
                break

            elif node_type == "agent":
                current_payload, chat_result = run_agent_node(next_node, current_payload, nodes, edges, task_id)
                pipeline_tasks[task_id]["logs"].append(f"[{node_name}] Antwort erhalten.")
                current_node_id = next_node_id

            elif node_type == "groupchat":
                provider = next_node["data"].get("provider", "ollama")
                model_name = next_node["data"].get("model", "")
                llm_config = get_llm_config(provider, model_name)

                gc_agents = []
                for e in edges:
                    if e["source"] == next_node_id:
                        connected_node = nodes[e["target"]]
                        if connected_node["type"] == "agent":
                            a_name = connected_node["data"].get("name", "Agent").replace(" ", "_")
                            a_sys = connected_node["data"].get("description", "Assistant")
                            a_sys += "\n\nWICHTIG: Du darfst AUSSCHLIESSLICH in validem JSON antworten. Bende deine Antwort mit TERMINATE."
                            gc_agents.append(ConversableAgent(name=a_name, system_message=a_sys, llm_config=llm_config, human_input_mode="NEVER"))

                if gc_agents:
                    try:
                        groupchat = GroupChat(agents=gc_agents, messages=[], max_round=10)
                        manager = GroupChatManager(groupchat=groupchat, llm_config=llm_config)
                        user_proxy = UserProxyAgent(name="System_Proxy", human_input_mode="NEVER", max_consecutive_auto_reply=2, is_termination_msg=lambda x: x.get("content", "") and "TERMINATE" in x.get("content", ""), code_execution_config={"use_docker": False})

                        pipeline_tasks[task_id]["logs"].append(f"[{node_name}] GroupChat startet mit {len(gc_agents)} Agenten...")
                        chat_result = user_proxy.initiate_chat(manager, message=current_payload, summary_method="last_msg")

                        final_text = chat_result.summary if chat_result.summary else ""
                        current_payload = final_text.replace("TERMINATE", "").strip()
                        pipeline_tasks[task_id]["logs"].append(f"[{node_name}] GroupChat Antwort erhalten.")
                    except Exception as e:
                        pipeline_tasks[task_id]["logs"].append(f"[{node_name}] ❌ Fehler: {str(e)}")
                        raise e
                else:
                    pipeline_tasks[task_id]["logs"].append(f"[{node_name}] Warnung: Keine Agenten mit GroupChat verbunden.")

                current_node_id = next_node_id

            elif node_type == "iterator":
                try:
                    import json
                    parsed_payload = json.loads(current_payload)
                    array_key = next_node["data"].get("arrayKey")
                    
                    if array_key and isinstance(parsed_payload, dict) and array_key in parsed_payload:
                        items_to_iterate = parsed_payload[array_key]
                    elif isinstance(parsed_payload, list):
                        items_to_iterate = parsed_payload
                    else:
                        items_to_iterate = [current_payload]

                    pipeline_tasks[task_id]["logs"].append(f"[{node_name}] Iteriere über {len(items_to_iterate)} Elemente...")

                    loop_edge = next((e for e in edges if e["source"] == next_node_id and e.get("sourceHandle") == "loop"), None)
                    next_edge_after_loop = next((e for e in edges if e["source"] == next_node_id and e.get("sourceHandle") == "next"), None)

                    if not loop_edge:
                        pipeline_tasks[task_id]["logs"].append(f"[{node_name}] Warnung: Kein Loop-Ausgang verbunden.")
                        current_node_id = next_node_id
                    else:
                        loop_target_node = nodes[loop_edge["target"]]
                        results = []
                        for i, item in enumerate(items_to_iterate):
                            item_str = json.dumps(item) if not isinstance(item, str) else item
                            pipeline_tasks[task_id]["logs"].append(f"[{node_name}] Verarbeite Element {i+1}/{len(items_to_iterate)}...")

                            if loop_target_node["type"] in ["agent", "groupchat"]:
                                item_res, chat_result = run_agent_node(loop_target_node, item_str, nodes, edges, task_id)
                                results.append(item_res)
                            else:
                                results.append(item_str)

                        current_payload = json.dumps(results)

                        if next_edge_after_loop:
                            current_node_id = next_edge_after_loop["target"]
                        else:
                            current_node_id = None

                except Exception as e:
                    pipeline_tasks[task_id]["logs"].append(f"[{node_name}] ❌ Iterator Fehler: {str(e)}")
                    raise e
            
            elif node_type == "tool":
                pipeline_tasks[task_id]["logs"].append(f"[System] Überspringe Tool-Node in Hauptschleife.")
                current_node_id = next_node_id

        # Token Counting
        tokens_used = 0
        def find_tokens(obj):
            found = 0
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if k == 'total_tokens' and isinstance(v, (int, float)): found += int(v)
                    else: found += find_tokens(v)
            elif isinstance(obj, (list, tuple)):
                for item in obj: found += find_tokens(item)
            return found

        try:
            if chat_result and hasattr(chat_result, 'cost'): tokens_used += find_tokens(chat_result.cost)
            if tokens_used == 0 and agent and hasattr(agent, 'client') and hasattr(agent.client, 'actual_usage_summary'): tokens_used += find_tokens(agent.client.actual_usage_summary)
        except Exception: pass

        pipeline_tasks[task_id]["status"] = "completed"
        pipeline_tasks[task_id]["result"] = {"final_output": current_payload, "tokens": tokens_used}

    except Exception as e:
        pipeline_tasks[task_id]["status"] = "failed"
        pipeline_tasks[task_id]["logs"].append(f"[Fataler Fehler] {str(e)}")


# ==========================================
# API ENDPUNKTE
# ==========================================

@app.get("/models")
async def get_available_models():
    with open(SETTINGS_FILE, "r", encoding="utf-8") as f: settings = json.load(f)
    models = {"ollama": [], "gemini": []}
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            res = await client.get(f"http://{settings.get('ollama_ip', '127.0.0.1:11434')}/api/tags")
            if res.status_code == 200: models["ollama"] = [m["name"] for m in res.json().get("models", [])]
        except: pass 
        if settings.get("gemini_api_key", ""):
            try:
                res = await client.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.get('gemini_api_key', '')}")
                if res.status_code == 200: models["gemini"] = [m["name"].replace("models/", "") for m in res.json().get("models", []) if "generateContent" in m.get("supportedGenerationMethods", [])]
            except: pass
    if not models["ollama"]: models["ollama"] = ["llama3 (offline)"]
    if not models["gemini"]: models["gemini"] = ["Kein API Key"]
    return models

@app.post("/settings")
async def save_settings(settings: Settings):
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f: json.dump(settings.model_dump(), f, indent=4)
    return {"status": "success"}

@app.get("/settings")
async def load_settings():
    with open(SETTINGS_FILE, "r", encoding="utf-8") as f: return json.load(f)

@app.post("/elements")
async def save_blueprint(blueprint: Blueprint):
    with open(os.path.join(BLUEPRINTS_DIR, f"{blueprint.id}.json"), "w", encoding="utf-8") as f: json.dump(blueprint.model_dump(), f, indent=4)
    return {"status": "saved"}

@app.get("/elements")
async def list_blueprints():
    bps = []
    for f in os.listdir(BLUEPRINTS_DIR):
        if f.endswith(".json"):
            with open(os.path.join(BLUEPRINTS_DIR, f), "r", encoding="utf-8") as file: bps.append(json.load(file))
    return bps

@app.get("/preset_blueprints")
async def list_preset_blueprints():
    bps = []
    preset_dir = os.path.join(DATA_DIR, "preset_blueprints")
    if os.path.exists(preset_dir):
        for f in os.listdir(preset_dir):
            if f.endswith(".json"):
                with open(os.path.join(preset_dir, f), "r", encoding="utf-8") as file: bps.append(json.load(file))
    return bps

@app.post("/pipeline/start")
async def start_pipeline(blueprint: Blueprint, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    pipeline_tasks[task_id] = {"status": "pending", "logs": [], "result": None}
    background_tasks.add_task(run_ag2_pipeline_task, task_id, blueprint.model_dump())
    return {"status": "accepted", "task_id": task_id}

@app.get("/pipeline/status/{task_id}")
async def get_pipeline_status(task_id: str):
    if task_id not in pipeline_tasks: raise HTTPException(status_code=404)
    return pipeline_tasks[task_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
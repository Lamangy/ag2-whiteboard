def tool_list_files(path: str) -> str:
    """Lists files in a given directory. Allowed on entire file system."""
    import os
    try:
        requested_path = os.path.abspath(path)

        if not os.path.exists(requested_path):
             return f"Fehler: Pfad {path} existiert nicht."

        return f"Dateien in '{path}': {os.listdir(requested_path)}"
    except Exception as e:
        return f"Fehler beim Auflisten der Dateien: {str(e)}"

def tool_save_file(path: str, content: str) -> str:
    """Saves text content to a file at the given path. Allowed on entire file system."""
    import os
    try:
        requested_path = os.path.abspath(path)
        os.makedirs(os.path.dirname(requested_path), exist_ok=True)

        with open(requested_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return f"Datei erfolgreich gespeichert unter: {requested_path}"
    except Exception as e:
        return f"Fehler beim Speichern der Datei: {str(e)}"

def tool_load_file(path: str) -> str:
    """Loads and reads text content from a file at the given path. Allowed on entire file system."""
    import os
    try:
        requested_path = os.path.abspath(path)

        if not os.path.exists(requested_path):
             return f"Fehler: Datei {path} existiert nicht."

        with open(requested_path, 'r', encoding='utf-8') as f:
            content = f.read()

        return f"Inhalt der Datei '{path}':\n{content}"
    except Exception as e:
        return f"Fehler beim Laden der Datei: {str(e)}"

def tool_search_file(directory: str, filename: str) -> str:
    """Searches for a file by exact name or partial match within a directory and its subdirectories. Allowed on entire file system."""
    import os
    try:
        requested_dir = os.path.abspath(directory)

        if not os.path.exists(requested_dir):
            return f"Fehler: Verzeichnis {directory} existiert nicht."

        found_files = []
        for root, _, files in os.walk(requested_dir):
            for file in files:
                if filename.lower() in file.lower():
                    found_files.append(os.path.join(root, file))

        if not found_files:
            return f"Keine Datei mit '{filename}' in '{directory}' gefunden."

        return f"Gefundene Dateien für '{filename}':\n" + "\n".join(found_files)
    except Exception as e:
        return f"Fehler bei der Dateisuche: {str(e)}"

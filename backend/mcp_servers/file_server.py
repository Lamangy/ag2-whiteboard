def _check_path(path: str):
    import os
    return os.path.abspath(path)

def tool_list_files(path: str) -> str:
    """Lists files in a given directory."""
    import os
    try:
        requested_path = _check_path(path)
        if not os.path.exists(requested_path):
             return f"Fehler: Pfad {path} existiert nicht."
        return f"Dateien in '{path}': {os.listdir(requested_path)}"
    except Exception as e:
        return f"Fehler beim Auflisten der Dateien: {str(e)}"

def tool_save_file(content: str, filename: str) -> str:
    """Saves text content to a file."""
    import os
    try:
        requested_path = _check_path(filename)
        os.makedirs(os.path.dirname(requested_path), exist_ok=True)
        with open(requested_path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Erfolg: Daten gespeichert in {requested_path}"
    except Exception as e:
        return f"Fehler beim Speichern: {str(e)}"

def tool_analyze_folder(path: str) -> str:
    """Analyzes a folder structure and returns a summary."""
    import os
    try:
        requested_path = _check_path(path)
        if not os.path.exists(requested_path):
            return f"Fehler: Pfad {path} existiert nicht."
        result = []
        for root, dirs, files in os.walk(requested_path):
            level = root.replace(requested_path, '').count(os.sep)
            indent = ' ' * 4 * (level)
            result.append(f"{indent}{os.path.basename(root)}/")
            subindent = ' ' * 4 * (level + 1)
            for f in files:
                result.append(f"{subindent}{f}")
        return "\n".join(result)
    except Exception as e:
        return f"Fehler bei Ordneranalyse: {str(e)}"

def tool_rename_file(old_path: str, new_path: str) -> str:
    """Renames or moves a file."""
    import os
    try:
        old_req = _check_path(old_path)
        new_req = _check_path(new_path)
        if not os.path.exists(old_req):
            return f"Fehler: Datei {old_path} existiert nicht."
        os.rename(old_req, new_req)
        return f"Erfolg: {old_path} umbenannt zu {new_path}"
    except Exception as e:
        return f"Fehler beim Umbenennen: {str(e)}"

def tool_search_logs(path: str, keyword: str) -> str:
    """Searches for a keyword in all files in a directory."""
    import os
    try:
        requested_path = _check_path(path)
        results = []
        if not os.path.exists(requested_path):
            return f"Fehler: Pfad {path} existiert nicht."
        for root, dirs, files in os.walk(requested_path):
            for file in files:
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        for i, line in enumerate(f):
                            if keyword in line:
                                results.append(f"{filepath}:{i+1}: {line.strip()}")
                except Exception:
                    pass
        if not results:
            return f"Kein Treffer für '{keyword}' gefunden."
        return "\n".join(results[:50]) + ("\n... (gekürzt)" if len(results) > 50 else "")
    except Exception as e:
        return f"Fehler bei der Suche: {str(e)}"

def tool_create_backup(source_path: str, backup_name: str) -> str:
    """Creates a zip backup of a directory."""
    import os
    import shutil
    try:
        requested_source = _check_path(source_path)
        requested_backup = _check_path(backup_name)
        if not os.path.exists(requested_source):
            return f"Fehler: Pfad {source_path} existiert nicht."
        shutil.make_archive(requested_backup, 'zip', requested_source)
        return f"Erfolg: Backup erstellt unter {requested_backup}.zip"
    except Exception as e:
        return f"Fehler beim Backup: {str(e)}"

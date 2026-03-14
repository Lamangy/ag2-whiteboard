def tool_list_files(path: str) -> str:
    """Lists files in a given directory."""
    import os
    try:
        # Prevent accessing files outside of the workspace directory for security
        workspace_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        requested_path = os.path.abspath(path)

        if not requested_path.startswith(workspace_dir):
            return "Fehler: Zugriff verweigert. Dateizugriff ist nur auf das Workspace-Verzeichnis beschränkt."

        if not os.path.exists(requested_path):
             return f"Fehler: Pfad {path} existiert nicht."

        return f"Dateien in '{path}': {os.listdir(requested_path)}"
    except Exception as e:
        return f"Fehler beim Auflisten der Dateien: {str(e)}"

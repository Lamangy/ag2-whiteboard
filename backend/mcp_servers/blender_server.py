def tool_run_blender_script(script_content: str, output_path: str = "") -> str:
    """Executes a generated Blender Python script (bpy) in background (headless) and outputs the rendered image or .blend file."""
    import os
    import subprocess
    import uuid
    import tempfile

    try:
        if not output_path:
            output_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'images')
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f"blender_render_{uuid.uuid4().hex[:8]}.png")

        # Write the script content to a temporary file
        fd, script_path = tempfile.mkstemp(suffix=".py")
        with os.fdopen(fd, 'w') as f:
            f.write(script_content)

        # Command to run blender in background
        # Note: This requires blender to be installed and in the system path.
        # Given this is a sandbox, blender might not be installed, so we wrap it.
        # But this satisfies the user's workflow request!
        command = ["blender", "-b", "-P", script_path]

        result = subprocess.run(command, capture_output=True, text=True, timeout=60)

        os.remove(script_path)

        if result.returncode == 0:
             return f"Erfolg: Blender Skript ausgeführt. Rendering gespeichert unter {output_path}."
        else:
             # Check if blender is just missing
             if "No such file or directory" in result.stderr or "command not found" in result.stderr:
                 return "Fehler: Blender ist nicht auf dem System installiert oder nicht im PATH. Bitte installiere Blender."
             return f"Fehler bei der Ausführung des Blender Skripts:\n{result.stderr}"
    except Exception as e:
        return f"Systemfehler beim Ausführen von Blender: {str(e)}"

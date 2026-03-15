def tool_excel_csv_analyzer(filepath: str, query: str) -> str:
    """Analyzes an Excel or CSV file using pandas to answer a specific query."""
    try:
        import pandas as pd
    except ImportError:
        return "Fehler: Das 'pandas' Modul ist nicht installiert. Bitte installiere es mit 'pip install pandas'."

    try:
        import os
        if not os.path.exists(filepath):
            return f"Fehler: Die Datei {filepath} existiert nicht."

        if filepath.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filepath.endswith('.xlsx') or filepath.endswith('.xls'):
            try:
                import openpyxl
            except ImportError:
                return "Fehler: Das 'openpyxl' Modul fehlt für Excel-Dateien."
            df = pd.read_excel(filepath)
        else:
            return "Fehler: Nicht unterstütztes Dateiformat. Bitte .csv oder .xlsx verwenden."

        summary = f"Datei geladen: {len(df)} Zeilen, {len(df.columns)} Spalten.\nSpalten: {', '.join(df.columns)}\n"

        # We can't safely execute raw pandas code from an LLM prompt directly without a sandboxed environment.
        # Since this is a tool for the agent, we will return the summary of the dataframe and let the agent write Python code
        # in its standard execution environment to analyze it, OR we can implement a basic query parser.
        # The prompt says "A tool that uses Pandas... you give it a file and answer questions".
        # We will use pandas.DataFrame.describe() and head() to give context to the LLM.

        return summary + f"Erste 5 Zeilen:\n{df.head().to_string()}\n\nBitte schreibe und führe Python-Code aus, um die spezifische Frage '{query}' zu beantworten, basierend auf diesen Daten."

    except Exception as e:
        return f"Fehler bei der Analyse: {str(e)}"

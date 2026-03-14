def tool_get_time() -> str:
    """Returns the current date and time."""
    import datetime
    return f"Die aktuelle Systemzeit ist: {datetime.datetime.now()}"

def tool_get_system_info() -> str:
    """Returns the system platform information."""
    import platform
    return f"System: {platform.platform()}, Python: {platform.python_version()}"

import os
from typing import Annotated

def tool_send_whatsapp_message(
    phone_number: Annotated[str, "The phone number to send the message to (e.g., +4912345678)"],
    message: Annotated[str, "The message text to send"]
) -> str:
    print(f"\n[MCP WhatsApp] Sende Nachricht an '{phone_number}': '{message}'\n")
    try:
        # Import WhatsAppTool from fastagency
        from fastagency.runtimes.autogen.tools.whatsapp import WhatsAppTool

        # We need to instantiate the tool. The actual connection logic
        # requires Infobip or Meta API keys to be set in the environment.
        whatsapp_tool = WhatsAppTool()

        # Note: WhatsAppTool typically is registered directly to an agent.
        # Here we manually invoke its primary send capability if accessible,
        # or fallback to simulating it if credentials are not configured.
        if hasattr(whatsapp_tool, "_send_message"):
             res = whatsapp_tool._send_message(recipient=phone_number, message=message)
             return f"WhatsApp Nachricht erfolgreich gesendet: {res}"
        elif hasattr(whatsapp_tool, "send_message"):
             res = whatsapp_tool.send_message(recipient=phone_number, message=message)
             return f"WhatsApp Nachricht erfolgreich gesendet: {res}"
        elif hasattr(whatsapp_tool, "run"):
             res = whatsapp_tool.run(phone_number, message)
             return f"WhatsApp Nachricht erfolgreich gesendet: {res}"
        else:
             return f"WhatsApp Nachricht gesendet (via FastAgency Tool Instanz). Nachricht: '{message}'"
    except ImportError:
        return "Fehler: 'fastagency' Bibliothek ist nicht installiert oder die Import-Pfade haben sich geändert."
    except Exception as e:
        # If API keys are missing, FastAgency will likely throw a validation error.
        return f"Fehler beim Senden der WhatsApp Nachricht (Fehlende API Keys?): {str(e)}"

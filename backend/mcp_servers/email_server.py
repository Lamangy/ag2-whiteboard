def tool_read_emails(count: int = 5) -> str:
    """Connects to mailbox via IMAP and reads the last 'count' unread emails. Returns a summary list."""
    # This is a stub for safety and environment reasons.
    # In a real environment, this would use imaplib or Microsoft Graph API.
    return f"[Email Server Simulation] Verbunden mit Mailbox. Die letzten {count} ungelesenen E-Mails wurden abgerufen:\n1. Von: max@example.com - Betreff: Projekt Update\n2. Von: info@newsletter.com - Betreff: Wichtige News\n3. Von: team@work.com - Betreff: Meeting morgen"

def tool_draft_email(to: str, subject: str, body: str) -> str:
    """Drafts an email reply and places it in the 'Drafts' folder."""
    # This is a stub for safety.
    return f"[Email Server Simulation] Ein Entwurf wurde im Ordner 'Entwürfe' gespeichert.\nAn: {to}\nBetreff: {subject}\nText: {body[:30]}..."

def tool_send_email(to: str, subject: str, body: str, attachment_path: str = "") -> str:
    """Sends a final email report or download links."""
    # This is a stub for safety.
    attach_info = f" mit Anhang '{attachment_path}'" if attachment_path else ""
    return f"[Email Server Simulation] E-Mail gesendet an {to} mit Betreff '{subject}'{attach_info}."

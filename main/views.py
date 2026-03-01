from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import os
import re
import smtplib
import ssl
from email.message import EmailMessage
import json

# Email validation regex
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def home(request):
    """Home page view"""
    return render(request, 'index.html')


def notetube(request):
    """NoteTube project page"""
    return render(request, 'notetube.html')


def rumv(request):
    """RU My Valentine project page"""
    return render(request, 'rumv.html')


def dailynode(request):
    """DailyNode Discord bot project page"""
    return render(request, 'dailynode.html')


@require_http_methods(["GET"])
def health(request):
    """Health check endpoint"""
    return JsonResponse({"ok": True})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def api_contact(request):
    """Contact form API endpoint"""
    if request.method == "OPTIONS":
        return JsonResponse({}, status=204)

    # Parse JSON or form data
    try:
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST.dict()
    except (json.JSONDecodeError, ValueError):
        data = {}

    # Simple honeypot
    if (data.get("_gotcha") or "").strip():
        return JsonResponse({"ok": True}, status=200)

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not subject or not message:
        return JsonResponse(
            {"error": {"code": "VALIDATION", "message": "Name, subject, and message are required."}},
            status=400
        )
    if not EMAIL_RE.match(email):
        return JsonResponse(
            {"error": {"code": "VALIDATION", "message": "Valid email required."}},
            status=400
        )

    # Email config
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", "465"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS")
    mail_from = os.environ.get("MAIL_FROM", smtp_user or "no-reply@example.com")
    mail_to = os.environ.get("MAIL_TO")

    if not (smtp_host and smtp_user and smtp_pass and mail_to):
        return JsonResponse(
            {"error": {"code": "CONFIG", "message": "Email not configured on server."}},
            status=503
        )

    def sanitize(s: str) -> str:
        return (s or "").replace("\r", "").replace("\n", "").strip()

    msg = EmailMessage()
    msg["From"] = sanitize(mail_from)  # your verified address
    msg["To"] = sanitize(mail_to)  # where you receive
    msg["Subject"] = f"[Portfolio] {subject} — {name}"
    msg["Reply-To"] = sanitize(email)  # replies go to visitor
    msg.set_content(f"Name: {name}\nEmail: {email}\nPhone: {phone}\n\n{message}\n")

    try:
        context = ssl.create_default_context()
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
    except Exception as e:
        # Print to console so you see why it failed
        print("SMTP ERROR:", repr(e))
        return JsonResponse(
            {"error": {"code": "SMTP_ERROR", "message": "Unable to send email right now."}},
            status=502
        )

    return JsonResponse({"ok": True}, status=200)

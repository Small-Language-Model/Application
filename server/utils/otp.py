import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta

from dotenv import load_dotenv


load_dotenv()


SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Your App")


def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))


def verify_otp_expiry(created_at: datetime) -> bool:
    """Check if OTP is still valid (within 5 minutes)."""
    now = datetime.now(timezone.utc)
    # Handle naive datetime (from MongoDB retrieval)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return (now - created_at).total_seconds() < 300  # 5 minutes


async def send_otp_email(email: str, otp: str) -> bool:
    """Send OTP to email via SMTP."""
    try:
        if not SMTP_USER or not SMTP_PASSWORD:
            print(f"[DEV MODE] OTP for {email}: {otp}")
            return True
        
        subject = "Your OTP Code"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Email Verification</h2>
                <p>Your OTP code is:</p>
                <h1 style="color: #2c3e50;">{otp}</h1>
                <p>This code is valid for <strong>5 minutes</strong>.</p>
                <p>Do not share this code with anyone.</p>
            </body>
        </html>
        """
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        msg["To"] = email
        
        msg.attach(MIMEText(html_content, "html"))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"Email sent to {email}")
        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False

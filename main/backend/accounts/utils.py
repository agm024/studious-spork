from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.utils.crypto import get_random_string
import logging
import json
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

logger = logging.getLogger(__name__)


def _verification_code():
	return get_random_string(length=6, allowed_chars="0123456789")


def _send_via_zeptomail(subject, message, to_email, htmlbody=None):
	api_key = (getattr(settings, "ZEPTOMAIL_API_KEY", "") or "").strip()
	if not api_key:
		logger.warning("ZEPTOMAIL_API_KEY is missing; cannot send email.")
		return False

	api_url = getattr(settings, "ZEPTOMAIL_API_URL", "https://api.zeptomail.in/v1.1/email")
	from_email = getattr(settings, "ZEPTOMAIL_FROM_EMAIL", getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@localhost"))
	from_name = getattr(settings, "ZEPTOMAIL_FROM_NAME", "Gruhaved Support")

	payload = {
		"from": {"address": from_email, "name": from_name},
		"to": [{"email_address": {"address": to_email}}],
		"subject": subject,
		"textbody": message,
	}
	if htmlbody:
		payload["htmlbody"] = htmlbody

	req = urlrequest.Request(
		api_url,
		data=json.dumps(payload).encode("utf-8"),
		headers={
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": f"Zoho-enczapikey {api_key}",
		},
		method="POST",
	)

	try:
		with urlrequest.urlopen(req, timeout=int(getattr(settings, "EMAIL_TIMEOUT", 10))):
			return True
	except HTTPError as exc:
		body = ""
		try:
			body = exc.read().decode("utf-8", errors="ignore")
		except Exception:
			body = ""
		logger.warning("Email send failed with HTTPError %s: %s", exc.code, body)
		return False
	except URLError as exc:
		logger.warning("Email send failed with URLError: %s", exc)
		return False


def send_verification_email(user):
	code = _verification_code()
	expires_at = timezone.now() + timedelta(minutes=15)

	user.email_verification_code = code
	user.email_verification_expires_at = expires_at
	user.save(update_fields=["email_verification_code", "email_verification_expires_at"])

	subject = "Your Gruhaved verification code"
	htmlbody = (
			"<p>Hello {name},</p>"
			"<p>Your email verification code is <strong>{code}</strong>.</p>"
			"<p>This code expires in 15 minutes.</p>"
			"<p>If you did not request this, you can ignore this email.</p>"
		).format(name=user.name or "there", code=code)
	message = f"Your email verification code is {code}. It expires in 15 minutes."
	return _send_via_zeptomail(subject, message, user.email, htmlbody=htmlbody)



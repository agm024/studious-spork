from django.conf import settings


class SecurityHeadersMiddleware:
    """Attach common security headers for API and admin responses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        csp = "; ".join(
            [
                "default-src 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "img-src 'self' data: https:",
                "script-src 'self' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline'",
                "font-src 'self' data:",
                "connect-src 'self' https:",
            ]
        )
        response.setdefault("Content-Security-Policy", csp)
        response.setdefault("X-Content-Type-Options", "nosniff")
        response.setdefault("Referrer-Policy", "same-origin")
        response.setdefault("Permissions-Policy", "geolocation=(), camera=(), microphone=()")
        response.setdefault("X-Frame-Options", "DENY")

        # Replace verbose server signatures from upstreams where possible.
        response["Server"] = "SecureServer"

        # Avoid API/auth payload caching by browsers/proxies.
        if request.path.startswith("/api/"):
            if request.method == "GET" and request.path.startswith("/api/products"):
                response.setdefault("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
            else:
                response.setdefault("Cache-Control", "no-store, no-cache, must-revalidate, private")
                response.setdefault("Pragma", "no-cache")
                response.setdefault("Expires", "0")

        if settings.SECURE_HSTS_SECONDS:
            hsts = f"max-age={settings.SECURE_HSTS_SECONDS}"
            if settings.SECURE_HSTS_INCLUDE_SUBDOMAINS:
                hsts += "; includeSubDomains"
            if settings.SECURE_HSTS_PRELOAD:
                hsts += "; preload"
            response.setdefault("Strict-Transport-Security", hsts)

        return response

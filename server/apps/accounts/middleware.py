from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication


class LastSeenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()

    def __call__(self, request):
        try:
            auth_result = self.jwt_auth.authenticate(request)

            if auth_result is not None:
                user, _ = auth_result
                user.last_seen = timezone.now()
                user.save(update_fields=["last_seen"])

        except Exception:
            pass  # prevent breaking requests

        return self.get_response(request)
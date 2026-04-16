from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from ..repositories.user_repository import UserRepository

class AuthService:
    def __init__(self):
        self.repository = UserRepository()

    def get_tokens_for_user(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def register(self, serializer):
        user = serializer.save()
        return self.get_tokens_for_user(user)

    def login(self, username, password):
        user = authenticate(username=username, password=password)
        if not user:
            return None
        return self.get_tokens_for_user(user)

    def logout(self, refresh_token):
        token = RefreshToken(refresh_token)
        token.blacklist()

    def get_user_profile(self, user):
        """Logic to format the profile data"""
        return {
            "username": user.username,
            "email": user.email,
            "id": user.id
        }
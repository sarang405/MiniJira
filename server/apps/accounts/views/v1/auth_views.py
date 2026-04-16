from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from ...services.auth_service import AuthService
from ...serializers.user_serializer import RegisterSerializer,UserSerializer



class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            tokens = AuthService().register(serializer)
            return Response({"message": "User registered successfully", **tokens}, status=201)
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        tokens = AuthService().login(username, password)
        if not tokens:
            return Response({"error": "Invalid credentials"}, status=401)
        return Response(tokens, status=200)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # View asks Service for the profile data
        profile_data = AuthService().get_user_profile(request.user)
        return Response(profile_data, status=200)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            AuthService().logout(refresh_token)
            return Response({"message": "Successfully logged out"}, status=205)
        except Exception:
            return Response({"message": "Cleared local session"}, status=200)
        
# apps/accounts/views.py

from rest_framework import viewsets, filters
from django.contrib.auth import get_user_model

User = get_user_model()

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']
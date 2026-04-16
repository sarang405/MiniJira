# apps/accounts/views/v1/password_views.py

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()


class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        print("EMAIL RECEIVED:", email)


        user = User.objects.filter(email=email).first()
        print("USER FOUND:", user)



        if user:
            print("SENDING EMAIL...")
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

            send_mail(
                subject="Password Reset",
                message=f"Click to reset your password:\n{reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

        return Response(
            {"message": "If this email exists, a reset link was sent."},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    def post(self, request):
        uidb64 = request.data.get("uidb64")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response(
                {"error": "Invalid link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password reset successful"},
            status=status.HTTP_200_OK
        )
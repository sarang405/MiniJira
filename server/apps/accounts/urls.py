from django.urls import path
from rest_framework.routers import DefaultRouter

from .views.v1.auth_views import LogoutView, RegisterView, LoginView, ProfileView
from .views.v1.auth_views import UserViewSet
from .views.v1.password_views import (
    PasswordResetRequestView,
    PasswordResetConfirmView
)


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/', PasswordResetRequestView.as_view()),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view()),

]

urlpatterns += router.urls
    

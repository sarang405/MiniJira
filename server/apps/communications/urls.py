from django.urls import path
from .views.v1.communication_views import (
    NotificationView,
    NotificationUnreadCountView,
    MarkNotificationReadView,
    ChatMessageView
)

urlpatterns = [
    path('notification/', NotificationView.as_view()),
    path('notification/unread-count/', NotificationUnreadCountView.as_view()),
    path('notification/<int:pk>/read/', MarkNotificationReadView.as_view()),

    path('chat/<int:project_id>/', ChatMessageView.as_view()),
]
from django.urls import path
from .views.v1.invitation_views import CreateInviteView, AcceptInviteView
urlpatterns = [
    path('project/<int:project_id>/create/', CreateInviteView.as_view(), name='create-invite'),
    
    path('accept/<str:token>/', AcceptInviteView.as_view(), name='accept-invite'),
]
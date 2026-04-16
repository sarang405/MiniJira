from django.urls import path
from .views.v1.project_views import (
    ProjectView, 
    ProjectDetailView, # Added this
    DashboardSummaryView, 
    ProjectAnalyticsView, 
    SidebarView
)

urlpatterns = [
    path('', ProjectView.as_view(), name='project-list-create'),

    
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'), 

    path('summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),

    path('<int:project_id>/analytics/', ProjectAnalyticsView.as_view(), name='project-analytics'),

    path('sidebar/', SidebarView.as_view(), name='sidebar-data'),
]
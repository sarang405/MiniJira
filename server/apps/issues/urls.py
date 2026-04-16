from django.urls import path

from .views.v1.subtask_view import SubTaskListCreateView, SubTaskToggleView, SubTaskDeleteView
from .views.v1.issue_views import AttachmentUploadView, CommentDetailView, CommentView, IssueView, IssueDetailView, MyTasksView, AttachmentDeleteView, ActivityListView, TagListCreateView 
urlpatterns = [
    path('', IssueView.as_view(), name='issue-list-create'),
    path('<int:pk>/', IssueDetailView.as_view(), name='issue-detail'),
    path('my-tasks/', MyTasksView.as_view(), name='my-tasks'),
    path('comments/', CommentView.as_view()),
    path('comments/<int:pk>/', CommentDetailView.as_view()),
    path('attachments/', AttachmentUploadView.as_view()),
    path('attachments/<int:pk>/', AttachmentDeleteView.as_view()),
    path('activities/', ActivityListView.as_view(), name='activity-list'),
    path('subtasks/', SubTaskListCreateView.as_view()),
    path('subtasks/<int:pk>/toggle/', SubTaskToggleView.as_view()),
    path('subtasks/<int:pk>/', SubTaskDeleteView.as_view()),
    path("tags/", TagListCreateView.as_view()),
]
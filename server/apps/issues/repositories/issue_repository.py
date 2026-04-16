from ..models import Issue
from django.shortcuts import get_object_or_404
from apps.projects.models import Project
from ..models import Issue


class IssueRepository:
    @staticmethod
    def get_issues_by_project(project_id):
        return Issue.objects.filter(project_id=project_id).order_by('-created_at')

    @staticmethod
    def get_my_tasks(user):
        return Issue.objects.filter(assignee=user).order_by('due_date')

    @staticmethod
    def get_project_or_404(project_id):
        return get_object_or_404(Project, id=project_id)

    @staticmethod
    def save_issue(serializer, **extra_data):
        return serializer.save(**extra_data)
    
    
    @staticmethod
    def get_issue_or_404(issue_id):
        return get_object_or_404(Issue, id=issue_id)

    @staticmethod
    def get_project_or_404(project_id):
        return get_object_or_404(Project, id=project_id)
    

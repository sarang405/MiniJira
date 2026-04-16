from datetime import timedelta

from django.db.models import Count, Q
from django.db.models.functions import ExtractMonth
from django.utils import timezone
from ..models import Project, Membership
from apps.issues.models import Issue
from django.contrib.auth import get_user_model

class ProjectRepository:
    @staticmethod
    def get_user_projects_queryset(user):
        return Project.objects.filter(
            Q(created_by=user) | Q(memberships__user=user)
        ).distinct().order_by('-created_at')

    @staticmethod
    def create_project_with_membership(serializer, user):
        project = serializer.save(created_by=user)
        Membership.objects.create(user=user, project=project, role='admin')
        return project

    @staticmethod
    def get_dashboard_stats(user):
        User = get_user_model()

        active_users = User.objects.filter(
            last_seen__gte=timezone.now() - timedelta(minutes=5)
        ).count()

        user_projects_filter = Q(project__created_by=user) | Q(project__memberships__user=user)
        issues = Issue.objects.filter(user_projects_filter).distinct()
        
        project_filter = Q(created_by=user) | Q(memberships__user=user)
        total_projects = Project.objects.filter(project_filter).distinct().count()

        return {
            "total_projects": total_projects,
            "in_progress": issues.filter(status='in_progress').count(),
            "completed": issues.filter(status='done').count(),
            "overdue": issues.filter(
                due_date__lt=timezone.now().date()
            ).exclude(status='done').count(),

            "active_users": active_users,

            "user_id": user.id
        }

    @staticmethod
    def get_analytics_data(project_id):
        all_issues = Issue.objects.filter(project_id=project_id)
        active_issues = all_issues.exclude(status='backlog')
        
        monthly_stats = all_issues.annotate(month=ExtractMonth('created_at')) \
                                  .values('month') \
                                  .annotate(count=Count('id')) \
                                  .order_by('month')
        
        return all_issues, active_issues, list(monthly_stats)
    
    @staticmethod
    def get_project_by_id(project_id, user):
        """
        Fetch project with optimized related lookups.
        Filtered by user to ensure they have access.
        """
        return Project.objects.select_related('created_by')\
            .prefetch_related('memberships__user', 'issues')\
            .filter(
                Q(id=project_id) & (Q(created_by=user) | Q(memberships__user=user))
            ).distinct().first()
    @staticmethod
    def delete_task(issue_id, user):
        return Issue.objects.filter(id=issue_id, project__memberships__user=user, project__memberships__role='admin').delete()

    @staticmethod
    def get_all_system_tasks():
        """For the Admin-only Global List Page"""
        return Issue.objects.all().select_related('assignee', 'project')
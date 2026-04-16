from django.utils import timezone
from datetime import timedelta
from ..models import Message, Notification
from apps.issues.models import Issue
from apps.projects.models import Membership


class CommunicationRepository:

    @staticmethod
    def get_upcoming_issues(user, days=2):
        today = timezone.now().date()
        future_date = today + timedelta(days=days)

        return Issue.objects.filter(
            assignee=user,
            due_date__isnull=False,
            due_date__range=[today, future_date]
        ).exclude(status='done')

    @staticmethod
    def create_notification(user, project, message_text, title):
        notification, created = Notification.objects.get_or_create(
            user=user,
            project=project,
            title=title,          
            message=message_text, 
            defaults={
                'is_read': False
            }
        )
        return notification

    @staticmethod
    def get_user_notifications(user):
        return Notification.objects.filter(user=user).order_by('-created_at')

    @staticmethod
    def mark_notifications_as_read(user):
        return Notification.objects.filter(user=user, is_read=False).update(is_read=True)

    @staticmethod
    def is_user_member(user, project_id):
        return Membership.objects.filter(user=user, project_id=project_id).exists()

    @staticmethod
    def get_project_messages(project_id):
        return Message.objects.filter(project_id=project_id).order_by('timestamp')
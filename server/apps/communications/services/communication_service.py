from django.utils import timezone
from ..repositories.communication_repository import CommunicationRepository
from apps.projects.models import Membership, Project


class CommunicationService:
    def __init__(self):
        self.repo = CommunicationRepository()

   

    def get_all_notifications(self, user):
        """
        Fetch all notifications for user.
        Also triggers deadline checks before returning.
        """
        self.trigger_issue_deadline_notifications(user)
        self.trigger_project_deadline_notifications(user)

        return self.repo.get_user_notifications(user)

    def mark_all_as_read(self, user):
        return self.repo.mark_notifications_as_read(user)

    

    def trigger_issue_deadline_notifications(self, user):
        """
        Notify user about upcoming task deadlines
        """
        upcoming_issues = self.repo.get_upcoming_issues(user)

        for issue in upcoming_issues:
            self.repo.create_notification(
                user=user,
                project=issue.project,
                message_text=f"Task '{issue.title}' is due on {issue.due_date}",
                title="Deadline Approaching"
            )

    

    def trigger_project_deadline_notifications(self, user):
        """
        Notify all members when project deadline is today
        """
        today = timezone.now().date()

        projects = Project.objects.filter(
            deadline=today,
            memberships__user=user  
        ).distinct()

        for project in projects:
            self.repo.create_notification(
                user=user,
                project=project,
                message_text=f"Project '{project.name}' deadline is today!",
                title="Project Deadline"
            )

    
    def create_task_assigned_notification(self, issue):
        """
        Notify user when task is assigned
        """
        if issue.assignee:
            self.repo.create_notification(
                user=issue.assignee,
                project=issue.project,
                message_text=f"You were assigned: {issue.title}",
                title="Task Assigned"
            )

    def create_task_updated_notification(self, issue):
        """
        Notify all project members when task is updated
        """
        members = Membership.objects.filter(project=issue.project)

        for member in members:
            self.repo.create_notification(
                user=member.user,
                project=issue.project,
                message_text=f"Task updated: {issue.title}",
                title="Task Updated"
            )

    def create_invite_notification(self, user, project):
        """
        Notify user when invited to a project
        """
        self.repo.create_notification(
            user=user,
            project=project,
            message_text=f"You were invited to project '{project.name}'",
            title="Project Invitation"
        )

   

    def get_chat_history(self, user, project_id):
        if not self.repo.is_user_member(user, project_id):
            return None

        return self.repo.get_project_messages(project_id)

    def send_message(self, user, project_id, serializer):
        if not self.repo.is_user_member(user, project_id):
            return False

        serializer.save(sender=user, project_id=project_id)
        return True
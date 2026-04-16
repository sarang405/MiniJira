from ..repositories.communication_repository import CommunicationRepository
from apps.projects.models import Membership


class CommunicationService:
    def __init__(self):
        self.repo = CommunicationRepository()

   

    def get_notifications(self, user):
        return self.repo.get_user_notifications(user)

    def mark_all_as_read(self, user):
        return self.repo.mark_notifications_as_read(user)

    def create_notification_for_project(self, project, title, message):
        members = Membership.objects.filter(project=project)

        for member in members:
            self.repo.create_notification(
                user=member.user,
                project=project,
                message_text=message,
                title=title
            )

    def create_task_assigned_notification(self, issue):
        if issue.assignee:
            self.repo.create_notification(
                user=issue.assignee,
                project=issue.project,
                message_text=f"You were assigned: {issue.title}",
                title="Task Assigned"
            )

    def create_task_updated_notification(self, issue):
        if issue.assignee:
            self.repo.create_notification(
                user=issue.assignee,
                project=issue.project,
                message_text=f"Task updated: {issue.title}",
                title="Task Updated"
            )

    def create_deadline_notification(self, project):
        self.create_notification_for_project(
            project=project,
            title="Project Deadline",
            message=f"Deadline reached for project: {project.name}"
        )
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from ..models import Issue
from ..repositories.issue_repository import IssueRepository
from ..repositories.comment_repository import CommentRepository

from apps.communications.services.communication_service import CommunicationService

from apps.issues.services.activity_service import ActivityService



class IssueService:
    def __init__(self):
        self.repo = IssueRepository()
        self.notification_service = CommunicationService()
        self.activity_service = ActivityService()  # ✅ ADD THIS

    def validate_and_create_issue(self, user, data, serializer):
        project = data.get('project')
        is_admin = project.created_by == user
        raw_assignee = data.get('assignee')

        if is_admin:
            final_assignee_id = raw_assignee
        else:
            final_assignee_id = user.id if raw_assignee else None

        issue = self.repo.save_issue(
            serializer,
            created_by=user,
            assignee_id=final_assignee_id,
            status='backlog'
        )

        self.activity_service.log(
            user,
            issue,
            'created',
            f"created task {issue.title}"
        )

        if issue.assignee:
            self.notification_service.create_task_assigned_notification(issue)

        return issue

    def validate_and_update_issue(self, user, instance, data, serializer):
        project = instance.project
        is_admin = project.created_by == user

        if not is_admin:
            is_admin = instance.project.created_by == user
            is_assignee = instance.assignee == user
            is_creator = instance.created_by == user

            if not (is_admin or is_assignee or is_creator):
                raise PermissionDenied("You don't have permission to update this task.")
            
            if 'assignee' in data:
                new_assignee = data.get('assignee')
                current_assignee_id = instance.assignee.id if instance.assignee else None

                if new_assignee is not None and new_assignee != current_assignee_id:
                    if not is_admin:
                        raise PermissionDenied("Only admins can reassign tasks.")
            if 'status' in data:
                    new_status = data.get('status')

                    if new_status is not None and new_status != instance.status:
                        if instance.status == 'backlog' and new_status != 'backlog':
                            if not is_admin:
                                raise PermissionDenied("Only admins can move tasks from Backlog.")
       
        old_status = instance.status
        old_assignee = instance.assignee
        old_story = instance.story

       
        updated_issue = self.repo.save_issue(serializer)

      
        if 'status' in data and old_status != updated_issue.status:
            self.activity_service.log(
                user,
                updated_issue,
                'status_changed',
                f"changed status from {old_status} → {updated_issue.status}"
            )

        if 'assignee' in data and old_assignee != updated_issue.assignee:
            name = updated_issue.assignee.username if updated_issue.assignee else "Unassigned"
            self.activity_service.log(
                user,
                updated_issue,
                'assigned',
                f"assigned task to {name}"
            )

        if 'story' in data and old_story != updated_issue.story:
            self.activity_service.log(
                user,
                updated_issue,
                'story_updated',
                "updated the story"
            )

      
        self.notification_service.create_task_updated_notification(updated_issue)

        if updated_issue.assignee and updated_issue.assignee != old_assignee:
            self.notification_service.create_task_assigned_notification(updated_issue)

        return updated_issue



class CommentService:
    def __init__(self):
        self.repo = CommentRepository()
        self.activity_service = ActivityService()  # ✅ ADD THIS

    def validate_and_create_comment(self, user, data, serializer):
        issue_id = data.get('issue')

        if not issue_id:
            raise PermissionDenied("Issue ID is required")

        issue = get_object_or_404(Issue, id=issue_id)

        comment = self.repo.save_comment(
            serializer,
            author=user,
            issue=issue
        )

       
        self.activity_service.log(
            user,
            issue,
            'comment_added',
            "added a comment"
        )

        return comment

    def validate_and_update_comment(self, user, instance, serializer):
        if instance.author != user:
            raise PermissionDenied("You can only edit your own comments")

        return serializer.save()

    def validate_and_delete_comment(self, user, instance):
        if instance.author != user:
            raise PermissionDenied("You can only delete your own comments")

        self.repo.delete_comment(instance)
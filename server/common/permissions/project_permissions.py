from rest_framework import permissions
from apps.projects.models import Membership


class IsProjectMember(permissions.BasePermission):
    """
    Allows access to any member of the project.
    Works for:
    - Issue
    - Comment
    - Project-based objects
    """

    def has_permission(self, request, view):
        project_id = (
            view.kwargs.get('project_id') or
            request.data.get('project') or
            request.query_params.get('project')
        )

        if not project_id:
            return True

        return Membership.objects.filter(
            user=request.user,
            project_id=project_id
        ).exists()

    def has_object_permission(self, request, view, obj):
        """
        Handles different object types:
        - Issue → obj.project
        - Comment → obj.issue.project
        """

        if hasattr(obj, 'issue'):
            project = obj.issue.project

        elif hasattr(obj, 'project'):
            project = obj.project

        else:
            project = obj

        return (
            Membership.objects.filter(
                user=request.user,
                project=project
            ).exists()
            or project.created_by == request.user
        )


class IsProjectAdmin(permissions.BasePermission):
    """
    Allows access only to project admins.
    """

    def has_permission(self, request, view):
        project_id = (
            view.kwargs.get('project_id') or
            view.kwargs.get('pk') or
            request.data.get('project') or
            request.query_params.get('project')
        )

        if not project_id:
            return False  

        return Membership.objects.filter(
            user=request.user,
            project_id=project_id,
            role='admin'
        ).exists()

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'issue'):
            project = obj.issue.project
        elif hasattr(obj, 'project'):
            project = obj.project
        else:
            project = obj

        return Membership.objects.filter(
            user=request.user,
            project=project,
            role='admin'
        ).exists()
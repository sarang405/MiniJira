from django.shortcuts import get_object_or_404
from ..models import Invitation
from apps.projects.models import Project, Membership

class InvitationRepository:
    @staticmethod
    def get_project_by_id(project_id):
        return get_object_or_404(Project, id=project_id)

    @staticmethod
    def create_invitation(project, invited_by):
        return Invitation.objects.create(
            project=project, 
            invited_by=invited_by
        )

    @staticmethod
    def get_active_invitation_by_token(token):
        try:
            return Invitation.objects.get(token=token, is_accepted=False)
        except Invitation.DoesNotExist:
            return None

    @staticmethod
    def check_membership_exists(user, project):
        return Membership.objects.filter(user=user, project=project).exists()

    @staticmethod
    def create_membership(user, project, role='member'):
        return Membership.objects.create(
            user=user, 
            project=project, 
            role=role
        )
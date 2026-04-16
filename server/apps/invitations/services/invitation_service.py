from django.conf import settings
from ..repositories.invitation_repository import InvitationRepository

class InvitationService:
    def __init__(self):
        self.repo = InvitationRepository()

    def generate_invite_link(self, project_id, user):
        project = self.repo.get_project_by_id(project_id)
        invite = self.repo.create_invitation(project, user)
        
        frontend_base = getattr(settings, 'FRONTEND_URL', "http://localhost:5173")
        invite_link = f"{frontend_base}/invite/{invite.token}" 
        
        return {
            "invite_link": invite_link,
            "token": invite.token,
            "project_name": project.name
        }

    def accept_invitation(self, token, user):
        invite = self.repo.get_active_invitation_by_token(token)
        if not invite:
            return {"error": "This invitation link is invalid or has already been used.", "status": 400}

        project = invite.project

        if project.created_by == user:
            return {"error": "You are the owner of this project and already have full access.", "status": 400}

        if self.repo.check_membership_exists(user, project):
            return {
                "error": "You are already a member of this project.",
                "project_id": project.id,
                "status": 400
            }

        self.repo.create_membership(user, project)
        
        invite.is_accepted = True
        invite.save()
        
        return {
            "message": f"Welcome to the team! You've joined {project.name}.",
            "project_id": project.id,
            "status": 200
        }
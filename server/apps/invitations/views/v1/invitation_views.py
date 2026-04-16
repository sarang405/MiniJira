from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from common.permissions.project_permissions import IsProjectAdmin
from ...services.invitation_service import InvitationService

class CreateInviteView(APIView):
    permission_classes = [IsAuthenticated, IsProjectAdmin]

    def post(self, request, project_id):
        service = InvitationService()
        result = service.generate_invite_link(project_id, request.user)
        return Response(result, status=status.HTTP_201_CREATED)

class AcceptInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, token):
        service = InvitationService()
        result = service.accept_invitation(token, request.user)
        
        if "error" in result:
            error_status = result.pop("status", status.HTTP_400_BAD_REQUEST)
            return Response(result, status=error_status)
            
        return Response(result, status=status.HTTP_200_OK)
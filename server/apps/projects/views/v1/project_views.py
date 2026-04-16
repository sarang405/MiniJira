from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ...serializers.project_serializer import ProjectSerializer
from ...services.project_service import ProjectService
from ...repositories.project_repositories import ProjectRepository
from common.permissions.project_permissions import IsProjectMember
from common.pagination.standard_pagination import StandardResultsSetPagination

class ProjectView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('search', None)
        
        service = ProjectService()
        
        
        projects = service.get_organized_projects(request.user, search=search_query)
        
        created_page = self.paginate_queryset(projects['created'])
        joined_page = self.paginate_queryset(projects['joined'])

        return Response({
            "my_projects": self.get_serializer(created_page, many=True).data if created_page is not None else self.get_serializer(projects['created'], many=True).data,
            "joined_projects": self.get_serializer(joined_page, many=True).data if joined_page is not None else self.get_serializer(projects['joined'], many=True).data,
            "count": projects['all'].count()
        })
class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        stats = ProjectRepository.get_dashboard_stats(request.user)
        return Response(stats)

class ProjectAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]
    def get(self, request, project_id):
        service = ProjectService()
        data = service.get_project_analytics(project_id)
        return Response(data)

class SidebarView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({
            "navigation": [
                {"name": "Dashboard", "icon": "grid", "link": "/dashboard"},
                {"name": "My Projects", "icon": "folder-plus", "link": "/my-projects"},
                {"name": "Joined Projects", "icon": "folder-shared", "link": "/joined-projects"},
                {"name": "My Task", "icon": "check-circle", "link": "/my-tasks"},
                {"name": "Messages", "icon": "message-square", "link": "/messages"},
                {"name": "Contacts", "icon": "users", "link": "/contact"}
            ]
        })


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def get(self, request, pk):
        service = ProjectService()
        project = service.get_project_details(pk, request.user)
        
        if not project:
            return Response(
                {"detail": "Project not found or access denied."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = ProjectSerializer(project, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        service = ProjectService()
        project = service.get_project_details(pk, request.user)

        if not project:
            return Response(
                {"detail": "Project not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if project.created_by != request.user:
            return Response(
                {"detail": "You do not have permission to delete this project."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        project.delete()
        return Response(
            {"detail": "Project deleted successfully."}, 
            status=status.HTTP_204_NO_CONTENT
        )
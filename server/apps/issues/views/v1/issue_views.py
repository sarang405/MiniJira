from rest_framework import generics, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from ...models import Issue, Comment, Attachment, Activity, Tag
from ...serializers.issue_serializer import IssueSerializer, CommentSerializer, AttachmentSerializer, TagSerializer

from ...services.issue_service import IssueService, CommentService
from ...repositories.issue_repository import IssueRepository
from ...repositories.comment_repository import CommentRepository

from common.permissions.project_permissions import IsProjectMember
from common.pagination.standard_pagination import StandardResultsSetPagination
from ...serializers.activity_serializer import ActivitySerializer




class IssueFilter(django_filters.FilterSet):
    min_date = django_filters.DateFilter(field_name="due_date", lookup_expr='gte')
    max_date = django_filters.DateFilter(field_name="due_date", lookup_expr='lte')

    class Meta:
        model = Issue
        fields = ['status', 'assignee', 'priority', 'project', 'min_date', 'max_date']



class IssueView(generics.ListCreateAPIView):
    serializer_class = IssueSerializer
    permission_classes = [IsProjectMember]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = IssueFilter
    search_fields = ['title', 'description']

    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        return IssueRepository.get_issues_by_project(project_id)

    def list(self, request, *args, **kwargs):
        if not request.query_params.get('project'):
            return Response({"error": "project id required"}, status=400)
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        IssueService().validate_and_create_issue(
            self.request.user, serializer.validated_data, serializer
        )

    def get_serializer_context(self):
        return {'request': self.request}



class IssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsProjectMember]

    def perform_update(self, serializer):
        IssueService().validate_and_update_issue(
            self.request.user, self.get_object(), serializer.validated_data, serializer
        )

    def get_serializer_context(self):
        return {'request': self.request}



class MyTasksView(generics.ListAPIView):
    serializer_class = IssueSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = IssueFilter
    search_fields = ['title', 'description', 'project__name']

    def get_queryset(self):
        return IssueRepository.get_my_tasks(self.request.user).select_related(
            'project', 'assignee'
        )

    def get_serializer_context(self):
        return {'request': self.request}



class CommentView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        issue_id = self.request.query_params.get('issue')
        return CommentRepository.get_comments_by_issue(issue_id)

    def perform_create(self, serializer):
        CommentService().validate_and_create_comment(
            self.request.user,
            serializer.validated_data,
            serializer
        )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        CommentService().validate_and_update_comment(
            self.request.user,
            self.get_object(),
            serializer
        )

    def perform_destroy(self, instance):
        CommentService().validate_and_delete_comment(
            self.request.user,
            instance
        )



class AttachmentUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        issue_id = request.data.get('issue')

        if not file or not issue_id:
            return Response({"error": "File and issue required"}, status=400)

        try:
            issue = Issue.objects.get(id=issue_id)
        except Issue.DoesNotExist:
            return Response({"error": "Issue not found"}, status=404)

        attachment = Attachment.objects.create(
            issue=issue,
            file=file
        )

        serializer = AttachmentSerializer(
            attachment,
            context={'request': request}
        )

        return Response(serializer.data, status=201)



class AttachmentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            attachment = Attachment.objects.get(id=pk)

            if (
                attachment.issue.created_by != request.user
                and attachment.issue.assignee != request.user
            ):
                return Response({"error": "Not allowed"}, status=403)

            attachment.delete()
            return Response({"message": "Deleted"}, status=204)

        except Attachment.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
        
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated



class ActivityListView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        print("PROJECT ID RECEIVED:", project_id)


        if project_id:
            return Activity.objects.filter(
                issue__project_id=project_id
            ).select_related('user', 'issue').order_by('-created_at')

        return Activity.objects.none()
    
class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
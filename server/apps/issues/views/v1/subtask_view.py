from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from ...models import SubTask, Issue
from ...serializers.subtask_serializer import SubTaskSerializer


class SubTaskListCreateView(generics.ListCreateAPIView):
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        issue_id = self.request.query_params.get('issue')
        return SubTask.objects.filter(issue_id=issue_id)

    def perform_create(self, serializer):
        issue_id = self.request.data.get('issue')
        issue = Issue.objects.get(id=issue_id)
        serializer.save(issue=issue)


class SubTaskToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        subtask = SubTask.objects.get(id=pk)
        subtask.is_done = not subtask.is_done
        subtask.save()
        return Response({"status": "updated"})


class SubTaskDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        subtask = SubTask.objects.get(id=pk)
        subtask.delete()
        return Response({"status": "deleted"}, status=204)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q

from ...services.communication_service import CommunicationService
from ...serializers.communication_serializer import MessageSerializer, NotificationSerializer

User = get_user_model()



class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            service = CommunicationService()

            notifications = service.get_all_notifications(request.user)[:50]

            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data)

        except Exception as e:
            print("NOTIFICATION ERROR:", e)
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        CommunicationService().mark_all_as_read(request.user)
        return Response({"message": "All notifications marked as read"})



class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = request.user.notifications.filter(is_read=False).count()
        return Response({"unread": count})



class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = request.user.notifications.filter(id=pk).first()

        if not notification:
            return Response({"error": "Notification not found"}, status=404)

        notification.is_read = True
        notification.save()

        return Response({"message": "Notification marked as read"})



class ChatMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        service = CommunicationService()
        messages = service.get_chat_history(request.user, project_id)

        if messages is None:
            return Response({"error": "Not a member"}, status=403)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        service = CommunicationService()

       
        if not request.data.get("content"):
            return Response({"error": "Message cannot be empty"}, status=400)

        serializer = MessageSerializer(data=request.data)

        if serializer.is_valid():
            success = service.send_message(request.user, project_id, serializer)

            if success:
                return Response(
                    MessageSerializer(serializer.instance).data,
                    status=201
                )

            return Response({"error": "Not allowed"}, status=403)

        return Response(serializer.errors, status=400)



class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search_query = request.query_params.get('search', '')

        users = User.objects.all()

        if search_query:
            users = users.filter(
                Q(username__icontains=search_query) |
                Q(email__icontains=search_query)
            )

        data = [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": "Member"
            }
            for u in users
        ]

        return Response(data)
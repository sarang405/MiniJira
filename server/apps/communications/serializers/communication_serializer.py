from rest_framework import serializers
from ..models import Message, Notification


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'content', 'timestamp']
        read_only_fields = ['sender', 'timestamp']


class NotificationSerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Notification
        fields = [
            'id',
            'type',            
            'message',
            'reference_id',    
            'project',
            'project_name',
            'is_read',
            'created_at'
        ]
        read_only_fields = ['created_at']
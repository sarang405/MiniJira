from rest_framework import serializers
from ..models import SubTask

class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ['id', 'issue', 'title', 'is_done', 'created_at']
        read_only_fields = ['created_at']
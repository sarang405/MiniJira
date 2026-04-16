from rest_framework import serializers
from ..models import Activity
from django.contrib.auth import get_user_model

User = get_user_model()

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class ActivitySerializer(serializers.ModelSerializer):
    user_detail = UserMiniSerializer(source='user', read_only=True)

    class Meta:
        model = Activity
        fields = [
            'id',
            'user',
            'user_detail',
            'issue',
            'action',
            'description',
            'created_at'
        ]
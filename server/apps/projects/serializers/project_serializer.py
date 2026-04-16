from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Project, Membership
from apps.issues.models import Issue 

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class IssueSimpleSerializer(serializers.ModelSerializer):
    assignee = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = Issue
        fields = ['id', 'title', 'status', 'priority', 'assignee', 'due_date']


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    role_label = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = Membership
        fields = ['user', 'role', 'role_label']


class ProjectSerializer(serializers.ModelSerializer):
    members = MembershipSerializer(many=True, read_only=True, source='memberships')
    tasks = IssueSimpleSerializer(many=True, read_only=True, source='issues')
    
    created_by = UserSimpleSerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    issue_count = serializers.IntegerField(source='issues.count', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'created_by', 'members', 'tasks',
            'progress_percentage', 'issue_count', 'deadline', 'created_at',
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_progress_percentage(self, obj):
        try:
            total = obj.issues.count()
            if total == 0:
                return 0
            done = obj.issues.filter(status='done').count()
            return int((done / total) * 100)
        except Exception:
            return 0

    def create(self, validated_data):
        request = self.context.get('request')
        
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError("User not found in request")

        user = request.user

        project = Project.objects.create(
            created_by=user,
            **validated_data
        )

        Membership.objects.get_or_create(
            user=user,
            project=project,
            defaults={'role': 'admin'}
        )

        return project
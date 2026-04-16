from datetime import date
import re

from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Issue, Comment, Attachment, Tag
from .subtask_serializer import SubTaskSerializer

User = get_user_model()



class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']



class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "color"]



class AttachmentSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ['id', 'file', 'uploaded_at']

    def get_file(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url



class IssueSerializer(serializers.ModelSerializer):

    assignee_detail = UserMinimalSerializer(source='assignee', read_only=True)
    project_name = serializers.SerializerMethodField()

    assignee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )

    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    attachments = serializers.SerializerMethodField()

    subtasks = SubTaskSerializer(many=True, read_only=True)

    def get_attachments(self, obj):
        request = self.context.get('request')
        serializer = AttachmentSerializer(
            obj.attachments.all(),
            many=True,
            context={'request': request}
        )
        return serializer.data

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    
    def create(self, validated_data):
        tags = validated_data.pop("tag_ids", [])
        issue = super().create(validated_data)
        issue.tags.set(tags)
        return issue

    def update(self, instance, validated_data):
        tags = validated_data.pop("tag_ids", None)
        issue = super().update(instance, validated_data)
        if tags is not None:
            issue.tags.set(tags)
        return issue
     # make sure this is at the top

    

    
    class Meta:
        model = Issue
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',

            'assignee',
            'assignee_detail',

            'project',
            'project_name',

            'created_by',
            'created_at',
            'updated_at',
            'due_date',

            'story',

            'tags',
            'tag_ids',

            'attachments',
            'subtasks',
        ]

        read_only_fields = [
            'created_by',
            'created_at',
            'updated_at'
        ]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value
    
    def validate_title(self, value):
        value = value.strip()

        if not re.match(r'^[A-Za-z][A-Za-z0-9\s\-]*$', value):
            raise serializers.ValidationError(
                "Title must start with a letter and can contain letters, numbers, spaces, and hyphens."
            )

        return value
    
    def validate_due_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value



class CommentSerializer(serializers.ModelSerializer):

    author_detail = UserMinimalSerializer(source='author', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'issue',

            'author',
            'author_detail',

            'content',

            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'author',
            'created_at',
            'updated_at'
        ]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Comment cannot be empty")
        return value
from django.shortcuts import get_object_or_404
from ..models import Comment


class CommentRepository:
    """
    Repository layer for Comment model.
    Handles all database interactions related to comments.
    """

    @staticmethod
    def get_comments_by_issue(issue_id):
        """
        Get all comments for a specific issue.
        Optimized with select_related for author.
        """
        return Comment.objects.filter(
            issue_id=issue_id
        ).select_related('author').order_by('-created_at')

    @staticmethod
    def get_comment_or_404(comment_id):
        """
        Retrieve a single comment or raise 404.
        """
        return get_object_or_404(Comment, id=comment_id)

    @staticmethod
    def save_comment(serializer, **extra_data):
        """
        Save a comment (create or update).
        """
        return serializer.save(**extra_data)

    @staticmethod
    def delete_comment(instance):
        """
        Delete a comment instance.
        """
        instance.delete()
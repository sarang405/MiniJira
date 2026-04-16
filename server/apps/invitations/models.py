from django.db import models
from django.conf import settings
from apps.projects.models import Project
import uuid

User = settings.AUTH_USER_MODEL


class Invitation(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Invite to {self.project}"
from django.db import models
from django.conf import settings
from apps.projects.models import Project

User = settings.AUTH_USER_MODEL

class Message(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']



class Notification(models.Model):
    TYPE_CHOICES = (
        ('task_assigned', 'Task Assigned'),
        ('task_updated', 'Task Updated'),
        ('invite', 'Invite'),
        ('deadline', 'Deadline'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)  


    type = models.CharField(max_length=50, choices=TYPE_CHOICES)

    message = models.TextField()

    reference_id = models.IntegerField(null=True, blank=True)

    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.type}"
# Create your models here.

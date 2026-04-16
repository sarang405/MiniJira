from django.db import models
from django.conf import settings
from apps.projects.models import Project

User = settings.AUTH_USER_MODEL



class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=20, default="gray")

    def __str__(self):
        return self.name



class Issue(models.Model):
    STATUS_CHOICES = (
        ('backlog', 'Backlog'),
        ('todo', 'Todo'),
        ('in_progress', 'In Progress'),
        ('in_review', 'In Review'),
        ('done', 'Done'),
    )

    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='backlog'
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )

    assignee = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_issues'
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='issues'
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_issues'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(null=True, blank=True)
    story = models.TextField(blank=True, null=True)

    
    tags = models.ManyToManyField(Tag, blank=True, related_name="issues")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.status} ({self.priority})"



class Comment(models.Model):
    issue = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE,
        related_name='comments'
    )

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments'
    )

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.author} on {self.issue.title}"



class Attachment(models.Model):
    issue = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    file = models.FileField(upload_to='attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)



class Activity(models.Model):
    ACTION_CHOICES = (
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned'),
        ('story_updated', 'Story Updated'),
        ('comment_added', 'Comment Added'),
        ('created', 'Created'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    issue = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']



class SubTask(models.Model):
    issue = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE,
        related_name='subtasks'
    )
    title = models.CharField(max_length=255)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({'Done' if self.is_done else 'Pending'})"
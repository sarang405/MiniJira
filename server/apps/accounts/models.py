from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    last_seen = models.DateTimeField(null=True, blank=True)  

    def __str__(self):
        return self.username
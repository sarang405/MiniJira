from .base import *
import dj_database_url

DEBUG = True
ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': dj_database_url.config(
        default=env('DATABASE_URL')
    )
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
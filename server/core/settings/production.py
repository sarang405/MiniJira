from .base import *
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

DATABASES = {
    'default': dj_database_url.config(
        default=env('DATABASE_URL')
    )
}

CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = True
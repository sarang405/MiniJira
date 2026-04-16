from rest_framework import serializers
from ..models import Invitation


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ['id', 'project', 'token', 'created_at']
        read_only_fields = ['token']
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRepository:
    @staticmethod
    def get_user_by_id(user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def create_user(validated_data):
        return User.objects.create_user(**validated_data)
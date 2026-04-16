from ..models import Activity

class ActivityService:

    @staticmethod
    def log(user, issue, action, description):
        Activity.objects.create(
            user=user,
            issue=issue,
            action=action,
            description=description
        )
from ..repositories.project_repositories import ProjectRepository

class ProjectService:
    def __init__(self):
        self.repo = ProjectRepository()

    def get_organized_projects(self, user, search=None):
        queryset = self.repo.get_user_projects_queryset(user)
        
        if search:
            queryset = queryset.filter(name__icontains=search)

        return {
            "all": queryset,
            "created": queryset.filter(created_by=user),
            "joined": queryset.exclude(created_by=user)
        }

    def get_project_analytics(self, project_id):
        all_issues, active_issues, monthly_growth = self.repo.get_analytics_data(project_id)
        
        backlog_count = all_issues.filter(status='backlog').count()
        total_active = active_issues.count()

        if total_active == 0:
            return {
                "total_active": 0,
                "backlog_waiting": backlog_count,
                "completion_percentage": 0,
                "counts": {"done": 0, "in_progress": 0, "todo": 0}
            }

        done_count = active_issues.filter(status='done').count()
        progress_count = active_issues.filter(status='in_progress').count()
        todo_count = active_issues.filter(status='todo').count()

        return {
            "project_id": project_id,
            "total_active_issues": total_active,
            "backlog_count": backlog_count,
            "counts": {"done": done_count, "in_progress": progress_count, "todo": todo_count},
            "percentages": {
                "completed": round((done_count / total_active) * 100, 1),
                "in_progress": round((progress_count / total_active) * 100, 1),
            },
            "monthly_growth": monthly_growth
        }
    
    def get_project_details(self, project_id, user):
        project = self.repo.get_project_by_id(project_id, user)
        if not project:
            return None
        return project
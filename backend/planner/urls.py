from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SubjectViewSet,
    AssignmentViewSet,
    ExamViewSet,
    StudySessionViewSet,
    dashboard_summary,
    progress_stats,
    signup,
    login,
    me,
)

router = DefaultRouter()
router.register(r"subjects", SubjectViewSet, basename="subject")
router.register(r"assignments", AssignmentViewSet, basename="assignment")
router.register(r"exams", ExamViewSet, basename="exam")
router.register(r"sessions", StudySessionViewSet, basename="session")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/summary/", dashboard_summary, name="dashboard-summary"),
    path("progress/", progress_stats, name="progress-stats"),
    path("auth/signup/", signup, name="auth-signup"),
    path("auth/login/", login, name="auth-login"),
    path("auth/me/", me, name="auth-me"),
]
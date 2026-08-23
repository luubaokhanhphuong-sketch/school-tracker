from datetime import date, timedelta

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Case, When, IntegerField, Sum
from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Subject, Assignment, Exam, StudySession
from .serializers import (
    SubjectSerializer,
    AssignmentSerializer,
    ExamSerializer,
    StudySessionSerializer,
    ProgressSerializer,
    UserSerializer,
    SignupSerializer,
)


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer

    def get_queryset(self):
        return Subject.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        qs = Assignment.objects.select_related("subject").filter(
            subject__owner=self.request.user
        )
        status_filter = self.request.query_params.get("status")
        priority_filter = self.request.query_params.get("priority")
        subject_filter = self.request.query_params.get("subject")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if priority_filter:
            qs = qs.filter(priority=priority_filter)
        if subject_filter:
            qs = qs.filter(subject_id=subject_filter)
        return qs.annotate(
            status_rank=Case(
                When(status=Assignment.Status.TODO, then=0),
                When(status=Assignment.Status.IN_PROGRESS, then=1),
                default=2,
                output_field=IntegerField(),
            ),
            priority_rank=Case(
                When(priority=Assignment.Priority.HIGH, then=0),
                When(priority=Assignment.Priority.MEDIUM, then=1),
                default=2,
                output_field=IntegerField(),
            ),
        ).order_by("status_rank", "priority_rank", "deadline")


class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer

    def get_queryset(self):
        qs = Exam.objects.select_related("subject").filter(
            subject__owner=self.request.user
        )
        if self.request.query_params.get("upcoming"):
            qs = qs.filter(exam_date__gte=date.today())
        return qs


class StudySessionViewSet(viewsets.ModelViewSet):
    serializer_class = StudySessionSerializer

    def get_queryset(self):
        qs = StudySession.objects.select_related("subject").filter(
            subject__owner=self.request.user
        )
        month = self.request.query_params.get("month")
        if month:
            try:
                year, mon = (int(x) for x in month.split("-"))
                qs = qs.filter(date__year=year, date__month=mon)
            except (ValueError, AttributeError):
                pass
        return qs


@api_view(["GET"])
def dashboard_summary(request):
    today = date.today()
    week_ahead = today + timedelta(days=7)

    assignments = Assignment.objects.select_related("subject").filter(
        subject__owner=request.user
    )
    todo_today = assignments.filter(
        deadline=today
    ).exclude(status=Assignment.Status.COMPLETED).count()
    overdue = assignments.filter(
        deadline__lt=today
    ).exclude(status=Assignment.Status.COMPLETED).count()

    tasks = assignments.exclude(status=Assignment.Status.COMPLETED)
    upcoming_deadlines = list(
        tasks.filter(deadline__gte=today)
        .order_by("deadline", "-priority")
        .values(
            "id",
            "title",
            "deadline",
            "priority",
            "status",
            "subject__name",
            "subject__color",
            "subject__icon",
        )[:5]
    )
    for task in upcoming_deadlines:
        task["subject_name"] = task.pop("subject__name")
        task["subject_color"] = task.pop("subject__color")
        task["subject_icon"] = task.pop("subject__icon")

    upcoming_exams = list(
        Exam.objects.select_related("subject")
        .filter(subject__owner=request.user, exam_date__gte=today)
        .order_by("exam_date")
        .values(
            "id",
            "title",
            "exam_date",
            "notes",
            "subject__name",
            "subject__color",
            "subject__icon",
        )[:5]
    )
    for exam in upcoming_exams:
        exam["subject_name"] = exam.pop("subject__name")
        exam["subject_color"] = exam.pop("subject__color")
        exam["subject_icon"] = exam.pop("subject__icon")
        exam["days_left"] = (exam["exam_date"] - today).days

    today_sessions = list(
        StudySession.objects.select_related("subject")
        .filter(subject__owner=request.user, date=today)
        .values(
            "id",
            "title",
            "date",
            "start_time",
            "duration_minutes",
            "completed",
            "subject__name",
            "subject__color",
            "subject__icon",
        )
    )
    for session in today_sessions:
        session["subject_name"] = session.pop("subject__name")
        session["subject_color"] = session.pop("subject__color")
        session["subject_icon"] = session.pop("subject__icon")

    total = assignments.count()
    completed = assignments.filter(status=Assignment.Status.COMPLETED).count()
    completion = round((completed / total * 100) if total else 0, 1)

    session_stats = StudySession.objects.filter(
        subject__owner=request.user
    ).aggregate(total_minutes=Sum("duration_minutes"))

    return Response(
        {
            "today": today.isoformat(),
            "todo_today": todo_today,
            "overdue": overdue,
            "upcoming_deadlines": upcoming_deadlines,
            "upcoming_exams": upcoming_exams,
            "today_sessions": today_sessions,
            "completion_percentage": completion,
            "total_assignments": total,
            "completed_assignments": completed,
            "total_study_minutes": session_stats["total_minutes"] or 0,
            "upcoming_deadline_count": tasks.filter(
                deadline__lte=week_ahead, deadline__gte=today
            ).count(),
            "pending_tasks": tasks.count(),
        }
    )


@api_view(["GET"])
def progress_stats(request):
    today = date.today()
    assignments = Assignment.objects.filter(subject__owner=request.user)
    total = assignments.count()
    completed = assignments.filter(status=Assignment.Status.COMPLETED).count()
    completion = round((completed / total * 100) if total else 0, 1)

    sessions = StudySession.objects.filter(subject__owner=request.user)
    total_minutes = sessions.aggregate(Sum("duration_minutes"))[
        "duration_minutes__sum"
    ] or 0

    subject_progress = []
    for subject in Subject.objects.filter(owner=request.user).prefetch_related(
        "assignments"
    ):
        sub_total = subject.assignments.count()
        sub_done = subject.assignments.filter(
            status=Assignment.Status.COMPLETED
        ).count()
        subject_progress.append(
            {
                "id": subject.id,
                "name": subject.name,
                "color": subject.color,
                "icon": subject.icon,
                "total": sub_total,
                "completed": sub_done,
                "percentage": round(
                    (sub_done / sub_total * 100) if sub_total else 0, 1
                ),
            }
        )
    subject_progress.sort(key=lambda s: s["percentage"], reverse=True)

    data = {
        "total_assignments": total,
        "completed_assignments": completed,
        "completion_percentage": completion,
        "total_study_minutes": total_minutes,
        "total_sessions": sessions.count(),
        "completed_sessions": sessions.filter(completed=True).count(),
        "upcoming_exams": Exam.objects.filter(
            subject__owner=request.user, exam_date__gte=today
        ).count(),
        "subject_progress": subject_progress,
        "today": today.isoformat(),
    }
    return Response(ProgressSerializer(data).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {"token": token.key, "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user is None:
        return Response(
            {"detail": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST
        )
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": UserSerializer(user).data})


@api_view(["GET"])
def me(request):
    return Response(UserSerializer(request.user).data)
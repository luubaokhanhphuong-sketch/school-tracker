from django.conf import settings
from django.db import models


class Subject(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subjects",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=120)
    color = models.CharField(max_length=9, default="#6366f1")
    icon = models.CharField(max_length=8, default="📘")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Assignment(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class Status(models.TextChoices):
        TODO = "todo", "Todo"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    title = models.CharField(max_length=200)
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="assignments"
    )
    description = models.TextField(blank=True, default="")
    deadline = models.DateField(null=True, blank=True)
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.TODO
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["status", "priority", "deadline"]

    def __str__(self):
        return self.title


class Exam(models.Model):
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="exams"
    )
    title = models.CharField(max_length=200, blank=True, default="")
    exam_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["exam_date"]

    def __str__(self):
        return f"{self.subject} — {self.exam_date}"


class StudySession(models.Model):
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="sessions"
    )
    title = models.CharField(max_length=200, blank=True, default="")
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=60)
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.subject} — {self.date}"
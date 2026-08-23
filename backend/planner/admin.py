from django.contrib import admin
from .models import Subject, Assignment, Exam, StudySession


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "color", "icon"]


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ["title", "subject", "priority", "status", "deadline"]
    list_filter = ["priority", "status"]


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ["subject", "exam_date", "title"]


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ["subject", "date", "start_time", "duration_minutes", "completed"]
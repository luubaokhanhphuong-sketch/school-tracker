from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Subject, Assignment, Exam, StudySession


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, min_length=6, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class SubjectSerializer(serializers.ModelSerializer):
    pending_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ["id", "name", "color", "icon", "created_at", "pending_tasks"]

    def get_pending_tasks(self, obj):
        return obj.assignments.exclude(status=Assignment.Status.COMPLETED).count()


class AssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_color = serializers.CharField(source="subject.color", read_only=True)
    subject_icon = serializers.CharField(source="subject.icon", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "title",
            "subject",
            "subject_name",
            "subject_color",
            "subject_icon",
            "description",
            "deadline",
            "priority",
            "status",
            "created_at",
        ]


class ExamSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_color = serializers.CharField(source="subject.color", read_only=True)
    subject_icon = serializers.CharField(source="subject.icon", read_only=True)

    class Meta:
        model = Exam
        fields = [
            "id",
            "subject",
            "subject_name",
            "subject_color",
            "subject_icon",
            "title",
            "exam_date",
            "start_time",
            "notes",
            "created_at",
        ]


class StudySessionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_color = serializers.CharField(source="subject.color", read_only=True)
    subject_icon = serializers.CharField(source="subject.icon", read_only=True)

    class Meta:
        model = StudySession
        fields = [
            "id",
            "subject",
            "subject_name",
            "subject_color",
            "subject_icon",
            "title",
            "date",
            "start_time",
            "duration_minutes",
            "completed",
            "notes",
        ]


class ProgressSerializer(serializers.Serializer):
    total_assignments = serializers.IntegerField()
    completed_assignments = serializers.IntegerField()
    completion_percentage = serializers.FloatField()
    total_study_minutes = serializers.IntegerField()
    total_sessions = serializers.IntegerField()
    completed_sessions = serializers.IntegerField()
    upcoming_exams = serializers.IntegerField()
    subject_progress = serializers.ListField(child=serializers.DictField())
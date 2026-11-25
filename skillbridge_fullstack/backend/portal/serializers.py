from django.contrib.auth.models import User
from rest_framework import serializers
from .models import StudentProfile, Job, Application

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        StudentProfile.objects.create(user=user)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    class Meta:
        model = StudentProfile
        fields = ["username", "email", "phone", "education", "skills", "bio"]

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["created_at"]

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company = serializers.CharField(source="job.company", read_only=True)
    location = serializers.CharField(source="job.location", read_only=True)
    class Meta:
        model = Application
        fields = ["id", "job", "job_title", "company", "location", "status", "applied_at"]
        read_only_fields = ["status", "applied_at"]

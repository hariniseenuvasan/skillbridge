from django.db import models
from django.contrib.auth.models import User

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, blank=True)
    education = models.CharField(max_length=150, blank=True)
    skills = models.TextField(blank=True, help_text="Comma-separated skills")
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

class Job(models.Model):
    title = models.CharField(max_length=120)
    company = models.CharField(max_length=120)
    location = models.CharField(max_length=120)
    job_type = models.CharField(max_length=40, default="Full-time")
    description = models.TextField()
    required_skills = models.CharField(max_length=250, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} - {self.company}"

class Application(models.Model):
    STATUS_CHOICES = [
        ("Applied", "Applied"), ("Shortlisted", "Shortlisted"),
        ("Rejected", "Rejected"), ("Selected", "Selected"),
    ]
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Applied")
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "job")
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.student.username} -> {self.job.title}"

from django.contrib import admin
from .models import StudentProfile, Job, Application

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "education")
    search_fields = ("user__username", "user__email")

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "location", "job_type", "is_active")
    list_filter = ("job_type", "is_active")
    search_fields = ("title", "company", "location")

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("student", "job", "status", "applied_at")
    list_filter = ("status",)
    list_editable = ("status",)

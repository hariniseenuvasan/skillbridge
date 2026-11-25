from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login_view),
    path("profile/", views.ProfileView.as_view()),
    path("jobs/", views.JobListCreateView.as_view()),
    path("jobs/<int:pk>/", views.JobDetailView.as_view()),
    path("jobs/<int:job_id>/apply/", views.apply_job),
    path("applications/", views.MyApplicationsView.as_view()),
    path("dashboard/", views.dashboard),
]

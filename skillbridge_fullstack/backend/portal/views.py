from django.contrib.auth import authenticate
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import StudentProfile, Job, Application
from .serializers import RegisterSerializer, ProfileSerializer, JobSerializer, ApplicationSerializer

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username}, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    user = authenticate(username=request.data.get("username"), password=request.data.get("password"))
    if not user:
        return Response({"detail": "Invalid username or password."}, status=status.HTTP_400_BAD_REQUEST)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username, "is_staff": user.is_staff})

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile

class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [permissions.AllowAny()]
    def get_queryset(self):
        qs = Job.objects.filter(is_active=True).order_by("-created_at")
        search = self.request.query_params.get("search")
        location = self.request.query_params.get("location")
        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(company__icontains=search) | qs.filter(required_skills__icontains=search)
        if location:
            qs = qs.filter(location__icontains=location)
        return qs

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminUser()]
        return [permissions.AllowAny()]

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_job(request, job_id):
    try:
        job = Job.objects.get(pk=job_id, is_active=True)
    except Job.DoesNotExist:
        return Response({"detail": "Job not found."}, status=404)
    application, created = Application.objects.get_or_create(student=request.user, job=job)
    if not created:
        return Response({"detail": "You have already applied for this job."}, status=400)
    return Response(ApplicationSerializer(application).data, status=201)

class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Application.objects.filter(student=self.request.user).select_related("job")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    return Response({
        "available_jobs": Job.objects.filter(is_active=True).count(),
        "my_applications": Application.objects.filter(student=request.user).count(),
        "shortlisted": Application.objects.filter(student=request.user, status="Shortlisted").count(),
    })

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from tasks.models import Task
from tasks.serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


@api_view(["GET"])
def health_check(_request):
    return Response({"status": "healthy", "service": "django-backend"})

from django.urls import include, path

from tasks.views import health_check


urlpatterns = [
    path("api/health/", health_check, name="health"),
    path("api/", include("tasks.urls")),
]

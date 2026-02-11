from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/health', views.health, name='health'),
    path('api/contact', views.api_contact, name='api_contact'),
    path('projects/notetube', views.notetube, name='notetube'),
    path('projects/rumv', views.rumv, name='rumv'),
]

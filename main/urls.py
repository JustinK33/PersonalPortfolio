from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/health', views.health, name='health'),
    path('api/contact', views.api_contact, name='api_contact'),
    path('projects/notetube', views.notetube, name='notetube'),
    path('projects/rumv', views.rumv, name='rumv'),
    path('projects/dailynode', views.dailynode, name='dailynode'),
    path('projects/gesture-control', views.gesturecontrol, name='gesturecontrol'),
    path('projects/linknest', views.linknest, name='linknest'),
]

from django.db import models

from django.utils import timezone
# Create your models here.

class Zone (models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Nombre Interno")
    display_name = models.CharField(max_length=100, verbose_name="Nombre Mostrado")
    created_at = models.DateTimeField(auto_now_add=True)


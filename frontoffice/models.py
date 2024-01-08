from API.models import UtilisateurAPI  
from django.db import models

class UtilisateurFront(models.Model):
    user = models.OneToOneField(UtilisateurAPI, on_delete=models.CASCADE, related_name='utilisateur_front')
    password = models.CharField(max_length=20)
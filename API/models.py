from django.db.models import CASCADE
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.db import models
from django.apps import apps
from django.db import models
from django.utils import timezone
from django.apps import AppConfig
from django.db.models import BigAutoField
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
import json
from django.utils.formats import localize
# Create your models here.

class BackofficeConfig(AppConfig):
    default_auto_field = BigAutoField()

class UtilisateurAPIManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None):
        user = self.create_user(username, email, password=password)
        user.is_admin = True
        user.save(using=self._db)
        return user

    def get_by_natural_key(self, username):
        return self.get(username=username)

class UtilisateurAPI(AbstractBaseUser):
    username = models.CharField(max_length=30, unique=True,default=None)
    email = models.EmailField(unique=True, default=None)
    password = models.CharField(max_length=128,default=None)
    STATUS_CHOICES = [
        ('Admin', 'Admin'),
        ('Client', 'Client'),
    ]
    status_utilisateur = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Client')

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = UtilisateurAPIManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True
    
    @property
    def utilisateurapi(self):
        return self

@receiver(post_save, sender=UtilisateurAPI)
def create_or_update_client_profile(sender, instance, created, **kwargs):
    if instance.status_utilisateur == 'Client':
        # Vérifiez si l'instance de Client existe déjà
        client_instance, client_created = Client.objects.get_or_create(utilisateur_client=instance)

        # Mettez à jour le champ email du Client associé avec l'e-mail de UtilisateurAPI
        client_instance.email = instance.email
        client_instance.save()

@receiver(post_delete, sender=UtilisateurAPI)
def delete_client_profile(sender, instance, **kwargs):
    if instance.status_utilisateur == 'Client':
        # Vérifiez si l'instance de Client existe avant de la supprimer
        try:
            client_instance = instance.client
            client_instance.delete()
        except Client.DoesNotExist:
            pass

@receiver(post_save, sender=UtilisateurAPI)
def save_client_profile(sender, instance, created, **kwargs):
    if instance.status_utilisateur == 'Client':
        # Vérifiez si l'instance de Client existe avant de la sauvegarder
        try:
            client_instance = instance.client
            client_instance.save()
        except Client.DoesNotExist:
            pass

class Client(models.Model):
    utilisateur_client = models.OneToOneField(UtilisateurAPI, on_delete=models.CASCADE, default=1)  # Set a default value, you can adjust this as needed
    nom_client = models.CharField(max_length=255,default='Unknown')
    prenom = models.CharField(max_length=255,default='Unknown')
    telephone = models.CharField(max_length=10,default='Unknown')
    email = models.EmailField(default='Unknown')
    adresse_client = models.TextField(default='Unknown')
    achats = models.DecimalField(max_digits=10, decimal_places=2, default=0) # lien vers des ventes historique
    derniere_date_achat = models.DateField(null=True, blank=True)
    NEWSLETTER_CHOICES = [
        ('Oui', 'oui'),
        ('Non', 'non'),
    ]
    newsletter = models.CharField(max_length=3, choices=NEWSLETTER_CHOICES, default='Non')

    def __str__(self):
        return f"{self.nom_client} {self.prenom}"

class Fournisseur(models.Model):
    nom_fournisseur = models.CharField(max_length=255, default='Unknown')
    adresse_fournisseur = models.TextField(default='Unknown')
    telephone = models.CharField(max_length=10, default='Unknown')
    email = models.EmailField(default='Unknown')
    type_produit = models.ManyToManyField('Produit', through='FournisseurProduit',related_name='fournisseurs_produits')

class Produit(models.Model):
    nom = models.CharField(max_length=255, default='Unknown')
    quantite = models.IntegerField(default=0)
    provenance = models.CharField(max_length=255, default='Unknown')
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date_reception = models.DateField(null=True, blank=True)
    fournisseur = models.ManyToManyField(Fournisseur, through='FournisseurProduit')

class FournisseurProduit(models.Model):
    id = models.AutoField(primary_key=True)
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)

class Stocks(models.Model):
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite_entree = models.IntegerField(default=0)
    quantite_sortie = models.IntegerField(default=0)
    date_achat = models.DateField(default=timezone.now) 

class AchatFournisseur(models.Model):
    prix = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite_achete = models.IntegerField(default=0)
    date_achat = models.DateField(default=timezone.now) 

class VenteClient(models.Model):
    utilisateur_client = models.ForeignKey(Client, on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite_vendue = models.IntegerField(default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    date_vente = models.DateField(default=timezone.now) 
    PAIEMENT_CHOICES = [
        ('Cheque', 'cheque'),
        ('CB', 'cb'),
        ('Especes', 'especes'),
    ]
    mode_paiement = models.CharField(max_length=50,choices=PAIEMENT_CHOICES)

class VenteQuotidienne(models.Model):
    date_achat = models.DateField(default=timezone.now) 
    total_ventes = models.DecimalField(max_digits=10, decimal_places=2)

class Depense(models.Model):
    description = models.TextField(default='Unknown')
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_achat = models.DateField(default=timezone.now) 

class Reservation(models.Model):
    nom=models.CharField(max_length=255, default='Unknown')
    prenom=models.CharField(max_length=255, default='Unknown')
    utilisateur = models.ForeignKey(Client, on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField(default=0)
    date_reservation = models.DateField(default=timezone.now) 
    STATUT_CHOICES = [
        ('Confirmé', 'Confirmé'),
        ('Annulé', 'Annulé'),
    ]
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES)
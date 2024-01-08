from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
# forms.py
from API.models import *
from frontoffice.models import UtilisateurFront

class ClientForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ['nom_client', 'prenom', 'telephone', 'email', 'adresse_client', 'achats', 'newsletter']

    newsletter = forms.ChoiceField(choices=Client.NEWSLETTER_CHOICES)

class ReservationForm(forms.ModelForm):
    # Ajoutez ce champ caché
    utilisateur = forms.IntegerField(widget=forms.HiddenInput(), required=False)
    class Meta:
        model = Reservation
        fields =['nom', 'prenom', 'produit', 'quantite', 'date_reservation', 'statut', 'utilisateur']

class ProduitForm(forms.ModelForm):
    class Meta:
        model = Produit
        fields = ['nom', 'date_reception', 'prix_unitaire', 'quantite', 'provenance', 'fournisseur']

class FournisseurForm(forms.ModelForm):
    class Meta:
        model = Fournisseur
        fields = ['adresse_fournisseur', 'telephone', 'type_produit', 'nom_fournisseur', 'email']
        
class SignUpForm(UserCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Enter a valid email address.')

    class Meta:
        model = UtilisateurAPI
        fields = ('username', 'email', 'password1', 'password2')
    
class LoginForm(AuthenticationForm):
    class Meta:
        model = UtilisateurAPI
        fields = ('username', 'password')

class AchatFournisseurForm(forms.ModelForm):
    class Meta:
        model = AchatFournisseur
        fields = ['prix', 'fournisseur', 'produit', 'quantite_achete', 'date_achat']
    
class VenteClientForm(forms.ModelForm):
    class Meta:
        model = VenteClient
        fields = ['utilisateur_client', 'quantite_vendue', 'produit', 'total', 'date_vente', 'mode_paiement']
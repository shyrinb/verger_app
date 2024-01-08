from API.models import *
from rest_framework import serializers
from django.contrib.auth.models import User

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilisateurAPI
        fields = '__all__'

class ClientSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()

    class Meta:
        model = Client
        fields = '__all__'

class FournisseurSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer()

    class Meta:
        model = Fournisseur
        fields = '__all__'

class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit  # Replace with the actual name of your Produit model
        fields = ['id', 'nom']  # Include all required fields

class StocksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stocks
        fields = '__all__'

class AchatFournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = AchatFournisseur
        fields = '__all__'

class VenteClientSerializer(serializers.ModelSerializer):
    utilisateur_client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), source='utilisateur_client', write_only=True)

    class Meta:
        model = VenteClient
        fields = ['id', 'utilisateur_client_id', 'produit', 'quantite_vendue', 'total', 'date_vente', 'mode_paiement']

class VenteQuotidienneSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenteQuotidienne
        fields = '__all__'

class DepenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depense
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    produit = ProduitSerializer()
    class Meta:
        model = Reservation
        fields = ['id', 'utilisateur_id', 'statut', 'nom', 'prenom', 'produit', 'quantite', 'date_reservation']


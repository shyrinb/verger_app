from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets
from .serializers import *
from .models import *

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('nom_client')
    serializer_class = ClientSerializer

class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all().order_by('nom_fournisseur')
    serializer_class = FournisseurSerializer

class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.all().order_by('nom')
    serializer_class = ProduitSerializer
    filter_fields = {
        'quantite': ['gte', 'lte']
    }
    
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().order_by('date_reservation')
    serializer_class = ReservationSerializer

class AchatFournisseurViewSet(viewsets.ModelViewSet):
    queryset = AchatFournisseur.objects.all().order_by('date_achat')
    serializer_class = AchatFournisseurSerializer

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = UtilisateurAPI.objects.all().order_by('username')
    serializer_class = UtilisateurSerializer

class VenteClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('utilisateur_client')
    serializer_class = VenteClientSerializer

class CountViewSet(APIView):
    def get(self, request, format=None):
        Produit_count = Produit.objects.all().count()
        Client_count =  Client.objects.all().count()
        Fournisseur_count = Fournisseur.objects.all().count()
        Achat_count = AchatFournisseur.objects.all().count()
        Vente_count = VenteClient.objects.all().count()
        Reservation_count= Reservation.objects.all().count()
        content = {
            'Produits_count': Produit_count,
            'Client_count':Client_count,
            'Fournisseur_count':Fournisseur_count,
            'Achat_count':Achat_count,
            'Vente_count':Vente_count,
            'Reservation_count':Reservation_count
        }
        return Response(content)
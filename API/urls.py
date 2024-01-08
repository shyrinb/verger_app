# API/urls.py
from django.urls import path
from django.urls import include, path
from rest_framework import routers
from . import views
from rest_framework import viewsets

router = routers.DefaultRouter()
router.register(r'clients', views.ClientViewSet, basename="client")
router.register(r'fournisseurs', views.FournisseurViewSet)
router.register(r'produits', views.ProduitViewSet)
router.register(r'achats', views.AchatFournisseurViewSet)
router.register(r'ventes', views.VenteClientViewSet)
router.register(r'users', views.UtilisateurViewSet)
router.register(r'reservations', views.ReservationViewSet)
# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('prod/count/', views.CountViewSet.as_view(), name='produits-count'),
    path('risk/', views.RiskViewSet.as_view(), name='risk'),
]
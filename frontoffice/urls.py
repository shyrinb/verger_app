"""frontoffice URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from frontoffice import views
from django.urls import include, path
from frontoffice.views import FournisseurView, VenteClientView,QuantiteUpdateMoreVenteView, QuantiteUpdateLessVenteView,FournisseursProduitView, QuantiteUpdateLessView,QuantiteUpdateMoreView,LoginView, ProduitQuantiteView, ProduitView, AchatFournisseurView, QuantiteDeleteView, ReservationAdminView,SignUpView, ProfileView, ReservationView,ClientView

urlpatterns = [
    path('', LoginView.as_view(), name='login'),
    path('inscription/', SignUpView.as_view(), name='inscription'),
    path('profil/', ProfileView.as_view(), name='profil'),
    path('reservation/', ReservationView.as_view(), name='reservation'),

    # CLIENT 
    path('client/', ClientView.as_view(), name='client_data'),
    path('client/<int:client_id>/', ClientView.as_view(), name='delete_client'),
    
    # FOURNISSEUR 
    path('fournisseur/', FournisseurView.as_view(), name='fournisseur_data'),
    path('fournisseur/del/<int:fournisseur_id>/', FournisseurView.as_view(), name='delete_fournisseur'),
    path('fournisseur/mod/<int:fournisseur_id>/', FournisseurView.as_view(), name='modify_fournisseur'),
    
    # PRODUIT
    path('produit/', ProduitView.as_view(), name='produit_data'),
    path('produit/del/<int:produit_id>/', ProduitView.as_view(), name='delete_produit'),
    path('produit/mod/<int:produit_id>/', ProduitView.as_view(), name='modify_produit'),

    # ACHAT
    path('achat/', AchatFournisseurView.as_view(), name='achat_data'),
    path('produit/quantite/<int:produit_id>/', ProduitQuantiteView.as_view(), name='produit_quantite'),  # mettre a jour la quantite dans produit pour un achat 
    path('produit/<int:produit_id>/fournisseurs/', FournisseursProduitView.as_view(), name='fournisseurs_produit'), # recuperer les produits par fournisseur
    
    path('achat/del/<int:achat_id>/', AchatFournisseurView.as_view(), name='delete_achat'),
    path('produit/del/quantite/<int:achat_fournisseur_id>/', QuantiteDeleteView.as_view(), name='quantite_delete'), # mettre a jour la quantite pour une suppression 

    #RESERVATION

    path('reservation/', ReservationView.as_view(), name='reservation_data'),
    path('reservation/admin/', ReservationAdminView.as_view(), name='reservation_admin_data'),
    path('produit/up/quantite/<int:reservation_id>/', QuantiteUpdateLessView.as_view(), name='quantite_update_more'), # mettre a jour la quantite pour une reservation 
    
    path('produit/down/quantite/<int:reservation_id>/', QuantiteUpdateMoreView.as_view(), name='quantite_update_less'),  # mettre a jour la quantite pour une modification 
    path('reservation/mod/<int:reservation_id>/', ReservationView.as_view(), name='reservation_modify'),

    #VENTE
    path('vente/', VenteClientView.as_view(), name='ventes_data'),
    path('produit/upvente/quantite/<int:vente_id>/', QuantiteUpdateLessVenteView.as_view(), name='quantite_update_vente_more'), # mettre a jour la quantite pour une vente 
    
    path('vente/del/<int:vente_id>/', VenteClientView.as_view(), name='delete_ventes'),
    path('produit/downvente/quantite/<int:vente_id>/', QuantiteUpdateMoreVenteView.as_view(), name='quantite_update_vente_more'), # mettre a jour la quantite pour une suppression de vente 

    path('vente/mod/<int:vente_id>/', VenteClientView.as_view(), name='modify_ventes'),
    
]
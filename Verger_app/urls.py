from django.urls import path
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.urls import path, include
from django.views.generic import TemplateView
from frontoffice.views import LoginView, UserInfoView,SignUpView

urlpatterns = [
    path('API/', include('API.urls')),
    path('', include('frontoffice.urls')),
    
    path('admindash/', TemplateView.as_view(template_name='frontoffice/master_page.html'), name='admindash_home'),
    path('admindash/statistiques/', TemplateView.as_view(template_name='frontoffice/page/statistiques.html'), name='admindash_statistiques'),
    path('admindash/produits/', TemplateView.as_view(template_name='frontoffice/page/produit.html'), name='admindash_produits'),
    path('admindash/clients/', TemplateView.as_view(template_name='frontoffice/page/client.html'), name='admindash_clients'),
    path('admindash/fournisseurs/', TemplateView.as_view(template_name='frontoffice/page/fournisseur.html'), name='admindash_fournisseurs'),
    path('admindash/achats/', TemplateView.as_view(template_name='frontoffice/page/achat.html'), name='admindash_achats'),
    path('admindash/profil/', TemplateView.as_view(template_name='frontoffice/page/profil.html'), name='admindash_profil'),
    path('admindash/reservations/', TemplateView.as_view(template_name='frontoffice/page/reservation.html'), name='admindash_reservations'),
    path('admindash/ventes/', TemplateView.as_view(template_name='frontoffice/page/vente.html'), name='admindash_ventes'),
    path('admindash/reservation/', TemplateView.as_view(template_name='frontoffice/page/gestion.html'), name='admindash_reservation'),
    
    path('admindash/userinfo/', UserInfoView.as_view(), name='userinfo'),
    path('admindash/logout.html', LoginView.as_view(), name='admindash_login'),
    path('', LoginView.as_view(), name='login'),
    path('inscription/', SignUpView.as_view(), name='inscription'),
]
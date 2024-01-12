
from http.client import ResponseNotReady
from django.contrib.auth import authenticate, login, logout
from django.http import *
import logging
from rest_framework.renderers import JSONRenderer
from django.http import JsonResponse
# Add this at the beginning of your script or module to configure logging
logging.basicConfig(level=logging.DEBUG)
from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView
from django.conf import settings
from django.contrib import messages
from API.backends import UtilisateurAPIBackend
from API.serializers import ReservationSerializer
from .forms import *
from API.models import  *
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView as AuthLoginView
from django.views import View
from .forms import ClientForm, FournisseurForm

class SignUpView(View):
    template_name = 'inscription.html'

    def get(self, request, *args, **kwargs):
        form = SignUpForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            if not user.username:
                user.username = None
            
            user.save()
            login(request, user)
            messages.success(request, 'Inscription réussie ! Vous êtes connecté.')
            return redirect('admindash_home')
        else:
            print(form.errors)
            messages.error(request, 'Erreur lors de l\'inscription. Veuillez vérifier vos informations.')
        return render(request, self.template_name, {'form': form})

def login_view(request):
    return render(request, "login.html",)

class LoginView(AuthLoginView):

  template_name = 'login.html'

  def post(self, request, **kwargs):

    username = request.POST.get('username', False)
    password = request.POST.get('password', False)
    user = UtilisateurAPIBackend().authenticate(request, username=username, password=password)

    if user is not None and user.is_active:
       # Connectez l'utilisateur
            login(request, user)
            messages.success(request, 'Connexion réussie')
            return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL)   
            
    messages.success(request, '')

    return render(request, self.template_name, {'user': request.user})

class LogoutView(TemplateView):

  template_name = 'login.html'

  def get(self, request, **kwargs):

    logout(request)

    return render(request, self.template_name)

class UserInfoView(View):
    def get(self, request, *args, **kwargs):
        user_info = {
            'status_utilisateur': request.user.status_utilisateur,
        }
        return JsonResponse(user_info)
    
#---------------------------------------------------------
    
class ProfileView(View):
    template_name = 'frontoffice/page/profil.html'

    def get(self, request, *args, **kwargs):
        client_instance, created = Client.objects.get_or_create(utilisateur_client=request.user.utilisateurapi)
        response_data = {
            'nom_client': client_instance.nom_client,
            'prenom': client_instance.prenom,
            'telephone': client_instance.telephone,
            'email': client_instance.email,
            'adresse_client': client_instance.adresse_client,
            'utilisateur_client_id': client_instance.utilisateur_client_id,
        }
        return JsonResponse(response_data)

    def put(self, request, *args, **kwargs):
        client_instance, created = Client.objects.get_or_create(utilisateur_client=request.user.utilisateurapi)
        form = ClientForm(request.POST, instance=client_instance)
        if form.is_valid():
            form.save()
            # Utilisez JsonResponse pour renvoyer des données JSON
            return JsonResponse({'success': True})
        # En cas d'erreur, renvoyez une réponse avec un statut d'erreur
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    
#---------------------------------------------------------

class ClientView(View):
    def get(self, request, *args, **kwargs):
        clients = Client.objects.all()
        client_data = []

        for client in clients:
            client_data.append({
                'id': client.id,
                'nom_client': client.nom_client,
                'prenom': client.prenom,
                'email': client.email,
                'adresse_client': client.adresse_client,
                'telephone': client.telephone,
            })

        return JsonResponse(client_data, safe=False)

    def delete(self, request, client_id, *args, **kwargs):
        try:
            client = get_object_or_404(Client, id=client_id)
            client.delete()
            return JsonResponse({'message': 'Client supprimé avec succès'})
        except Exception as e:
            print(f"Erreur lors de la suppression du client : {e}")
            return JsonResponse({'error': str(e)}, status=500)

#---------------------------------------------------------
        

class FournisseurView(View):
    def get(self, request, *args, **kwargs):
        try:
            fournisseurs = Fournisseur.objects.all()
            fournisseur_data = []

            for fournisseur in fournisseurs:
                type_produit_data = [{'id': tp.id, 'nom': tp.nom} for tp in fournisseur.type_produit.all()]

                fournisseur_data.append({
                    'id': fournisseur.id,
                    'nom_fournisseur': fournisseur.nom_fournisseur,
                    'adresse_fournisseur': fournisseur.adresse_fournisseur,
                    'telephone': fournisseur.telephone,
                    'email': fournisseur.email,
                    'type_produit': type_produit_data,
                    # Ajoutez d'autres champs selon vos besoins
                })

            logging.info("Fournisseurs récupérés avec succès : %s", fournisseur_data)
            return JsonResponse(fournisseur_data, safe=False)
        except Exception as e:
            logging.error("Erreur lors de la récupération des fournisseurs : %s", str(e))
            return JsonResponse({'error': str(e)}, status=500)

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            form = FournisseurForm(data)
            if form.is_valid():
                fournisseur = form.save()
                return JsonResponse({'id': fournisseur.id, 'message': 'Fournisseur créé avec succès'})
        except Exception as e:
            print(f"Erreur lors de la création du fournisseur : {e}")
            return JsonResponse({'error': str(e)}, status=500)

    def put(self, request, fournisseur_id, *args, **kwargs):
        try:
            fournisseur = get_object_or_404(Fournisseur, id=fournisseur_id)
            data = json.loads(request.body)
            fournisseur.nom_fournisseur = data.get('nom_fournisseur', fournisseur.nom_fournisseur)
            fournisseur.email = data.get('email', fournisseur.email)
            fournisseur.adresse_fournisseur = data.get('adresse_fournisseur', fournisseur.adresse_fournisseur)
            fournisseur.telephone = data.get('telephone', fournisseur.telephone)
            fournisseur.type_produit.set(data.get('type_produit', []))
            fournisseur.save()
            return JsonResponse({'message': 'Fournisseur modifié avec succès'})
        except Exception as e:
            print(f"Erreur lors de la modification du fournisseur : {e}")
            return JsonResponse({'error': str(e)}, status=500)

    def delete(self, request, fournisseur_id, *args, **kwargs):
        try:
            fournisseur = get_object_or_404(Fournisseur, id=fournisseur_id)
            fournisseur.delete()
            return JsonResponse({'message': 'Fournisseur supprimé avec succès'})
        except Exception as e:
            print(f"Erreur lors de la suppression du fournisseur : {e}")
            return JsonResponse({'error': str(e)}, status=500)
        
#---------------------------------------------------------
        

class ProduitView(View):
    def get(self, request, *args, **kwargs):
        try:
            produits = Produit.objects.all()
            produit_data = []

            for produit in produits:
                
                fournisseurs_data = []  # Initialisez une liste pour stocker les données des fournisseurs
                fournisseur_produits = FournisseurProduit.objects.filter(produit=produit)
                for fp in fournisseur_produits:
                    fournisseur = fp.fournisseur
                    fournisseurs_data.append({
                        'id': fournisseur.id,
                        'nom_fournisseur': fournisseur.nom_fournisseur,
                    })
                    
                produit_data.append({
                    'id': produit.id,
                    'date_reception': produit.date_reception,
                    'nom': produit.nom,
                    'prix_unitaire': produit.prix_unitaire,
                    'quantite': produit.quantite,
                    'provenance': produit.provenance,
                    'fournisseurs': fournisseurs_data,  # Correction ici
                })

            logging.info("Produits récupérés avec succès : %s", produit_data)
            return JsonResponse(produit_data, safe=False)
        except Exception as e:
            logging.error("Erreur lors de la récupération des produits : %s", str(e))
            return JsonResponse({'error': str(e)}, status=500)

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            form = ProduitForm(data)
            if form.is_valid():
                produit = form.save()
                return JsonResponse({'id': produit.id, 'message': 'Produit créé avec succès'})
            else:
                return JsonResponse({'error': form.errors}, status=400)
        except Exception as e:
            print(f"Erreur lors de la création du produit : {e}")
            return JsonResponse({'error': str(e)}, status=500)

    def put(self, request, produit_id, *args, **kwargs):
        try:
            produit = get_object_or_404(Produit, id=produit_id)
            data = json.loads(request.body)

            produit.date_reception = data.get('date_reception', produit.date_reception)
            produit.nom = data.get('nom', produit.nom)
            produit.prix_unitaire = data.get('prix_unitaire', produit.prix_unitaire)
            produit.quantite = data.get('quantite', produit.quantite)
            produit.provenance = data.get('provenance', produit.provenance)
            produit.save()
            
            return JsonResponse({'message': 'Produit modifié avec succès'})
        except Exception as e:
            print(f"Erreur lors de la modification du produit : {e}")
            return JsonResponse({'error': str(e)}, status=500)


    def delete(self, request, produit_id, *args, **kwargs):
        try:
            produit = get_object_or_404(Produit, id=produit_id)
            produit.delete()
            return JsonResponse({'message': 'Produit supprimé avec succès'})
        except Exception as e:
            print(f"Erreur lors de la suppression du produit : {e}")
            return JsonResponse({'error': str(e)}, status=500)
        


#---------------------------------------------------------
class AchatFournisseurView(View):
    def get(self, request, *args, **kwargs):
        try:
            achats_fournisseurs = AchatFournisseur.objects.all()
            achat_fournisseur_data = []

            for achat_fournisseur in achats_fournisseurs:
                achat_fournisseur_data.append({
                    'id': achat_fournisseur.id,
                    'prix': achat_fournisseur.prix,
                    'fournisseur': achat_fournisseur.fournisseur.nom_fournisseur,
                    'produit': achat_fournisseur.produit.nom,
                    'quantite_achete': achat_fournisseur.quantite_achete,
                    'date_achat': achat_fournisseur.date_achat,
                })

            logging.info("Achats Fournisseurs récupérés avec succès : %s", achat_fournisseur_data)
            return JsonResponse(achat_fournisseur_data, safe=False)
        except Exception as e:
            logging.error("Erreur lors de la récupération des achats fournisseurs : %s", str(e))
            return JsonResponse({'error': str(e)}, status=500)

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            print("Received data:", data)  # Ajoutez cette ligne pour voir les données dans la console
            form = AchatFournisseurForm(data)
            
            if form.is_valid():
                achat_fournisseur = form.save()
                return JsonResponse({'id': achat_fournisseur.id, 'message': 'Achat Fournisseur créé avec succès'})
            else:
                print("Form is not valid:", form.errors)  # Ajoutez cette ligne pour voir les erreurs de validation dans la console
                return JsonResponse({'error': 'Données invalides'}, status=400)
        except Exception as e:
            print(f"Erreur lors de la création de l'achat fournisseur : {e}")
            return JsonResponse({'error': str(e)}, status=500)

    def delete(self, request, *args, **kwargs):
        try:
            achat_fournisseur_id = kwargs.get('achat_id')  # Utilisez get pour récupérer l'ID
            print(f"ID à supprimer: {achat_fournisseur_id}")
            
            achat_fournisseur = get_object_or_404(AchatFournisseur, id=achat_fournisseur_id)
            achat_fournisseur.delete()
            
            return JsonResponse({'message': 'Achat Fournisseur supprimé avec succès'})
        except Exception as e:
            print(f"Erreur lors de la suppression de l'achat fournisseur : {e}")
            return JsonResponse({'error': str(e)}, status=500)


class FournisseursProduitView(View):
    def get(self, request, produit_id, *args, **kwargs):
        try:
            print("essaie de recuperer les fournisseurs selon le produit selectionnée")
            # Récupérez les fournisseurs liés au produit spécifié (ajustez selon votre modèle)
            fournisseurs = Fournisseur.objects.filter(type_produit=produit_id)
            # Construisez les données à renvoyer
            fournisseurs_data = [{'id': fournisseur.id, 'nom_fournisseur': fournisseur.nom_fournisseur} for fournisseur in fournisseurs]

            return JsonResponse(fournisseurs_data, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

class ProduitQuantiteView(View):
    def get(self, request, produit_id, *args, **kwargs):
        try:
            produit = Produit.objects.get(id=produit_id)
            return JsonResponse({'quantite': produit.quantite})
        except Produit.DoesNotExist:
            return JsonResponse({'error': 'Produit non trouvé'}, status=404)
        
class QuantiteDeleteView(View):
    def put(self, request, achat_fournisseur_id, *args, **kwargs):
        try:
            achat_fournisseur = get_object_or_404(AchatFournisseur, id=achat_fournisseur_id)

            produit = achat_fournisseur.produit

            # Calculate the new quantity after deletion
            nouvelle_quantite = produit.quantite - achat_fournisseur.quantite_achete

            # Update the quantity in the produit
            produit.quantite = nouvelle_quantite
            produit.save()

            # Return the new quantity as a JSON response
            return JsonResponse({'produit_id': produit.id, 'quantite': nouvelle_quantite})
        except Exception as e:
            print(f"Error during update of quantity after AchatFournisseur deletion: {e}")
            return JsonResponse({'error': str(e)}, status=500)


#---------------------------------------------------------
class ReservationView(View):

    def get(self, request, *args, **kwargs):
        client_instance, created = Client.objects.get_or_create(utilisateur_client=request.user.utilisateurapi)
        reservations = Reservation.objects.filter(utilisateur=client_instance)

        reservations_data = []

        for reservation in reservations:
            reservation_data = {
                "id": reservation.id,
                'utilisateur': reservation.utilisateur_id,
                'statut': reservation.statut,
                'nom': reservation.nom,
                'prenom': reservation.prenom,
                'produit': reservation.produit.nom,
                'quantite': reservation.quantite,
                'date_reservation': reservation.date_reservation,
            }
            reservations_data.append(reservation_data)

        return JsonResponse(reservations_data, safe=False)

    def post(self, request, *args, **kwargs):
        try:
            # Charger les données JSON depuis le corps de la requête
            data = json.loads(request.body)
            utilisateur_id = data.get('utilisateur')
            if utilisateur_id is not None:
                # Récupérer l'utilisateur à partir de l'ID
                try:
                    utilisateur = Client.objects.get(id=utilisateur_id)
                except Client.DoesNotExist:
                    return JsonResponse({'success': False, 'errors': {'utilisateur': 'User not found.'}}, status=400)

                # Assigner l'utilisateur à la réservation
                reservation = Reservation(
                    nom=data.get('nom'),
                    prenom=data.get('prenom'),
                    utilisateur=utilisateur,
                    produit_id=data.get('produit'),
                    quantite=data.get('quantite', 0),
                    date_reservation=data.get('date_reservation'),
                    statut=data.get('statut')
                )
                reservation.save()

                return JsonResponse({'id': reservation.id, 'message': 'Réservation créée avec succès'})
            else:
                # Si l'ID n'est pas fourni, vous pouvez gérer cela en conséquence
                return JsonResponse({'success': False, 'errors': {'utilisateur': 'User ID is required.'}}, status=400)
        except Exception as e:
            print(f"Erreur lors de la création de la réservation : {e}")
            return JsonResponse({'error': str(e)}, status=500)

    def put(self, request, *args, **kwargs):
        try:
            reservation_instance = get_object_or_404(Reservation, pk=kwargs['reservation_id'])
            data = json.loads(request.body)

            reservation_instance.nom = data.get('nom', reservation_instance.nom)
            reservation_instance.prenom = data.get('prenom', reservation_instance.prenom)

            # Ajoutez la logique pour obtenir une instance de Produit à partir de l'ID
            produit_id = data.get('produit')
            try:
                produit = Produit.objects.get(id=produit_id)
            except ObjectDoesNotExist:
                return JsonResponse({'error': 'Produit non trouvé.'}, status=400)

            reservation_instance.produit = produit

            reservation_instance.quantite = data.get('quantite', reservation_instance.quantite)
            reservation_instance.date_reservation = data.get('date_reservation', reservation_instance.date_reservation)
            reservation_instance.statut = data.get('statut', reservation_instance.statut)

            # Récupérez le statut avant la mise à jour
            ancien_statut = reservation_instance.statut

            # Vérifiez si le statut est passé de "En attente" à "Confirmé" (confirmation)
            if ancien_statut == 'En attente' and reservation_instance.statut == 'Confirmé':
                print("statut changé d' En attente à Confirmé")
            # Vérifiez si le statut est passé de "En attente" à "Annulé" (annulation)
            elif ancien_statut == 'En attente' and reservation_instance.statut == 'Annulé':
                print("statut changé d' En attente à Annulé")
                # Restituez la quantité du produit
                produit = reservation_instance.produit
                produit.quantite += reservation_instance.quantite
                produit.save()

            reservation_instance.save()

            return JsonResponse({'message': 'Réservation modifiée avec succès'})
        except Exception as e:
            print(f"Erreur lors de la modification de la réservation : {e}")
            return JsonResponse({'error': str(e)}, status=500)

class ReservationAdminView(View):
    
    def get(self, request, *args, **kwargs):
        reservations = Reservation.objects.all()
        serializer = ReservationSerializer(reservations, many=True)
        reservations_data = serializer.data
        print(reservations_data)
        return JsonResponse(reservations_data, safe=False)
        
class QuantiteUpdateMoreView(View):
    def put(self, request, *args, **kwargs):
        try:
            reservation_id = kwargs.get('reservation_id')
            
            # Récupérer la réservation à partir de l'ID
            reservation = get_object_or_404(Reservation, id=reservation_id)

            # Vérifier si le statut de la réservation est "En attente"
            if reservation.statut == 'Annulé':
                # Récupérer le produit associé à la réservation
                produit = reservation.produit

                # Réduire la quantité du produit
                produit.quantite += reservation.quantite
                produit.save()

                return JsonResponse({'message': 'Quantité du produit mise à jour avec succès'})
            else:
                # Si le statut n'est pas "En attente", renvoyer un message d'erreur
                return JsonResponse({'error': 'La réservation n\'est pas annulé. La quantité du produit ne peut pas être mise à jour.'}, status=400)
        except Exception as e:
            print(f"Erreur lors de la mise à jour de la quantité du produit : {e}")
            return JsonResponse({'error': str(e)}, status=500)
        
class QuantiteUpdateLessView(View):
    def put(self, request, *args, **kwargs):
        try:
            reservation_id = kwargs.get('reservation_id')
            
            # Récupérer la réservation à partir de l'ID
            reservation = get_object_or_404(Reservation, id=reservation_id)

            # Vérifier si le statut de la réservation est "En attente"
            if reservation.statut == 'En attente':
                # Récupérer le produit associé à la réservation
                produit = reservation.produit

                # Réduire la quantité du produit
                produit.quantite -= reservation.quantite
                produit.save()

                return JsonResponse({'message': 'Quantité du produit mise à jour avec succès'})
            else:
                # Si le statut n'est pas "En attente", renvoyer un message d'erreur
                return JsonResponse({'error': 'La réservation n\'est pas en attente. La quantité du produit ne peut pas être mise à jour.'}, status=400)
        except Exception as e:
            print(f"Erreur lors de la mise à jour de la quantité du produit : {e}")
            return JsonResponse({'error': str(e)}, status=500)


#---------------------------------------------------------

class VenteClientView(View):
    def get(self, request, *args, **kwargs):
        try:
            vente_clients = VenteClient.objects.all()
            vente_client_data = []

            for vente_client in vente_clients:
                vente_client_data.append({
                    'id': vente_client.id,
                    'utilisateur_client': vente_client.utilisateur_client.nom_client,
                    'produit': vente_client.produit.nom,
                    'quantite_vendue': vente_client.quantite_vendue,
                    'total': vente_client.total,
                    'date_vente': vente_client.date_vente,
                    'mode_paiement': vente_client.mode_paiement,
                })

            logging.info("Vente Clients récupérées avec succès : %s", vente_client_data)
            return JsonResponse(vente_client_data, safe=False)
        except Exception as e:
            logging.error("Erreur lors de la récupération des vente clients : %s", str(e))
            return JsonResponse({'error': str(e)}, status=500)

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            print("Received data:", data)  # Add this line to see the data in the console
            form = VenteClientForm(data)
            
            if form.is_valid():
                vente_client = form.save()
                return JsonResponse({'id': vente_client.id, 'message': 'Vente Client créée avec succès'})
            else:
                print("Form is not valid:", form.errors)  # Add this line to see validation errors in the console
                return JsonResponse({'error': 'Données invalides'}, status=400)
        except Exception as e:
            print(f"Erreur lors de la création de la vente client : {e}")
            return JsonResponse({'error': str(e)}, status=500)

    def put(self, request, *args, **kwargs):
        try:
            vente_client_id = kwargs.get('vente_id')  
            vente_client = get_object_or_404(VenteClient, id=vente_client_id)
            data = json.loads(request.body)
            print("data recupere")
            print(data)
            form = VenteClientForm(data, instance=vente_client)

            if form.is_valid():
                form.save()
                return JsonResponse({'message': 'Vente Client mise à jour avec succès'})
            else:
                return JsonResponse({'error': 'Données invalides'}, status=400)
        except Exception as e:
            print(f"Erreur lors de la mise à jour de la vente client : {e}")
            return JsonResponse({'error': str(e)}, status=500)

    def delete(self, request, *args, **kwargs):
        try:
            vente_client_id = kwargs.get('vente_id')  
            vente_client = get_object_or_404(VenteClient, id=vente_client_id)
            vente_client.delete()
            
            return JsonResponse({'message': 'Vente Client supprimée avec succès'})
        except Exception as e:
            print(f"Erreur lors de la suppression de la vente client : {e}")
            return JsonResponse({'error': str(e)}, status=500)

class QuantiteUpdateLessVenteView(View):
    def put(self, request, *args, **kwargs):
        try:
            vente_client_id = kwargs.get('vente_client_id')
            # Récupérer la réservation à partir de l'ID
            venteclient = get_object_or_404(VenteClient, id=vente_client_id)
            # Récupérer le produit associé à la réservation
            produit = venteclient.produit_vendue
            # Réduire la quantité du produit
            produit.quantite -= venteclient.quantite_vendue
            produit.save()
            return JsonResponse({'message': 'Quantité du produit mise à jour avec succès'})
        except Exception as e:
            print(f"Erreur lors de la mise à jour de la quantité du produit : {e}")
            return JsonResponse({'error': str(e)}, status=500)

class QuantiteUpdateMoreVenteView(View):
    def put(self, request, *args, **kwargs):
        try:
            vente_client_id = kwargs.get('vente_client_id')
            # Récupérer la réservation à partir de l'ID
            venteclient = get_object_or_404(VenteClient, id=vente_client_id)
            # Récupérer le produit associé à la réservation
            produit = venteclient.produit_vendue
            # Réduire la quantité du produit
            produit.quantite += venteclient.quantite_vendue
            produit.save()
            return JsonResponse({'message': 'Quantité du produit mise à jour avec succès'})
        except Exception as e:
            print(f"Erreur lors de la mise à jour de la quantité du produit : {e}")
            return JsonResponse({'error': str(e)}, status=500)

#---------------------------------------------------------
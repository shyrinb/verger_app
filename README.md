# Verger App Readme

Ce fichier readme fournit des instructions détaillées sur le lancement et l'utilisation de l'application Verger. Découvrez ci-dessous les différentes fonctionnalités accessibles via le menu de navigation.

## Fonctionnalités

- **Gestion**
  - Produits
  - Clients
  - Fournisseurs
  - Achats
  - Ventes
  - Réservation (Admin et Utilisateur)
  - Statistiques
  - Mon Profil

## Comment Utiliser

### 1. Lancer l'Application

Assurez-vous que les dépendances nécessaires et l'environnement sont configurés. 

```bash
cd verger_app
pip install -r requirements.txt
```

Mettez à jour la base de données utilisée avec les configurations correctes sans oublier de la créer

```bash
python manage.py migrate
```
Ensuite, lancez l'application selon les spécifications de votre environnement de développement :

```bash
python manage.py runserver
```

Accédez à http://localhost:5000 ou sur https://shyrin.pythonanywhere.com/ pour arriver sur la page d'inscription et commencez à utiliser l'application.

### 2. Navigation
Utilisez le menu de navigation pour accéder aux différentes sections de l'application.

### 3. Fonctionnalités
Chaque élément du menu correspond à une fonctionnalité spécifique de l'application.

Menu Gestion (Admin)

Cliquez sur chaque élément pour gérer et afficher des informations liées aux Produits, Clients, Fournisseurs, Achats, Ventes, Réservation, Statistiques, et Profil, divisé en trois sections CRM, Gestion et Profil

Menu Gestion (Client)

Les fonctionnalités accessibles pour le client incluent Réservations, Profil et Produits.

Pour toute assistance supplémentaire, veuillez contacter l'équipe de développement. Profitez de l'utilisation de l'application !
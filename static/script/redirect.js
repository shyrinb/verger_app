// Appeler la fonction initiale pour charger les statistiques
$(document).ready(function () {
    // Ajouter une requête AJAX pour récupérer les informations de l'utilisateur
    $.ajax({
        url: '/admindash/userinfo/',
        type: 'GET',
        success: function (response) {
            console.log(response.status_utilisateur);
            // Cacher tous les onglets
            $('a').hide();
            $('a:contains(Déconnexion)').show();
            $('a:contains(Accueil)').show();
            $('a:contains(<iclass="fas fa-bars"></i>)').show();
            // Cacher les onglets non autorisés pour le client
        }, error: function (error) {
            console.error('Erreur lors de la requête AJAX:', error);
        }
    });
});

function chargeTab(tabName) {
    // Cacher tous les onglets
    $('a').hide();
    $('a:contains(Déconnexion)').show();
    $('a:contains(Accueil)').show();
    $('a:contains(<iclass="fas fa-bars"></i>)').show();

    if (tabName=== 'crm'){
        $('a:contains(Clients),  a:contains(Fournisseurs),a:contains(Statistiques)').show();
    } else if(tabName=== 'gestionstocks'){
        $('a:contains(Produits), a:contains(Reservation), a:contains(Achats), a:contains(Ventes)').show();  
    } else if (tabName === 'monprofil'){
        $('a:contains(Profil)').show();
    } else if (tabName === 'client'){
        $('a:contains(Produits), a:contains(Reservations),a:contains(Profil)').show();
    }
}

function show(page, userRole) {

    // Supprimer la classe active de tous les liens
    $('a').removeClass('active');

     // Afficher tous les onglets pour l'administrateur
     if (page === 'produit') {
        $('a:contains(Produits)').addClass('active');
        $("#main-content").load("produits");
    } else if (page === 'client') {
        $('a:contains(Clients)').addClass('active');
        $("#main-content").load("clients");
    } else if (page === 'fournisseur') {
        $('a:contains(Fournisseurs)').addClass('active');
        $("#main-content").load("fournisseurs");
    } else if (page === 'achat') {
        $('a:contains(Achats)').addClass('active');
        $("#main-content").load("achats");
    } else if (page === 'ventes') {
        $('a:contains(Ventes)').addClass('active');
        $("#main-content").load("ventes");
    } else if (page === 'reservations') {
        $('a:contains(Reservations)').addClass('active');
        $("#main-content").load("reservations");
    } else if (page === 'reservation') {
        $('a:contains(Reservation)').addClass('active');
        $("#main-content").load("reservation");
    } else if (page === 'statistiques') {
        $('a:contains(Statistiques)').addClass('active');
        $("#main-content").load("statistiques");
    }
    if (page === 'profil') {
        $('a:contains(Profil)').addClass('active');
        $("#main-content").load("profil");
    }// Ajouter la classe active uniquement aux onglets autorisés
    event.preventDefault();
    
}

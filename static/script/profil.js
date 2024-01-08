// profil.js
$(document).ready(function () {

    function chargerDonneesClient() {
        // Effectuer une requête AJAX pour récupérer les données du client depuis le serveur
        $.ajax({
            url: "/profil/",
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                console.log(data);

                // Mettre à jour les champs avec les données récupérées
                $('#id_nom_client').val(data.nom_client);
                $('#id_prenom').val(data.prenom);
                $('#id_telephone').val(data.telephone);
                $('#id_email').val(data.email);
                $('#id_adresse_client').val(data.adresse_client);
                $('#id_achats').val(data.achats);
                $('#id_newsletter').val(data.newsletter);
            },
            error: function (error) {
                console.error('Erreur lors du chargement des données du client:', error);
            }
        });
    }

    // Appeler la fonction pour charger les données du client au chargement de la page
    chargerDonneesClient();

    // Ajouter un gestionnaire de clic pour le bouton "Modifier"
    $('#btn_modifier').click(function () {
        activerModeModification();
    });

    // Écouter le formulaire pour soumettre les modifications
    $('#profil-form').submit(function (e) {
        e.preventDefault();

        // Effectuer une requête AJAX pour sauvegarder les modifications sur le serveur
        $.ajax({
            url: "/profil/",
            method: 'POST',
            data: $(this).serialize(),
            success: function (data) {
                desactiverModeModification();
                console.log('Modifications enregistrées avec succès:', data);
                // Actualiser les données du client après l'enregistrement
                chargerDonneesClient();
            },
            error: function (error) {
                console.error('Erreur lors de l\'enregistrement des modifications:', error);
            }
        });
    });

    function activerModeModification() {
        // Rendre les champs modifiables en désactivant l'attribut "readonly"
        $('[name="nom_client"]').prop('readonly', false);
        $('[name="prenom"]').prop('readonly', false);
        $('[name="telephone"]').prop('readonly', false);
        $('[name="email"]').prop('readonly', false);
        $('[name="adresse_client"]').prop('readonly', false);
        $('[name="achats"]').prop('readonly', false);

        // Masquer le bouton "Modifier"
        $('#btn_modifier').hide();
        // Afficher le bouton "Enregistrer"
        $('#btn_enregistrer').show();
    }

    function desactiverModeModification() {
        // Désactiver le mode de modification en réactivant l'attribut "readonly"
        $('[name="nom_client"]').prop('readonly', true);
        $('[name="prenom"]').prop('readonly', true);
        $('[name="telephone"]').prop('readonly', true);
        $('[name="email"]').prop('readonly', true);
        $('[name="adresse_client"]').prop('readonly', true);
        $('[name="achats"]').prop('readonly', true);

        // Masquer le bouton "Enregistrer"
        $('#btn_enregistrer').hide();
        // Afficher le bouton "Modifier"
        $('#btn_modifier').show();
    }
});

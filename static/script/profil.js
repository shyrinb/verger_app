// profil.js

var MyTools = {
    Validation: function () {
        var inputs = ["nom_client", "prenom", "telephone", "email", "adresse_client","newsletter"];
        var checked = true;

        inputs.forEach(function (input) {
            var element = $("#" + input);
            if (element.val() == null || element.val() == "") {
                alert(input + " is empty");
                checked = false;
            }
        });
        return checked;
    }
};

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
            },
            error: function (error) {
                console.error('Erreur lors du chargement des données du client:', error);
            }
        });
    }

    // Appeler la fonction pour charger les données du client au chargement de la page
    chargerDonneesClient();
    desactiverModeModification();

    // Ajouter un gestionnaire de clic pour le bouton "Modifier"
    $('#btn_modifier').click(function () {
        activerModeModification();
    });

    // Écouter le formulaire pour soumettre les modifications
    $('#profil-form').submit(function (e) {
        e.preventDefault();

        // Ajoutez le jeton CSRF à votre demande
        var csrfToken = $("[name=csrfmiddlewaretoken]").val();
        var formData = {
            nom_client: $('#id_nom_client').val(),
            prenom: $('#id_prenom').val(),
            telephone: $('#id_telephone').val(),
            email: $('#id_email').val(),
            adresse_client: $('#id_adresse_client').val(),
            utilisateur_client: $('#utilisateur_client').val()
        };
    
        console.log("telephone",$('#id_telephone').val());
        console.log("prenom", $('#id_prenom').val());
        console.log("nom",$('#id_nom_client').val());
        console.log("adress",$('#id_adresse_client').val());
        console.log("email", $("#id_email").val());
        console.log("formData",formData);
        console.log(JSON.stringify(formData));
        // Effectuer une requête AJAX pour sauvegarder les modifications sur le serveur
        $.ajax({
            url: "/profil/",
            method: 'PUT',  // Modifier la méthode en PUT
            headers: {
                "X-CSRFToken": csrfToken
            },
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (data) {
                console.log('Modifications enregistrées avec succès:', data);
                desactiverModeModification();
                // Actualiser les données du client après l'enregistrement
                chargerDonneesClient();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Erreur lors de l\'enregistrement des modifications:", jqXHR, textStatus, errorThrown);
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

        // Masquer le bouton "Enregistrer"
        $('#btn_enregistrer').hide();
        // Afficher le bouton "Modifier"
        $('#btn_modifier').show();
    }
});
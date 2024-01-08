$(document).ready(function () {

    table = $('#treservation').DataTable({
        ajax: {
            url: "/reservation/admin/",
            dataSrc: ''
        },
        columns: [
            {  data: "id" },
            {  data: "utilisateur_id" },
            {  data: "statut"},
            { data: "nom" },
            { data: "prenom"  }, 
            { data: "produit.nom" }, 
            { data: "quantite"      }, 
            { data: "date_reservation"  },
            {
                render: function () {
                    return '<button type="button" class="btn btn-outline-secondary modifier">Modifier</button>';
                }
            },
        ]
    });


    $('#table-content').on('click', '.modifier', function () {
        var btn = $('#btn');
        var id = $(this).closest('tr').find('td').eq(0).text();
        var nom = $(this).closest('tr').find('td').eq(3).text();
        var prenom = $(this).closest('tr').find('td').eq(4).text();
        var quantite = $(this).closest('tr').find('td').eq(6).text();
        var date_reservation = $(this).closest('tr').find('td').eq(7).text();
        var statut = $(this).closest('tr').find('td').eq(2).text();
        var utilisateur = $(this).closest('tr').find('td').eq(1).text();

        // Cachez la liste déroulante du produit
        $("#produit").hide();
        btn.text('Modifier');
        $("#utilisateur").val(utilisateur);
        $("#nom").val(nom);
        $("#prenom").val(prenom);
        $("#quantite").val(quantite);
        $("#date_reservation").val(date_reservation);
        $("#statut").val(statut);
    
        // Récupérez le statut avant la mise à jour
        var ancienStatut = statut;
    
        btn.click(function (e) {
            e.preventDefault();
            // Ajoutez le jeton CSRF à votre demande
            var csrfToken = $("[name=csrfmiddlewaretoken]").val();
            var s = {
                nom: $("#nom").val(),
                prenom: $("#prenom").val(),
                produit: parseInt($("#produit").val()), 
                quantite: $("#quantite").val(),
                utilisateur: parseInt($("#utilisateur").val()),
                date_reservation: $("#date_reservation").val(),
                statut: $("#statut").val(),
            };
            if ($('#btn').text() == 'Modifier') {
                if(MyTools.Validation()){
                    $.ajax({
                        url: '/reservation/mod/' + id + '/',
                        contentType: "application/json",
                        dataType: "json",
                        data: JSON.stringify(s),
                        type: 'PUT',
                        headers: {
                            "X-CSRFToken": csrfToken
                        },
                        success: function (data, textStatus, jqXHR) {
                            // Affichez à nouveau la liste déroulante du produit après la modification
                            $("#produit").show();
                            console.log("data",data);
                            console.log("Ancien statut :", ancienStatut);
                            console.log("Nouveau statut :", s.statut);
                            statut = s.statut;
                            // Vérifiez si le statut est passé de "En attente" à "Confirmé" (confirmation)
                            if (ancienStatut === 'En attente' && statut === 'Confirmé') {
                                console.log("la commande est validé");
                            }  else if (ancienStatut === 'En attente' && statut === 'Annulé') {
                                console.log("passe de en attente a annulé");
                                // Restituez la quantité du produit
                                $.ajax({
                                    url: '/produit/down/quantite/' + id + '/',
                                    contentType: "application/json",
                                    type: 'PUT',
                                    headers: {
                                        "X-CSRFToken": csrfToken
                                    },
                                    success: function (data) {
                                        console.log("Quantité du produit restituée avec succès");
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        console.error("AJAX error:", textStatus, errorThrown);
                                        // Affichez les détails de l'erreur côté client
                                        console.log(jqXHR.responseText);
                                    }
                                });
                            }
                            $("#nom").val(''),
                            $("#prenom").val(''),
                            $("#produit").val(''), 
                            $("#quantite").val(''),
                            $("#date_reservation").val(''),
                            $("#statut").val(''),
                            $('#utilisateur').val('')
                            btn.text('Ajouter');
                            table.ajax.reload();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus);
                            console.log("Erreur côté serveur :", jqXHR.responseJSON.errors);
                        }
                    });
                }
            }
        });
    });
   
});
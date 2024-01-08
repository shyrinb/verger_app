MyTools = {
    Validation: function () {
        var inputs = ["nom", "prix_unitaire", "quantite", "fournisseur","date_reception", "provenance"];
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
}

$(document).ready(function () {

    table = $('#tproduit').DataTable({
        ajax: {
            url: "/produit/",
            dataSrc: ''
        },
        columns: [
            { data: "id" },
            { data: "date_reception" },
            { data: "nom" },
            { data: "prix_unitaire" },
            { data: "quantite" },
            { data: "provenance" },
            { 
                data: "fournisseurs",  // Utilisez la clé 'fournisseurs' ici
                render: function (data) {
                    // Utilisez la clé 'nom_fournisseur' pour extraire les noms des fournisseurs
                    return data.map(function (fournisseur) {
                        return fournisseur.nom_fournisseur;
                    }).join(', ');
                }
            },
            {
                "render": function () {
                    return '<button type="button" class="btn btn-outline-danger supprimer">Supprimer</button>';
                }
            },
            {
                "render": function () {
                    return '<button type="button" class="btn btn-outline-secondary modifier">Modifier</button>';
                }
            }],
        'rowCallback': function (row, data, index) {
            if ($(row).find('td:eq(4)').text() == 0) {
                $(row).find('td:eq(4)').css('color', 'red');
            } else {
                if ($(row).find('td:eq(4)').text() > 1 && $(row).find('td:eq(4)').text() < 10) {
                    $(row).find('td:eq(4)').css('color', 'orange');
                } else {
                    $(row).find('td:eq(4)').css('color', 'green');
                }
            }
        }
    });

    // Ajouter une requête AJAX pour récupérer les informations de l'utilisateur
    $.ajax({
        url: '/admindash/userinfo/',
        type: 'GET',
        success: function (response) {
            console.log("status_utilisateur: ",response.status_utilisateur);
            if (response.status_utilisateur === "Client") {
                // Désactiver les boutons de modification et de suppression
                $(".modifier, .supprimer").hide();
            }
      
            // Cacher les onglets non autorisés pour le client
        }, error: function (error) {
            console.error('Erreur lors de la requête AJAX:', error);
        }
    });

    $('#btn').click(function () {
        var provenance = $("#provenance");
        var nom = $("#nom");
        var prix_unitaire = $("#prix_unitaire");
        var quantite = $("#quantite");
        var fournisseur = $("#fournisseur");
        var date_reception = $("#date_reception");

        if ($('#btn').text() == 'Ajouter') {
            if (MyTools.Validation()) {
                var fournisseur_values = fournisseur.serializeArray().map(function (item) {
                    return item.value;
                });
    
                var p = {
                    nom: nom.val(),
                    prix_unitaire: prix_unitaire.val(),
                    quantite: quantite.val(),
                    fournisseur: fournisseur_values,
                    date_reception: date_reception.val(),
                    provenance: provenance.val(),
                };
                // Ajoutez le jeton CSRF à votre demande
                var csrfToken = $("[name=csrfmiddlewaretoken]").val();
                $.ajax({
                    url: '/produit/',
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(p),
                    type: 'POST',
                    headers: {
                        "X-CSRFToken": csrfToken
                    },
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        table.ajax.reload();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log("Erreur lors de la transmission des données :", errorThrown);
                    }
                });
            }
        }
    });

    $('#table-content').on('click', '.supprimer', function () {
            var id = $(this).closest('tr').find('td').eq(0).text();
            var oldLing = $(this).closest('tr').clone();
            var newLigne = '<tr style="position: relative;" class="bg-light" ><th scope="row">'
                + id
                + '</th><td colspan="4" style="height: 100%;">';
            newLigne += '<h4 class="d-inline-flex">Voulez vous vraiment supprimer ce produit ? </h4>';
            newLigne += '<button type="button" class="btn btn-outline-primary btn-sm confirmer" style="margin-left: 25px;">Oui</button>';
            newLigne += '<button type="button" class="btn btn-outline-danger btn-sm annuler" style="margin-left: 25px;">Non</button></td></tr>';

            $(this).closest('tr').replaceWith(newLigne);
            $('.annuler').click(function () {
                $(this).closest('tr').replaceWith(oldLing);
            });
            $('.confirmer').click(function (e) {
                e.preventDefault();
                // Ajoutez le jeton CSRF à votre demande
                var csrfToken = $("[name=csrfmiddlewaretoken]").val();
                $.ajax({
                    url: '/produit/del/' + id + '/',
                    data: {},
                    type: 'DELETE',
                    headers: {
                        "X-CSRFToken": csrfToken
                    },
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        table.ajax.reload();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $("#error").modal();
                    }
                });
            });
        });

    $('#table-content').on('click', '.modifier', function () {
        var btn = $('#btn');
        var id = $(this).closest('tr').find('td').eq(0).text();
        var nom = $(this).closest('tr').find('td').eq(2).text();
        var prix_unitaire = parseInt($(this).closest('tr').find('td').eq(3).text());
        var quantite = $(this).closest('tr').find('td').eq(4).text();
        var fournisseur = $(this).closest('tr').find('td').eq(6).text();
        var date_reception = $(this).closest('tr').find('td').eq(1).text();
        var provenance = $(this).closest('tr').find('td').eq(5).text();
        
        id = parseInt(id);
        btn.text('Modifier');
        $("#nom").val(nom);
        $("#prix_unitaire").val(prix_unitaire);
        $("#quantite").val(quantite);
        $("#fournisseur").val(fournisseur);
        $("#provenance").val(provenance);
        $("#date_reception").val(date_reception);

        btn.click(function (e) {
            e.preventDefault();
            nom=$("#nom").val();
            prix_unitaire=$("#prix_unitaire").val();
            quantite=$("#quantite").val();
            fournisseur=$("#fournisseur").val();
            provenance=$("#provenance").val();
            date_reception=$("#date_reception").val();
            var p = {
                id: id, 
                nom: nom,
                prix_unitaire: prix_unitaire,
                quantite: quantite,
                fournisseur: fournisseur,
                date_reception: date_reception,
                provenance: provenance,
            };
            if ($('#btn').text() == 'Modifier') {
                if (MyTools.Validation()) {
                    // Ajoutez le jeton CSRF à votre demande
                    var csrfToken = $("[name=csrfmiddlewaretoken]").val();

                    $.ajax({
                        url: '/produit/mod/' + id + '/',
                        contentType: "application/json",
                        dataType: "json",
                        data: JSON.stringify(p),
                        type: 'PUT',
                        headers: {
                            "X-CSRFToken": csrfToken
                        },
                        async: false,
                        success: function (data, textStatus, jqXHR) {
                            table.ajax.reload();
                            $("#date_reception").val('');
                            $("#nom").val('');
                            $("#prix_unitaire").val('');
                            $("#quantite").val('');
                            $("#fournisseur").val('');
                            $("#provenance").val('');
                            btn.text('Ajouter');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log("erreur modif",textStatus,errorThrown);
                        }
                    });
                }
            }
        });
    });

    $.ajax({
        url: '/fournisseur/',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            var fournisseurDropdown = $("#fournisseur");
            fournisseurDropdown.empty();
    
            if (response && response.length > 0) {
                for (var i = 0; i < response.length; i++) {
                    var nomFournisseur = response[i]['nom_fournisseur'];
                    var idFournisseur = response[i]['id'];
                    fournisseurDropdown.append("<option value='" + idFournisseur + "'>" + nomFournisseur + "</option>");
                }
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.error("Erreur lors de la récupération des fournisseurs :", textStatus, errorThrown);
        }
    });

});
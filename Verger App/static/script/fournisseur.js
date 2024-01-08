var table; // Déclarer la variable de la table en dehors de la fonction $(document).ready

var MyTools = {
    Validation: function () {
        var inputs = ["nom_fournisseur", "email", "telephone", "adresse_fournisseur", "produit"];
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

    table = $('#tfourni').DataTable({
        ajax: {
            url: "/fournisseur/",
            dataSrc: ''
        },
        columns: [
            { data: "id" },
            { data: "nom_fournisseur" },
            { data: "email" },
            { data: "adresse_fournisseur" },
            { data: "telephone" },
            {
                data: "type_produit",
                render: function (data) {
                    // Vérifiez si la liste de produits n'est pas vide
                    if (data && data.length > 0) {
                        // Utilisez la clé 'nom' pour extraire les noms des produits
                        return data.map(function (type_produit) {
                            return type_produit.nom;
                        }).join(', ');
                    } else {
                        return '';  // Retournez une chaîne vide si la liste est vide
                    }
                }
            },
            {
                render: function () {
                    return '<button type="button" class="btn btn-outline-danger supprimer">Supprimer</button>';
                }
            },
            {
                render: function () {
                    return '<button type="button" class="btn btn-outline-secondary modifier">Modifier</button>';
                }
            }]
    });

    $("#btn_add").click(function () {
        if ($('#btn_add').text() == 'Ajouter') {
            if (MyTools.Validation()) {
                var types_produits = $("#produit").serializeArray().map(function (item) {
                    return item.value;
                });
                var s = {
                    nom_fournisseur: $("#nom_fournisseur").val(),
                    email: $("#email").val(),
                    telephone: $("#telephone").val(),
                    adresse_fournisseur: $("#adresse_fournisseur").val(),
                    type_produit: types_produits,
                };                
            
                // Ajoutez le jeton CSRF à votre demande
                var csrfToken = $("[name=csrfmiddlewaretoken]").val();
                $.ajax({
                    url: '/fournisseur/',
                    contentType: "application/json",
                    data: JSON.stringify(s),
                    type: 'POST', 
                    headers: {
                        "X-CSRFToken": csrfToken
                    },
                    success: function (data) {
                        console.log("Réponse du serveur :", data); 
                        table.ajax.reload();
                    },
                    error: function (textStatus) {
                        console.log(textStatus);
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
            + '</th><td colspan="5" style="height: 100%;">';
        newLigne += '<h4 class="d-inline-flex">Voulez-vous vraiment supprimer ce fournisseur ? </h4>';
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
                url: '/fournisseur/del/' + id + '/',
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
        var nom_fournisseur = $(this).closest('tr').find('td').eq(1).text();
        var email = $(this).closest('tr').find('td').eq(2).text();
        var telephone = $(this).closest('tr').find('td').eq(4).text();
        var adresse_fournisseur = $(this).closest('tr').find('td').eq(3).text();
        var type_produit = $(this).closest('tr').find('td').eq(6).text();

        btn.text('Modifier');
        $("#nom_fournisseur").val(nom_fournisseur);
        $("#email").val(email);
        $("#telephone").val(telephone);
        $("#adresse_fournisseur").val(adresse_fournisseur);
        $("#produit").val(type_produit);

        btn.click(function (e) {
            e.preventDefault();
            var s = {
                nom_fournisseur: $("#nom_fournisseur").val(),
                email: $("#email").val(),
                telephone: $("#telephone").val(),
                adresse_fournisseur: $("#adresse_fournisseur").val(),
                id: $("#id").val(),
                type_produit: $("#produit").val()
            };            

            if ($('#btn').text() == 'Modifier') {
                if (MyTools.Validation()) {
                    $.ajax({
                        url: '/fournisseur/mod/' + id + '/',
                        contentType: "application/json",
                        dataType: "json",
                        data: JSON.stringify(s),
                        type: 'PUT',
                        async: false,
                        success: function (data, textStatus, jqXHR) {
                            table.ajax.reload();
                            $("#nom_fournisseur").val('');
                            $("#email").val('');
                            $("#telephone").val('');
                            $("#adresse_fournisseur").val('');
                            $("#produit").val('');
                            btn.text('Ajouter');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus);
                        }
                    });
                    $("#main-content").load("fournisseurs");
                }
            }
        });
    });

    $.ajax({
        url: '/produit/',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            var produitDropdown = $("#produit");
            produitDropdown.empty();
    
            if (response && response.length > 0) {
                for (var i = 0; i < response.length; i++) {
                    var produit = response[i]['nom'];
                    var idproduit = response[i]['id'];
                    produitDropdown.append("<option value='" + idproduit + "'>" + produit + "</option>");
                }
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.error("Erreur lors de la récupération des produits :", textStatus, errorThrown);
        }
    });
});

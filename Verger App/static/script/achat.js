MyTools = {
    Validation: function () {
        var inputs = ["datea", "quantite_achete", "prix","produit", "fournisseur"];
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

    table = $('#tachat').DataTable({
        ajax: {
            url: "/achat/",
            dataSrc: ''
        },
        columns: [
            { data: "id" },
            { data: "date_achat" },
            { data: "quantite_achete" },
            { data: "fournisseur"   }, 
            { data: "produit"  },
            { data: "prix"   },
            {   "render": function () {
                    return '<button type="button" class="btn btn-outline-danger supprimer">Supprimer</button>';
                }
            }]
    });

    function updateProductQuantity(productId, newQuantity) {
        var updatedProduct = {
            quantite: newQuantity
        };
        // Ajoutez le jeton CSRF à votre demande
        var csrfToken = $("[name=csrfmiddlewaretoken]").val();
        $.ajax({
            url: '/produit/mod/' + productId + '/',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(updatedProduct),
            type: 'PUT',
            headers: {
                "X-CSRFToken": csrfToken
            },
            success: function (data, textStatus, jqXHR) {
                console.log("nouvelle quantite:", updatedProduct.quantite)
                console.log("Mise à jour de la quantité du produit");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("AJAX error:", textStatus, errorThrown);
            }
        });
    }

    $("#btn").click(function () {
        var date = $("#datea");
        var quantite_achete = $("#quantite_achete");
        var produit = $("#produit");
        var fournisseur = $("#fournisseur");
        var prix = $("#prix");
    
        if ($('#btn').text() == 'Ajouter') {
            if (MyTools.Validation()) {
                var s = {
                    date_achat: date.val(),
                    quantite_achete: quantite_achete.val(),
                    fournisseur: fournisseur.val(),
                    produit: produit.val(),
                    prix: prix.val(),
                };
    
                $.ajax({
                    url: '/produit/quantite/' + produit.val(),
                    contentType: "application/json",
                    type: 'GET',
                    success: function (data) {
                        var quantiteProduit = data.quantite;
                        console.log("Quantité du produit : " + quantiteProduit);
                        // Ajoutez le jeton CSRF à votre demande
                        var csrfToken = $("[name=csrfmiddlewaretoken]").val();
                        $.ajax({
                            url: '/achat/',
                            contentType: "application/json",
                            data: JSON.stringify(s),
                            type: 'POST',
                            headers: {
                                "X-CSRFToken": csrfToken
                            },
                            success: function (data) {
                                // Après l'ajout de l'achat fournisseur, mettez à jour la quantité du produit
                                updateProductQuantity(produit.val(), parseInt(quantiteProduit) + parseInt(quantite_achete.val()));
                                table.ajax.reload();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.error("AJAX error:", textStatus, errorThrown);
                            }
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error("AJAX error:", textStatus, errorThrown);
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
        newLigne += '<h4 class="d-inline-flex">Voulez vous vraiment supprimer cette salle ? </h4>';
        newLigne += '<button type="button" class="btn btn-outline-primary btn-sm confirmer" style="margin-left: 25px;">Oui</button>';
        newLigne += '<button type="button" class="btn btn-outline-danger btn-sm annuler" style="margin-left: 25px;">Non</button></td></tr>';

        $(this).closest('tr').replaceWith(newLigne);

        $('.annuler').click(
            function () {
                $(this).closest('tr')
                    .replaceWith(
                        oldLing);
            });
        $('.confirmer').click(function (e) {
            e.preventDefault();

            var id = $(this).closest('tr').find('th').text().trim();
            // Ajoutez le jeton CSRF à votre demande
            var csrfToken = $("[name=csrfmiddlewaretoken]").val();
            // Exécuter d'abord la requête PUT pour mettre à jour la quantité
            updateProductQuantityAfterDelete(id);
            $.ajax({
                url: '/achat/del/' + id + '/',  // Utilisez le bon nom de paramètre ici
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
                    console.error("AJAX error:", textStatus, errorThrown);
                    $("#error").modal();
                }
            });

           
        });
    });

    function updateProductQuantityAfterDelete(achatId) {
        // Ajoutez le jeton CSRF à votre demande
        var csrfToken = $("[name=csrfmiddlewaretoken]").val();
        // Effectuez une requête AJAX pour récupérer la nouvelle quantité après la suppression de l'achat
        $.ajax({
            url: '/produit/del/quantite/' + achatId + '/',
            contentType: "application/json",
            type: 'PUT',
            headers: {
                "X-CSRFToken": csrfToken
            },
            success: function (data) {
                var productId = data.produit_id;
                var nouvelleQuantite = data.nouvelle_quantite;
    
                // Utilisez l'ID du produit pour mettre à jour la quantité
                $(`#produit_${productId}`).text(nouvelleQuantite);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("AJAX error:", textStatus, errorThrown);
            }
        });
    }
    
    

        var produitDropdown = $("#produit");
        $.ajax({
            url: '/produit/',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response && response.length > 0) {
                    for (var i = 0; i < response.length; i++) {
                        var produit = response[i]['nom'];
                        var idproduit = response[i]['id'];
                        produitDropdown.append("<option value='" + idproduit + "'>" + produit + "</option>");
                    }
        
                    // Déclenchez l'événement de changement pour initialiser le menu déroulant des fournisseurs
                    produitDropdown.trigger('change');
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.error("Erreur lors de la récupération des produits :", textStatus, errorThrown);
            }
        });
        
        // Ajoutez un écouteur d'événements pour l'événement de changement du menu déroulant du produit
        produitDropdown.on('change', function () {
            // Récupérez l'ID du produit sélectionné
            var selectedProductId = $(this).val();
            
            var fournisseurDropdown = $("#fournisseur");
            // Effacez le menu déroulant des fournisseurs
            fournisseurDropdown.empty();
            console.log("selectedProductId:", selectedProductId);
            // Récupérez et remplissez le menu déroulant des fournisseurs en fonction du produit sélectionné
            $.ajax({
                url: '/produit/' + selectedProductId + '/fournisseurs/',
                type: 'GET',
                dataType: 'json',
                success: function (response) {
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

});
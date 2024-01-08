MyTools = {
    Validation: function () {
        var inputs = ["datevente", "quantite", "produit", "client", "paiement", "total"];
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

    table = $('#tvente').DataTable({
        ajax: {
            url: "/vente/",
            dataSrc: ''
        },
        columns: [
            {  data: "id"  },
            {   data: "utilisateur_client"   },
            {   data: "date_vente"    },
            {  data: "quantite_vendue"   },
            {    data: "total"  },
             {   data: "mode_paiement"   },
             {   data: "produit"   },
            {
                "render": function () {
                    return '<button type="button" class="btn btn-outline-danger supprimer">Supprimer</button>';
                }
            },
            {
                "render": function () {
                    return '<button type="button" class="btn btn-outline-secondary modifier">Modifier</button>';
                }
            }]

    });


    $("#btn").click(function () {
        var date_vente = $("#datevente");
        var quantite = $("#quantite");
        var produit = $("#produit");
        var client = $("#client");
        var paiement = $("#paiement");
        var total = $("#total");

        if ($('#btn').text() == 'Ajouter') {
            if (MyTools.Validation()) {

                var csrfToken = $("[name=csrfmiddlewaretoken]").val();
                var s = {
                    date_vente: date_vente.val(),
                    quantite_vendue: quantite.val(),
                    utilisateur_client: client.val(),
                    produit: produit.val(),
                    mode_paiement: paiement.val(),
                    total: total.val(),
                };
                            
                $.ajax({
                    url: '/vente/',
                    contentType: "application/json",
                    data: JSON.stringify(s),
                    type: 'POST',
                    headers: {
                        "X-CSRFToken": csrfToken
                    },
                    success: function (data) {
                        var venteId = data.id;
                        $.ajax({
                            url: '/produit/upvente/quantite/' + venteId + '/',
                            contentType: "application/json",
                            type: 'PUT',
                            headers: {
                                "X-CSRFToken": csrfToken
                            },
                            success: function (data) {
                                console.log("Mise à jour de la quantité du produit");
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.error("AJAX error:", textStatus, errorThrown);
                            }
                        });
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
        const id = $(this).closest('tr').find('td').eq(0).text();
        const oldLing = $(this).closest('tr').clone();
    
        const newLigne = `
            <tr style="position: relative;" class="bg-light">
                <th scope="row">${id}</th>
                <td colspan="4" style="height: 100%;">
                    <h4 class="d-inline-flex">Voulez-vous vraiment supprimer cette salle ? </h4>
                    <button type="button" class="btn btn-outline-primary btn-sm confirmer" style="margin-left: 25px;">Oui</button>
                    <button type="button" class="btn btn-outline-danger btn-sm annuler" style="margin-left: 25px;">Non</button>
                </td>
            </tr>`;
    
        $(this).closest('tr').replaceWith(newLigne);
    
        const annulerHandler = function () {
            $(this).closest('tr').replaceWith(oldLing);
        };
    
        const confirmerHandler = function (e) {
            e.preventDefault();
            const csrfToken = $("[name=csrfmiddlewaretoken]").val();
            $.ajax({
                url: '/produit/up/quantite/' + id + '/',
                contentType: "application/json",
                type: 'PUT',
                headers: {
                    "X-CSRFToken": csrfToken
                },
                success: function (data) {
                    console.log("Mise à jour de la quantité du produit");
                    $.ajax({
                        url: `/vente/del/${id}`,
                        data: {},
                        type: 'DELETE',
                        headers: {
                            "X-CSRFToken": csrfToken
                        },
                        async: false,
                        success: function (data, textStatus, jqXHR) {
                            console.log("suppression effectué");
                            table.ajax.reload();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            $("#error").modal();
                        }
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("AJAX error:", textStatus, errorThrown);
                }
            });
            
        };
        $('.annuler').click(annulerHandler);
        $('.confirmer').click(confirmerHandler);

    });

    $('#table-content').on('click', '.modifier', function () {
        var btn = $('#btn');
        var id = $(this).closest('tr').find('td').eq(0).text();
        var date = $(this).closest('tr').find('td').eq(2).text();
        var quantite = $(this).closest('tr').find('td').eq(3).text();
        var client = $(this).closest('tr').find('td').eq(1).text();
        var produit = $(this).closest('tr').find('td').eq(4).text();
        var paiement = $(this).closest('tr').find('td').eq(6).text();
        var total = $(this).closest('tr').find('td').eq(5).text();

        id = parseInt(id);
        btn.text('Modifier');
        $("#datevente").val(date);
        $("#quantite").val(quantite);
        $("#client").val(client);
        $("#produit").val(produit);
        $("#total").val(total);
        $("#paiement").val(paiement);

        btn.click(function (e) {
            e.preventDefault();
            var date = $("#datevente");
            var quantite = $("#quantite");
            var produit = $("#produit");
            var client = $("#client");
            var paiement = $("#paiement");
            var total = $("#total");
            var s = {
                id: id, 
                date_vente: date.val(),
                quantite_vendue: quantite.val(),
                utilisateur_client: client.val(),
                produit: produit.val(),
                mode_paiement: paiement.val(),
                total: total.val(),
            };

            if ($('#btn').text() == 'Modifier') {
                if (MyTools.Validation()) {
                    var csrfToken = $("[name=csrfmiddlewaretoken]").val();
                    $.ajax({
                        url: '/vente/mod/' + id + '/',
                        contentType: "application/json",
                        dataType: "json",
                        data: JSON.stringify(s),
                        type: 'PUT',
                        headers: {
                            "X-CSRFToken": csrfToken
                        },
                        async: false,
                        success: function (data, textStatus, jqXHR) {
                            table.ajax.reload();
                            $("#datevente").val('');
                            $("#quantite").val('');
                            $("#produit").val('');
                            $("#client").val('');
                            $("#paiement").val('');
                            $("#total").val('');
                            btn.text('Ajouter');
                        }, error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus);
                        }
                    });
                }
            }
        });
    });

    $.ajax({
        url: '/client/',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            var len = response.length;
            $("#client").empty();
            for (var i = 0; i < len; i++) {
                var id = response[i]['id'];
                var prenom = response[i]['prenom'];
                var nom = response[i]['nom_client'];
                $("#client").append("<option value='" + id + "'>" + nom + " " + prenom + "</option>");
            }
        }
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
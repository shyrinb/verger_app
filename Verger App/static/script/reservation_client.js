MyTools = {
    Validation: function () {
        var inputs = ["statut", "nom", "prenom", "produit", "quantite", "date_reservation", "utilisateur"];
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

    table = $('#treservation').DataTable({
        ajax: {
            url: "/reservation/",
            dataSrc: ''
        },
        columns: [
            {  data: "id" },
            {  data: "utilisateur" },
            {  data: "statut"},
            { data: "nom" },
            { data: "prenom"  }, 
            { data: "produit" }, 
            { data: "quantite"      }, 
            { data: "date_reservation"  },
            {
                render: function () {
                    return '<button type="button" class="btn btn-outline-secondary modifier">Modifier</button>';
                }
            },
        ]
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

    function updateQuantiteDropdown(quantiteDisponible) {
        var quantiteDropdown = $('#quantite');
        quantiteDropdown.empty();
    
        // Ajouter les options à la liste déroulante en fonction de la quantité disponible
        for (var i = 1; i <= quantiteDisponible; i++) {
            quantiteDropdown.append('<option value="' + i + '">' + i + '</option>');
        }
    }
    
    // Fonction pour récupérer les détails du produit
    function getProduitDetails(produitId) {
        console.log("getProduitDetails called for produitId:", produitId);
         // Utilisez la valeur de produitId pour effectuer une requête AJAX
         $.ajax({
            url: '/produit/quantite/' + produitId + '/',
            type: 'GET',
            dataType: 'json',
            success: function (produitDetails) {
                var quantiteDisponible = produitDetails.quantite;
                // Mise à jour de la liste déroulante de quantité
                updateQuantiteDropdown(quantiteDisponible);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.error("Erreur lors de la récupération des détails du produit :", textStatus, errorThrown);
            }
        });
    }
    
    $('#produit').on('change', function () {
        console.log("Option changed");
        var selectedProduitId = $(this).val();
        setTimeout(function () { getProduitDetails(selectedProduitId); }, 1000); 
    });

    $("#btn").click(function () {
        var nom = $("#nom");
        var prenom = $("#prenom");
        var produit = $("#produit");
        var quantite = $("#quantite");
        var date_reservation = $("#date_reservation");
        var statut = $("#statut");
        var utilisateur = $("#utilisateur");
    
        if ($('#btn').text() == 'Ajouter') {
            if (MyTools.Validation()) {
                var s = {
                    nom: nom.val(),
                    prenom: prenom.val(),
                    produit: produit.val(),
                    quantite: parseInt(quantite.val()),
                    date_reservation: date_reservation.val(),
                    statut: statut.val(),
                    utilisateur: parseInt(utilisateur.val()),  // Utiliser directement la valeur numérique
                };
                var csrfToken = $("[name=csrfmiddlewaretoken]").val();

                $.ajax({
                    url: '/reservation/',
                    contentType: "application/json",
                    data: JSON.stringify(s),
                    type: 'POST',
                    headers: {
                        "X-CSRFToken": csrfToken
                    },
                    success: function (data) {
                        var reservationId = data.id;
                        // Vérifier si le statut est en attente
                        if (statut.val() === 'En attente') {
                            // Mettre à jour la quantité du produit associé
                            $.ajax({
                                url: '/produit/up/quantite/' + reservationId + '/',
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
                        }
                        table.ajax.reload();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error("AJAX error:", textStatus, errorThrown);
                        alert("Une erreur s'est produite lors de l'ajout de la réservation. Veuillez réessayer.");
                    }
                });
            }
        }
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
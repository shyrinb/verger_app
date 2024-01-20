$(document).ready(function () {

    var table = $('#tclient').DataTable({
        ajax: {
            url: "/client/",
            dataSrc: ''
        },
        columns: [
            { data: "id" },
            { data: "nom_client" },
            { data: "prenom" },
            { data: "email" },
            { data: "adresse_client" },
            { data: "telephone" },
            {
                render: function () {
                    return '<button type="button" class="btn btn-outline-danger supprimer">Supprimer</button>';
                }
            }
        ]
    });

    $('#table-content').on('click', '.supprimer', function () {
        var id = $(this).closest('tr').find('td').eq(0).text();
        var oldRow = $(this).closest('tr').clone();

        var newRow = '<tr style="position: relative;" class="bg-light" ><th scope="row">'
            + id
            + '</th><td colspan="4" style="height: 100%;">';
        newRow += '<h4 class="d-inline-flex">Voulez-vous vraiment supprimer ce client ? </h4>';
        newRow += '<button type="button" class="btn btn-outline-primary btn-sm confirmer" style="margin-left: 25px;">Oui</button>';
        newRow += '<button type="button" class="btn btn-outline-danger btn-sm annuler" style="margin-left: 25px;">Non</button></td></tr>';

        $(this).closest('tr').replaceWith(newRow);

        $('.annuler').click(function () {
            $(this).closest('tr').replaceWith(oldRow);
        });

        $('.confirmer').click(function (e) {
            e.preventDefault();
            $.ajax({
                url: `/client/${id}/`,
                type: 'DELETE',
                headers: { 'X-CSRFToken': getCookie('csrftoken') },
                success: function (data, textStatus, jqXHR) {
                    console.log(data);
                    table.ajax.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $("#error").modal();
                }
            });
        });
    });

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

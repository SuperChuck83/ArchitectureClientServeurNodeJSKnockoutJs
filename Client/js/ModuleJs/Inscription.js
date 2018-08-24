var InscriptionViewModel = function (params) {

    //RootModel => le viewModel parent passé en paramètre du composant dans le HTML ( //component: { name: "Inscription-Component",params: { ViewModel: $root}}// ) 
    var RootModel = params.ViewModel;

    //Model propre au composant.
    var _that = this;
    _that.text = ko.observable("Variable dans le model InscriptionViewModel(Inscription.js) ");

    //lors du clique sur le bouton d'inscription ...
    _that.InscriptionClick = function () {
        InscriptionServer();
    }

    //l'objet d'inscription qu'on enverra au serveur pour inscrire l'utilisateur
    _that.ObjetInscription = {};
    _that.ObjetInscription.pseudo = ko.observable("");
    _that.ObjetInscription.mdp1 = ko.observable("");
    _that.ObjetInscription.mdp2 = ko.observable("");



    /******Ajax call function  ******/
    var InscriptionServer = function () {
        $.ajax({
            url: GetAppUrl() + "api/InscriptionUser",
            type: 'POST',
            data: { pseudo: _that.ObjetInscription.pseudo(), mdp1: _that.ObjetInscription.mdp1(), mdp2: _that.ObjetInscription.mdp2() }, //les paramètres qu'on utilisera côté serveur 
            success: function (result) {
                if (result.success) {
                    $.notify(result.message, "success");

                    //on vide l'objet inscription 
                    _that.ObjetInscription.pseudo("");
                    _that.ObjetInscription.mdp1("");
                    _that.ObjetInscription.mdp2("");
                }
                else {
                    for (var i in result.message) {
                        $.notify(result.message[i], "error");
                    }
                }
            },
            error: function (e) {
                $.notify(e.responseText, "error");
            }
        });
    }
    /******FIN Ajax call function  ******/

}


var ConnexionViewModel = function (params) {
 
    //RootModel => le viewModel parent passé en paramètre du composant dans le HTML ( //component: { name: "Inscription-Component",params: { ViewModel: $root}}// ) 
    var RootModel = params.ViewModel;

    //Model propre au composant.
    var _that = this;
   
    //lors du clique sur le bouton de connexion ...
    _that.ConnexionClick = function () {
        RootModel.socket.emit("TestConnection", { pseudo: _that.ObjetConnexion.pseudo(), pwd: _that.ObjetConnexion.mdp() });
    }

    //l'objet d'inscription qu'on enverra au serveur pour inscrire l'utilisateur
    _that.ObjetConnexion = {};
    _that.ObjetConnexion.pseudo = ko.observable(getCookie("MonSiteUsername"));
    _that.ObjetConnexion.mdp = ko.observable(getCookie("MonSitePassword"));



    /******SERVEUR EVENT socket******/
    {
        //Quand le serveur accepte la connection 
        RootModel.socket.on('ConnectionDone', function (data) { //.code et .message
            //si connection réussi 
            if (data.code == 1) {

                setCookie("MonSiteUsername", data.pseudo);
                setCookie("MonSitePassword", _that.ObjetConnexion.mdp());
                setCookie("MonSiteToken", data.token);

                RootModel.user.pseudo(data.pseudo);
                RootModel.user.token(data.token);

                $.notify(data.message, "success");

                //on cache le module d'accueil une fois qu'on est connecté
                RootModel.AccueilModule.AccueilVisible(false);

            }
            else {
                $.notify(data.message, "error");
            }
        });

    }
    /******FIN SERVEUR EVENT ******/


}


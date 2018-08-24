var MiniTchatViewModel = function (params) {

    //RootModel => le viewModel parent passé en paramètre du composant dans le HTML ( //component: { name: "Inscription-Component",params: { ViewModel: $root}}// ) 
    var RootModel = params.ViewModel;

    //Model propre au composant.
    var _that = this;
 
    //observable pour l'input du tchat
    _that.MessageTchat = ko.observable("");
    //Observable array pour la liste des messages reçu. (utilisé dans miniTchat.html ) 
    _that.ListeMessageTchat = ko.observableArray([]);


    //quand on clique sur un bouton pour envoyer le message dans le tchat
    _that.EnvoiMessageDansTchat = function () {

        var msgToSend = { message: _that.MessageTchat() }
        _that.MessageTchat(""); //on vide l'input du message

        RootModel.socket.emit("TchatRecoisMessage", msgToSend);
    }


    /******SERVEUR EVENT socket******/
    {
        //message de succès ou d'erreur du serveur 
        RootModel.socket.on("TchatEnvoisMessage", function (dataMessage) { /****dataMessage= {pseudo,message}****/

            //on ajoute l'objet message du serveur à notre liste de message pour que l'ihm se rafraichisse automatiquement avec le nouveau message.
            _that.ListeMessageTchat.push(dataMessage);
           
        })
      
    }
    /******FIN SERVEUR EVENT ******/



}


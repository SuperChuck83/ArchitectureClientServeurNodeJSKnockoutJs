$(document).ready(function () {

    function getParam(param) {
        return new URLSearchParams(window.location.search).get(param);
    }

    // This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
    function AppViewModel() {


        var APP_URL = GetAppUrl();

        var self = this;
        self.firstPWD = ko.observable("");
        self.secondPWD = ko.observable("");
        self.Confirmer = function () {
            var id = getParam("id");

            if (self.firstPWD() == self.secondPWD() && self.firstPWD().length> 3 )
            {
                $.ajax({
                    url: APP_URL + "SetNewPassword",
                    type: 'POST',
                    data: { 'token': id, 'newmdp': self.firstPWD() },
                    success: function (result) {

                        if (result == "OK") {
                            $.notify("Tu peux te connecter au site avec ton nouveau mot de passe.", "success");
                        }
                        else {
                            $.notify("Erreur dans la modification du mot de passe :  la demande de changement a expiré et n'est valable qu'1 jour", "error");
                        }
                        

                    }
                });

            }
            else {
                $.notify("Les mots de passe ne sont pas identique et doivent faire plus de 3 caractères !", "error");
            }
           

        };

    }
    // Activates knockout.js
    ko.applyBindings(new AppViewModel());








});
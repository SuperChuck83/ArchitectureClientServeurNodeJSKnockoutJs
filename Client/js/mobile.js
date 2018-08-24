$(document).ready(function () {


    window.addEventListener('load', function () {
        window.history.pushState({}, '')
    })

    window.addEventListener('popstate', function () {
        window.history.pushState({}, '')
    })


    var Linkify = function (inputText) {
        //URLs starting with http://, https://, or ftp://
        var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        var replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

        //URLs starting with www. (without // before it, or it'd re-link the ones done above)
        var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var replacedText = replacedText.replace(replacePattern2, '$1<a href="https://$2" target="_blank">$2</a>');

        //Change email addresses to mailto:: links
        var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
        var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

        return replacedText
    }

    //activate nosleep
    var noSleep = new NoSleep();

    console.log("NS-Activate");



    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    const publicVapidKey = "BDwxkhvooiO1NMyxKfx2jodr-rQFzTvR1PMdEZN4zrQc3vszeulUkAzZOKawnaZBQXQBVvqd-MxKAHb4KYiVXy8";


    if ('serviceWorker' in navigator) {

        navigator.serviceWorker.getRegistration().then(function (regi) {

            if (regi) {
                regi.update();
            }

            navigator.serviceWorker.register('/sw', { scope: '/', useCache: false }).then(function (reg) {

                if (reg.installing) {

                    console.log('Service worker installing ' + reg.scope);
                } else if (reg.waiting) {

                    console.log('Service worker installed' + reg.scope);
                } else if (reg.active) {

                    console.log('Service worker active' + reg.scope);
                }


            }).catch(function (error) {
                // registration failed

                console.log('Registration failed with ' + error);
            });



        });

    }


    var APP_URL = GetAppUrl();
    var APP_URLFW = GetFireWaterUrl();
    var APP_URLFK = GetFraiseKeroseneUrl();

    var date = new Date();
    date.setFullYear(date.getFullYear() - 120);
    $('.datepicker').datepicker({
        language: 'fr',
        autoclose: true,
        minDate: date,
        endDate: '0d',
        defaultViewDate: "year"
    });

    function $_GET(param) {
        var vars = {};
        window.location.href.replace(location.hash, '').replace(
            /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
            function (m, key, value) { // callback
                vars[key] = value !== undefined ? value : '';
            }
        );

        if (param) {
            return vars[param] ? vars[param] : null;
        }
        return vars;
    }

    function setCookie(sName, sValue) {
        var today = new Date(), expires = new Date();
        expires.setTime(today.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = sName + "=" + encodeURIComponent(sValue) + ";expires=" + expires.toGMTString();
    };
    function getCookie(sName) {
        var cookContent = document.cookie, cookEnd, i, j;
        var sName = sName + "=";

        for (i = 0, c = cookContent.length; i < c; i++) {
            j = i + sName.length;
            if (cookContent.substring(i, j) == sName) {
                cookEnd = cookContent.indexOf(";", j);
                if (cookEnd == -1) {
                    cookEnd = cookContent.length;
                }
                return decodeURIComponent(cookContent.substring(j, cookEnd));
            }
        }
        return null;
    }


    var options = {};
    options.transports = ['websocket'];
    var socket = io.connect(GetAppUrl(), options);
    // var socket = io();
    //connection au serveur de notification
    var NotifSocket = io.connect(GetNotifUrl(), options);


    // This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
    function AppViewModel() {
        paypal.Button.render({

            env: 'production', // sandbox | production

            // Show the buyer a 'Pay Now' button in the checkout flow
            commit: true,

            // payment() is called when the button is clicked
            payment: function () {

                if (getCookie("frutiUserName") && getCookie("frutiToken")) {

                    // Set up a url on your server to create the payment
                    var CREATE_URL = APP_URL + "PaypalCreate";

                    // Make a call to your server to set up the payment
                    return paypal.request.post(CREATE_URL)
                        .then(function (res) {

                            return res.id;
                        });
                }
                else {
                    $.notify("Autorise les cookie dans ton navigateur ou reconnecte toi au site", "error");
                }
            },

            // onAuthorize() is called when the buyer approves the payment
            onAuthorize: function (data, actions) {

                // Set up a url on your server to execute the payment
                var EXECUTE_URL = APP_URL + "PaypalExecute";

                if (getCookie("frutiUserName") && getCookie("frutiToken")) {
                    // Set up the data you need to pass to your server
                    var data = {
                        paymentID: data.paymentID,
                        payerID: data.payerID,
                        pseudo: getCookie("frutiUserName"),
                        token: getCookie("frutiToken")

                    };

                    // Make a call to your server to execute the payment
                    return paypal.request.post(EXECUTE_URL, data)
                        .then(function (res) {

                            self.player.kikooz(res);
                            //self.Historique.AddNotifOrLoadHisto();
                            $.notify("Achat de kikooz effectué avec succès !", "success");
                        });
                }
                else {
                    $.notify("Autorise les cookie dans ton navigateur ou reconnecte toi au site", "error");
                }
            }
        }, '#paypal-button-container');

        socket.on('disconnect', function () { if ($_GET("device") != "android") { location.reload() } else { $('#decomodal').modal('show'); }  /* $('#decomodal').modal('show');*/ });

        socket.on('decoForce', function () { $('#decomodal').modal('show'); });

        socket.on("ExperienceGain", function (data) {
            self.player.experience(self.player.experience() + data.xp);
            $.notify(data.message, "warn");


        });
        socket.on("ErreurServeur", function (data) {

            $.notify(data, "error");
        })
        socket.on("SuccessServeur", function (data) {

            $.notify(data, "success");
        })

        socket.on("Myping", function () {

            socket.emit("Mypong", { a: 1 });
        });

        //self = this pour toujours etre dans le bon context
        var self = this;

        self.capitalizeFirstLetterNO = function (string) {

            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        self.capitalizeFirstLetter = function (stringObservable) {

            return stringObservable().charAt(0).toUpperCase() + stringObservable().slice(1);
        }


        var height = $(window).height();
        height = height - 135;
        self.ScreenHeight = ko.observable(height + "px");

        $(window).resize(function () {
            // This will execute whenever the window is resized
            var height2 = $(window).height();
            height2 = height2 - 150;
            self.ScreenHeight(height2 + "px");

        });

        self.player =
        {
            pseudo: ko.observable(""),
            motdepasse: ko.observable(getCookie("frutiPassword")),
            token: ko.observable(""),
            codeAvatar: ko.observable(""),
            kikooz: ko.observable(""),
            isTotoche: ko.observable(false),
            experience: ko.observable()
        };

        if (getCookie("frutiUserName")) {
            self.player.pseudo(getCookie("frutiUserName").toLowerCase());
        }

        var GetNumberNotificationHistoric = function () {
            $.ajax({
                url: APP_URL + "GetNumberNotificationHistoric",
                type: 'POST',
                data: { 'pseudo': self.player.pseudo() },
                success: function (result) {

                    self.Historique.notificationNumber(self.Historique.notificationNumber() + result.nombreNotifHisto);
                    self.DossierMail.NumberMailNonLu(self.DossierMail.NumberMailNonLu() + result.nombreNotifMail);

                }
            });

        }

        //gestion avatar factry
        self.avatarHeader = {};
        self.avatarHeader = AvatarHeaderFactory(); //fichier js avatarFactory

        //le serveur previens le client qu'il na plus besoin d'être totoché 
        socket.on('NotTototcheAnymore', function (data) {
            self.player.isTotoche(false);
            self.avatarHeader.BeHappy();

            $.notify("Tu n'es plus totoché !", "success");

        });

        self.avatarHeader.BeTotoche = function () {

            self.avatarHeader.TypeEmotebouche("5");
            self.avatarHeader.SetAvatar(false, self.player.codeAvatar());

        }

        self.avatarHeader.BeNeutral = function () {
            if (!self.player.isTotoche()) {

                self.avatarHeader.TypeEmotebouche("2");
                self.avatarHeader.TypeEmoteyeux("1");
                self.avatarHeader.SetAvatar(false, self.player.codeAvatar());

                socket.emit("beNeutre");
            }

        }
        self.avatarHeader.BeHappy = function () {
            if (!self.player.isTotoche()) {
                self.avatarHeader.TypeEmotebouche("1");
                self.avatarHeader.TypeEmoteyeux("1");
                self.avatarHeader.SetAvatar(false, self.player.codeAvatar());
                socket.emit("beHappy");
            }


        }
        self.avatarHeader.BeVeryHappy = function () {
            if (!self.player.isTotoche()) {
                self.avatarHeader.TypeEmotebouche("3");
                self.avatarHeader.TypeEmoteyeux("2");
                self.avatarHeader.SetAvatar(false, self.player.codeAvatar());
                socket.emit("beVeryHappy");
            }


        }
        self.avatarHeader.BeSad = function () {
            if (!self.player.isTotoche()) {
                self.avatarHeader.TypeEmotebouche("4");
                self.avatarHeader.TypeEmoteyeux("3");
                self.avatarHeader.SetAvatar(false, self.player.codeAvatar());
                socket.emit("beSad");
            }


        }
        self.avatarHeader.BeJerk = function () {
            if (!self.player.isTotoche()) {
                self.avatarHeader.TypeEmotebouche("1");
                self.avatarHeader.TypeEmoteyeux("4");
                self.avatarHeader.SetAvatar(false, self.player.codeAvatar());
                socket.emit("beJerk");
            }


        }
        self.avatarHeader.BeAngry = function () {
            if (!self.player.isTotoche()) {
                self.avatarHeader.TypeEmotebouche("4");
                self.avatarHeader.TypeEmoteyeux("4");
                self.avatarHeader.SetAvatar(false, self.player.codeAvatar());
                socket.emit("beAngry");
            }

        }
        //FIN avatar factory


        //gestion de la connection
        self.AskAllow = ko.observable(true);
        self.clickAskForConnection = function () {
            self.player.pseudo(self.player.pseudo().toLowerCase());
            if (socket.connected) {
                self.AskAllow(false);
                noSleep.enable();
                //noSleep.disable();
                data = {
                    pseudal: self.player.pseudo(),
                    pwd: self.player.motdepasse(),
                };
                socket.emit('TestConnection', data);
            }
        };

        self.connectionAutorise = ko.observable(false);
        socket.on('ConnectionDone', function (data) { //.code et .message
            //si connection réussi 
            self.AskAllow(true);
            if (data.code == 1) {
                setCookie("frutiUserName", self.player.pseudo().toLowerCase());
                setCookie("frutiPassword", self.player.motdepasse());
                setCookie("frutiToken", data.token);
                self.player.token(data.token);
                self.player.isTotoche(data.isTotoche);
                //on set l'avatar de l'accueil 
                self.player.codeAvatar(data.codeAvatar);
                self.avatarHeader.SetAvatar(true, self.player.codeAvatar());

                //on montre à l'user combien de kikooz il possède 
                self.player.kikooz(data.kikooz);

                self.connectionAutorise(true);
                //1- on demande à recuperer la liste contact 
                // socket.emit("GetListeContact");


                //on recupere le nombre de notification de l'historique et de mail 
                GetNumberNotificationHistoric();

                GetContactOnline();

                getListeProfilUser();

                //on instancie le module de notification
                //demande d'authentification au serveur de notification
                NotifSocket.emit("AskForAuthorization", { pseudo: self.player.pseudo(), token: self.player.token(), zone: "bureau" });

                NotifSocket.on("NewNotification", function (data) {

                    if (data.destinataire == self.player.pseudo() || data.destinataire == "all") {

                        if (data.type == undefined) {
                            data.type = "success";
                        }
                        $.notify(data.message, data.type);

                        if (data.environement == "forum") {
                            self.Historique.notificationNumber(self.Historique.notificationNumber() + 1);
                        }
                        else if (data.environement == "blog") {
                            self.DossierMail.NumberMailNonLu(self.DossierMail.NumberMailNonLu() + 1);
                        }


                        if (data.action != undefined) {
                            if (data.action.type == "xp") {
                                self.player.experience(self.player.experience() + data.action.inc);

                            }
                        }
                    }
                });

                NotifSocket.emit("SendNotificationToMe", { destinataire: "all", message: "Bienvenue !" });

                NotifSocket.emit("SendNotifDisconnect");

                NotifSocket.on("ExperienceGain", function (data) {
                    self.player.experience(self.player.experience() + data.xp);
                    $.notify(data.message, "warn");

                });

                NotifSocket.on("AnnonceEveryOne", function (message) {
                    self.AnnonceMessage(message);
                    $('#Annoncemodal').modal('show');

                    var maxZ = Math.max.apply(null,
                        $.map($('body *'), function (e, n) {
                            if ($(e).css('position') != 'static')
                                return parseInt($(e).css('z-index')) || 1;
                        }));
                    $("#Annoncemodal").css("z-index", maxZ + 1);


                });

            }
            else {
                $.notify(data.message, "error");
            }

        });
        self.AnnonceMessage = ko.observable("");
        //FIN gestion de la connection 

        //gestion inscription 

        self.InscriptionVisible = ko.observable(false);
        self.ConnectionVisible = ko.observable(true);
        self.inscriptionClick = function () {

            self.InscriptionVisible(true);
            self.ConnectionVisible(false);
        };
        self.ConnectClick = function () {

            self.InscriptionVisible(false);
            self.ConnectionVisible(true);
        };

        //factory inscription 
        self.ObjetInscription = ObjetInscriptionFactory();
        self.ObjetInscription.radioSelectedOptionValue.subscribe(function (newValue) {
            if (newValue == "M") {
                //change yeux
                self.avatarManager.oeilType = "1";
                self.avatarManager.yeux("Client/img/SVG/Yeux/1/1/1/blanc.svg");
                self.avatarManager.oeilColorFlag = 0;

                //change cheveux 
                self.avatarManager.CheveuxType = "1";
                self.avatarManager.CheveuxFormeFlag = 0;
                self.avatarManager.cheveux("Client/img/SVG/Cheveux/1/1/blanc.svg");
                self.avatarManager.ClasseFactorySetClass();
            }
            else {
                //change yeux
                self.avatarManager.oeilType = "2";
                self.avatarManager.yeux("Client/img/SVG/Yeux/2/1/1/blanc.svg");
                self.avatarManager.oeilColorFlag = 0;
                //change cheveux 
                self.avatarManager.CheveuxType = "2";
                self.avatarManager.CheveuxFormeFlag = 0;
                self.avatarManager.cheveux("Client/img/SVG/Cheveux/2/1/blanc.svg");
                self.avatarManager.ClasseFactorySetClass();
            }
        });
        self.ObjetInscription.radioSelectedOptionValue("M");

        self.ClickInscription = function () {
            var data = {};
            data.pseudo = self.ObjetInscription.pseudo();
            //data.age = self.ObjetInscription.age();
            data.DateNaissance = self.ObjetInscription.DateNaissance();
            data.mdp1 = self.ObjetInscription.mdp1();
            data.mdp2 = self.ObjetInscription.mdp2();
            data.region = self.ObjetInscription.selectedRegion().id;
            data.genre = self.ObjetInscription.radioSelectedOptionValue();
            data.email = self.ObjetInscription.email();
            data.parrain = self.ObjetInscription.parrain();
            data.CharteLu = self.ObjetInscription.CharteLu();
            data.codeAvatar = self.avatarManager.GetCodeAvatarInscription();
            socket.emit("UserToInsert", data);
        };

        self.InscriptionFinish = ko.observable(false);
        socket.on("inscriptionSuccess", function () {

            $.notify("Tu es bien inscrit, connecte toi au site !", "success");
            self.InscriptionFinish(true);
            self.InscriptionVisible(false);
            self.ConnectionVisible(true);

            self.player.pseudo(self.ObjetInscription.pseudo());
            self.player.motdepasse("");

            //clear objet inscription
            self.ObjetInscription.clear();

        });


        self.avatarManager = AvatarHeaderFactory(true, self.ObjetInscription);

        self.ListeRegion = ko.observableArray([]);


        //fin gestion inscription 

        //gestion hamburger menu 
        self.Hamburger = {};
        self.Hamburger.isOpen = ko.observable(false);
        self.Hamburger.OpenOrClose = function () {
            if (self.Hamburger.isOpen()) {
                self.Hamburger.isOpen(false);
            }
            else {
                self.Hamburger.isOpen(true);
            }
        };

        self.listMenu = ko.observableArray([]);

        var Accueil = {};
        Accueil.Libelle = "Accueil";
        Accueil.isSelect = ko.observable(true);
        Accueil.Select = function (FlagOpen) {
            deselectAllMenu();
            Accueil.isSelect(true);

            if (FlagOpen != 42) {
                self.Hamburger.OpenOrClose();
            }

        }
        var Salon = {};
        Salon.Libelle = "Salons";
        Salon.isSelect = ko.observable(false);
        Salon.Select = function (FlagOpen) {
            deselectAllMenu();
            Salon.isSelect(true);
            if (FlagOpen != 42 && FlagOpen != 43) {
                self.Hamburger.OpenOrClose();
            }
            if (FlagOpen == 43)
            {
                //on reduit tous les salons ouvert 
                for (var i in self.ListeSalonOuvert()) {
                    self.ListeSalonOuvert()[i].reduce(42);
                }

                //on affiche la liste des salons !
                self.ListeSalonVisible(true);
            }

            socket.emit('JoinListeSalon');
        };
        var Messagerie = {};
        Messagerie.Libelle = "Messagerie";
        Messagerie.isSelect = ko.observable(false);
        Messagerie.Select = function (FlagOpen) {
            deselectAllMenu();
            Messagerie.isSelect(true);
            if (FlagOpen != 42) {
                self.Hamburger.OpenOrClose();
            }

            GetListeMail();
            GetListeMailSend();
        };
        var MesItems = {};
        MesItems.Libelle = "Mes items";
        MesItems.isSelect = ko.observable(false);
        MesItems.Select = function (FlagOpen) {
            deselectAllMenu();
            MesItems.isSelect(true);
            if (FlagOpen != 42) {
                self.Hamburger.OpenOrClose();
            }
            GetMyItem();
        };
        var MesContacts = {};
        MesContacts.Libelle = "Contacts";
        MesContacts.isSelect = ko.observable(false);
        MesContacts.Select = function (FlagOpen) {
            deselectAllMenu();
            MesContacts.isSelect(true);
            if (FlagOpen != 42) {
                self.Hamburger.OpenOrClose();
            }

            socket.emit("GetListeContact");

        };
        var Boutique = {};
        Boutique.Libelle = "Boutique";
        Boutique.isSelect = ko.observable(false);
        Boutique.Select = function (FlagOpen) {
            deselectAllMenu();
            Boutique.isSelect(true);
            if (FlagOpen != 42) {
                self.Hamburger.OpenOrClose();
            }
        };

        var Jeux = {};
        Jeux.Libelle = "Mes jeux";
        Jeux.isSelect = ko.observable(false);
        Jeux.Select = function (FlagOpen) {
            deselectAllMenu();
            Jeux.isSelect(true);
            if (FlagOpen != 42) {
                self.Hamburger.OpenOrClose();
            }
            socket.emit("GetJeuxDispo");
        };




        var deselectAllMenu = function () {
            for (var i in self.listMenu()) {
                self.listMenu()[i].isSelect(false);
            }
            self.ProfilVisible(false);//deselectionne le profil
        };

        self.listMenu.push(Accueil);
        self.listMenu.push(Salon);
        self.listMenu.push(Messagerie);
        self.listMenu.push(MesItems);
        self.listMenu.push(MesContacts);
        self.listMenu.push(Jeux);
        self.listMenu.push(Boutique);
        //fin gestion hamburger menu 


        // subscribe to visibility change events
        document.addEventListener('visibilitychange', function () {
            // fires when user switches tabs, apps, goes to homescreen, etc.
            if (document.visibilityState == 'hidden') {
            }

            // fires when app transitions from prerender, user returns to the app / tab.
            if (document.visibilityState == 'visible') {

                socket.emit("Mypong");
                if (self.listMenu()[5].isSelect()) {
                    socket.emit("GetJeuxDispo");
                }


            }
        });


        //gestion accueil 

        //self.goToForum = function ()
        //{

        //    window.open(APP_URL + 'forum?pseudo=' + self.player.pseudo().toLowerCase() + "&token=" + self.player.token(), '_blank');
        //}
        //self.goToBlog = function () {
        //    window.open(APP_URL + 'FrutiBlog?pseudo=' + self.player.pseudo().toLowerCase() + "&mypseudo=" + self.player.pseudo().toLowerCase() + "&token=" + self.player.token(), '_blank');
        //}


        self.ForumUrl = ko.pureComputed(function () {
            return APP_URL + 'forum?pseudo=' + self.player.pseudo().toLowerCase() + "&token=" + self.player.token() + "&mobile=true";
        }, this);

        self.BlogUrl = ko.pureComputed(function () {
            return APP_URL + 'FrutiBlog?pseudo=' + self.player.pseudo().toLowerCase() + "&mypseudo=" + self.player.pseudo().toLowerCase() + "&token=" + self.player.token()
        }, this);
        //fin gestion accueil



        //gestion feutre 
        self.listeFeutreArray = ko.observableArray([]);
        socket.on("S_ListeFeutreUser", function (data) {
            self.listeFeutreArray.removeAll();
            for (var i in data) {
                self.listeFeutreArray.push(data[i]);
            }

        });

        //gestion des feutres des salons 
        var ListeFeutreDisponible = function () {

            var ListeFeutreArray = [];

            var selfListeFeutre = self.listeFeutreArray();
            for (var i in selfListeFeutre) {
                ListeFeutreArray.push({
                    SelfListe: ListeFeutreArray,
                    id: i, Libelle: selfListeFeutre[i].nom, img: ko.observable("Client/img/feutre/" + selfListeFeutre[i].imgOpen), imgAvecCapuchon: "Client/img/feutre/" + selfListeFeutre[i].imgOpen, imgSansCapuchon: "Client/img/feutre/" + selfListeFeutre[i].imgClose, open: ko.observable(false),
                    clique: function () {
                        if (this.open()) {
                            this.open(false);
                            this.img(this.imgAvecCapuchon); //capuchon 
                        }
                        else {
                            for (var i in this.SelfListe) {
                                this.SelfListe[i].open(false);
                                this.SelfListe[i].img(this.SelfListe[i].imgAvecCapuchon);
                            }

                            this.open(true);
                            this.img(this.imgSansCapuchon); //pas de capuchon

                        }

                    }
                });


            }

            //la liste des feutres que possède l'utilisateur => l'objectif final est d'obtenir la liste des feutres que possèdes l'utilisateur en requentant la base de donnée 
            return ListeFeutreArray;
        }
        //fin gestion feutre


        //gestion des salons 
        self.ListeSalonArray = [];
        self.ListeSalonArray.push({ id: 0, Libelle: "Temple du grand piquant", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 1, Libelle: "Nuage d'Egerie", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 2, Libelle: "Atelier Arc-en-ciel", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 3, Libelle: "Laboratoire Kiwix", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 4, Libelle: "Forêt Enchantée", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 5, Libelle: "La montagne des Loups-Garous", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 6, Libelle: "Fruti-Théâtre", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 7, Libelle: "Marais d'Ornégon", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 8, Libelle: "Plage Banana-Nuit", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 9, Libelle: "Ile olympique de môh", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 10, Libelle: "Taverne Far-Zest", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonArray.push({ id: 11, Libelle: "Salon Anim's", nbco: ko.observable(0), newMessage: ko.observable(false) });
        self.ListeSalonVisible = ko.observable(true);
        self.SalonNewMessage = ko.observable(0);

        self.SalonListNewMessage = ko.observableArray();

        //lorsqu'on recoit les info d'un salon ( id et liste de player connecté)
        socket.on('InfoSalon', function (data) {

            var IndexSalon = _.findIndex(self.ListeSalonOuvert(), { id: data.id });
            if (IndexSalon != -1) {

                self.ListeSalonOuvert()[IndexSalon].NbConnecte(data.ListePlayerSalon.length);

                data.ListePlayerSalon = data.ListePlayerSalon.sort(function (a, b) {
                    if (a.pseudo < b.pseudo) return -1;
                    if (b.pseudo < a.pseudo) return 1;
                    return 0;
                });

                self.ListeSalonOuvert()[IndexSalon].ListeConnecte(data.ListePlayerSalon); //pseudo, genre
            }
        });

        //recoit le nombre de co d'un salon 
        socket.on('InfoListeSalon', function (data) {
            for (var i in data) {
                self.ListeSalonArray[i].nbco(data[i]);
            }
        });


        //la liste des salons ouvert dans l'appli 
        self.ListeSalonOuvert = ko.observableArray();

        self.ListeSalonConnecte = ko.observableArray();
        //open one salon//
        self.OpenOneSalon = function (data) {

            //on ferme la liste des salons dès qu'on clique sur un salon 
            self.ListeSalonVisible(false);

            if (_.findIndex(self.ListeSalonOuvert(), { id: data.id }) == -1) {

                self.ListeSalonOuvert.push({
                    id: data.id, Libelle: ko.observable(data.Libelle), ListeFeutreSalon: ListeFeutreDisponible(), FlagPrivate: ko.observable(data.FlagPrivate), FlagNotPublic: ko.observable(data.FlagNotPublic), newMessage: ko.observable(false),
                    FeutreEnCours: function () {
                        var idfeutre = -1;
                        for (var i in this.ListeFeutreSalon) {
                            if (this.ListeFeutreSalon[i].open()) {
                                idfeutre = this.ListeFeutreSalon[i].id;
                                break;
                            }
                        }
                        return idfeutre;
                    },
                    BouilleBig: ko.observable(true),
                    SetBouilleTaille: function () {

                        if (this.BouilleBig()) {
                            this.BouilleBig(false);
                        }
                        else {
                            this.BouilleBig(true);
                        }
                    },
                    FeutreUsing: ko.observable(null),
                    FeutreUsingIndex: null,
                    ChangeFeutreUsing: function () {
                        if (this.FeutreUsing() == null) {
                            this.FeutreUsingIndex = 0;
                            this.ListeFeutreSalon[this.FeutreUsingIndex].open(true);
                            this.FeutreUsing(this.ListeFeutreSalon[this.FeutreUsingIndex]);
                        }
                        else {
                            if (this.FeutreUsingIndex == this.ListeFeutreSalon.length) {
                                this.ListeFeutreSalon[this.FeutreUsingIndex].open(false);
                                this.FeutreUsingIndex = null;
                                this.FeutreUsing(null);
                            }
                            else {
                                if (this.ListeFeutreSalon[this.FeutreUsingIndex] != undefined) {
                                    this.ListeFeutreSalon[this.FeutreUsingIndex].open(false);
                                    this.FeutreUsingIndex = this.FeutreUsingIndex + 1;
                                    this.FeutreUsing(this.ListeFeutreSalon[this.FeutreUsingIndex]);
                                    if (this.ListeFeutreSalon[this.FeutreUsingIndex] != undefined) {
                                        this.ListeFeutreSalon[this.FeutreUsingIndex].open(true);
                                    }
                                }



                            }


                        }
                    },
                    ListeBouille: ko.observableArray(),
                    ListeConnecte: ko.observableArray(),
                    NbConnecte: ko.observable(0),
                    IsOpen: ko.observable(true),
                    blocFeutreIsOpen: ko.observable(false), blocUserTchatIsOpen: ko.observable(true),
                    BouilleShowerIsOpen: ko.observable(true),
                    BouilleShowerOpen: function (data) {

                        if (this.BouilleShowerIsOpen()) {
                            this.BouilleShowerIsOpen(false);

                        } else {
                            this.BouilleShowerIsOpen(true);

                        }

                    },
                    blocUserTchatOpen: function (data) {

                        if (this.blocUserTchatIsOpen()) {
                            this.blocUserTchatIsOpen(false);


                        } else {
                            this.blocUserTchatIsOpen(true);

                        }

                    },
                    blocFeutreOpen: function (data) {
                        if (this.blocFeutreIsOpen()) {
                            this.blocFeutreIsOpen(false)
                        } else {
                            this.blocFeutreIsOpen(true)
                        }

                    },
                    close: function () {
                        this.IsOpen(false);
                        var indexOf = _.findIndex(self.ListeSalonOuvert(), {
                            id: data.id
                        })
                        if (indexOf != -1) {
                            self.ListeSalonOuvert.splice(indexOf, 1);
                            //on informe le serveur qu'on a quitté un salon 
                            socket.emit('ExitSalon', data);
                        }

                        //on affiche les salons 
                        self.ListeSalonVisible(true);



                    },
                    open: function () {
                        this.IsOpen(true); this.newMessage(false);
                        
                        var indexOf = _.findIndex(self.SalonListNewMessage(), {
                            id: this.id
                        })
                        if (indexOf != -1) {

                            self.SalonListNewMessage().splice(1, indexOf);
                        }

                     
                        if (!this.FlagPrivate() && !this.FlagNotPublic()) {
                            //si c'est un salon publique on ajoute le bitonio  

                            var indexOf = _.findIndex(self.ListeSalonArray, {
                                id: this.id
                            })
                            if (indexOf != -1) {

                                self.ListeSalonArray[indexOf].newMessage(false);
                            }
                        }
                    },
                    reduce: function (identifier) {

                        this.IsOpen(false);

                        if (identifier != 42) {
                            self.ListeSalonVisible(true);
                           
                        }

                    },
                    openListeCo: function () {
                        self.ListeSalonConnecte.removeAll();
                        for (var i in this.ListeConnecte()) {
                            self.ListeSalonConnecte.push(this.ListeConnecte()[i]);
                        }
                        $("#myModalCoList").modal();
                    },
                    ListeMessage: ko.observableArray([]),
                    AddMessagetchat: function (data) {
                        var autoscrolltemp = this.autoscroll;
                        var stylePoliceEmote = "";
                        if (data.pseudo != null) {
                            //fomattage de la date 
                            var now = new Date(data.heure);

                            var Bouille = {};
                            Bouille = AvatarHeaderFactory();
                            Bouille.SetAvatar(true, data.codeAvatar);
                            Bouille.pseudo = data.pseudo;
                            var indexBouille = _.findIndex(this.ListeBouille(), { pseudo: data.pseudo });
                            if (indexBouille == -1) {
                                this.ListeBouille.push(Bouille);
                                // this.DeleteBouille(Bouille); //supprime la bouille après 2 secondes et demi 
                            }

                            if (data.type == "emote") {

                                stylePoliceEmote = "font-style : italic;";
                                if (data.message == "sifflote") {
                                    //Bouille.setSifflote();
                                    data.message = "<span style='" + stylePoliceEmote + "'>sifflote</span>";
                                }
                                else if (data.message == "rougit") {
                                    //Bouille.setRougit();
                                    data.message = "<span style='" + stylePoliceEmote + "'>rougit</span>";
                                }
                                else if (data.message == "question" || data.message == "oO") {

                                    data.message = "<span style='" + stylePoliceEmote + "'>se pose des questions ...</span>";
                                    //Bouille.setQuestion();
                                }
                                else if (data.message == "gum") {
                                    data.message = "<span style='" + stylePoliceEmote + "'>fait une bulle de chewing-gum !</span>";
                                    //Bouille.setGum();
                                }
                                else if (data.message == "pleure") {

                                    data.message = "<span style='" + stylePoliceEmote + "'>pleure.</span>";
                                    //Bouille.setPleure();
                                }
                                else if (data.message == "larme") {
                                    data.message = "<span style='" + stylePoliceEmote + "'>verse une larme.</span>";
                                    //Bouille.setPleure();
                                }
                                else if (data.message == "rigole") {
                                    data.message = "<span style='" + stylePoliceEmote + "'>rigole</span>";
                                    //Bouille.setRigole();
                                }
                                else if (data.message == "mdr" || data.message == "ptdr" || data.message == "lol") {
                                    data.message = "<span style='" + stylePoliceEmote + "'>éclate de rire</span>";
                                    //Bouille.setRigole();
                                }
                                else if (data.message == "regarde") {
                                    data.message = "<span style='" + stylePoliceEmote + "'>regarde ailleurs ...</span>";
                                    //Bouille.setRegarde();
                                }
                            }
                            else {
                                data.message = Linkify(data.message);
                                //fruti-wizz
                                data.message = data.message.replace(/@.[^\s]+/g, "<span style='color:#C0C0C0'> $& </span>");
                                data.message = data.message.replace(new RegExp("@" + self.player.pseudo(), 'i'), "<span class='wizz' style='color:#0000FF; display:inline-block;'>@" + self.capitalizeFirstLetterNO(self.player.pseudo()) + "</span>");
                             


                            }


                            if (data.base64 != null) {
                                data.message = "<div data-bind='click:toto'> <i class='fa fa-image toficon' style='font-size:25px;'></i> <img class='tofo' style='max-width:350px; max-height:350px; display:none;' src='" + data.base64 + "'/> </div>"
                            }
                            else {
                                var grasstyle = ""
                                if (data.color == "000055") {
                                    grasstyle = "font-weight:bold;";
                                }
                                data.message = "<span style='" + grasstyle + "'>" + data.message + " </span>"
                            }

                            //var Message = "<div class='speech-bubble' style=';margin-top:30px;color:#" + data.color + "'> <span>" + now.format("[HH:MM:ss]") + "</span> " + "<b>" + self.capitalizeFirstLetterNO(data.pseudo) + "</b> " + data.message + "</div>";
                            //$("#" + this.id).append(Message);

                            var lengthListe = this.ListeMessage().length - 1;
                            if (this.ListeMessage().length > 0) {

                                if (data.pseudo.toLowerCase() == this.ListeMessage()[lengthListe].pseudo.toLowerCase()) {

                                    //on supprime tous les wizz existant 
                                    this.ListeMessage()[lengthListe].message(this.ListeMessage()[lengthListe].message().replace(new RegExp("wizz", 'gi'), ""));
                                    //fin supression wizz

                                    this.ListeMessage()[lengthListe].message(this.ListeMessage()[lengthListe].message() + "<br/>" + "<span style='color:#" + data.color + "'>" + data.message + "</span>");

                                }
                                else {
                                    this.ListeMessage.push({ color: "#" + data.color, date: now.format("[HH:MM:ss]"), pseudo: self.capitalizeFirstLetterNO(data.pseudo), message: ko.observable(data.message), bouille: Bouille, type: ko.observable(true) });

                                }
                            }
                            else {
                                this.ListeMessage.push({ color: "#" + data.color, date: now.format("[HH:MM:ss]"), pseudo: self.capitalizeFirstLetterNO(data.pseudo), message: ko.observable(data.message), bouille: Bouille, type: ko.observable(true) });

                            }

                            if (this.IsOpen() == false) {
                                this.newMessage(true);
                                if (self.ListeSalonVisible() == false && this.FlagPrivate() || this.FlagNotPublic()) {

                                    var indexOf = _.findIndex(self.SalonListNewMessage(), {
                                        id: this.id
                                    })
                                    if (indexOf == -1) {

                                        self.SalonListNewMessage.push({ id: this.id, nom: "" });


                                        //vibration tel 
                                        window.navigator.vibrate(300); // vibrate for 200ms

                                    }
                                 

                                }
                                
                                if (!this.FlagPrivate() && !this.FlagNotPublic()) {
                                    //si c'est un salon publique on ajoute le bitonio  

                                    var indexOf = _.findIndex(self.ListeSalonArray, {
                                        id: this.id
                                    })
                                    if (indexOf != -1) {

                                        self.ListeSalonArray[indexOf].newMessage(true);
                                    }
                                }
                            }


                        }
                        else {

                            var Message = "";
                            if (data.ProfilBg) {

                                Message = '<div style="background-color:white;" class="ProfilFenetreContainerTchat">' +
                                    '<div class="firstContainer" style="background: url(Client/img/profil/' + data.ProfilBg + '); height:53px;width:200px;padding-left:0px;background-repeat:no-repeat; background-size: 100%;">' +
                                    "<div style='text-align:center;line-height:50px;font-style: italic;' >" + data.message + "</div>" +
                                  '</div>' +
                                    '</div>';

                            }
                            else {

                                Message = "<div style='font-style: italic;' >" + data.message + "</div>";

                            }

                            this.ListeMessage.push({ message: Message, type: ko.observable(false), pseudo: "@srv" });

                            //var Message = "<div style='font-style: italic;' >" + data.message + "</div>";
                            //$("#" + this.id).append(Message);
                        }

                        if (autoscrolltemp) {
                            var el = $("#" + this.id);
                            el.scrollTop(el[0].scrollHeight);
                        }


                    },
                    autoscroll: true,
                    photo: ko.observable(),
                    ClickPhoto: function () {
                        var selector = $("#" + this.id).parent().find(".photo");
                        selector.trigger("click");
                    },
                    cancelPhoto: function () {
                        this.photo(null);
                    }
                });

                //on informe le serveur qu'on a rejoint un salon 
                if (!data.FlagPrivate) {

                    socket.emit('JoinSalon', data);
                }
                else {
                    socket.emit('JoinPrivateDiscution', data);
                }

                $("#" + data.id).on('scroll', function () {
                    if (Math.round($(this).scrollTop() + $(this).innerHeight(), 10) >= Math.round($(this)[0].scrollHeight, 10)) {

                        var indexOf = _.findIndex(self.ListeSalonOuvert(), {
                            id: data.id
                        })
                        if (indexOf != -1) {

                            self.ListeSalonOuvert()[indexOf].autoscroll = true;
                        }
                    }
                    else {
                        //alert('no end');
                        var indexOf = _.findIndex(self.ListeSalonOuvert(), {
                            id: data.id
                        })
                        if (indexOf != -1) {

                            self.ListeSalonOuvert()[indexOf].autoscroll = false;
                        }
                    }
                });


                $("#" + data.id).on('click', '.onepseudo', function (e) {


                    var pseudo = $(this).html();
                    pseudo = pseudo.replace(/[^a-z0-9]/gmi, "");

                    var input = $("#" + data.id).parent().find(".tchatinput");
                    input.val(input.val() + "@" + pseudo + " ");
                    input.focus();

                });

            }
            else {
                var indexSal = _.findIndex(self.ListeSalonOuvert(), { id: data.id });
                self.ListeSalonOuvert()[indexSal].IsOpen(true);
                self.ListeSalonOuvert()[indexSal].newMessage(false);

                //supprime la notif privé
                    self.SalonListNewMessage.remove(function (salon) {
                        return salon.id == data.id;
                    });
                //fin supprime la notif

                //supprime la notif public
                if (!self.ListeSalonOuvert()[indexSal].FlagPrivate() && !self.ListeSalonOuvert()[indexSal].FlagNotPublic()) {
                    //si c'est un salon publique on supprime le bitonio  

                    var indexOf = _.findIndex(self.ListeSalonArray, {
                        id: data.id
                    })
                    if (indexOf != -1) {

                        self.ListeSalonArray[indexOf].newMessage(false);
                    }
                }
                //fin supprime la notif

            }

        };
        //FINopen one salon//

        $(document).on("click", ".toficon", function () {
            $(this).parent().find(".tofo").show();
            $(this).hide();
        });
        $(document).on("click", ".tofo", function () {
            $(this).parent().find(".toficon").show();
            $(this).hide();
        });



        //GESTION DES ITEMS
        self.MesItems = {};
        self.MesItems.ItemUser = ko.observableArray([]);

        //recupère la liste des items d'un utilisateur ( seulement les siens ) 
        var GetMyItem = function () {
            $.ajax({
                url: APP_URL + "GetMyItem",
                type: 'POST',
                data: { 'pseudo': self.player.pseudo(), 'token': self.player.token() },
                success: function (result) {
                    self.MesItems.ItemUser.removeAll();
                    for (var i in result) {
                        var item = {
                            nom: result[i].nom,
                            couleur: result[i].couleur,
                            description: result[i].description,
                            utiliser: function () {
                                self.MesItems.DeselectAllItem(); //deselectionne tous les autres items. 
                                this.isUtilise(true);

                                SetChapeauIHM(this.nom, this.couleur);
                                self.avatarHeader.SetAvatar(false, self.player.codeAvatar());

                                socket.emit("ChangeChapeau", { nom: this.nom, couleur: this.couleur });

                            },
                            enlever: function () {
                                this.isUtilise(false);
                                SetChapeauIHM("", "");
                                self.avatarHeader.SetAvatar(false, self.player.codeAvatar());

                                socket.emit("enleverChapeau");
                            },
                            lien: function () {
                                return "Client/img/SVG/Chapeau/" + this.nom + "/" + this.couleur;
                            },
                            isUtilise: ko.observable(result[i].isUsing)

                        };
                        self.MesItems.ItemUser.push(item);

                    }


                }
            });

        }
        self.MesItems.DeselectAllItem = function () {

            for (var i in self.MesItems.ItemUser()) {
                self.MesItems.ItemUser()[i].isUtilise(false);
            }
        };
        var SetChapeauIHM = function (nom, couleur) {
            var code = self.player.codeAvatar();
            var res = code.split(",");
            res[9] = nom;
            res[10] = couleur;
            self.player.codeAvatar(res.join());
        };

        //FIN GESTION DES ITEMS


        //quando n appuis sur entrée lors de l'envois d'un message 
        self.InputEnterCallback = function (ValeurInput, idSalon, libelle, FlagPrivate) {

            if (ValeurInput) {
                //on recupere le feutre qui est actuellement uilisé 
                var idFeutreEnCours = null;
                var IndexSalon = _.findIndex(self.ListeSalonOuvert(), { id: idSalon });
                if (IndexSalon != -1) {

                    idFeutreEnCours = self.ListeSalonOuvert()[IndexSalon].FeutreEnCours();

                }

                var data = {};
                data.id = idSalon;
                data.message = ValeurInput;
                data.libelle = libelle();

                data.FlagPrivate = FlagPrivate();


                if (self.player.isTotoche()) {

                    socket.emit("TestTotoche");
                }
                else if ((ValeurInput.substr(0, "/invit ".length) == "/invit ")) //invite une personne 
                {
                    data.pseudoToInvit = ValeurInput.substr("/invit ".length);


                    socket.emit("InvitOnSalon", data);


                }
                else if ((ValeurInput.substr(0, "/totoche ".length) == "/totoche "))//totoche une personne 
                {
                    var pseudoToTotoche = ValeurInput.substr("/totoche ".length);


                    socket.emit("SetTotoche", pseudoToTotoche);
                }
                else if ((ValeurInput.substr(0, "/rename ".length) == "/rename "))//totoche une personne 
                {
                    var newname = ValeurInput.substr("/rename ".length);
                    data.newname = newname;
                    socket.emit("RenameSalon", data);
                }
                else if ((ValeurInput == "/clear"))//totoche une personne 
                {

                    var IndexSalon = _.findIndex(self.ListeSalonOuvert(), { id: data.id });
                    if (IndexSalon != -1) {
                        self.ListeSalonOuvert()[IndexSalon].ListeMessage.removeAll();
                    }

                }
                else if ((ValeurInput == "/blueon"))//totoche une personne 
                {
                    socket.emit("SetBlueFeutre");
                }
                else if ((ValeurInput == "/blueoff"))//totoche une personne 
                {
                    socket.emit("UnSetBlueFeutre");
                }
                else {
                    data.base64photo = null;
                    if (self.ListeSalonOuvert()[IndexSalon].photo()) {

                        var selector = $("#" + self.ListeSalonOuvert()[IndexSalon].id).parent().find(".photo");
                        var file = selector[0].files[0];
                        getBase64(file, data, IndexSalon); // prints the base64 string


                    }
                    else {
                        //envois du message 
                        data.idFeutre = idFeutreEnCours;
                        socket.emit("SalonSendMessage", data)
                    }


                }
            }
        };

        self.nextphoto64 = ko.observable();
        var getBase64 = function getBase64(file, data, IndexSalon) {
            var reader = new FileReader();
            reader.onload = function () {

                //This is the code you put inside the reader.onload function
                var img = new Image();
                img.src = reader.result;
                var mime_type = "image/jpeg";

                img.onload = function () {

                    //Sets the quality to the image
                    var quality = 0.8;

                    var cW = img.naturalWidth
                    var cH = img.naturalHeight;

                    var canvas = document.createElement('canvas');
                    canvas.width = img.width
                    canvas.height = img.height;
                    var context = canvas.getContext("2d");


                    if (cW > 800 && cH > 600) {
                        cW /= 2;
                        cH /= 2;
                    }
                    else if (cW > 2000) {
                        cW /= 4;
                        cH /= 4;
                        quality = 0.6;
                    }
                    else if (cW > 4000) {
                        cW /= 6;
                        cH /= 6;
                        quality = 0.3;
                    }




                    canvas.width = cW;
                    canvas.height = cH;


                    //context.drawImage(this, 0, 0, cW, cH);
                    var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
                    if (iOS) {
                        // Redraw image, doubling the height seems to fix the iOS6 issue.
                        context.drawImage(this, 0, 0, cW, cH * 2.041);

                    } else {
                        // 90° rotate right
                        context.drawImage(this, 0, 0, cW, cH);
                    }

                    var dataUrl = canvas.toDataURL(mime_type, quality);

                    self.nextphoto64(dataUrl); // console.log(reader.result);
                    self.ListeSalonOuvert()[IndexSalon].photo(null);
                    data.base64photo = self.nextphoto64();
                    socket.emit("SalonSendMessage", data);

                }


                //self.nextphoto64(reader.result); // console.log(reader.result);
                //self.ListeSalonOuvert()[IndexSalon].photo(null);
                //data.base64photo = self.nextphoto64();
                //socket.emit("SalonSendMessage", data);
            };
            reader.readAsDataURL(file);
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }

        //quand on recoit un message 
        socket.on('ReceiveMessage', function (data) {

            var IndexSalon = _.findIndex(self.ListeSalonOuvert(), { id: data.id });
            if (IndexSalon != -1) {
                self.ListeSalonOuvert()[IndexSalon].AddMessagetchat(data);
            }
            else {
                var IndexSalon2 = _.findIndex(self.ListeSalonOuvert(), { id: parseInt(data.id) });
                if (IndexSalon2 != -1) {
                    self.ListeSalonOuvert()[IndexSalon2].AddMessagetchat(data);
                }
            }

        });


        self.ListeInvitationSalon = ko.observableArray();
        var IdInvitationSalon = 0;
        socket.on('InvitationSalon', function (data) {

            self.ListeInvitationSalon.push(
                {
                    ObjectId: IdInvitationSalon,
                    pseudoInviteur: data.pseudoInviteur,
                    id: data.id,
                    Libelle: data.nomsalon,
                    Libelle2: data.Libelle,
                    FlagPrivate: data.FlagPrivate,
                    clicked: function () {

                        for (var i in self.ListeSalonOuvert()) {
                            self.ListeSalonOuvert()[i].IsOpen(false);
                        }


                        var Indexof = _.findIndex(self.ListeInvitationSalon(), { ObjectId: this.ObjectId });
                        if (Indexof != -1) {
                            self.ListeInvitationSalon.splice(Indexof, 1);
                        }

                        //   self.ListeSalonArray.push({ id: 0, Libelle: "Temple du grand piquant", nbco: ko.observable(0) });

                        if (_.findIndex(self.ListeSalonArray, { id: this.id }) != -1) {

                            self.OpenOneSalon(self.ListeSalonArray[data.id]);

                            self.listMenu()[1].Select();
                            self.Hamburger.isOpen(false);
                        }
                        else {
                            var salondata = {};
                            salondata.id = this.id;
                            if (this.Libelle) {
                                salondata.Libelle = this.Libelle;
                            }
                            else {
                                salondata.Libelle = this.Libelle2;
                            }

                            salondata.nbco = ko.observable(0);
                            salondata.FlagPrivate = this.FlagPrivate;

                            self.OpenOneSalon(salondata);
                            //on ouvre le menu salon 
                            self.listMenu()[1].Select();
                            self.Hamburger.isOpen(false);
                        }


                    },
                    canceled: function () {
                        var Indexof = _.findIndex(self.ListeInvitationSalon(), { ObjectId: this.ObjectId });
                        if (Indexof != -1) {
                            self.ListeInvitationSalon.splice(Indexof, 1);
                        }
                    }


                })
            $.notify("Invitation reçu de " + data.pseudoInviteur, "success");
            IdInvitationSalon = IdInvitationSalon + 1;

        });

        socket.on('SalonNameChange', function (data) {
            var IndexSalon = _.findIndex(self.ListeSalonOuvert(), { id: data.id });
            if (IndexSalon != -1) {
                self.ListeSalonOuvert()[IndexSalon].Libelle(data.newname);
            } else {
                var IndexSalon2 = _.findIndex(self.ListeSalonOuvert(), { id: parseInt(data.id) });
                if (IndexSalon2 != -1) {
                    self.ListeSalonOuvert()[IndexSalon2].Libelle(data.newname);
                }
            }

        });


        //salon privé 
        self.PrivateSalonInput = ko.observable();
        self.OpenPrivateSalon = function () {

            var regex1 = /(^[A-Za-z\'0-9]*$)/g;
            var regex2 = /^(0|1|2|3|4|5|6|7|8|9|10|11)$/g;


            if (regex1.test(self.PrivateSalonInput()) && !regex2.test(self.PrivateSalonInput()) && self.PrivateSalonInput().length > 0) {
                var data = {};
                data.Libelle = self.PrivateSalonInput();
                data.id = self.PrivateSalonInput();
                data.FlagPrivate = false;
                data.FlagNotPublic = true;
                self.OpenOneSalon(data);
            }
            else {
                $.notify("Nom de salon interdit ! (Lettre avec accents et caractère spéciaux interdit )", "error");
            }

            self.PrivateSalonInput("");
        }

        //fin gestion des salons


        //#region dossier contact 

        self.contact = {};
        self.contact.listContact = ko.observableArray([]);


        self.clickOnpseudoInContactZone = function (data) {
            self.ListeProfilOuvert.removeAll();
            if (_.findIndex(self.ListeProfilOuvert(), { pseudo: data.friendName }) == -1) {
                var pseudoClicked = data.friendName;
                getLastOnglet();
                deselectAllMenu();
                socket.emit("GetUserProfil", pseudoClicked);
            }

        }


        //quand le serveur renvoit la liste des contacts 
        socket.on("sendListeContact", function (data) {

            self.contact.listContact.removeAll();

            for (var i in data) {
                data[i].Avatar = AvatarHeaderFactory();
                data[i].Avatar.SetAvatar(false, data[i].codeAvatar);
                data[i].isVisible = ko.observable(true);
                self.contact.listContact.push(data[i]);
            }
            //  self.contact.searchString("");
            // socket.emit("GetListeContactOnline", self.contact.listContact());

        });
        var GetContactOnline = function () {

            socket.emit("GetListeContact", self.contact.listContact());
            setTimeout(function () { GetContactOnline(); }, 4000);
        };


        //quand le serveur renvoit la liste des contacts online
        self.contact.listContactSansAvatar = ko.observableArray([]);
        socket.on("SendListeContactOnline", function (ListeContact) {

            self.contact.listContactSansAvatar.removeAll();

            for (var i in ListeContact) {
                //if (ListeContact[i].dateNaissance) {
                //    var today = new Date();
                //    var annivMoment = moment(ListeContact[i].dateNaissance, "DD/MM/YYYY");
                //    var anniv = new Date(annivMoment);

                //    if (anniv.getDate() == today.getDate() && anniv.getMonth() == today.getMonth()) {
                //        ListeContact[i].anniv = true;
                //    }
                //    else {
                //        ListeContact[i].anniv = false;
                //    }
                //}
                //else {
                //    ListeContact[i].anniv = false;
                //}

                self.contact.listContactSansAvatar.push(ListeContact[i]);
            }

        });



        socket.on("DeleteFavouriteFinish", function () {
            //on demande à recuperer la liste contact 
            $.notify("Ton ami a été supprimé de ta liste", "error");
            socket.emit("GetListeContact");
        });
        self.contact.ContactToDelete = ko.observable("");
        self.contact.ContactDeletePopUpVisible = ko.observable(false);
        self.contact.deleteContact = function (data) {
            self.contact.ContactToDelete(data.friendName);
            $('#DelAmiodal').modal('show');

            self.contact.ContactDeletePopUpVisible(true);

        }
        self.contact.YesdeleteContact = function (data) {
            socket.emit("DeleteAmi", self.contact.ContactToDelete());
            self.contact.ContactDeletePopUpVisible(false);
            $('#DelAmiodal').modal('hide');
        }
        self.contact.NOdeleteContact = function (data) {
            self.contact.ContactDeletePopUpVisible(false);
            $('#DelAmiodal').modal('hide');
        }

        self.ContactVisible = ko.observable(true);
        self.ContactNoirVisible = ko.observable(false);
        self.ContactShow = function () {
            self.ContactVisible(true);
            self.ContactNoirVisible(false);
        };
        self.ContactNoirShow = function () {
            self.ContactVisible(false);
            self.ContactNoirVisible(true);

            socket.emit("GetListeContactNoir");
        };


        //#region Contact noir 

        self.DossierContact_noir = {};
        self.DossierContact_noir.listContact = ko.observableArray([]);
        socket.on("sendListeContactNoir", function (data) {

            self.DossierContact_noir.listContact.removeAll();

            for (var i in data) {
                data[i].Avatar = AvatarHeaderFactory();
                data[i].Avatar.SetAvatar(false, data[i].codeAvatar);
                data[i].isVisible = ko.observable(true);

                self.DossierContact_noir.listContact.push(data[i]);
            }
        });

        self.DossierContact_noir.ContactToDelete = ko.observable("");
        self.DossierContact_noir.PopUpDeleteVisible = ko.observable(false);
        self.DossierContact_noir.OpenPopUpDeleteContact = function (data) {
            self.DossierContact_noir.ContactToDelete(data.friendName);
            $('#DelAmiNoirmodal').modal('show');
            self.DossierContact_noir.PopUpDeleteVisible(true);
        };
        self.DossierContact_noir.ClosePopUpDelete = function () {
            self.DossierContact_noir.PopUpDeleteVisible(false);
            $('#DelAmiNoirmodal').modal('hide');
        };
        self.DossierContact_noir.DeleteContact = function (data, element) {

            socket.emit("DeleteAmiNoir", self.DossierContact_noir.ContactToDelete());
            $('#DelAmiNoirmodal').modal('hide');
            self.DossierContact_noir.PopUpDeleteVisible(false);
        };
        socket.on("DeleteNoirFinish", function () {
            //on demande à recuperer la liste contact 
            $.notify("Suppression de la liste noire effectué avec succés", "error");
            socket.emit("GetListeContactNoir");
        });
        //#endregion contact noir

        //#endregion dossier contact



        //#region Gestion des mails/messages 
        self.DossierMail = {};
        self.DossierMail.MailListIsVisible = ko.observable(true);
        self.DossierMail.MailListSETVisible = function () {
            self.DossierMail.MailListIsVisible(true);
            self.DossierMail.NewMailIsVisible(false);
            self.DossierMail.MailSendListIsVisible(false);
        };
        self.DossierMail.NewMailIsVisible = ko.observable(false);
        self.DossierMail.NewMailSETVisible = function () {
            self.DossierMail.MailListIsVisible(false);
            self.DossierMail.NewMailIsVisible(true);
            self.DossierMail.destinataire("");
            self.DossierMail.sujet("");
        };
        self.DossierMail.NewMailSETVisibleWithExpediteur = function (data) {
            self.DossierMail.MailListIsVisible(false);
            self.DossierMail.NewMailIsVisible(true);

            self.DossierMail.destinataire(data.expediteur());
            self.DossierMail.sujet("[Re]" + data.sujet());

        };
        //les variables bindé sur le nouveau message a envoyer
        self.DossierMail.destinataire = ko.observable("");
        self.DossierMail.sujet = ko.observable("");
        self.DossierMail.message = ko.observable("");
        self.DossierMail.ClickSendMail = function () {

            data = {
                destinataire: self.DossierMail.destinataire(),
                sujet: self.DossierMail.sujet(),
                message: self.DossierMail.message()
            }

            if (!self.DossierMail.destinataire()) {
                $.notify("il faut un destinataire", "error");

            }
            else if (self.DossierMail.sujet().length < 3) {
                $.notify("le sujet doit comporter plus de 3 caractères ", "error");

            }
            else if (self.DossierMail.message().length < 3) {
                $.notify("le message doit comporter plus de 3 caractères ", "error");
            }


            socket.emit('SendMailToUser', data);

        }

        self.DossierMail.MailOuvert = ko.observable(null);
        self.DossierMail.MailOuvert_Avatar = {};
        self.DossierMail.MailOuvert_Avatar.clicked = function () {
            self.ListeProfilOuvert.removeAll();
            if (_.findIndex(self.ListeProfilOuvert(), { pseudo: self.DossierMail.MailOuvert().expediteur() }) == -1) {
                var pseudoClicked = self.DossierMail.MailOuvert().expediteur();
                getLastOnglet();
                deselectAllMenu();
                socket.emit("GetUserProfil", pseudoClicked);
            }
        };
        self.DossierMail.MailOuvert_Avatar.Avatar = AvatarHeaderFactory();


        self.DossierMail.isMailOuvert = ko.observable(false);
        self.DossierMail.CloseMailOuvert = function () {

            self.DossierMail.MailOuvert(null);
        }

        self.DossierMail.MessageToShow = ko.observable("");
        self.DossierMail.ClickOpenEmail = function (data) {
            self.DossierMail.isMailOuvert(true);
            self.DossierMail.MailOuvert(ko.mapping.fromJS(data));
            self.DossierMail.MailOuvert_Avatar.Avatar.SetAvatar(true, data.codeAvatar);
            data.message = data.message.replace(/\n/g, "<br>");

            self.DossierMail.MessageToShow(Linkify(data.message));

            if (self.DossierMail.MailSendListIsVisible()) {

            }
            else {
                if (data.lu == false) {
                    self.DossierMail.NumberMailNonLu(self.DossierMail.NumberMailNonLu() - 1);
                }
                data.lu = true;
                socket.emit("MailLu", data._id);
            }

        }
        self.DossierMail.ClickDeleteEmail = function () {

            var ListeIdMailToDelete = [];


            for (var i in self.DossierMail.ListeMail()) {
                if (self.DossierMail.ListeMail()[i].ToDelete() == true) {
                    ListeIdMailToDelete.push(self.DossierMail.ListeMail()[i]._id);
                }
            }


            for (var i in ListeIdMailToDelete) {

                self.DossierMail.ListeMail.remove(function (mail) {

                    return mail._id == ListeIdMailToDelete[i];

                });

            }

            if (ListeIdMailToDelete.length == 0) {
                $.notify("il faut sélectionner les mails à supprimer", "error");
            }
            else {
                socket.emit("DeleteListeMail", ListeIdMailToDelete);
            }


        }

        //renvois un booleen pour dire si un  ou plusieurs mail est checked pour le delete ou non 
        self.DossierMail.IsMailCheckedForDelete = ko.pureComputed(function () {
            var flag = false;
            if (self.DossierMail && self.DossierMail.ListeMail) {
                for (var i in self.DossierMail.ListeMail()) {
                    if (self.DossierMail.ListeMail()[i].ToDelete() == true) {
                        flag = true;
                        break;
                    }
                }

            }
            return flag;
        }, self);
        self.DossierMail.NumberMailNonLu = ko.observable(0);

        //demande au serveur de renvoyer la liste des mails de l'user connecté
        var GetListeMail = function () {
            socket.emit("GetMyMail");
        }
        //la liste des mails 
        self.DossierMail.ListeMail = ko.observableArray([]);
        socket.on("ListOfMyMail", function (data) {
            self.DossierMail.ListeMail.removeAll();
            for (var i in data) {
                data[i].heure = moment(data[i].date).format("HH:mm:ss ");
                data[i].date = moment(data[i].date).format("DD/MM/YYYY");
                data[i].ToDelete = ko.observable(false);
                self.DossierMail.ListeMail.push(data[i]);
            }
        })


        self.DossierMail.ListeMailSend = ko.observableArray([]);

        self.DossierMail.MailSendListIsVisible = ko.observable(false);
        self.DossierMail.SetMailSendListVisible = function () {
            //liste mail recu 
            self.DossierMail.MailListIsVisible(false);

            //noveau mail 
            self.DossierMail.NewMailIsVisible(false);

            //liste mail envoyé 
            self.DossierMail.MailSendListIsVisible(true);
        };
        var GetListeMailSend = function () {
            socket.emit("GetMyMailSend");
        }
        socket.on("ListOfMyMailSend", function (data) {
            self.DossierMail.ListeMailSend.removeAll();
            for (var i in data) {
                data[i].heure = moment(data[i].date).format("HH:mm:ss ");
                data[i].date = moment(data[i].date).format("DD/MM/YYYY");
                self.DossierMail.ListeMailSend.push(data[i]);
            }
        })


        socket.on("sendMailSuccess", function () {

            self.DossierMail.destinataire("");
            self.DossierMail.sujet("");
            self.DossierMail.message("");
            GetListeMailSend();
            $.notify("Email envoyé avec succès ", "success");
        });

        //Quand  on recoit un mail de quelqu'un on affichera une notification ! 
        socket.on("EmailRecu", function (data) {

            $.notify("email recu de " + data, "success");
            self.DossierMail.NumberMailNonLu(self.DossierMail.NumberMailNonLu() + 1);
            GetListeMail();
        })
        socket.on("ErreurDossierMail", function (data) {

            $.notify(data, "error");
        })

        //#endregion fin gestion des mail/messages



        //#region gestion historique 
        self.goToHisto = function () {

            GetListNotificationHistoric();
        }

        socket.on("newNotificationHistoric", function () {

            GetNumberNotificationHistoric();

            //if (self.Historique.IsOpen()) {
            //    GetListNotificationHistoric();
            //}

        });

        self.Historique = {};
        self.Historique.notificationNumber = ko.observable(0);
        self.Historique.ListHistorique = ko.observableArray([]);

        self.Historique.CurrentHistorique = ko.observable();
        self.currentIndexHisto = ko.observable(0);
        self.IndexHistoMax = ko.observable(0);
        var GetListNotificationHistoric = function () {
            currentIndexHisto = 0;
            $.ajax({
                url: APP_URL + "GetNotificationHistoric",
                type: 'POST',
                data: { 'pseudo': self.player.pseudo(), 'token': self.player.token() },
                success: function (result) {

                    self.Historique.ListHistorique.removeAll();
                    moment.locale("fr");

                    for (var i in result) {

                        result[i].dateMessage = moment(result[i].dateMessage).format("ddd DD MMMM HH:mm");
                        self.Historique.ListHistorique.push(result[i]);
                    }

                    self.IndexHistoMax(result.length - 1);
                    self.Historique.CurrentHistorique(ko.mapping.fromJS(self.Historique.ListHistorique()[self.currentIndexHisto()]));


                }
            });

        }
        self.Historique.PreviousHistoric = function () {

            self.currentIndexHisto(self.currentIndexHisto() - 1);

            self.Historique.CurrentHistorique(ko.mapping.fromJS(self.Historique.ListHistorique()[self.currentIndexHisto()]));
        }

        self.Historique.NextHistoric = function () {

            self.currentIndexHisto(self.currentIndexHisto() + 1);
            self.Historique.CurrentHistorique(ko.mapping.fromJS(self.Historique.ListHistorique()[self.currentIndexHisto()]));
        }
        //#endregion fin gestion historique 


        //gestion de l'annuaire
        self.Annuaire = {};
        self.Annuaire.keyword = ko.observable("");
        self.Annuaire.enterSearch = function (d, e) {
            e.keyCode === 13 && self.Annuaire.Search();
            return true;
        };
        self.Annuaire.Search = function (d, e) {
            //alert(self.Annuaire.keyword());
            if (self.Annuaire.keyword()) {
                self.Annuaire.ListeSearch.removeAll();
                socket.emit('Annuaire_Search', self.Annuaire.keyword());
            }
            else {
                $.notify("il faut renseigner un pseudo.", "error");
            }

        };

        self.Annuaire.ListeSearch = ko.observableArray([]);
        socket.on('SendAnnuaireSearch', function (data) {
            for (var i in data) {
                self.Annuaire.ListeSearch.push(data[i]);
            }
        });

        self.clickOnpseudoInAnnuaire = function (data) {
            getLastOnglet();
            self.ListeProfilOuvert.removeAll();
            if (_.findIndex(self.ListeProfilOuvert(), { pseudo: data.toLowerCase() }) == -1) {
                var pseudoClicked = data.toLowerCase();
                deselectAllMenu();
                socket.emit("GetUserProfil", pseudoClicked);
            }

        };

        //fin Annuaire 


        //#region profil user 
        self.ProfilVisible = ko.observable(false);


        self.convertEnumOnlineToColor = _convertEnumOnlineToColor;
        //lors du click sur le pseudo
        self.clickOnAvatarAccueil = function () {
            getLastOnglet();
            self.ListeProfilOuvert.removeAll();
            if (_.findIndex(self.ListeProfilOuvert(), { pseudo: self.player.pseudo().toLowerCase() }) == -1) {
                deselectAllMenu();
                socket.emit("GetUserProfil", self.player.pseudo().toLowerCase());

            }
        }
        self.clickOnpseudoInChat = function (data) {
            getLastOnglet();
            self.ListeProfilOuvert.removeAll();
            if (_.findIndex(self.ListeProfilOuvert(), { pseudo: data.pseudo.toLowerCase() }) == -1) {
                var pseudoClicked = data.pseudo.toLowerCase();
                deselectAllMenu();
                $('#myModalCoList').modal('hide');
                socket.emit("GetUserProfil", pseudoClicked);
            }

        };

        var LastOnglet = null;
        var getLastOnglet = function () {

            //  self.listMenu()[1].Select();
            for (var i in self.listMenu()) {
                if (self.listMenu()[i].isSelect()) {
                    LastOnglet = self.listMenu()[i].Select;
                }
            }
        };

        self.loaderProfil = ko.observable(true);
        socket.on("ReceiveUserProfil", function (data) {

            self.OpenOneUserProfil(data);
            self.loaderProfil(false);
        });

        self.ListeProfilOuvert = ko.observableArray();
        self.pseudoToAddListeNoir = ko.observable("");
        self.AddInListeNoir = function () {
            var data = {};
            data.pseudo = self.pseudoToAddListeNoir();
            socket.emit('AddPlayerInListeNoir', data);
            $('#AddAmiNoirmodal').modal('hide');
        };
        socket.on("AddListeNoirFinish", function () {
            //on demande à recuperer la liste contact 
            $.notify("Contact ajouté à la liste noire !", "success");
            socket.emit("GetListeContactNoir");

        });
        self.cancelModal = function () { $('#AddAmiNoirmodal').modal('hide'); };

        //tchat 1:1
        self.InvitForPrivateTchat = function (PlayerToAdd) {
            //emit coté serveur join serveur en envoyant le pseudo du gars à invité
            var pseudoTOInvit = PlayerToAdd.pseudo;

            var data = {};
            data.Libelle = self.player.pseudo() + " " + pseudoTOInvit + "_";
            data.id = self.player.pseudo() + pseudoTOInvit + "_";
            data.FlagPrivate = true;
            data.privatePseudo = pseudoTOInvit;

            //on reduit tous les salons ouverts 
            for (var i in self.ListeSalonOuvert()) {
                self.ListeSalonOuvert()[i].reduce(42);
            }

            self.OpenOneSalon(data);
            self.listMenu()[1].Select();
            self.Hamburger.isOpen(false);
            $.notify("Invitation envoyée !", "success");

        };
        //fin tchat 1:1
        //AJOUT EN FAVORIS
        self.AddFavourite = function (PlayerToAdd) {
            socket.emit('AddPlayerInFavorite', PlayerToAdd);
        };
        socket.on("AddFavouriteFinish", function () {
            //on demande à recuperer la liste contact 
            $.notify("Tu as un nouvel ami !", "success");
            socket.emit("GetListeContact");
        });
        //FIN AJOUT EN FAVORIS
        //OUVRIR BLOG
        self.OpenBlog = function (PlayerToOpen) {

            window.open(APP_URL + 'FrutiBlog?pseudo=' + PlayerToOpen.pseudo + "&mypseudo=" + self.player.pseudo().toLowerCase() + "&token=" + self.player.token());
        };
        //FIN OUVRIR BLOG
        self.OpenOneUserProfil = function (data) {
            moment.locale("fr");
            if (_.findIndex(self.ListeProfilOuvert(), { pseudo: data.pseudo }) == -1) { //si on a pas deja ouvert de profil pour cette utilisateur alors on ajoute un profil 


                self.pseudoToAddListeNoir(data.pseudo);

                //USER PROFIL FACTORY
                var UserProfil = UserProfilFactory(data, self.player.pseudo());
                UserProfil.OpenAddInListeNoir = function () {
                    $('#AddAmiNoirmodal').modal('show');
                };

                UserProfil.extensionProfil(true);
                UserProfil.close = function () {
                    var indexOf = _.findIndex(self.ListeProfilOuvert(), { pseudo: UserProfil.pseudo })
                    if (indexOf != -1) { self.ListeProfilOuvert.splice(indexOf, 1); }
                    self.ProfilVisible(false);
                    self.loaderProfil(true);
                    //selectionne le dernier onglet ouvert 
                    LastOnglet(42);
                };
                UserProfil.SendMail = function () {
                    //remove la liste 
                    self.ListeProfilOuvert.removeAll();
                    deselectAllMenu();
                    Messagerie.isSelect(true);
                    self.DossierMail.NewMailSETVisible();
                    self.DossierMail.destinataire(UserProfil.pseudo);
                };
                UserProfil.AddInListeNoir = function () {
                    var data = {};
                    data.pseudo = UserProfil.pseudo;
                    socket.emit('AddPlayerInListeNoir', data);

                    UserProfil.ProfilListeNoireDeletePopUpVisible(false);
                };
                UserProfil.SendKikooz = function () {
                    if (UserProfil.KikoozToSend() <= 0) {
                        $.notify("Radin comme un radis ! ( un don de kikooz doit être supérieur à 0 )", "error");
                    }
                    else if (UserProfil.KikoozToSend() > 200) {
                        $.notify("Tu es trop généreux, un don ne peut dépasser 200 kikooz !", "error");
                    }
                    else if (UserProfil.KikoozToSend() > self.player.kikooz()) {
                        $.notify("Tu n'as pas assez de kikooz (" + self.player.kikooz() + ")", "error");
                    }
                    else if (self.player.pseudo() == UserProfil.pseudo) {
                        $.notify("Se donner des kikooz est inutile ...", "warn");
                    }
                    else {
                        socket.emit("GiveKikooz", { receveur: UserProfil.pseudo, montant: UserProfil.KikoozToSend() });

                        UserProfil.KikoozToSend(0);
                    }
                };
                UserProfil.ModifyDescription = function () {
                    if (UserProfil.ModifyDescriptionVisible()) {
                        UserProfil.ModifyDescriptionVisible(false);
                    }
                    else {
                        var jqxhr = getListeProfilUser();
                        var Psrc = UserProfil.ProfilBgSrcString;
                        var profilBgSelected = UserProfil.profilBgSelected;
                        jqxhr.done(function () {

                            var index = _.findIndex(self.ListeProfilUser(), { src: Psrc });
                            if (index != -1) {

                                profilBgSelected(self.ListeProfilUser()[index]);
                            }

                        });

                        UserProfil.ModifyDescriptionVisible(true);
                    }
                };
                UserProfil.saveProfil = function () {
                    UserProfil.ProfilDescription(UserProfil._ProfilDescription());
                    socket.emit("SetUserDescription", { description: UserProfil._ProfilDescription() });

                    if (UserProfil.NewProfilBgSrc()) {
                        socket.emit("SetUserBgProfil", { ProfilBgSrc: UserProfil.NewProfilBgSrc() });
                    }

                    UserProfil.ModifyDescriptionVisible(false);
                };
                //FIN USER PROFIL FACTORY
                self.ListeProfilOuvert.push(UserProfil);
                self.ProfilVisible(true);
                var index = _.findIndex(self.ListeProfilOuvert(), { pseudo: data.pseudo });
                if (index != -1) {
                    self.ListeProfilOuvert()[index].Avatar.SetAvatar(true, self.ListeProfilOuvert()[index].codeAvatar);
                    self.ListeProfilOuvert()[index].experienceObject.Init(data.experience);

                    self.ListeProfilOuvert()[index].profilBgSelected.subscribe(function (newvalue) {
                        if (newvalue) {
                            self.ListeProfilOuvert()[index].ProfilBgSrc("url('Client/img/profil/" + newvalue.src + "')");
                            self.ListeProfilOuvert()[index].NewProfilBgSrc(newvalue.src);
                        }

                    });
                }
            }

        }

        self.ListeProfilUser = ko.observableArray([]);
        var getListeProfilUser = function () {

            self.ListeProfilUser.removeAll();
            var jqxhr = $.ajax({
                url: APP_URL + "GetProfilBgUser",
                type: 'POST',
                data: { 'pseudo': self.player.pseudo(), 'token': self.player.token() },
                success: function (result) {

                    self.ListeProfilUser.push(defautlBg);

                    for (var i in result) {
                        self.ListeProfilUser.push(result[i]);
                    }


                }
            });

            return jqxhr;
        };
        var defautlBg = {
            username: self.player.pseudo(),
            nom: "ananas",
            src: "ananas.svg"
        };


        //#endregion profil user

        //Gestion Boutique 
        var firstBoutiqueOpen = true;
        self.Boutique = {};
        self.Boutique.IsOpen = ko.observable(true);
        self.Boutique.open = function () {
            self.Boutique.IsOpen(true);

            if (firstBoutiqueOpen) {
                //get liste des fond de profils users disponibles 
                getListeProfilUser();
            }
            firstBoutiqueOpen = false;

        };
        self.Boutique.close = function () {
            self.Boutique.IsOpen(false);
            DeleteReduce("Boutique");
        };
        self.Boutique.reduce = function () {
            self.Boutique.IsOpen(false);
            AddReduce("Boutique", self.Boutique.open, "Client/img/pasteque.png");
        };

        self.Boutique.IsOpenAchatKikooz = ko.observable(false);
        self.Boutique.OpenAchatKikooz = function () {
            self.Boutique.IsOpenAchatKikooz(true);
        }
        self.Boutique.CloseAchatKikooz = function () {
            self.Boutique.IsOpenAchatKikooz(false);
        }



        //feutre
        self.Boutique.ListeFeutre = ko.observableArray([]);
        self.Boutique.FeutreIsPossede = function (nomFeutre) {
            var listeFeutreUser = self.listeFeutreArray();
            var index = _.findIndex(listeFeutreUser, { nom: nomFeutre })
            if (index != -1) {
                return true;
            }
            else {
                return false;
            }

        };
        self.Boutique.isVisibleListeFeutre = ko.observable(false);
        self.Boutique.FeutreLoader = ko.observable(false);
        self.Boutique.ShowFeutre = function () {

            if (self.Boutique.isVisibleListeFeutre()) {
                self.Boutique.isVisibleListeFeutre(false);
            }
            else {
                self.Boutique.isVisibleListeFeutre(true);
            }

            if (self.Boutique.ListeFeutre().length == 0) {
                self.Boutique.FeutreLoader(true);
                $.ajax({
                    url: APP_URL + "GetFeutreBoutique", success: function (result) {

                        self.Boutique.ListeFeutre.removeAll();
                        for (var i in result) {

                            result[i].isPossede = ko.observable(self.Boutique.FeutreIsPossede(result[i].nom));
                            self.Boutique.ListeFeutre.push(result[i]);
                        }
                        self.Boutique.FeutreLoader(false);
                    }
                });

            }


        }

        self.Boutique.clickFeutre = function (FeutreData) {

            //on ajoute à la visualisation le feutre 

            self.Boutique.VisualisationAchatManager(FeutreData, "feutre");
        };
        //fin feutre



        //Item
        self.Boutique.ListeItem = ko.observableArray([]);

        self.Boutique.isVisibleListeItem = ko.observable(false);
        self.Boutique.ItemLoader = ko.observable(false);
        self.Boutique.ShowItem = function () {

            if (self.Boutique.isVisibleListeItem()) {
                self.Boutique.isVisibleListeItem(false);
            }
            else {
                self.Boutique.isVisibleListeItem(true);
            }

            if (self.Boutique.ListeItem().length == 0) {
                self.Boutique.ItemLoader(true);
                $.ajax({
                    url: APP_URL + "GetItemBoutique",
                    data: { pseudo: self.player.pseudo() },
                    success: function (result) {

                        self.Boutique.ListeItem.removeAll();
                        for (var i in result) {

                            if (!result[i].nom2) {
                                result[i].nom2 = "";
                            }
                            result[i].isPossede = ko.observable(result[i].isPossedee);
                            self.Boutique.ListeItem.push(result[i]);
                        }
                        self.Boutique.ItemLoader(false);
                    }
                });

            }


        };
        self.Boutique.clickItem = function (ItemData) {

            //on ajoute à la visualisation le feutre 
            if (self.Boutique.VisualisationAchat.id() != ItemData._id) {
                self.Boutique.VisualisationAchatManager(ItemData, "item");
            }
        };
        //fin Item

        //Jeux
        self.Boutique.ListeJeux = ko.observableArray([]);

        self.Boutique.isVisibleListeJeux = ko.observable(false);
        self.Boutique.JeuxLoader = ko.observable(false);
        self.Boutique.ShowJeux = function () {

            if (self.Boutique.isVisibleListeJeux()) {
                self.Boutique.isVisibleListeJeux(false);
            }
            else {
                self.Boutique.isVisibleListeJeux(true);
            }

            if (self.Boutique.ListeJeux().length == 0) {
                self.Boutique.JeuxLoader(true);
                $.ajax({
                    url: APP_URL + "GetJeuxBoutique",
                    data: { pseudo: self.player.pseudo() },
                    success: function (result) {

                        self.Boutique.ListeJeux.removeAll();
                        for (var i in result) {

                            result[i].isPossede = ko.observable(false);
                            self.Boutique.ListeJeux.push(result[i]);
                        }
                        self.Boutique.JeuxLoader(false);
                    }
                });

            }


        };
        self.Boutique.clickJeux = function (JeuxData) {

            //on ajoute à la visualisation le feutre 
            self.Boutique.VisualisationAchatManager(JeuxData, "jeux");
        };
        //fin jeux

        //fond de profil
        self.Boutique.ListeFondProfil = ko.observableArray([]);
        self.Boutique.isVisibleListeFondProfil = ko.observable(false);
        self.Boutique.FondProfilLoader = ko.observable(false);

        self.Boutique.FondProfilIsPossede = function (nomFond) {

            var listeProfilUser = self.ListeProfilUser();
            var index = _.findIndex(listeProfilUser, { nom: nomFond })
            if (index != -1) {
                return true;
            }
            else {
                return false;
            }

        }

        self.Boutique.ShowFondProfil = function () {

            if (self.Boutique.isVisibleListeFondProfil()) {
                self.Boutique.isVisibleListeFondProfil(false);
            }
            else {
                self.Boutique.isVisibleListeFondProfil(true);
            }

            if (self.Boutique.ListeFondProfil().length == 0) {
                self.Boutique.FondProfilLoader(true);

                $.ajax({
                    url: APP_URL + "GetFondProfilBoutique",
                    data: { pseudo: self.player.pseudo() },
                    success: function (result) {
                        self.Boutique.ListeFondProfil.removeAll();
                        for (var i in result) {

                            result[i].isPossede = ko.observable(self.Boutique.FondProfilIsPossede(result[i].nom));
                            self.Boutique.ListeFondProfil.push(result[i]);
                        }
                        self.Boutique.FondProfilLoader(false);
                    }
                });
            }


        };
        self.Boutique.clickFondProfil = function (FondData) {

            //on ajoute à la visualisation le feutre 
            self.Boutique.VisualisationAchatManager(FondData, "FondProfil");
        };

        //fin fond de profil 



        //objet visualisation achat 
        self.Boutique.VisualisationAchat = {
            nom: ko.observable(""),
            src: ko.observable(""),
            prix: ko.observable(""),
            description: ko.observable(""),
            type: ko.observable(""),
            id: ko.observable(""),
            isPossede: ko.observable(""),
            couleur: ko.observable("black"),
            datasrc: ko.observable(""),
            Avatar: AvatarHeaderFactory(),

        };

        var SetChapeauBoutique = function (nom, couleur) {
            var code = self.player.codeAvatar();
            var res = code.split(",");
            res[9] = nom;
            res[10] = couleur;

            code = res.join();
            return code;
        };


        self.Boutique.VisualisationAchatManager = function (data, type) {

            if (type == "feutre") {
                self.Boutique.VisualisationAchat.type("feutre");
                self.Boutique.VisualisationAchat.nom(data.nom);
                self.Boutique.VisualisationAchat.src("Client/img/feutre/" + data.src);
                self.Boutique.VisualisationAchat.prix(data.prix);
                self.Boutique.VisualisationAchat.description(data.description);
                self.Boutique.VisualisationAchat.isPossede(data.isPossede());
                self.Boutique.VisualisationAchat.id(data._id);
                self.Boutique.VisualisationAchat.couleur("#" + data.hexa);

            }
            else if (type == "item") {
                self.Boutique.VisualisationAchat.type("item");
                self.Boutique.VisualisationAchat.nom(data.nom);
                self.Boutique.VisualisationAchat.src("Client/img/SVG/Chapeau/" + data.nom + "/" + data.couleur);
                self.Boutique.VisualisationAchat.prix(data.prix);
                self.Boutique.VisualisationAchat.description(data.description);
                self.Boutique.VisualisationAchat.isPossede(data.isPossede());
                self.Boutique.VisualisationAchat.id(data._id);
                self.Boutique.VisualisationAchat.couleur("black");

                var code = SetChapeauBoutique(data.nom, data.couleur);
                self.Boutique.VisualisationAchat.Avatar.SetAvatar(false, code);


            }
            else if ((type == "jeux")) {
                self.Boutique.VisualisationAchat.type("jeux");
                self.Boutique.VisualisationAchat.nom(data.nom);
                self.Boutique.VisualisationAchat.src(data.src);
                self.Boutique.VisualisationAchat.prix(data.prix);
                self.Boutique.VisualisationAchat.description(data.description);
                self.Boutique.VisualisationAchat.isPossede(false);
                self.Boutique.VisualisationAchat.id(data._id);
                self.Boutique.VisualisationAchat.couleur("black");
            }
            else if ((type == "FondProfil")) {
                self.Boutique.VisualisationAchat.type("FondProfil");
                self.Boutique.VisualisationAchat.nom(data.nom);
                self.Boutique.VisualisationAchat.src("Client/img/profil/" + data.src);
                self.Boutique.VisualisationAchat.prix(data.prix);
                self.Boutique.VisualisationAchat.description(data.description);
                self.Boutique.VisualisationAchat.isPossede(data.isPossede());
                self.Boutique.VisualisationAchat.id(data._id);
                self.Boutique.VisualisationAchat.datasrc(data.src);
                self.Boutique.VisualisationAchat.couleur("black");
            }
            else {
                throw "self.Boutique.VisualisationAchatManager : NOT IMPLEMENTED";
            }
        };

        self.Boutique.IsVisibleAcheterPopUp = ko.observable(false);
        self.Boutique.OpenAcheterPopUp = function () {
            if (self.player.kikooz() >= self.Boutique.VisualisationAchat.prix()) {
                self.Boutique.IsVisibleAcheterPopUp(true);
            }
            else {
                $.notify("Pas assez de kikooz pour cet article...", "error");
            }

        }
        self.Boutique.CloseAcheterPopUp = function () {

            self.Boutique.IsVisibleAcheterPopUp(false);
        }
        self.Boutique.AccepterAchat = function () {

            self.Boutique.VisualisationAchat.isPossede(true);

            if (self.Boutique.VisualisationAchat.type() == "feutre") {
                var index = _.findIndex(self.Boutique.ListeFeutre(), { _id: self.Boutique.VisualisationAchat.id() });
                if (index != -1) {
                    self.Boutique.ListeFeutre()[index].isPossede(true);
                }
            }
            else if (self.Boutique.VisualisationAchat.type() == "item") {
                var index = _.findIndex(self.Boutique.ListeItem(), { _id: self.Boutique.VisualisationAchat.id() });
                if (index != -1) {
                    self.Boutique.ListeItem()[index].isPossede(true);
                }
            }
            else if (self.Boutique.VisualisationAchat.type() == "jeux") {

                socket.emit("GetJeuxDispo");


            }
            else if (self.Boutique.VisualisationAchat.type() == "FondProfil") {
                var index = _.findIndex(self.Boutique.ListeFondProfil(), { _id: self.Boutique.VisualisationAchat.id() });
                if (index != -1) {
                    self.Boutique.ListeFondProfil()[index].isPossede(true);
                }

            }

            socket.emit("AchatBoutiqueAccepte", { id: self.Boutique.VisualisationAchat.id(), type: self.Boutique.VisualisationAchat.type() });

            self.Boutique.IsVisibleAcheterPopUp(false);
        }

        socket.on("AchatOk", function (SoldeKikooz) {
            self.player.kikooz(SoldeKikooz);
            $.notify("Article acheté avec succès", "success");

        });

        socket.on("DonOk", function (SoldeKikooz) {
            self.player.kikooz(SoldeKikooz);
            $.notify("Don effectué avec succès, il te reste " + SoldeKikooz + " kikooz", "success");

        });

        socket.on("DonRecu", function (data) {
            self.player.kikooz(self.player.kikooz() + data.montant);
            $.notify("Tu as reçu un don de " + data.pseudo + " d'un montant de " + data.montant + " kikooz", "success");

        });

        self.Boutique.ProfilTestSrc = ko.observable("");
        self.Boutique.TestFondProfil = function (data) {


            if (_.findIndex(self.ListeProfilOuvert(), { pseudo: self.player.pseudo() }) != -1) {
                $.notify("Ferme ton profil pour tester !", "error");
            }
            else {

                self.Boutique.ProfilTestSrc(self.Boutique.VisualisationAchat.datasrc());
                socket.emit("GetUserProfil", self.player.pseudo());

            }


        }

        self.Boutique.BackToAccueil = function () {
            self.Boutique.VisualisationAchat.type(null);
        };
        //Fin objet visualisation achat 

        self.Boutique.isVisibleHistoAchat = ko.observable(false);
        self.Boutique.ListeHistoAchat = ko.observableArray([]);

        self.Boutique.OpenHistoAchat = function () {
            self.Boutique.isVisibleHistoAchat(true);
            self.Boutique.CloseAchatKikooz();
            moment.locale("fr");
            $.ajax({
                url: APP_URL + "GetFactureUser",
                type: 'POST',
                data: { 'pseudo': self.player.pseudo() },
                success: function (result) {

                    self.Boutique.ListeHistoAchat.removeAll();

                    for (var i in result) {

                        result[i].date = moment(result[i].date).format("ddd DD MMMM HH:mm");

                        self.Boutique.ListeHistoAchat.push(result[i]);
                    }



                }
            });

        }
        self.Boutique.CloseHistoAchat = function () {
            self.Boutique.isVisibleHistoAchat(false);
        }


        //FIN Gestion Boutique

        //gestion des jeux 

        socket.on("SendListeJeuDispo", function (data) {

            self.FireWater.PartieDuJour(0);
            self.FraiseKerosene.PartieDuJour(0);
            for (var i in data) {
                if (data[i].nom == "FireWater" && data[i].used == false) {
                    self.FireWater.PartieDuJour(self.FireWater.PartieDuJour() + 1);
                }
                else if (data[i].nom == "La fraise sous kérosène" && data[i].used == false) {
                    self.FraiseKerosene.PartieDuJour(self.FraiseKerosene.PartieDuJour() + 1);
                }
            }
        });

        socket.on("SendListeJeuAchete", function (data) {

            for (var i in data) {

                if (data[i].nom == "FireWater 3D") {
                    self.FireWater.PartieAchete(data[i].ranked);
                }
                else if (data[i].nom == "La fraise sous kérosène") {
                    self.FraiseKerosene.PartieAchete(data[i].ranked);
                }
            }

        });

        self.StartFraiseKerosene = function () {

            var requeststring = "?pseudo=" + self.player.pseudo().toLowerCase() + "&token=" + self.player.token();

            window.open(APP_URLFK + requeststring);

        };

        self.StartFireWater = function () {

            var requeststring = "?pseudo=" + self.player.pseudo().toLowerCase() + "&token=" + self.player.token();

            window.open(APP_URLFW + requeststring);

        };

        //la fraise sous kerosene
        self.FraiseKerosene = {};
        self.FraiseKerosene.PartieDuJour = ko.observable(0);
        self.FraiseKerosene.PartieAchete = ko.observable(0);

        //FireWater
        self.FireWater = {};
        self.FireWater.PartieDuJour = ko.observable(0);
        self.FireWater.PartieAchete = ko.observable(0)


        //fin gestion jeux 




        //#region KO BINDING
        ko.bindingHandlers.AddContactnoirDragable = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called when the binding is first applied to an element
                // Set up any initial state, event handlers, etc. here
                var $element = $(element);

                $element.draggable({
                    containment: $element.parent(),//".AddZoneContactNoirIn",
                    cursor: "move",
                    stack: "div",
                    distance: 0,
                    cancel: "button"
                });

            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called once when the binding is first applied to an element,
                // and again whenever any observables/computeds that are accessed change
                // Update the DOM element based on the supplied values here.

                var $element = $(element);

                if (valueAccessor()() == true) {
                    $element.css({ top: '20px' });
                }
                else {

                }


            }
        };

        ko.bindingHandlers.DeleteDragable = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called when the binding is first applied to an element
                // Set up any initial state, event handlers, etc. here
                var $element = $(element);
                $element.draggable({
                    containment: ".ZoneVisu",
                    cursor: "move",
                    stack: "div",
                    distance: 0,
                    cancel: "button"
                });

            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called once when the binding is first applied to an element,
                // and again whenever any observables/computeds that are accessed change
                // Update the DOM element based on the supplied values here.
            }
        };

        //binding handler pour le drag n drop et resizable together 
        ko.bindingHandlers.InputEnterKey = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called when the binding is first applied to an element
                // Set up any initial state, event handlers, etc. here
                var $element = $(element);
                var clickHandler = ko.utils.unwrapObservable(valueAccessor());

                var IdSallon = viewModel.id;
                var libelle = viewModel.Libelle;
                var FlagPrivate = viewModel.FlagPrivate;

                $(element).keypress(function (event) {
                    var keyCode = (event.which ? event.which : event.keyCode);
                    if (keyCode === 13) {

                        clickHandler($(element).val(), IdSallon, libelle, FlagPrivate);
                        $(element).val("");
                        return false;
                    }
                    return true;
                });


            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

            }
        };

        ko.bindingHandlers.ButtonEnterKey = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called when the binding is first applied to an element
                // Set up any initial state, event handlers, etc. here
                var $element = $(element);
                var clickHandler = ko.utils.unwrapObservable(valueAccessor());

                var IdSallon = viewModel.id;
                var libelle = viewModel.Libelle;
                var FlagPrivate = viewModel.FlagPrivate;

                $(element).click(function (event) {
                    clickHandler("ok", IdSallon, libelle, FlagPrivate);

                });


            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

            }
        };


        ko.bindingHandlers.ContactDragable = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called when the binding is first applied to an element
                // Set up any initial state, event handlers, etc. here
                var $element = $(element);
                $element.draggable({
                    containment: ".ZoneMesContacts",
                    cursor: "move",
                    stack: "div",
                    distance: 0,
                    cancel: "button"
                });

            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called once when the binding is first applied to an element,
                // and again whenever any observables/computeds that are accessed change
                // Update the DOM element based on the supplied values here.
            }
        };

        //#endregion KO BINDING

        var init = function () {

            //1- recuperation des regions.
            $.ajax({
                url: APP_URL + "GetAllDepartement", success: function (result) {
                    for (var i in result) {
                        self.ListeRegion.push(result[i]);
                    }

                }
            });



        }
        init();


    }
    // Activates knockout.js
    ko.applyBindings(new AppViewModel());








});
//$(document).ready(function () {
$(window).trigger("load");
$(window).on("load", function () {
  
    //on inclus le text de require.js
    requirejs.config({
        paths: {
            "text": "http://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text"
        }
    });

    var options = {};
    options.transports = ['websocket'];
    var socket = io.connect(GetAppUrl(), options);


    if (!Math.trunc) {
        Object.defineProperty(Math, "trunc", {
            value: function (val) {
                return val < 0 ? Math.ceil(val) : Math.floor(val);
            }
        });
    }


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

    //test ie
    function msieversion() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
        {
            $.notify({ title: "Il est fortement recommandé de ne pas utiliser internet explorer !", message: "" }, { type: 'danger' });
        }
        else  // If another browser, return 0
        {

        }

        return false;
    }
    msieversion();


    { //chargement des images ! une fois que la page a finis de charger on charge en arrière plan les images que l'on veut
        var ListImageToLoad = ["Client/img/SVG/Chapeau/Allez les bleus/bleu.svg"];
        for (var i in ListImageToLoad) {
            $("#preimg").append("<img  style='position:absolute; width:1px; height:1px;' src='" + ListImageToLoad[i] + "'/>");
        }
    }

    //affichage du site 
    $("#Loader").hide();
    $("#WebSite").show();


    //demande la permission des notifications
    if (!detectIE()) {

        if (("Notification" in window)) {
            Notification.requestPermission(function (permission) {

                // Quelque soit la réponse de l'utilisateur, nous nous assurons de stocker cette information
                if (!('permission' in Notification)) {
                    Notification.permission = permission;

                }
            });
        }

    }

    $('body').bind("dragstart", function (event, ui) {
        event.stopPropagation();
    });

    
    //initialisation du socket client
    var APP_URL = GetAppUrl();

   

    //Fin définition des objets 
    var user = {
        pseudo: ko.observable(getCookie("MonSiteUsername")),
        motdepasse: ko.observable(getCookie("MonSitePassword")),
        token: ko.observable("")
    }

    // This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
    function AppViewModel() {

        //self = this pour toujours etre dans le bon context
        var self = this;

        /*****Ressource ****/
        self.RessourceString = ko.observable(res_fr); ///res_fr, variable dans Client/js/LangRessource/Ressource.js
        {
            /**** Function permettant de changer de langue au click d'un boutton   ****/
            self.ChangeLangue = function () {
                self.RessourceString(ChangeLangue()); // "ChangeLangue" Function dans /Client/js/LangRessource/Ressource.js
            }
            /**** Fin Function permettant de changer de langue au click d'un boutton   ****/
        }
        /***** Ressource****/


        self.user = user;
        //on recupere le socket pour pouvoir utiliser le socket dans les modules
        self.socket = socket;

        self.Test = ko.observable("Variable à la racine du projet (index.js)");


        self.testClick = function () {
            ExampleAjaxCall(); //appel ajax à chaque clique, api/ExampleAjaxCall coté serveur possède un outil qui limite le nombre d'appel possible ("apiLimiter"), si on fait plus de 5 appels en 3 secondes alors on affichera un message d'erreur ! 
        }



        /******Ajax call function  ******/
        var ExampleAjaxCall = function () {
            $.ajax({
                url: APP_URL + "api/ExampleAjaxCall",
                type: 'POST',
                data: { 'pseudo': "testPseudo" },
                success: function (result) {
                    $.notify({ title: result.pseudo, message: "" }, { type: 'success' });

                 
                },
                error: function (e) {
                    $.notify({ title: e.responseText, message: "" }, { type: 'danger' });
               
                }
            });
        }
        /******FIN Ajax call function  ******/


        /******SERVEUR EVENT socket******/
        {
            //message de succès ou d'erreur du serveur 
            socket.on("ErreurServeur", function (msgErreur) {
         
                $.notify({ title: msgErreur, message: "" }, { type: 'danger' });
            })
            socket.on("SuccessServeur", function (msgSucces) {
                $.notify({ title: msgSucces, message: "" }, { type: 'success' });

            })

            //Example socket.on 
            socket.on("ExampleSocketOn", function (data) { });


            //quand le socket se déconnecte pour une raison x ou y, une modale de l'ihm s'affiche ... 
            socket.on('disconnect', function () { $('#decomodal').modal('show'); });
        }
        /******FIN SERVEUR EVENT ******/



        /*~~~~ Initialisation function ~~~~*/
        var init = function () {
            ExampleAjaxCall();


            /****Chargement de module IHM   ****/
            LoadModuleFunction(); //fonction dans le fichier /client/js/LoadModule.js;
            /****Fin Chargement de module IHM  ****/
        }
        init();
        /*~~~~Fin call init  ~~~~*/


        /****** CUSTOM BINDING handler ********/
        //binding handler pour le drag n drop et resizable together 
        ko.bindingHandlers.DragableResizable = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called when the binding is first applied to an element
                // Set up any initial state, event handlers, etc. here
                var $element = $(element);
                $element.resizable().draggable({
                    handle: ".ZoneDraggable",
                    containment: ".ZoneBureau",
                    cursor: "move",
                    stack: "div",
                    distance: 0,
                    cancel: "img"
                });

                var maxZ = Math.max.apply(null,
                    $.map($('body *'), function (e, n) {
                        if ($(e).css('position') != 'static')
                            return parseInt($(e).css('z-index')) || 1;
                    }));
                $(element).css("z-index", maxZ);
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                // This will be called once when the binding is first applied to an element,
                // and again whenever any observables/computeds that are accessed change
                // Update the DOM element based on the supplied values here.
            }
        };

        /******FIN CUSTOM BINDING handler ********/


        /****** EVENEMENT navigateur ******/
        /* avant que l'onglet se ferme */
        window.onbeforeunload = function () {
            socket.emit("exampleEmit");
        };

        // subscribe to visibility change events
        document.addEventListener('visibilitychange', function () {
            // fires when user switches tabs, apps, goes to homescreen, etc.
            if (document.visibilityState === 'hidden') {

            }
            // fires when app transitions from prerender, user returns to the app / tab.
            if (document.visibilityState === 'visible') {

            }
        });
        /****** FIN EVENEMENT navigateur ******/


    }
    // Activates knockout.js
    ko.applyBindings(new AppViewModel());



});
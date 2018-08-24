//Activer ou désactiver le module d'inscription.

var ModuleInscriptionActif = ko.observable(true);
var ModuleConnexionActif = ko.observable(true);
var ModuleMiniTchatActif = ko.observable(true);

var ModuleAccueilActif = ko.observable(true);


var LoadModuleFunction = function () {


    //si module Accueil Actif
    ko.components.register('Accueil-Component', {  // Connexion-Component est le nom du composant il suffit de l'apeller dans le html comme suit : <div data-bind='component: { name: "Connexion-Component",params: { ViewModel: $root}}'></div>  
        viewModel: AccueilViewModel, //ConnexionViewModel est une function se trouvant dans le fichier Client/js/ModuleJs/Connexion.js
        template: { require: 'text!Client/ModuleHtml/Accueil.html' }, //utilisation de require text pour récupérer un template HTML et l'afficher.
    });


    //si module d'inscription Actif
    ko.components.register('Inscription-Component', {  // Inscription-Component est le nom du composant il suffit de l'apeller dans le html comme suit : <div data-bind='component: { name: "Inscription-Component",params: { ViewModel: $root}}'></div>  
        viewModel: InscriptionViewModel, //InscriptionViewModel est une function se trouvant dans le fichier Client/js/ModuleJs/Inscription.js
            template: { require: 'text!Client/ModuleHtml/Inscription.html' }, //utilisation de require text pour récupérer un template HTML et l'afficher.
        });
    
    //si module de connexion Actif
    ko.components.register('Connexion-Component', {  // Connexion-Component est le nom du composant il suffit de l'apeller dans le html comme suit : <div data-bind='component: { name: "Connexion-Component",params: { ViewModel: $root}}'></div>  
        viewModel: ConnexionViewModel, //ConnexionViewModel est une function se trouvant dans le fichier Client/js/ModuleJs/Connexion.js
        template: { require: 'text!Client/ModuleHtml/Connexion.html' }, //utilisation de require text pour récupérer un template HTML et l'afficher.
    });

    //si module Mini tchat Actif
    ko.components.register('MiniTchat-Component', {  // MiniTchat-Component est le nom du composant il suffit de l'apeller dans le html comme suit : <div data-bind='component: { name: "MiniTchat-Component",params: { ViewModel: $root}}'></div>  
        viewModel: MiniTchatViewModel, //InscriptionViewModel est une function se trouvant dans le fichier Client/js/ModuleJs/miniTchat.js
        template: { require: 'text!Client/ModuleHtml/miniTchat.html' }, //utilisation de require text pour récupérer un template HTML et l'afficher.
    });

    //***********  Ci dessous il suffit d'instancier les autres modules que l'on souhaite *******//


}



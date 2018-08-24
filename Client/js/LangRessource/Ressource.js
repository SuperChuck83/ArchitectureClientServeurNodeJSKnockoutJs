var ressourceActive = ko.observable("fr");

var res_fr = {
    Bonjour : "Bonjour !"

}


var res_en = {
    Bonjour: "Hello !"

}

var ChangeLangue = function () {

    var resourceObject;
    if(ressourceActive() == "fr")
    {
        ressourceActive("en");
        resourceObject = res_en;
    }
    else if(ressourceActive() == "en")
    {
        ressourceActive("fr");
        resourceObject = res_fr;
    }
    else {
        throw ("ChangeLangue, Ressource.js, Language non implémenté....")
    }

    return resourceObject;
    
}
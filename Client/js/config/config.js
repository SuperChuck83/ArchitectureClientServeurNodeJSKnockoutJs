const EnvironementProd = false;

var GetAppUrl = function () {

    if (EnvironementProd) {
        return "https://frutizone.fr/"
    }
    else {
        return "http://localhost:3100/";
    }
};



const EnvironementProd = false;

var GetAppUrl = function () {

    if (EnvironementProd) {
        return "http://54.38.34.85:3100/";
    }
    else {
        return "http://localhost:3100/";
    }
};



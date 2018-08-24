var AccueilViewModel = function (params) {
 
    //RootModel => le viewModel parent passé en paramètre du composant dans le HTML ( //component: { name: "Accueil-Component",params: { ViewModel: $root}}// ) 
    var RootModel = params.ViewModel;

    //Model propre au composant.
    var _that = this;
    _that.AccueilVisible = ko.observable(true);


    //declaration du module dans le rootmodel pour que tout le monde puisse y accèder
    RootModel.AccueilModule = _that;
    
}


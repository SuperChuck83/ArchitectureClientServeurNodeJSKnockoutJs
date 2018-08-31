function escapeHtml(text) {
    if (text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

}

//déclaration de mongojs et des collections ( tables )
var mongojs = require('mongojs');
//ici on ajoute toutes les collections que l'on utilise dans le projet (Archi est le nom de la base de donnée)
var db = mongojs('localhost:27017/Archi', ['user', 'departement', 'Token_pwd', 'admin_Role', 'smiley']);

//underscore permet de travailler avec les listes/tableaux
var _ = require('underscore')._;
//gestion des password hasché 
var passwordHash = require('password-hash');
//infrastructure pour l'api REST
var express = require('express');

var multer = require('multer');
var path = require('path');
var request = require('request');
//permet de faire travailler node js en asynchrone quando n l'utilise, par exemple faire X requête en base en parallèle et attendre le résultat finale avant dexecuter la suite du code ! 
var async = require("async.min");
//permet d'éviter les injectiosn SQL, à appliquer sur chaque variable venant du client.
var sanitize = require('mongo-sanitize');
//permet de gérer l'envoie de mail 
var nodemailer = require("nodemailer");
//permet de gérer des dates 
var moment = require("moment.min");
//permet de minifier loes fichiers ..
var compressor = require('node-minify');
//permet d'avoir des ID uniques 
var Guid = require('guid');

var app = express();
app.enable('trust proxy');
app.set('trust proxy', function () { return true; });

//le server pour les sockets 
var serv = require('http').Server(app);

//permet d'un peu sécuriser son application juste en écrivant ces lignes.. ( https://www.npmjs.com/package/helmet ) 
var helmet = require('helmet');
app.use(helmet());


//Pour le projet angular qui est sur le port 4200 il faut activer le cors pour pouvoir faire des requêtes 
const cors = require('cors')
var corsOptions = {
    origin: ['http://localhost:4200', 'http://54.38.34.85:3100', 'http://54.38.34.85:4200'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors(corsOptions))

//genere une minification au lancement du serveur. utile pour diminuer le poid et la compréhension de ses fichiers, mais à n'utiliser qu'en production car cela prend un peu de temps ...
if (true) {
    // Using Google Closure Compiler
    //le site 
    //compressor.minify({
    //    compressor: 'gcc',
    //    input: 'Client/js/index.js',
    //    output: 'Client/js/min/index.js',
    //    callback: function (err, min) { }
    //});
}

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


/******Lien vers des pages html ******/

//lien vers le service worker... pour la version mobile
app.get('/sw', function (req, res) {
    res.sendFile(__dirname + '/sw.js');
});

app.get('/', function (req, res) {
    // res.setHeader("Cache-Control", "public, max-age=3000");
    //res.setHeader("Service-Worker-Allowed", "/");

    res.sendFile(__dirname + '/Client/index.html');
});

app.get('/m', function (req, res) {
    //res.setHeader("Service-Worker-Allowed", "/");
    res.sendFile(__dirname + '/Client/mobile/index.html');
});


app.get('/Images', function (req, res) {
    res.sendFile(__dirname + '/Images/' + req.query.nom);
});
/******Lien vers des pages html ******/


//****** API GET/POST *******/
{
    //gestion du rate limit, un utilisateur ne pourra pas apeller plus de "max" fois en "windowMs" secondes, 
    const rateLimit = require("express-rate-limit");
    const apiLimiter = rateLimit({
        windowMs: 5 * 1000,//5 secondes // 15 * 60 * 1000 -- 15 minutes
        max: 5
    });
    // only apply to requests that begin with /api/
    app.use("/api/", apiLimiter);


    app.get('/GetAllDepartement', function (req, res) {

        var callbacksuccess = function (Liste) {
            res.send(Liste);
        }

        db.departement.find({}).sort({ id: 1 }, function (err, res) {
            if (res.length > 0) {
                callbacksuccess(res);
            }
        });
    });


    //exemple d'appel post, le client envois le paramètre "pseudo" et le serveur retourne l'élement envoyé ! 
    app.post('/api/ExampleAjaxCall', function (req, res) {
        try {
            console.log("ExampleAjaxCall " + req.body.pseudo)
            res.send( {pseudo : req.body.pseudo + " " + " back", age: 10 });
        }
        catch (e) {
            console.log(e);
        }
    });


    //exemple d'appel post, le client envois le paramètre "pseudo" et le serveur retourne l'élement envoyé ! 
    app.post('/api/InscriptionUser', function (req, res) {
        try {
            console.log("inscription");
            //tout ce qui provient du client doit être sanitizer pour éviter des attaques d'injection nosql.
            var pseudo = sanitize(req.body.pseudo);
            var mdp1 = sanitize(req.body.mdp1);
            var mdp2 = sanitize(req.body.mdp2);

            var ListeFailMessage = [];
            var InscriptionAuthorize = true;

            /****  Test métier *****/
            if (mdp1 != mdp2) { //--si les mots de passe sont différents 
                InscriptionAuthorize = false;
                ListeFailMessage.push("Les mots de passe sont différents");
            }
            else {
                if (mdp1.length < 4) { //--si le mot de passe fait moins de 4 caractères 
                    InscriptionAuthorize = false;
                    ListeFailMessage.push("Mot de passe trop court (<4) ");
                }
            }
            if (pseudo.length < 3) //--si le pseudo fait moins de 3 caractères 
            {
                InscriptionAuthorize = false;
                ListeFailMessage.push("pseudo trop court (<3)");
            }
            /****  Fin Test métier *****/


            if (!InscriptionAuthorize) {
                res.send({ success: false, message: ListeFailMessage });
            }
            else {
                var Pseudoregex = new RegExp(["^", pseudo, "$"].join(""), "i");
                // Creates a regex of: /^SomeStringToFind$/i
                //--Test si le pseudo n'existe pas déjà en base
                db.user.find({ username: Pseudoregex }, function (err, UserRes) {

                    if (UserRes.length > 0) {
                        ListeFailMessage.push("Pseudo déjà existant.");
                        res.send({ success: false, message: ListeFailMessage });
                    }
                    else {
                        //hash le mot de passe… 
                        var hashedPassword = passwordHash.generate(mdp1);

                        //insère l'utilisateur en base…
                        db.user.insert({ username: pseudo, password: hashedPassword, role: "user", banni: false, dateInscription: new Date() }, function (err) {
                            res.send({ success: true, message: "Tu es désormais inscrit." });
                        });
                    }

                });
            }
        }
        catch (e) {
            console.log(e);
        }
    });



    //#region gestion du pass word

    //envoie le mail de changement de mot de passe avec l'url 
    app.post('/ChangePwdManager', function (req, Pwdres) {

        try {
            //console.log(req.body);
            var pseudo = sanitize(req.body.pseudo);

            db.Token_pwd.find({ pseudo: pseudo }, function (err, Tres) {
                var flag = true;
                if (Tres.length > 0) {
                    for (var i in Tres) {

                        if (moment().diff(Tres[i].date, 'days') < 1) {
                            flag = false;
                        }
                    }
                }
                if (flag) {
                    db.user.find({ username: pseudo }, function (err, res) {

                        if (res.length > 0) {
                            var email = res[0].email;

                            //generation du GUID
                            var guid = Guid.create();

                            db.Token_pwd.insert({ token: guid.value, date: new Date(), pseudo: pseudo, idPseudo: res[0]._id, expired: false }, function (err) {

                                //envoie du mail 
                                var mail = {
                                    from: "frutizoneofficiel@gmail.com",
                                    to: email,
                                    subject: "Frutizone - Récupération du mot de passe",
                                    html: "Tu as fait une demande de changement de mot de passe pour le pseudo " + pseudo + " tu peux changer ton mot de passe en te rendant sur le lien suivant : " + "<a href='https://frutizone.fr/PwdManager?id=" + guid + "' >https://frutizone.fr/PwdManager?id=" + guid + "</a>"
                                }
                                transport.sendMail(mail, function (error, response) {
                                    if (error) {
                                        //console.log(error);
                                    } else {
                                        //console.log("Message sent: " + response.message);
                                    }

                                    transport.close();
                                });
                                //fin envoie du mail

                                Pwdres.send('OK');

                            });



                        }

                    });

                }
                else {
                    Pwdres.send('Une seule demande par jour, vérifie les spam de ta boite mail !');
                }

            });
        } catch (e) {
            console.log(e);
        }

    });
    //renvoie la vue de changement de mot de passe si le token n'est pas expiré 
    app.get('/PwdManager', function (req, res) {

        try {
            var guid = sanitize(req.query.id);
            db.Token_pwd.find({ token: guid }, function (err, eres) {
                if (eres.length > 0) {

                    res.sendFile(__dirname + '/Client/PwdManager.html');
                }
                else {
                    res.sendFile(__dirname + '/Client/index.html'); //TODO :  erreur page
                }

            });
        }
        catch (e) {
            console.log(e);
        }
    });
    //appuie de l'utilisateur sur le bouton confirmer le changement de mot de passe : si le token n'est pas expiré on modifie le mot de passe 
    app.post('/SetNewPassword', function (req, res) {

        try {
            var token = sanitize(req.body.token);
            var newmdp = sanitize(req.body.newmdp);

            if (newmdp.length > 3) {

                db.Token_pwd.find({ token: token }, function (err, Tokenres) { // trouve le token correspondant 

                    if (Tokenres.length > 0) {

                        if (moment().diff(Tokenres[0].date, 'days') < 1 && Tokenres[0].expired == false) {

                            db.user.find({ _id: Tokenres[0].idPseudo }, function (err, userres) { //cherche l'user correspondant au token par son "id user "

                                if (userres.length > 0) {

                                    //update le mot de passe user 
                                    db.user.update({ _id: userres[0]._id }, { $set: { password: passwordHash.generate(newmdp) } }, function (err, dbres) {

                                        db.Token_pwd.update({ token: token }, { $set: { expired: true } }, function (err, dbres) {

                                            res.send('OK');
                                        });

                                    });
                                }

                            });
                        }
                        else {

                            res.send('NOTOK');
                        }


                    }

                });
            }

        } catch (e) {
            console.log(e);
        }


    });

    //#endregion gestion du pass word

}

//****** FIN API GET/POST *******/


//initialisation composant mail 
var smtpTransport = require('nodemailer-smtp-transport');
var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    tls: { rejectUnauthorized: false },
    auth: {
        user: "NAWAK",
        pass: "NAWAK"
    }
}))
//fin initialisation composant mail 



//******* TEMPS REEL ******//
app.use('/client', express.static(__dirname + '/Client'));
serv.listen(3100);
console.log("Server started. " + new Date());

//le salon que tout le monde rejoins quand il se connecte à l'application
var roomBase = "@HyperRoom";

var SOCKET_LIST = {}; //non utilisé pour l'instant '

//liste de joueur connecté nom de joueur connecté
var ListeNomPlayer = [];

var ListeNomPlayerSocketId = [];

var io = require('socket.io')(serv, { 'pingInterval': 25000, 'pingTimeout': 3600000 });

io.sockets.on('connection', function (socket) {

    //variable qui contient toute la session de l'user !
    var newuser = {};

    //on oblige l'user à rejoindre un salon de base!
    socket.join(roomBase);

    //!!!!!!\\ il faut enlever tous les logs qui ne sont pas dans des catchs lors d'une mise en prod car les console.log écrivent dans un fichier ce qui a pour conséquence de ralentir ENORMEMENT le serveur.
    console.log("Connection " + socket.id);


    /****  Gestion de la connection user ****/
    socket.on('TestConnection', function (data) {
        try {

            if (!newuser.pseudo)
            {
                var pseudo = sanitize(data.pseudo);
                var pwd = sanitize(data.pwd);

                if (!pseudo) {
                    socket.emit("ErreurServeur", "Le pseudo doit être renseigné !");
                }
                else {
                    db.user.find({ username: new RegExp(["^", pseudo, "$"].join(""), "i") }, function (err, res) {

                        if (res.length > 0) {

                            if (res[0].banni == true) //si user banni on renvois un message erreur 
                            {
                                socket.emit("ErreurServeur", "Ce compte est banni du site.");
                            }
                            else {
                                //pseudo inscris en base
                                //--on demande à l'utilisateur de renseigné le mot de passe
                                if (pwd) //si l'utilisateur renseigne un mot de passe 
                                {
                                    if (passwordHash.verify(pwd, res[0].password)) {

                                        var indexPlayer = ListeNomPlayer.indexOf(pseudo.toLowerCase());

                                        //si quelqu'un est déjà connecté à son compte
                                        if (indexPlayer != -1) {

                                            socket.emit("ErreurServeur", "Ce compte était déjà connecté au site...");

                                            var IndexPlayerSocket = _.findIndex(ListeNomPlayerSocketId, { pseudo: pseudo.toLowerCase() });
                                            if (IndexPlayerSocket != -1) {
                                                try {
                                                    io.sockets.connected[ListeNomPlayerSocketId[IndexPlayerSocket].socketId].emit("ErreurServeur", "Quelqu'un vient de se connecter avec ton compte.");
                                                    io.sockets.connected[ListeNomPlayerSocketId[IndexPlayerSocket].socketId].disconnect();
                                                }
                                                catch (e) {
                                                    console.log("deconnection échoué");
                                                }
                                            }
                                        }
                                        //si le mot de passe est bon
                                        //-- on connecte l'utilisateur avec son vrai pseudo
                                        newuser.pseudo = res[0].username;
                                        newuser.role = res[0].role;

                                        //ajoute du pseudo à lal iste NOM player.
                                        ListeNomPlayer.push(pseudo.toLowerCase());

                                        ListeNomPlayerSocketId.push({
                                            pseudo: pseudo.toLowerCase(),
                                            socketId: socket.id,
                                            role: res[0].role
                                        });

                                        //on renseigne un token pour la personne qui s'est connecté qui permettra d'avoir l'accès à l'api sans exposer son mot de passe.
                                        var guid = Guid.create();
                                        db.user.update({ username: newuser.pseudo }, { $set: { token: guid.value } }, function (err, dbres) { });
                                        socket.emit("ConnectionDone", { code: 1, message: "connexion réussi", pseudo: newuser.pseudo, token: guid.value, role: newuser.role });

                                    }
                                    else {
                                        socket.emit('ErreurServeur', "Mauvais mot de passe !");
                                    }

                                }
                                else { //si pas de mot de passe renseigné connection false demande de mot de passe avec message 
                                    socket.emit('ErreurServeur', "Le mot de passe doit être renseigné !");
                                }
                            } //fin else banni

                        }
                        else {
                            //pseudo non inscris 
                            socket.emit('ErreurServeur', "Pseudo inexistant");
                        }
                    });

                }
            }
           
        }
        catch (e) {
            console.log(e);
        }

    });
    /****  FIN Gestion de la connection user ****/


    //quand un joueur se déconnecte du site node js lance cette évenement 
    //il faut donc supprimer toute trace du joueur qui se déconnecte ici ( dans les listes par exemple )
    //zone très délicate à ne pas foirer à tester à chaque modif que ca fonctionne bien.
    socket.on('disconnect', function () {
        //console.log('Got disconnect! ');

        //quitter tous les salons : 
        var IndexPlayerSalon;

        //important... newuser est global au socket et peut donc être supprimer avant la fin de la fonction, ce qui entraine des perturbations ...
        var newuserpseudo = newuser.pseudo;

        if (newuserpseudo)
        {
            console.log("disconnect " + newuserpseudo);
            var IndexPlayerSocket = _.findIndex(ListeNomPlayerSocketId, { pseudo: newuserpseudo.toLowerCase() });
            if (IndexPlayerSocket != -1) {
                console.log("disconnect 1" );
                ListeNomPlayerSocketId.splice(IndexPlayerSocket, 1);
            }

            var indexnomPlayer = ListeNomPlayer.indexOf(newuserpseudo.toLowerCase());
            if (indexnomPlayer != -1) {
                console.log("disconnect 2");
                ListeNomPlayer.splice(indexnomPlayer, 1);
            }
        }

        socket.leave(roomBase);
    });

    socket.on("exampleEmit", function (data) { //data = pseudouser
        try {
            console.log("exampleEmit");
        } catch (e) {
            console.log(e);
        }
    });

    /***** Mini Tchat *****/
    socket.on("TchatRecoisMessage", function (data) {
        try {

            console.log(data.message);
            /** Test métier  **/
            var envoiAutorise = true;
            if (!data.message  || data.message.length < 1) {
                envoiAutorise = false;
                socket.emit("ErreurServeur", "Message trop court.");
            }
            /** Fin Test métier  **/

            if (envoiAutorise == true) {
                console.log(newuser.pseudo);
                dataToSend = {
                    pseudo: newuser.pseudo ? newuser.pseudo : "Anonymous", // si l'utilisateur est authentifié alors on renvois son pseudo sinon on renvois anonymous.
                    message: data.message
                };

                //Envois à tout le monde connecté au salon "roomBase = @HyperRoom"
                io.in(roomBase).emit('TchatEnvoisMessage', dataToSend);


                //io.emit('TchatEnvoisMessage', dataToSend); //-- envois à tout le monde connecté au serveur ! 
                //socket.emit("TchatEnvoisMessage", dataToSend); //--envois qu'à soit même 
            }

        } catch (e) {
            console.log(e);
        }
    });
    /***** FIN Mini Tchat *****/

});


//******* FIN TEMPS REEL ******//

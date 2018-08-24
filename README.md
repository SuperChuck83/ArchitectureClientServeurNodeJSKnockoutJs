# Frutiparc
Frutiparc web 

Bonjour, Ici le code source de frutiparc version web, l'objectif est de se rapprocher le plus possible du site flash frutiparc 2, 
en utilisant les archives du net et notre mémoire de ce que fut frutiparc. 

l'architecture actuelle est basé sur :
1) un serveur node js communiquant avec une base de donnée mongodb. 
2) une IHM en html/css avec le framework javascript knockout permettant de faire du binding de données simplement. 

prérequis à télécharger et installer : 
node js : https://nodejs.org/en/download/ 
mongo db : https://www.mongodb.com/download-center#community  + je conseille mongobooster pour visualiser les bases mongodb : https://mongobooster.com/ 

Prérequis à apprendre avant de commencer à coder : 
on part du principe que l'on connait le javascript, le html et le css, il faut suivre le petit tuto en ligne ( rien à installer tout avec le navigateur)
de knockout.js : http://learn.knockoutjs.com/ 



prérequis pour lancer l'application : 

Une fois que mongodb est télécharger il faut créer la base de nom "WL" et dedans cette table créer la collection( table ) "user"
avec mongobooster cela se fait en 2 ou 3 click ( click droit sur localhost => "create database" => ecrire "WL" => valider, click droit sur "WL" => create collection => "user" => valider )  
IMPORTANT 14/08/2017 : 
lancer la commande suivante => db.user.insert({username:"toto", password : "sha1$1e48b34a$1$7b1a5e988a09cc3efe275fd4faee9612718ffd81"}) 

Comment lancer l'application : 

Pour lancer l'application avec windows il faut ouvrir la console windows ( ctrl + R écrire CMD et entrée )   
et se rendre sur le dossier contenant le code source ( cd /user/Nom/frutiparc ) 
ecrire dans la console "node app.js" le serveur se lance. 

dans un navigateur taper l'adresse local : http://localhost:3000/ 

ici on est sur la page de connexion de frutiparc il suffit d'entrer ses identifiants et d'appuyer sur le bouton se connecter 
arriver sur le bureau de frutiparc. 

IMPORTANT 14/08/2017 : 
actuellement on se connecte à l'aide d'un bouchon ( dans ocr.js )  pour aller plus vite 
pseudo : toto password : 12345 
donc il faut ajouter à la table/collection "user"  à l'aide de la commande suivante par exemple : 
db.user.insert({username:"toto", password : "sha1$1e48b34a$1$7b1a5e988a09cc3efe275fd4faee9612718ffd81"}) 




Modifier l'application :
coté serveur on travail dans le fichier app.js 

coté client javascript on travail dans ocr.js ( l'objectif pour plus tard est de réussir à découper ce fichier en plusieurs fichier, pas évident avec knockout )

coté client IHM on travail dans index.html et ocr.css 

les librairies JS clientes vont dans le dossier /Client/js, les librairies js coté serveur vont dans node_modules et s'installe avec l'outil npm 

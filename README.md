# Architecture Client-Serveur NodeJS et KnockoutJs
##@Live Demo : http://54.38.34.85:3100


1) prérequis à télécharger et installer : 
- node js : https://nodejs.org/en/download/ 
- mongo db : https://www.mongodb.com/download-center#community  + je conseille mongobooster pour visualiser les bases mongodb : https://mongobooster.com/ 


# Lancer mongodb 
2) Dans un invite de commande se rendre dans le dossier où est installer mongo db ( cd C:\Program files\MongoDb\Server\3.4 ( ou votre version à vous)\bin ) puis taper la commande suivante => mongod --port 27017 --dbpath "C:\Program Files\MongoDB\data\db"
Cela va lancer mongodb sur le port 27017. ( si on ne fait pas ça on peut pas utiliser la base de données dans notre serveur ) 


# Lancer le projet
3) Dans un invite de commande aller à la racine du projet /ArchitectureNode  et taper la commande => node app.js
le message "Server started ...." devrait s'afficher 
il suffit ensuite d'ouvrir un navigateur est d'écrire l'url local du projet : http://localhost:3100/ 




Ce projet est donc un exemple d'application web utilisant un serveur node js avec API et socket, et knockout js, html et css côté client. 
Il permet de voir comment disposer en plusieurs modules distinct au niveau du front avec knockout, de faire des appels ajax au serveur node js, et d'utiliser de la communication temps réel avec les sockets. 


les features disponibles actuellement sont donc => Utilisation de module côté IHM, l'utilisation de socket pour la communication dans le tchat, un système d'inscription et d'authentification.



tuto de knockout.js : http://learn.knockoutjs.com/ 

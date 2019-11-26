JEU DE DAME
===========

Ce projet a pour objectif d'implémenter un jeu de Dame multi-utilisateur. Notre jeu comporte:
Vous devez réaliser un jeu en ligne sur le modèle vu en TD. Il doit comporter :

  - Une page permettant de s’enregistrer,
  - Un mécanisme pour se connecter,
  - Une page présentant la liste des utilisateurs en ligne, leur nombre de parties gagnées/perdues,
  - Un mécanisme permettant de défier un adversaire,
  - Une interface permettant de jouer le jeu.

Technologie utilisée
------------

Pour réaliser cette applicatioon , on a utilisé:

  - Node.js,
  - Express,
  - Une base de donnée No SQL pour la sauvegarde des états: Mongo DB
  - Le WebSocket pour la réaliser la communication entre les clients et le server: Mongoose
  
  Fonctionnement de l'application:
  -------------------------------
  
  A démarage l'utilisation doit ce connecter avec un login et un mot de passe.
  S'il n'a pas de compte il doit en créer un.
  
  Ensuite il est derigé vers la page des utilisateur connectés.
  Cette page affiche tous les utilisateur qui sont connectés avec unu statut 'AVAILABLE'.
  Sur cette pasge il pourra choisir Quel joueur i l aimerait défier.
  Une invitation sera donc envoyée a ce joueur, qui décide si oui ou non il veut jouer avec celui qui l'a invité.
  S'il répond oui, son statut est mis en 'PLAYING' et le plateau de jeu lui est envoyer à lui ainsi qu'au demandeur de défi.
  



 
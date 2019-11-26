var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validate = require('mongoose-validator')

var passwordValidator = [
  validate({
    validator: 'matches',
    arguments: ['(((?=.*\d)(?=.*[a-z])(?=.*[A-Z])).{8,})+$','i'],
    message: 'Password should matches with the patern',
  }),
]  


var emailValidator = [
  validate({
    validator: 'isEmail',
    arguments: ['([\w-\.]+@([\w-]+\.)+[\w-]{2,4})+$','i'],
    message: 'Email should matches with the patern',
  }),
  
]
var stringValidator = [
  validate({
    validator: 'isAscii',
    message: 'Name should matches with the patern',
  }),
  
]


var Schema = mongoose.Schema;

var User = mongoose.Schema({
    nom: { type: String, required: true, validate: stringValidator }, 
    mail: { type: String,  validate: emailValidator }, 
    password: { type: String, required: true, validate: passwordValidator },
    socket: Object,   
    gagner: Number,
    perdu: Number,
    statut: String
  
}); 
var Utilisateur = mongoose.model('UserList', User);

var syncgetUserlist = () => {
       return new Promise((resolve, reject) => {
         Utilisateur.
          find().
          select('nom gagner perdu socket').
          exec(function (err, utilisateurs) {
            if (err) reject(err);
            else
              resolve(utilisateurs);
          }); 
       });
    };

var syncgetUser = (nom) => {
       return new Promise((resolve, reject) => {
         if(typeof nom==='undefined')
           reject(' voila')
         Utilisateur.
          findOne().
          where('nom').equals(nom).
          select('nom gagner perdu statut').
          exec(function (err, utilisateur) {
            if (err) reject(err);
            else
              resolve(utilisateur);
          }); 
       });
    };


var syncAddUser = (nom,email,password) => { 
   
       var hash = bcrypt.hashSync(password, 10);
       return new Promise((resolve, reject) => {
         
        Utilisateur.
          findOne().
          where('nom').equals(nom).
          select('nom').
          exec(function (err, utilisateur) {
            if (err) reject(err);
            else if(utilisateur){
                resolve("used");
            }  
            else{
             Utilisateur.create({ nom: nom, 
                     email:email,
                     password:hash, 
                     socket:null,
                     gagner:0, 
                     perdu:0,
                     statut:'AVAILABLE' }, function (err, result) {
              if (err)  reject(err);
              else{
                resolve("ok");
              }
        });         
            }
          }); 
  
        
    });        
};

//login
var syncLogin = (nom,password) => {
       var hash = bcrypt.hashSync(password, 10);
       return new Promise((resolve, reject) => {
         
        Utilisateur.
          findOne().
          where('nom').equals(nom).
          select('password').
          exec(function (err, utilisateur) {
            if (err){ 
                     reject(err);
                    }
            else if(utilisateur){
              
              if(bcrypt.compareSync(password, utilisateur.password)) {
               //  syncUpdateState(nom,);
                resolve("ok");
              } else {
               resolve("no");
              }

            } 
          else{
            console.log(nom)
            resolve("no");
          }
           
          }); 
  
        
    });        
};

//update

var syncUpdateState = (nom,stat) => { 
   
    return new Promise((resolve, reject) => {
      var updates = {$set: { statut: stat } };
      Utilisateur.updateOne({nom: nom}, updates, function(err,data) {
        if(err)
          reject(err);
        else if(data)
          resolve("done");
      });
               
    });        
};


var syncUpdateWs = (nom, ws) => { 
   
    return new Promise((resolve, reject) => {
      var updates = {$set: { socket: ws.toObject() } };
      Utilisateur.updateOne({nom: nom}, updates, function(err,data) {
        if(err)
          reject(err);
        else if(data)
          resolve("done");
        
      });
               
    });        
};
var syncUpdateGagner = (nom) => { 
   
    return new Promise((resolve, reject) => {
      var updates = {$inc: { gagner: 1 } };
      Utilisateur.updateOne({nom: nom}, updates, function(err,data) {
        if(err)
          reject(err);
        else if(data)
          resolve("done");
        
      });
               
    });        
};

var syncUpdatePerdu = (nom) => { 
   
    return new Promise((resolve, reject) => {
      var updates = {$inc: { gagner: -1 } };
      Utilisateur.updateOne({nom: nom}, updates, function(err,data) {
        if(err)
          reject(err);
        else if(data)
          resolve("done");
        
      });
               
    });        
};

var syncLogout = (nom) => { 
   
       return new Promise((resolve, reject) => {  
         syncUpdateState(nom,"AVAILABLE");

        });      
};


var syncUser = {
  updateGagner:syncUpdateGagner,
  updateState: syncUpdateState,
  getUserlist: syncgetUserlist,
  UpdatePerdu:syncUpdatePerdu,
  updateWs:syncUpdateWs,
  getUser: syncgetUser,
  addUser: syncAddUser,
  logout:syncLogout,
  login:syncLogin
  
  
};


module.exports = {
  sync: syncUser
};
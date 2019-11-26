const dataStore = require('./datastore').sync;

class User {
  
  constructor(name, wsconn,gagner,perdu) {
    
    this.name = name;
   this.gagner = gagner;
    this.perdu = perdu;
    this.wsconn = wsconn;
   this.state = 'AVAILABLE';
   // this.setToAvaible();
  }
  
  async getUser(){
    return this;
  }
  
async gagnant(){
    this.gagner++;
   try{
      var log= await dataStore.updateGagner(this.name);
   }
    catch(e){
            console.log(e);
    }
     

}
  
async perdant(){
  this.perdu++;
  try{
      var log= await dataStore.updatePerdu(this.name);
   }
    catch(e){
      console.log(e);
    }
}
  toJSON() {
    return {
      name: this.name,
      state: this.state,
      gagner:this.gagner,
      perdu:this.perdu,
    }
  }
  async setToAvaible(){    

    try{
      await dataStore.updateState(this.name,'AVAILABLE');   }
    catch(e){
      console.log(e);
    }  
  }
  serialize() {
    return {
      name: this.name,
      state: this.state,
      gagner:this.gagner,
      perdu:this.perdu,
    }
  }
 async  invitation(adv) {
    
    try{
      var user= await dataStore.getUser(this.name);
      var adver= await dataStore.getUser(adv.name);
      if (this !== adv
          && user.statut == 'AVAILABLE'
          && adver.statut == 'AVAILABLE') {
      
          this.state = adv.state = 'INVITATION';
          await dataStore.updateState(this.name,'INVITATION');
          await dataStore.updateState(adv.name,'INVITATION');
          return "ok";
    
      } else {
          return null;   
      }

   }
    catch(e){
        console.log(""+e);
    }
    
  }
  
  
  async invitation_accepter(adv){
    this.state = adv.state = 'PLAYING';
    try{     
          await dataStore.updateState(this.name,'PLAYING');
          await dataStore.updateState(adv.name,'PLAYING');     
   }
    catch(e){
      console.log(e);
    }
  }
  


async invitation_rejeter(adv){
    try{     
          this.state = adv.state = 'AVAILABLE';
          await dataStore.updateState(this.name,'AVAILABLE');
          await dataStore.updateState(adv.name,'AVAILABLE');     
   }
    catch(e){
      console.log(e);
    }
  }
  
  async addUser(name, email,password){    
  var add;
    try{
      add=await dataStore.addUser(name,email,password);
     }
    catch(e){
      console.log(e);
    } 
    return add;
  }
  
  async log_out(){
    this.state = 'AVAILABLE';
    try{     
          await dataStore.logout(this.name);
   }
    catch(e){
      console.log(e);
    }
  }
  
}

exports.User = User;








































case 'new_connection':
            const name = parsed.username;
          try{
            var us= await dataStore.getUser(name);
           //connected_users[name] =  thisUser = new User(name,wsconn,us.gagner,us.perdu,us.statut);//pour chaque nom  connecté créer un user et l'ajouter a connected
            connected_users[name] =  new User(name,wsconn,us.gagner,us.perdu);//pour chaque nom  connecté créer un user et l'ajouter a connected
            thisUser=new User(name,wsconn,us.gagner,us.perdu)
            //  connected_users[name] = thisUser;
                  //  console.log(thisUser);

            //connected_users={}
            wsserver.broadcast(connected_users);
          }catch(err){
            console.log(""+err)
          }
              console.log(thisUser);

        break;
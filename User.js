const dataStore = require('./datastore').sync;

class User {
  
  constructor(name, wsconn,gagner,perdu) {
    
    this.name = name;
    this.gagner = gagner;
    this.perdu = perdu;
    this.wsconn = wsconn;
    this.state = 'AVAILABLE';

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
  setToAvaible(adv){
    this.state=adv.state = 'AVAILABLE';
  }
  serialize() {
    return {
      name: this.name,
      state: this.state,
      gagner:this.gagner,
      perdu:this.perdu,
    }
  }
  invitation(adv) {
    if (this !== adv
        && this.state == 'AVAILABLE'
        && adv.state == 'AVAILABLE') {
      this.state = adv.state = 'INVITATION';
      return "ok";
    } else {
      return null;
    }
  }
  invitation_accepter(adv){
    this.state = adv.state = 'PLAYING';
  }
  
}

exports.User = User;

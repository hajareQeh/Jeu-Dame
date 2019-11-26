var http = require('http');
var ws = require('ws');
var mongoose = require('mongoose'); 
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const User = require('./User').User;

var MONGODB_URI = 'mongodb+srv://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+'/'+process.env.DB;
// Nous connectons l'API à notre base de données
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
const dataStore = require('./datastore').sync;

app.use(express.static('public'));

var connected_users={};
var server = http.createServer(app);
var wsserver = new ws.Server({ 
    server: server,    
});
app.use(bodyParser.json());

var ad;

function noop() {}

/*const interval = setInterval(function ping() {
  wsserver.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
 
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);
*/



wsserver.broadcast = function broadcast(data) {
  wsserver.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
     
      client.send(JSON.stringify({
          type: 'userlist',
          userlist: Object.values(data).map((u) => u.serialize()),
        }));
    }
   
  });
};

//****************************************
var tmpcase=1;

class Case {
  constructor(color, pion,row,column) {
    this.color = color;
    this.pion = pion;
    this.row = row;
    this.column = column;
    this.selected=false;
    this.dame=false;
  }
}

var b=[[0,1,0,1,0,1,0,1,0,1],
       [1,0,1,0,1,0,1,0,1,0],
       [0,1,0,1,0,1,0,1,0,1],
       [1,0,1,0,1,0,1,0,1,0],
       [0,0,0,0,0,0,0,0,0,0],
       [0,0,0,0,0,0,0,0,0,0],
       [0,-1,0,-1,0,-1,0,-1,0,-1],
       [-1,0,-1,0,-1,0,-1,0,-1,0],
       [0,-1,0,-1,0,-1,0,-1,0,-1],
       [-1,0,-1,0,-1,0,-1,0,-1,0]];


var turn = 1;
var row_f;
var column_f;
var tmp=0;
var etat;
var board = Array(10);
var game_is_over = false;


for (var i = 0 ; i < 10 ; i++) {
    board[i] = Array(10);
   for (var j = 0 ; j < 10 ; j++) {
      etat=new Case(tmp,b[i][j],i,j);
        board[i][j] = etat;
        if(tmp==1) tmp = 0;
               else tmp = 1;
    }
   if(tmp == 1) tmp = 0;
               else tmp = 1;
}

function win(){
  var player_w = 0;
  var player_b = 0;
  for (let i = 0 ; i < 10 ; i++) {
   for (let j = 0 ; j < 10 ; j++) {
      if(board[i][j].pion == 1) player_w +=1;
      if(board[i][j].pion == -1) player_b +=1;
     
   }
  }
  
  if(player_w == 0){
    console.log("end game : black win");
    return true;
  }else
    if(player_b == 0) {
      console.log("end game : white win");
      return true;
    }else
      return false;
}

function play_W(column,row,i){
  if(board[row][column]!=i && board[row][column].color!=0){
  if(board[row][column].pion==0){
  if(i.dame){
    dame_move(i,row,column,-1);
    
  }else{
    
    if(row==i.row+1 && (column==i.column+1 | column==i.column-1)){
    board[row][column].pion=i.pion;
    board[i.row][i.column].pion=0;
    //i.pion=0;
    
      }else{
        if(board[i.row+1][i.column-1].pion== -1 && row==i.row+2 && column==i.column-2 ){
          
          board[row][column].pion=i.pion;
          board[i.row+1][i.column-1].pion= 0;
          board[i.row][i.column].pion=0;
          //i.pion=0;
        }
        if(board[i.row+1][i.column+1].pion== -1 && row==i.row+2 && column==i.column+2 ){
          
          board[row][column].pion=i.pion;
          board[i.row+1][i.column+1].pion= 0;
          board[i.row][i.column].pion=0;
         // i.pion=0;
        }
      }
  }
  }else console.log("il y a pas de pion");
  }else console.log("toucher un autre pion ");
  
      dame(row,column);
  console.log("enddd");
    
   }
 
function play_B(column,row,i){
   if(board[row][column]!=i && board[row][column].color!=0){
   if(board[row][column].pion==0){
   if(i.dame){
    dame_move(i,row,column,1);
    
   }else{
       
      
    if(row==i.row-1 && (column==i.column+1 | column==i.column-1)){
    board[row][column].pion=i.pion;
    board[i.row][i.column].pion=0;
    //i.pion=0;
    
      }else{
        if(board[i.row-1][i.column-1].pion== 1 && row==i.row-2 && column==i.column-2 ){
          
          board[row][column].pion=i.pion;
          board[i.row-1][i.column-1].pion= 0;
           board[i.row][i.column].pion=0;
          //i.pion=0;
        }
        if(board[i.row-1][i.column+1].pion== 1 && row==i.row-2 && column==i.column+2 ){
          
          board[row][column].pion=i.pion;
          board[i.row-1][i.column+1].pion= 0;
          board[i.row][i.column].pion=0;
          //i.pion=0;
        }
      }
  }
  }else console.log("il y a pas de pion");
  }else console.log("toucher un autre pion ");
  dame(row,column);

     
   }
 
function dame_move(i,row,column,t){
  let position_r=Math.abs(i.row-row);
     let position_c=Math.abs(i.column-column);
     
    if(position_r == position_c){//possition correcte
      if(i.row< row){
        if(i.column< column){
            for (let k = i.row, j = i.column ; k < row ,j < column ; k++,j++) {
                   if(board[k][j].pion== t && board[k+1][j+1].pion== 0 ){
                      
                     board[k][j].pion= 0;
                     
                  }
             }
        }else{
            for (let k = i.row ,j = i.column; k < row,j > column ; k++,j--) {
                   if(board[k][j].pion== t && board[k+1][j-1].pion== 0 ){
                      
                     board[k][j].pion= 0;
                  }
               
             }
          
        }
      }else{
         if(i.column< column){
          for (let k = i.row, j = i.column ; k > row ,j < column ; k--,j++) {
                   if(board[k][j].pion== t && board[k-1][j+1].pion== 0 ){
                      
                     board[k][j].pion= 0;
                  }
               
             }
          
        }else{
            for (let k = i.row, j = i.column ; k > row ,j > column ; k--,j--) {
                   if(board[k][j].pion== t && board[k-1][j-1].pion== 0 ){
                      
                     board[k][j].pion= 0;
                  }
               
             }
          
        }   
      }
      
      board[row][column].pion= i.pion;
      board[row][column].dame= i.dame;
      board[i.row][i.column].pion=0;
      //i.pion=0;
       
    }else console.log("possition non correcte");
  
}

function dame(row,column){
  if(board[row][column].row==0 && board[row][column].pion==-1)
    board[row][column].dame=true;
  if(board[row][column].row==9 && board[row][column].pion==1)
    board[row][column].dame=true;
 
}


//*********************************************/


wsserver.on('connection',  function(wsconn) {
      let thisUser = null;

    wsconn.on('message', async function(data) {
      
      const parsed = JSON.parse(data);
      
      switch (parsed.type) {
        
        case 'new_connection':
          const name = parsed.username;
          var us;
          try{
            us= await dataStore.getUser(name);
          }
          catch(err){
            console.log(""+err)
          }
            thisUser = new User(name,wsconn,us.gagner,us.perdu);//pour chaque nom  connecté créer un user et l'ajouter a connected
            connected_users[name] = thisUser;
          //connected_users={}
            wsserver.broadcast(connected_users);

        break;
          
        case 'connected':
            
            wsserver.broadcast(connected_users);
          
        break;
        
        case 'challenge':
          console.log("loool");
          console.log(thisUser);
            var adver = connected_users[parsed.adversaire];
            //si l'adverssaire est libre
            if (adver && thisUser.invitation(adver)) {   
              adver.wsconn.send(JSON.stringify({// on envoie une demande a l'aversaire
                type: 'challenge_demander',
                username: thisUser.name,
              }));
           } else {
              // We send back an error
              thisUser.invitation_rejeter(adver);
              wsconn.send(JSON.stringify({
                type: 'challenge_rejected',
                username: parsed.username, 
              }));
          }
          wsserver.broadcast(connected_users);  //mettre à jour la liste des utilisateurs libre
        break;
        
        case 'challenge_accepte':
            
            thisUser = connected_users[parsed.username];
            var advers = connected_users[parsed.adversaire];  //adver ici c'est celui qui envoie la demande de challenge
            ad = advers.name; // ad c'est celui qui accepte la demande 
            advers.wsconn.send(JSON.stringify({
              type: 'challenge',
              username: thisUser.name,
              b : board,
            }));
            wsconn.send(JSON.stringify({
              type: 'challenge',
              username: advers.name,
              b : board,
            }));
          wsserver.broadcast(connected_users); 
        break;
          
        case 'move':
            const white = connected_users[parsed.username]; //celui qui accepte la demande c'est le white
            //const black = connected_users[parsed.adversaire];
    
            if(!win()){
            if(tmpcase==1 && white.name==ad){  
              play_W(parsed.a,parsed.b,parsed.pt);
              tmpcase=0;
            }else{
              if(tmpcase==0 && white.name!=ad){
               play_B(parseInt(parsed.a),parseInt(parsed.b),parsed.pt);
              tmpcase=1;
              }else{
                if(tmpcase==0 && white.name==ad){
                 wsconn.send(JSON.stringify({
                type: 'alert',
                username: white.name,
              }));
              }else{
                   white.wsconn.send(JSON.stringify({
                type: 'alert',
                username: thisUser.name,
              }));
              }
              }  
            }
              
          white.wsconn.send(JSON.stringify({
            type: 'move',
            username: thisUser.name,
            b : board,
          }));
          wsconn.send(JSON.stringify({
            type: 'move',
            username: white.name,
             b : board,
          }));
          }else{
             white.wsconn.send(JSON.stringify({
            type: 'game_over',
            username: thisUser.name,
          }));
          wsconn.send(JSON.stringify({
            type: 'game_over',
            username: white.name,
          }));
          }
          wsserver.broadcast(connected_users); 
            break;
        
        case 'challenge_refuse':
            //thisUser = connected_users[parsed.username];
            var advers = connected_users[parsed.adversaire];
            thisUser.invitation_rejeter(adver);
            adver.wsconn.send(JSON.stringify({
                type: 'challenge_rejected',
                username: parsed.advername,
              }));
        break;
        case 'go_to_signup':
          wsconn.send(JSON.stringify({
              type: 'go_to_signup',
          }));
        break;
        case 'signup':
          try{
            var add=await dataStore.addUser(parsed.username,parsed.email,parsed.password);
            if(add==="used"){
              wsconn.send(JSON.stringify({ 
                  type: 'message_bd',
                  msg: 'Login déjà utilisé !'
              }));}
            else if(add==="ok")
              wsconn.send(JSON.stringify({
                  type: 'logged',
                  username:parsed.username
              }));
            
          }catch(err){
            console.log(""+err);
          }
        break;
        case 'login':
          try{           
              var log= await dataStore.login(parsed.username,parsed.password);
            
              if(log==="no"){
                wsconn.send(JSON.stringify({
                    type: 'message_bd',
                    msg:'Login ou Mot de Passe Incorrect !', }));
              }
            else if(log==="ok")
              wsconn.send(JSON.stringify({
                  type: 'logged',
                  username:parsed.username
              }));
          }catch(e){
            console.log(""+e)
          }
          
        break;  
        case 'quit':

          var thisUser = connected_users[parsed.name];
          if(parsed.adversaire){
            var adver=connected_users[parsed.adversaire]
            adver.gagnant();
            thisUser.perdant();
          }
          thisUser.setToAvaible();          wsserver.broadcast(connected_users);
        break;
          
        case 'logout':
          var user = connected_users[parsed.user];
          if(parsed.adversaire){
            var adversaire=connected_users[parsed.adversaire];
            if(adversaire.statut == 'PLAYING' && user.statut == 'PLAYING')
              adversaire.gagnant();
              adversaire.setToAvaible();
          }
          if(user.statut == 'PLAYING')//
            user.perdant();
          
          user.log_out();
          
          delete connected_users[parsed.user];
          wsserver.broadcast(connected_users);
        break;
          

      }
    });
    // etc...
});




// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  
 response.sendFile(__dirname + '/views/index.html');
});
app.get('/troo', async function(request, response) {
 var us= await dataStore.getUserlist();
 response.send(us);
});
app.get('/signup', function(request, response) {
  response.sendFile(__dirname + '/public/signup.html');
});
// listen for requests :)
const listener = server.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

 
// client-side js
// run by the browser each time your view template is loaded
var ws = new WebSocket('wss://' + window.location.host);
const loginForm = document.getElementById('login');
const signUpForm= document.getElementById('signup');
const logout=document.getElementById('logout');
const info=document.getElementById('info');
var status = 'available';
const main = document.getElementById('main');
var maj=1;

const p = document.getElementById('info');
const nb = document.getElementById('nb');
var adversaire = null;
var turn = 1;
var row_f;
var column_f;
var b= Array(10);
var name;
const $ = document.querySelector.bind(document);
const append = (node, type) => node.appendChild(document.createElement(type));

ws.addEventListener('open', function(e) {  

      if (sessionStorage.getItem('username')) {
          maj=0;
          console.log(sessionStorage.getItem('username'));
          ws.send(JSON.stringify({ 
                  type: 'connected', 
                }));
      }
    ws.addEventListener('message', function(e) {
      const parsed = JSON.parse(e.data);
       
      switch (parsed.type) {
        
        case "userlist":  // Pour la mise à jour de la liste des utilisateurs 
                        console.log(maj)

            if (maj==0 && status == 'available') {//??????????????????????????????
              main.innerHTML = '';
              main.appendChild(createUserList(parsed.userlist));
              logout.style.display = "block";
              console.log(parsed.userlist)

            }    
          

        break;
        
        case 'challenge_demander': //si un chalenge est envoyé,  demander notification
            if (confirm(parsed.username+' aimerait vous challenger. Aceptez vous?')) { //si réponse = yes
             ws.send(JSON.stringify({ 
                  type: 'challenge_accepte', 
                  adversaire: parsed.username,
                  username:sessionStorage.getItem('username'),

                }));
             } 
            else {//si réponse = no
                 ws.send(JSON.stringify({ 
                    type: 'challenge_refuse', 
                    adversaire: parsed.username,                  
                    username:sessionStorage.getItem('username'),

                }));
             }
           logout.style.display = "block";

        break;
          
        case 'challenge':
            logout.style.display = "block";
            adversaire=parsed.username;//conserve le nom de l'adversaire 
            status = 'playing';
            main.innerHTML = '';
            p.innerHTML="white : ";
            p.align="center";
            render(parsed.b);
            initial(parsed.b);
            const button = append(main, 'button');
            button.textContent = 'Quit';
            button.className = 'quit';
        break; 
        
        case 'move':
            console.log("move");
            status = 'playing';
            main.innerHTML = '';
            render(parsed.b);
            initial(parsed.b);
            const bss = append(main, 'button');
            bss.textContent = 'Quit';
            bss.className = 'quit';
        break; 
        
        case 'game_over':
            status = 'available';
            p.innerHTML = '';
            main.innerHTML = '';
           alert('Game_over');
        break;  
         
        case 'alert':
           alert('It is not your turn!! ');
        break;
          
        case 'challenge_rejected':
            alert('The invite was rejected');
        break;
        case 'go_to_signup':
          main.innerHTML = '';
          createSignUp(); 
        break; 
        case 'message_bd'://///////////////////////
          info.innerHTML = parsed.msg;
        break; 
        case 'logged':
          if (!sessionStorage.getItem('username')) {
            sessionStorage.setItem('username', parsed.username);
          }   
          ws.send(JSON.stringify({ 
                    type: 'new_connection', 
                    username: sessionStorage.username,
                }));
          info.innerHTML='';
          maj=0;
          
        break;
          console.log(e.data);

      }
      
      window.onbeforeunload = function() {
      main.innerHTML = '';
      main.appendChild(createUserList(parsed.userlist));
}
    });
    
 
  /////ACTION APRES CLICK DE BOUTTON
    loginForm.onsubmit = function(event) { //Lorsque le formulaire de login est soumis 
        event.preventDefault();   
      console.log(signUpForm);
      const username = loginForm.elements['username'];
      const password = loginForm.elements['password'];
       
        ws.send(JSON.stringify({ 
          type: 'login', 
          username: username.value,
          password: password.value
        }));  

        username.value = '';
        password.value = '';
        username.focus();
    };
  
  
  ///**************Click on logout************/
  logout.onclick = function(event) {
    event.preventDefault();   
      console.log("logou")
        ws.send(JSON.stringify({ 
          type: 'logout', 
          user: sessionStorage.getItem('username'),
          adversaire:adversaire
        }));  
     sessionStorage.removeItem('username');
     adversaire=null;
    location.reload();//rafraichir la page 
    maj=1;
    };
  
  
  main.addEventListener('click', (e) => { // Lorsqu'on choisi un utilisateur à challenger
    if (e.target.className == 'challenge') {
      //name=e.target.dataset.username;
      console.log(e.target.dataset.username)
      ws.send(JSON.stringify({ // lancer un challenge
        type: 'challenge',
        username:sessionStorage.getItem('username'),
        adversaire:e.target.dataset.username,
      }));
      
    } 
   else if (e.target.className == 'go_to_signup') {///*************************************************
      
     
     ws.send(JSON.stringify({ // lancer un challenge
        type: 'go_to_signup',
      }));
    // alert("signup");
      
    } 
    
    else if (e.target.className == 'quit') {
      
      adversaire=null;
      
      ws.send(JSON.stringify({ type: 'quit',
                               name: sessionStorage.getItem('username')
                             
                             }));
    
    } else if (e.target.tagName == "TD") {
        if(turn ==1){
          //first clique
          row_f= parseInt(e.target.dataset.row);
          column_f = parseInt(e.target.dataset.column);
          turn=0;
          
          if(b[row_f][column_f].pion != 0){
            b[row_f][column_f].selected = true;
            main.innerHTML = '';
            render(b);
            const button = append(main, 'button');
            button.textContent = 'Quit';
            button.className = 'quit';
            b[row_f][column_f].selected = false;
          }else{
            turn =1;
          }
            
      }else{
         turn = 1;
         var column_s = parseInt(e.target.dataset.column);
         var row_s = parseInt(e.target.dataset.row);
        //seconde clique
        if(b[row_s][column_s].pion == 0){
          ws.send(JSON.stringify({ // lancer un challenge
              type: 'move',
              username:sessionStorage.getItem('username'),
              a : column_s,
              b : row_s,
              pt :b[row_f][column_f],
          }));
         }else{
           turn =0;
        }
      }
     }
    
      });
  
  
  });




// Create table from user list
const createUserList = (users) => {
  var list = document.createElement('TABLE');
 /* list.setAttribute("id", "list");*/
  list.border = '2';
  list.width = '60%';
  list.align = 'center';
  var row = document.createElement('TR');
  list.appendChild(row);
  
  append(row, 'TH').textContent = 'ONLINE PLAYERS'; 
  append(row, 'TH').textContent = 'Match Gagner'; 
  append(row, 'TH').textContent = 'Match Perdu'; 
  append(row, 'TH').textContent = 'Chalenged'; 
  
  for (var u of users) {
      var tr = document.createElement('TR');
    
    list.appendChild(tr);
    append(tr, 'TD').textContent = u.name; 
    append(tr, 'TD').textContent = u.gagner; 
    append(tr, 'TD').textContent = u.perdu; 
      const button = append(append(tr, 'TD'), 'button');
      button.textContent = 'Challenge';
      button.className = 'challenge';
      button.dataset.username = u.name;
      if (u.state != 'AVAILABLE' || u.name == sessionStorage.username)
        button.disabled = true;
    }
  return list;
}

const createSignUp = () => {
  
   const f = document.createElement("form");
  f.setAttribute('id',"signup");
  f.setAttribute('class',"container");
  
  const username = document.createElement("input"); //input element, text
  username.setAttribute('type',"text");
  username.setAttribute('name',"username");
  username.setAttribute('id',"username");
  username.setAttribute('placeholder',"Enter Username");
  username.required=true;
  
  const email = document.createElement("input");
   email.setAttribute('type',"email");
   email.setAttribute('name',"email");
   email.setAttribute('id',"email");
   email.setAttribute('placeholder',"Enter email");
  email.required=true;
  const password = document.createElement("input");
   password.setAttribute('type',"password");
   password.setAttribute('name',"password");
   password.setAttribute('id',"password");
   password.setAttribute('pattern',"*.(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"); 
   password.setAttribute('title',"Doit contenir au moins un nombre, une lettre majuscule et une lettre minisculeet doit faire au moins 8 caractères");
   password.setAttribute('placeholder',"Enter Password");
  password.required=true; 
      
  const passwordA = document.createElement("input");
   passwordA.setAttribute('type',"password");
   passwordA.setAttribute('name',"passwordA");
   passwordA.setAttribute('id',"passwordA");
   passwordA.setAttribute('placeholder',"Enter Password Again");
   passwordA.required=true;
  
  const s = document.createElement("input"); //input element, Submit button
  s.setAttribute('type',"submit");
  s.setAttribute('value',"Submit");
  passwordA.setAttribute('class',"signup");

   
  f.appendChild(username);
  f.appendChild(email);
  f.appendChild(password);
  f.appendChild(passwordA);
  f.appendChild(s);
  main.innerHTML = '';
  main.appendChild(f);
  
  
  //******Code pour Check la valeur de pasword
  
  var myInput = document.getElementById("password");
  var letter = document.getElementById("letter");
  var capital = document.getElementById("capital");
  var number = document.getElementById("number");
  var length = document.getElementById("length");

  // Quand l'utilisateur clique dans le champs mot de passe ,afficher le champe de message
  myInput.onfocus = function() {
    document.getElementById("message").style.display = "block";
  }

  // Quand l'utilisateur clique hors du champs du mot de passe, cacher la champs de message
  myInput.onblur = function() {
    document.getElementById("message").style.display = "none";
  }

  // Quand l'utilisateur commence à taper dans le champ mot de passe
  myInput.onkeyup = function() {
    // Valider lettres miniscules dans le password
    var lowerCaseLetters = /[a-z]/g;
    if(myInput.value.match(lowerCaseLetters)) {  
      letter.classList.remove("invalid");
      letter.classList.add("valid");
    } else {
      letter.classList.remove("valid");
      letter.classList.add("invalid");
    }

    // Valider une lettre Majuscule dasn le password
    var upperCaseLetters = /[A-Z]/g;
    if(myInput.value.match(upperCaseLetters)) {  
      capital.classList.remove("invalid");
      capital.classList.add("valid");
    } else {
      capital.classList.remove("valid");
      capital.classList.add("invalid");
    }

    // Valider l'existance d'un chiffre dans le mot de passe
    var numbers = /[0-9]/g;
    if(myInput.value.match(numbers)) {  
      number.classList.remove("invalid");
      number.classList.add("valid");
    } else {
      number.classList.remove("valid");
      number.classList.add("invalid");
    }

    // Valider la longueur du mot de passe
    if(myInput.value.length >= 8) {
      length.classList.remove("invalid");
      length.classList.add("valid");
    } else {
      length.classList.remove("valid");
      length.classList.add("invalid");
    }
  }

    /********************Fin code pour vérification password*******************/

    f.onsubmit = function(event) { //Lorsque le formulaire de login est soumis 
        event.preventDefault();   
        const username = f.elements['username'];
        const email = f.elements['email'];
        const password = f.elements['password'];
        const passwordA = f.elements['passwordA'];
        console.log(username.value);
        console.log(password.value);

         if(password.value===passwordA.value){
           info.innerHTML=""
            ws.send(JSON.stringify({ 
              type: 'signup', 
              username: username.value,
              email: email.value,
              password: password.value,
              passwordA: passwordA.value
            }));  
         }else{
           info.innerHTML="Les mot de passes ne correspondent pas !"
         }
          username.value = '';
          email.value='';
          password.value='';
          passwordA.value='';
          username.focus();

      };

  

}


function render(board){
// var div = document.querySelector('#msg');
  var tab = document.createElement("TABLE");
  tab.setAttribute("id", "table");
  for (var i = 0 ; i < 10 ; i++) {
    var lign = document.createElement("TR");
    
    for (var j = 0 ; j < 10 ; j++) {
      var cell = document.createElement("TD");
      cell.dataset.column = j;
      cell.dataset.row = i;
     if(board[i][j].color == 1)
        cell.className = "white";
      if(board[i][j].color == 0)
        cell.className = "black";
       if(board[i][j].pion == 1)
        cell.className = "PION_W";
      if(board[i][j].pion == -1)
        cell.className = "PION_B";
      if(board[i][j].selected == true)
        cell.className = "shine";
      if(board[i][j].dame == true){
        if(board[i][j].pion == 1)
        cell.className = "dame_w";
      if(board[i][j].pion == -1)
        cell.className = "dame_b";
      }
      
       lign.appendChild(cell);
    }
    tab.appendChild(lign);
  }
  tab.align = 'center';
  main.appendChild(tab);
}



function initial(board){
  for (var i = 0 ; i < 10 ; i++) {
    b[i] = Array(10);
    for (var j = 0 ; j < 10 ; j++) 
                          b[i][j] = board[i][j];
  }
}
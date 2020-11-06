
//Database references
var usersRef = firebase.database().ref("users/");
var activeBetsRef = firebase.database().ref("active-bets/");

//updates users in bet creation Dropdown for player1 from database request
var select = document.getElementById("selectHost");
usersRef.once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      let key = childSnapshot.key;
      let name = childSnapshot.child("name").val();

      let el = document.createElement("option");
      el.textContent = name;
      el.value = key;

      select.appendChild(el);
    });
  });

//updates users in bet creation Dropdown for player2 from database request
var selectOpp = document.getElementById("selectOpponent");
usersRef.once('value').then(function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    let key = childSnapshot.key;
    let name = childSnapshot.child("name").val();

    let el = document.createElement("option");
    el.textContent = name;
    el.value = key;

    selectOpp.appendChild(el);
  });

  let AddUserOption = document.createElement("option");
  let AddUser = document.createElement("a");
  AddUserOption.innerHTML = '<a href=""> </a>';

});

  //update users in dues (Pay Up) dropdown
  var selectPlayer = document.getElementById("selectPlayerPayUp");
  usersRef.once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      let key = childSnapshot.key;
      let name = childSnapshot.child("name").val();
  
      let el = document.createElement("option");
      el.textContent = name;
      el.value = key;

      selectPlayer.appendChild(el);
    });
  });

//update active bets cards on change to children of active bets in database
activeBetsRef.on('value', function(snapshot) {
  let container = document.getElementById("card-container");
  container.innerHTML = "";
  snapshot.forEach(function(childSnapshot) {
    
    var bet = childSnapshot.val();
    let id = childSnapshot.key;
    
    let player1 = bet.player1;
    let player1Name = bet.player1Name;
    let player2 = bet.player2;
    let player2Name = bet.player2Name;
    let time = bet.time;
    let topic = bet.topic;
    let outcome = bet.outcome;
    let wager = bet.wager;

    buildActiveBetCard(id, player1, player1Name, player2, player2Name, time, topic, outcome, wager);
  });
});

//adds a user to the DB
function addUser(username){
  firebase.database().usersRef.push({
    "name": username
  });
}

//Builds an active bet card
//adds onClick listeners to buttons
function buildActiveBetCard(id, player1, player1Name, player2, player2Name, time, topic, outcome, wager){

  let cardContainer = document.getElementById("card-container");

  let card = document.createElement('div');
  card.className = 'card margin10 rounded';
  card.id = id;

  let closeCard = document.createElement('a')
  closeCard.id = id;
  closeCard.className = 'close';
  closeCard.innerHTML = 'x';
  closeCard.style = 'text-align: right; padding-right: 10px'

  closeCard.href = '#';
  closeCard.onclick = function(){
    deleteBet(id);
    document.getElementById(id).remove();
  };

  let cardBody = document.createElement('div');
  cardBody.className = 'card-body marginTop0';

  let title = document.createElement('h3');
  title.innerText = topic;
  title.className = 'card-title';

  let betText = document.createElement('h3');
  betText.innerText = player1Name + " bet " + " " + player2Name;
  betText.className = "card-text";

  let wagerText = document.createElement('h4');
  wagerText.innerText = wager
  wagerText.className = "card-text";

  let outcomeText = document.createElement('h1');
  outcomeText.innerText = outcome;
  outcomeText.className = "card-text";

  let selectWinnerLabel = document.createElement('label');
  selectWinnerLabel.innerText = "Select the winner: ";
  selectWinnerLabel.className = "card-label marginTop10";

  let row = document.createElement('div');
  row.className = "row justify-content-center margin5";

  let col1 = document.createElement('div');
  col1.className = "col-xs-3 margin5";

  let player1Button = document.createElement("button");
  player1Button.className = "btn-lg btn-success";
  player1Button.value = player1;
  player1Button.innerText = player1Name;
  player1Button.onclick = function(){
    closeBet(id, player1);return false;
  };

  let col2 = document.createElement('div');
  col2.className = "col-xs-3 margin5";

  let player2Button = document.createElement("button");
  player2Button.className = "btn-lg btn-success";
  player2Button.value = player2;
  player2Button.innerText = player2Name;
  player2Button.onclick = function(){
    closeBet(id, player2);return false;
  };

  card.appendChild(closeCard);

  cardBody.appendChild(betText);
  cardBody.appendChild(wagerText);
  cardBody.appendChild(outcomeText);
  cardBody.appendChild(selectWinnerLabel);

  col1.appendChild(player1Button);
  col2.appendChild(player2Button);
  row.appendChild(col1);
  row.appendChild(col2);

  cardBody.appendChild(row);
  card.appendChild(cardBody);
  cardContainer.appendChild(card);
}

//Close out bet and update database with new info on who owes who
function closeBet(id, winner){
  firebase.database().ref('active-bets/' + id).once('value').then(function(snapshot) {
    var bet = snapshot.val();

    var loser = null;
    var loserName = null;
    var winnerName = null;

    if(winner == bet.player1){
      loser = bet.player2;
      loserName = bet.player2Name;
      winnerName = bet.player1Name;
    }
    else{
      loser = bet.player1;
      loserName = bet.player1Name;
      winnerName = bet.player2Name;
    }

    firebase.database().ref('users/' + loser +'/owes/').push({
      "bro": winnerName,
      "item": snapshot.val().wager
    });
  });

  deleteBet(id);
  payUpOnChange();
}

//delete a bet. Does not do business logic like in closeBet().
function deleteBet(id){
  firebase.database().ref('active-bets/' + id).remove();
  document.getElementById(id).remove();
}

//delete a debt (row in Pay Up). Used when a user plays a debt in real life.
function deleteDebt(userID,debtID){
  firebase.database().ref('users/' + userID + '/owes/' + debtID).remove();
}

//Updates debts table. Called when there is a change in debts. 
function payUpOnChange(){
  let thead = document.getElementById("thead");

  thead.innerHTML='';
  let row = thead.insertRow();

  let cell1 = row.insertCell();
  cell1.style = 'text-align: center';
  let cell2 = row.insertCell();
  cell2.style = 'text-align: center';

  let text1 = document.createTextNode("Who you owe");
  let text2 = document.createTextNode("What you owe");

  cell1.appendChild(text1);
  cell2.appendChild(text2);

  console.log(document.getElementById("selectPlayerPayUp").value);
  firebase.database().ref("users/" + document.getElementById("selectPlayerPayUp").value + "/owes/").once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {

      let row = thead.insertRow();

      let cell1 = row.insertCell();
      cell1.style = 'text-align: center';
      let cell2 = row.insertCell();
      cell2.style = 'text-align: center';
      let cell3 = row.insertCell();

      let text1 = document.createTextNode(childSnapshot.child("bro").val());
      let text2 = document.createTextNode(childSnapshot.child("item").val());

      let closeRow = document.createElement('a')
      closeRow.className = 'close';
      closeRow.innerHTML = 'x';
      closeRow.style = 'text-align: right; padding-right: 10px'

      closeRow.href = '#';
      closeRow.onclick = function(){
        deleteDebt(document.getElementById("selectPlayerPayUp").value,childSnapshot.key);
        row.remove();
        return false;
      };
      
      cell1.appendChild(text1);
      cell2.appendChild(text2);
      cell3.appendChild(closeRow);
    });
  });
}
//jquery

// Listen to the form submit event to create a new bet.
$('#placeBet').submit(function(evt) {

  
  var dt = new Date();

  usersRef = firebase.database().ref("users/");

  //dt.toLocaleString();
  // Target the form elements by their ids
  // And build the form object like this using jQuery: 
  var formData = {
    "time": firebase.firestore.Timestamp.fromDate(new Date()),
    "topic": $('#topic').val(),
    "outcome": $('#outcome').val(),
    "player1": $('#selectHost option:selected').val(),
    "player1Name": $('#selectHost option:selected').text(),
    "player2": $('#selectOpponent option:selected').val(),
    "player2Name": $('#selectOpponent option:selected').text(),
    "wager": $('#wager').val(),
    
  }

  evt.preventDefault(); //Prevent the default form submit action
  
  // You have formData here and can do this:
  if (!firebase.apps.length) {
    firebase.initializeApp({});
 }
  firebase.database().ref('active-bets/').push( formData ); // Adds the new form data to the list under formDataTree node

  document.forms['placeBet'].reset()
})

function openHamburger() {
  var x = document.getElementById("myLinks");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

//used for 'x' icon to delete its parent when clicked
$('remove').click(function(){ 
	$(this).parent().remove() 
}); 
var node;
var shown_cards = [];
var asked_questions = [];
var submitted_statements = [];
var scored_cards = [];
var space_pressed = 0;
var last_space_pressed = 0;
var last_successful_request = 0;
var latest_latitude = null;
var latest_longitude = null;
var latest_card = null;

var logging_configs = [
  {url: 'http://logger.cenode.io/cards/sherlockSam', logged_cards: []},
  {url: 'http://logger2.cenode.io/cards/sherlockSam', logged_cards: []},
  {url: 'http://localhost:8080/cards/sherlockSam', logged_cards: []}
];

var SHERLOCK_CORE = [
  "conceptualise a ~ sherlock thing ~ S that is an entity and is an imageable thing",
  "conceptualise an ~ organisation ~ O that is a sherlock thing",
  "conceptualise a ~ fruit ~ F that is a sherlock thing and is a locatable thing",
  "conceptualise a ~ room ~ R that is a location and is a sherlock thing",
  "conceptualise a ~ hat colour ~ C",
  "conceptualise a ~ sport ~ S",
  "conceptualise a ~ character ~ C that is a sherlock thing and is a locatable thing and has the hat colour C as ~ hat colour ~",
  "conceptualise the character C ~ works for ~ the organisation O and ~ eats ~ the fruit F and ~ plays ~ the sport S",
  "conceptualise the hat colour C ~ is worn by ~ the character C",
  "conceptualise an ~ object ~ O that is an entity",
  "conceptualise the object O ~ resides in ~ the room R",
  "conceptualise the room R ~ contains ~ the fruit F and has the character C as ~ contents ~ and has the object O as ~ additional contents ~",
  "conceptualise the fruit F ~ is eaten by ~ the character C",
  "conceptualise the sport S ~ is played by ~ the character C and ~ is in ~ the room R",
  "conceptualise a ~ question ~ Q that has the value V as ~ text ~ and has the value W as ~ value ~ and has the value X as ~ relationship ~",
  "conceptualise the question Q ~ concerns ~ the sherlock thing C",

  "there is a rule named r1 that has 'if the character C ~ eats ~ the fruit F then the fruit F ~ is eaten by ~ the character C' as instruction",
  "there is a rule named r2 that has 'if the character C ~ plays ~ the sport S then the sport S ~ is played by ~ the character C' as instruction",
  "there is a rule named r3 that has 'if the character C has the hat colour S as ~ hat colour ~ then the hat colour S ~ is worn by ~ the character C' as instruction",
  "there is a rule named r4 that has 'if the character C ~ is in ~ the room R then the room R has the character C as ~ contents ~' as instruction",
  "there is a rule named r5 that has 'if the fruit F ~ is in ~ the room R then the room R ~ contains ~ the fruit F' as instruction",

  // Inverse rules:
  "there is a rule named r6 that has 'if the fruit F ~ is eaten by ~ the character C then the character C ~ eats ~ the fruit F' as instruction",
  "there is a rule named r7 that has 'if the sport S ~ is played by ~ the character C then the character C ~ plays ~ the sport S' as instruction",
  "there is a rule named r8 that has 'if the hat colour S ~ is worn by ~ the character C then the character C has the hat colour S as ~ hat colour ~' as instruction",
  "there is a rule named r9 that has 'if the room R has the character C as ~ contents ~ then the character C ~ is in ~ the room R' as instruction",
  "there is a rule named r10 that has 'if the room R ~ contains ~ the fruit F then the fruit F ~ is in ~ the room R' as instruction",

  "there is an organisation named 'police'",
  "there is a character named 'Prof Crane' that has 'http://sherlock.cenode.io/media/crane.png' as image",
  "there is a character named 'Dr Finch' that has 'http://sherlock.cenode.io/media/finch.png' as image",
  "there is a character named 'Col Robin' that has 'http://sherlock.cenode.io/media/robin.png' as image",
  "there is a character named 'Sgt Stork' that has 'http://sherlock.cenode.io/media/stork.png' as image",
  "there is a character named 'Rev Hawk' that has 'http://sherlock.cenode.io/media/hawk.png' as image",
  "there is a character named 'Capt Falcon' that has 'http://sherlock.cenode.io/media/falcon.png' as image",
  "there is a character named 'Elephant' that has 'http://sherlock.cenode.io/media/Elephant.png' as image",
  "there is a character named 'Giraffe' that has 'http://sherlock.cenode.io/media/Giraffe.png' as image",
  "there is a character named 'Hippopotamus' that has 'http://sherlock.cenode.io/media/Hippopotamus.png' as image",
  "there is a character named 'Leopard' that has 'http://sherlock.cenode.io/media/Leopard.png' as image",
  "there is a character named 'Lion' that has 'http://sherlock.cenode.io/media/Lion.png' as image",
  "there is a character named 'Zebra' that has 'http://sherlock.cenode.io/media/Zebra.png' as image",
  "there is a room named 'Ruby Room'",
  "there is a room named 'Sapphire Room'",
  "there is a room named 'Gold Room'",
  "there is a room named 'Amber Room'",
  "there is a room named 'Emerald Room'",
  "there is a room named 'Silver Room'",
  "there is a fruit named 'pineapple'",
  "there is a fruit named 'apple'",
  "there is a fruit named 'banana'",
  "there is a fruit named 'orange'",
  "there is a fruit named 'lemon'",
  "there is a fruit named 'pear'",
  "there is a fruit named 'grape'",
  "there is a fruit named 'kiwi'",
  "there is a fruit named 'tomato'",
  "there is a hat colour named 'green'",
  "there is a hat colour named 'red'",
  "there is a hat colour named 'yellow'",
  "there is a hat colour named 'black'",
  "there is a hat colour named 'white'",
  "there is a hat colour named 'purple'",
  "there is a hat colour named 'pink'",
  "there is a hat colour named 'blue'",
  "there is a hat colour named 'brown'",
  "there is a hat colour named 'grey'",
  "there is a sport named 'tennis'",
  "there is a sport named 'badminton'",
  "there is a sport named 'rugby'",
  "there is a sport named 'football'",
  "there is a sport named 'soccer'",
  "there is a sport named 'running'",
  "there is a sport named 'swimming'",
  "there is a sport named 'athletic'",
  "there is a sport named 'baseball'",
  "there is a sport named 'rounders'",
  "there is a sport named 'softball'",
  "there is a sport named 'cricket'",
  "there is a sport named 'golf'",
  "there is a sport named 'basketball'",

  "there is a rule named objectrule1 that has 'if the object O ~ resides in ~ the room R then the room R has the object O as ~ additional contents ~' as instruction",
  "there is an object named 'gorilla'",
  "there is an object named 'dinosaur'",
  "there is an object named 'robot'",
  "there is an object named 'ghost'",
  "there is an object named 'balloon'",

  "there is a question named 'q1' that has 'What character eats pineapples?' as text and has 'is eaten by' as relationship and concerns the sherlock thing 'pineapple'",
  "there is a question named 'q2' that has 'What sport does Zebra play?' as text and has 'plays' as relationship and concerns the sherlock thing 'Zebra'",
  "there is a question named 'q3' that has 'What character eats apples?' as text and has 'is eaten by' as relationship and concerns the sherlock thing 'apple'",
  "there is a question named 'q4' that has 'What colour hat is Elephant wearing?' as text and has 'hat colour' as value and concerns the sherlock thing 'Elephant'",
  "there is a question named 'q6' that has 'Where is Giraffe?' as text and has 'is in' as relationship and concerns the sherlock thing 'Giraffe'",
  "there is a question named 'q7' that has 'What colour hat is Lion wearing?' as text and has 'hat colour' as value and concerns the sherlock thing 'Lion'",
  "there is a question named 'q8' that has 'Where is Lion?' as text and has 'is in' as relationship and concerns the sherlock thing 'Lion'",
  "there is a question named 'q9' that has 'Which character is in the emerald room?' as text and has 'contents' as value and concerns the sherlock thing 'Emerald Room'",
  "there is a question named 'q12' that has 'What character eats bananas?' as text and has 'is eaten by' as relationship and concerns the sherlock thing 'banana'",
  "there is a question named 'q13' that has 'What character is in the sapphire room?' as text and has 'contents' as value and concerns the sherlock thing 'Sapphire Room'",
  "there is a question named 'q17' that has 'What sport does Elephant play?' as text and has 'plays' as relationship and concerns the sherlock thing 'Elephant'",
  "there is a question named 'q18' that has 'What character is wearing a red hat?' as text and has 'is worn by' as relationship and concerns the sherlock thing 'red'",
  "there is a question named 'q19' that has 'What character plays rugby?' as text and has 'is played by' as relationship and concerns the sherlock thing 'rugby'",
  "there is a question named 'q20' that has 'What fruit does Leopard eat?' as text and has 'eats' as relationship and concerns the sherlock thing 'Leopard'",
  "there is a question named 'q23' that has 'What fruit does Giraffe eat?' as text and has 'eats' as relationship and concerns the sherlock thing 'Giraffe'",
  "there is a question named 'q24' that has 'What colour hat is Zebra wearing?' as text and has 'hat colour' as value and concerns the sherlock thing 'Zebra'",
  "there is a question named 'q25' that has 'Where is the apple?' as text and has 'is in' as relationship and concerns the sherlock thing 'apple'",
  "there is a question named 'q26' that has 'What character is wearing a yellow hat?' as text and has 'is worn by' as relationship and concerns the sherlock thing 'yellow'",
  "there is a question named 'q28' that has 'What fruit is in the silver room?' as text and has 'contains' as relationship and concerns the sherlock thing 'Silver Room'",
  "there is a question named 'q30' that has 'What character is wearing a blue hat?' as text and has 'is worn by' as relationship and concerns the sherlock thing 'blue'",
  "there is a question named 'q31' that has 'What character eats lemons?' as text and has 'is eaten by' as relationship and concerns the sherlock thing 'lemon'",
  "there is a question named 'q33' that has 'What fruit does Elephant eat?' as text and has 'eats' as relationship and concerns the sherlock thing 'Elephant'",
  "there is a question named 'q34' that has 'What character plays basketball?' as text and has 'is played by' as relationship and concerns the sherlock thing 'basketball'",
  "there is a question named 'q35' that has 'What character plays soccer?' as text and has 'is played by' as relationship and concerns the sherlock thing 'soccer'",
  "there is a question named 'q36' that has 'What sport does Lion play?' as text and has 'plays' as relationship and concerns the sherlock thing 'Lion'",
  "there is a question named 'q37' that has 'What character is in the ruby room?' as text and has 'contents' as value and concerns the sherlock thing 'Ruby Room'",
  "there is a question named 'q39' that has 'What character plays golf?' as text and has 'is played by' as relationship and concerns the sherlock thing 'golf'",
  "there is a question named 'q40' that has 'What character eats oranges?' as text and has 'is eaten by' as relationship and concerns the sherlock thing 'orange'",
  "there is a question named 'q41' that has 'What colour hat is Hippopotamus wearing?' as text and has 'hat colour' as value and concerns the sherlock thing 'Hippopotamus'",
  "there is a question named 'q45' that has 'What character is in the amber room?' as text and has 'contents' as value and concerns the sherlock thing 'Amber Room'",
  "there is a question named 'q47' that has 'Where is Elephant?' as text and has 'is in' as relationship and concerns the sherlock thing 'Elephant'",
  "there is a question named 'q48' that has 'Where is the pear?' as text and has 'is in' as relationship and concerns the sherlock thing 'pear'",
  "there is a question named 'q50' that has 'What fruit does Lion eat?' as text and has 'eats' as relationship and concerns the sherlock thing 'Lion'",
  "there is a question named 'q52' that has 'What sport does Giraffe play?' as text and has 'plays' as relationship and concerns the sherlock thing 'Giraffe'",
  "there is a question named 'q53' that has 'Where is Hippopotamus?' as text and has 'is in' as relationship and concerns the sherlock thing 'Hippopotamus'",
  "there is a question named 'q54' that has 'What sport does Hippopotamus play?' as text and has 'plays' as relationship and concerns the sherlock thing 'Hippopotamus'"
];

var settings = {
  logged_in : false,
};

var user = {
  id : null,
  cards : [],
  questions : [],
  answers : [],
  inputs: [],
  input_counter : 0,
  score : 0,
  current_screen : "login"
};

var log = {
  recording_presses : false,
  keypresses : 0,
  start_time : 0,
  end_time : 0
};

var ui = {
  buttons : {
    login : null,
    logout : null,
  },
  inputs : {
    login_user_id : null,
    main_user_id : null,
    text : null,
    guess : null,
    autofill : null
  },
  overlays : {
    login : null,
    moira : null,
    dashboard: null
  },
  view_changers : [],
  info : {
    cards : null,
    questions : null,
    login_error : null,
    score : null,
    online_status : null
  }
};

function initialize_ui(){
  ui.buttons.login = document.getElementById("login");
  ui.inputs.login_user_id = document.getElementById("login_username");
  ui.inputs.main_user_id = document.getElementById("username");
  ui.inputs.text = document.getElementById("text");
  ui.inputs.guess = document.getElementById("guess");
  ui.inputs.autofill = document.getElementById("autofill");
  ui.overlays.login = document.getElementById("login_overlay");
  ui.overlays.moira = document.getElementById("moira_overlay");
  ui.info.cards = document.getElementById("cards");
  ui.info.login_error = document.getElementById("login_error");
  ui.info.online_status = document.getElementById("online_status");
  ui.view_changers = document.getElementsByClassName("change_view");
}

function bind_listeners(){
  ui.buttons.login.onclick = login;
  ui.inputs.login_user_id.onkeyup = login;
  ui.inputs.text.onkeyup = key_up;
  ui.inputs.text.onkeydown = key_down;
  for(var i = 0; i < ui.view_changers.length; i++){
    ui.view_changers[i].onclick = function(e){change_view(e.target.getAttribute("data-view"));};
  }
}

function change_view(view){
  user.selected_screen = view;
  update_ui();
}

function login(e){
  if(e && e.keyCode){
    if(e.keyCode !== 13){
      return;
    }
  }
  user.id = ui.inputs.login_user_id.value.charAt(0).toUpperCase() + ui.inputs.login_user_id.value.slice(1);
  user.id = user.id.trim();
  if(user.id == null || user.id == ""){
    ui.info.login_error.style.display = "block";
    return;
  }

  node = new CENode(MODELS.CORE, SHERLOCK_CORE);
  ui.info.online_status.style.display = "none";

  node.agent.set_name(user.id+" agent");
  window.setTimeout(function(){
    node.add_sentence("there is a tell card named 'msg_{uid}' that is from the agent '"+node.agent.get_name().replace(/'/g, "\\'")+"' and is to the agent '"+node.agent.get_name().replace(/'/g, "\\'")+"' and has the timestamp '{now}' as timestamp and has 'there is an agent named \\'"+node.agent.get_name().replace(/'/g, "\\\'")+"\\'' as content");
    node.add_sentence("there is a feedback policy named 'p3' that has the individual '"+user.id+"' as target and has 'true' as enabled and has 'full' as acknowledgement");
  }, 100);

  settings.logged_in = true;
  user.selected_screen = "moira";
  user.cards = [];
  ui.info.login_error.style.display = "none";

  update_ui();
  load_questions();//fetch_questions();
  poll_for_instances();
  for(var i = 0; i < logging_configs.length; i++){
    log_cards(logging_configs[i]);
  }
}


function add_sentence(t){
  node.add_sentence(t);
}

function key_down(e){
  if(e.keyCode == 9){
    e.preventDefault();
    return false;
  }
  if(e.keyCode == 32){
    space_pressed = new Date().getTime();
    if((space_pressed - last_space_pressed) < 400 && ui.inputs.text.value.slice(-1) == ' '){
      if(ui.inputs.text.value.length < ui.inputs.guess.value.length && ui.inputs.autofill.checked == true){
          e.preventDefault();
          ui.inputs.text.value = node.guess_next(ui.inputs.text.value.substring(0, ui.inputs.text.value.length-1)) + " ";
          return false;
      }
    }
    last_space_pressed = new Date().getTime();
  }
}

function key_up(e){
  if(e.keyCode == 13){
    log.recording_presses = false;
    log.end_time = parseInt(new Date().getTime());
    send();
  }
  else if(e.keyCode == 38){
    if(user.input_counter > 0){
      user.input_counter--;
      ui.inputs.text.value = user.inputs[user.input_counter];
    }
    e.preventDefault();
  }
  else if(e.keyCode == 40){
    if(user.input_counter < user.inputs.length-1){
      user.input_counter++;
      ui.inputs.text.value = user.inputs[user.input_counter];
    }
    else{
      ui.inputs.text.value = "";
    }
  }
  else if(e.keyCode == 9){
    ui.inputs.text.value = node.guess_next(ui.inputs.text.value);
    e.preventDefault();
    return false;
  }
  else{
    if(log.recording_presses == false){
      log.recording_presses = true;
      log.start_time = parseInt(new Date().getTime());
      log.keypresses = 0;
    }
    log.keypresses++;
  }

  if(ui.inputs.autofill.checked == true){
    ui.inputs.guess.value = node.guess_next(ui.inputs.text.value);
  }
  else{
    ui.inputs.guess.value = "";
  }
}

function send(){
  var input = ui.inputs.text.value.trim().replace(/(\r\n|\n|\r)/gm,"");

  ui.inputs.text.value = "";
  user.inputs.push(input);
  user.input_counter = user.inputs.length;

  var sentence = input.replace(/'/g, "\\'");
  var card;
  if(latest_card && sentence.toLowerCase().trim() == 'y' || sentence.toLowerCase().trim() == 'yes'){
    confirm_card(latest_card.name, latest_card.content);
  }
  else if(latest_card && sentence.toLowerCase().trim() == 'n' || sentence.toLowerCase().trim() == 'no'){
    unconfirm_card(latest_card.name);
  }
  else if(sentence.toLowerCase().trim() == 'show anomalies'){
    add_card_simple(sentence, 'user');
    var objects = node.concepts.object.instances;
    for(var i = 0; i < objects.length; i++){
      add_card_simple(objects[i].gist, 'friend');
    }
    return;
  }
  else if(sentence.toLowerCase().indexOf("who ") == 0 || sentence.toLowerCase().indexOf("what ") == 0 || sentence.toLowerCase().indexOf("where ") == 0 || sentence.toLowerCase().indexOf("list ") == 0){
    card = "there is an ask card named 'msg_{uid}' that has '"+sentence+"' as content and is to the agent '"+node.agent.get_name().replace(/'/g, "\\'")+"' and is from the individual '"+user.id+"' and has the timestamp '{now}' as timestamp";
    add_card_simple(input, 'user');
  }
  else{
    submitted_statements.push(input.toLowerCase());

    card = "there is an nl card named 'msg_{uid}' that has '"+sentence+"' as content and is to the agent '"+node.agent.get_name().replace(/'/g, "\\'")+"' and is from the individual '"+user.id+"' and has the timestamp '{now}' as timestamp";
    add_card_simple(input, 'user');
  }
  node.add_sentence(card);
}

function confirm_card(id, content){
  try{
    document.getElementById("confirm_"+id).style.display = "none";
    document.getElementById("unconfirm_"+id).style.display = "none";
  }
  catch(err){
    console.log(err);
  }

  submitted_statements.push(content.toLowerCase());

  add_card_simple("Yes.", 'user');
  var card = "there is a tell card named 'msg_{uid}' that has '"+content.replace(/'/g, "\\'")+"' as content and is to the agent '"+node.agent.get_name().replace(/'/g, "\\'")+"' and is from the individual '"+user.id+"' and has the timestamp '{now}' as timestamp and is in reply to the card '"+id+"'";
  card+=" and has '"+log.keypresses+"' as number of keystrokes";
  card+=" and has '"+log.end_time+"' as submit time";
  card+=" and has '"+log.start_time+"' as start time";
  if(latest_latitude && latest_longitude){
    card+=" and has '"+latest_latitude+"' as latitude";
    card+=" and has '"+latest_longitude+"' as longitude";
  }
  node.add_sentence(card);
  ui.inputs.text.focus();
}

function unconfirm_card(id){
  document.getElementById("confirm_"+id).style.display = "none";
  document.getElementById("unconfirm_"+id).style.display = "none";
  add_card_simple("No.", 'user');
  add_card_simple("OK.", 'friend');
  ui.inputs.text.focus();
}

function update_ui(){
  if(settings.logged_in == true){
    ui.overlays.login.style.display = "none";
    if(user.selected_screen == "moira"){
      ui.overlays.moira.style.display = "block";
    }
    else if(user.selected_screen == "dashboard"){
      ui.overlays.moira.style.display = "none";
    }
  }
  else{
    ui.overlays.login.style.display = "block";
    ui.overlays.moira.style.display = "none";
    ui.inputs.login_user_id.value = "";
    ui.info.cards.innerHTML = "";
  }
}

function add_card_simple(text, user){
  ui.info.cards.innerHTML += '<li class="card '+user+'"><p>'+text+'</p></li>';
  ui.info.cards.scrollTop = ui.info.cards.scrollHeight;
}

function add_card(card){
  latest_card = card;
  var content = card.content;
  var id = card.name;
  var tos = card.is_tos.map(function(to){
    return to.name.toLowerCase();
  });
  var from = card.is_from.name;
  var card_type = card.type;
  var linked_content = card.linked_content;

  if(!content){return;}
  if(id == null || (id != null && shown_cards.indexOf(id) == -1)){
    shown_cards.push(id);
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    var c = '<li class="card';
    if(tos && tos.indexOf(user.id) > -1){c+=' user';}
    else{
      c+=' friend';
      if(navigator.vibrate){
        navigator.vibrate([70,40,200]);
      }
    }
    c+='">';
    c+='<p>';
    if(card_type != null && card_type.name == "confirm card"){
      c+='OK. Is this what you meant?<br /><br />';
    }
    c+=content.replace(/(?:\r\n|\r|\n)/g, ' <br /> ').replace(/  /g, '&nbsp;&nbsp;')+'</p>';
    if(card_type != null && card_type.name == "confirm card"){
      c+='<button id="confirm_'+id+'" class="confirm" onclick="confirm_card(\''+id+'\', \''+content.replace(/'/g, "\\'")+'\')">Yes</button>';
      c+='<button id="unconfirm_'+id+'" class="unconfirm" onclick="unconfirm_card(\''+id+'\')">No</button>';
    }
    if(linked_content != null){
      c+='<img src="'+linked_content+'" alt="Attachment" />';
    }
    c+='</li>';
    ui.info.cards.innerHTML+=c;
    ui.info.cards.scrollTop = ui.info.cards.scrollHeight;
  }
}

function get_question_state(q){
  if(q.responses.length == 0){return "unanswered";}
  else if(q.responses.length < 3){return "unconfident";}
  else{
    var responses = {};
    var response_vols = [];
    for(var j = 0; j < q.responses.length; j++){
      if(!(q.responses[j] in responses)){responses[q.responses[j]] = 0;}
      responses[q.responses[j]]++;
    }
    for(key in responses){response_vols.push(responses[key]);}
    response_vols.sort().reverse();
    if(response_vols.length == 1){return "answered";}
    else if(response_vols.length > 1 && (response_vols[0]-response_vols[1]) >= 3){return "answered";}
    else{return "contested";}
  }
}

function load_questions(){
  var qs = node.get_instances("question");
  for(var i = 0; i < qs.length; i++){
    var q = {};
    q.responses = [];
    for(var j = 0; j < qs[i].values.length; j++){
      var ins_name = typeof qs[i].values[j].instance == 'string' ? qs[i].values[j].instance : qs[i].values[j].instance.name;
      q[qs[i].values[j].label] = ins_name;
    }
    for(var j = 0; j < qs[i].relationships.length; j++){
      q[qs[i].relationships[j].label] = qs[i].relationships[j].instance.name;
    }
    user.questions.push(q);
  }
}

function poll_for_instances(){
  if(node == null){
    return;
  }
  setTimeout(function(){
    var ins = node.get_instances();
    for(var i = 0; i < user.questions.length; i++){user.questions[i].responses = [];}
    for(var i = 0; i < ins.length; i++){
      // Detect if type of card. If so, filter and add to UI if necessary
      if(ins[i].type.name.indexOf("card") > -1){
        var tos = ins[i].is_tos;
        if(tos){for(var j = 0; j < tos.length; j++){
          if(tos[j].name.toLowerCase() == user.id.toLowerCase()){
            add_card(ins[i]);
          }
        }}
      }
      else{
        for(var j = 0; j < user.questions.length; j++){
          var instance = ins[i];
          var question = user.questions[j];
          if(question.concerns.toLowerCase() == instance.name.toLowerCase()){
            if(question.value != null){
              for(var k = 0; k < instance.values.length; k++){
                if(instance.values[k].label == question.value){
                  if(typeof instance.values[k].instance == "string"){
                    question.responses.push(instance.values[k].instance.toLowerCase());
                  }
                  else{
                    question.responses.push(instance.values[k].instance.name.toLowerCase());
                  }
                }
              }
            }
            if(question.relationship != null){
              for(var k = 0; k < instance.relationships.length; k++){
                if(instance.relationships[k].label == question.relationship){
                  question.responses.push(instance.relationships[k].instance.name.toLowerCase());
                }
              }
            }
          }
        }
      }
    }
    // ui.info.questions.innerHTML = "";
    user.score = 0;
    var ratios = {};
    for(var i = 0; i < user.questions.length ; i++){
      var state = get_question_state(user.questions[i]);
      // ui.info.questions.innerHTML += '<li onclick="alert(\''+user.questions[i].text+'\');" class="response question '+state+'">'+(i+1)+'</li>';
      if(state == 'answered'){
        user.score++;
      }
      if(!(state in ratios)){
        ratios[state] = 0;
      }
      ratios[state]++;
    }
    // var bars = document.getElementById('dashboard_indicator').getElementsByTagName('div');
    // for(var i = 0; i < bars.length; i++){
    //   bars[i].style.width = "0%";
    // }
    for(var type in ratios){
      var typeElem = document.getElementById(type);
      if (typeElem) {
        typeElem.style.width = Math.floor(ratios[type] * 100 / parseFloat(user.questions.length))+'%';
      }
    }
    update_ui();
    poll_for_instances();
  },1000);
}

function log_cards(config){
  try{
    var cards = node.get_instances("card", true);
    var properties = ['timestamp', 'content', 'is in reply to', 'is from', 'number of keystrokes', 'submit time', 'start time', 'latitude', 'longitude'];
    var unlogged_cards = [];
    for(var i = 0; i < cards.length; i++){
      if(config.logged_cards.indexOf(cards[i].name) == -1){
        var card_to_log = {};
        card_to_log.name = cards[i].name;
        card_to_log.type = cards[i].type.name;
        for(var j = 0; j < properties.length; j++){
          var prop = properties[j];
          if(cards[i].property(prop)){
            card_to_log[prop] = cards[i].property(prop).name || cards[i].property(prop);
          }
        }
        unlogged_cards.push(card_to_log);
      }
    }
    if(unlogged_cards.length == 0){
      setTimeout(function(){
         log_cards(config);
      }, 3000);
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", config.url);
    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status == 200){
        setTimeout(function(){
          for(var i = 0; i < unlogged_cards.length; i++){
            config.logged_cards.push(unlogged_cards[i].name);
          }
          log_cards(config);
        }, 10000);
      }
      else if(xhr.readyState == 4 && xhr.status != 200){
        setTimeout(function(){
          log_cards(config);
        }, 5000);
      }
    }
    xhr.send(JSON.stringify(unlogged_cards));
  }
  catch(err){
    console.log(err);
    setTimeout(function(){
      log_cards(config);
    }, 5000);
  }
}

function check_online(){
  var now = new Date().getTime();
  var last = node.agent.get_last_successful_request();
  var diff = now - last;
  if(diff < 5000){
    ui.info.online_status.style.backgroundColor = "green";
  }
  else{
    ui.info.online_status.style.backgroundColor = "rgb(200,200,200)";
  }
  setTimeout(function(){
    check_online();
  }, 1000);
}

var record_position = function(position){
  latest_longitude = position.coords.longitude;
  latest_latitude = position.coords.latitude;
}

window.onresize = function(event) {
  ui.info.cards.style.height = (window.innerHeight - 370)+'px';
  ui.info.cards.scrollTop = ui.info.cards.scrollHeight;

  var content = document.getElementById("main-content");
  content.style.height = (window.innerHeight - 50) + "px";
}

window.onbeforeunload = function() {
  return "Quitting Sherlock may mean you can't resume from where you left off.";
};

var loadChat = function() {
  initialize_ui();
  bind_listeners();
  ui.overlays.moira.style.display = "none";
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(record_position);
  }
  ui.inputs.text.focus();
  ui.info.cards.style.height = (window.innerHeight - 370)+'px';

  var content = document.getElementById("main-content");
  if(content){
    content.style.height = (window.innerHeight - 50) + "px";
  }
}

window.onload = function(){
  loadChat();
};

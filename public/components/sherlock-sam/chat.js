function SherlockChat(){
    var shown_cards = [];
    var submitted_statements = [];
    var scored_cards = [];
    var logged_cards = [];
    var space_pressed = 0;
    var last_space_pressed = 0;
    var forbid_input = false;
    var last_successful_request = 0;
    var inputs = [];
    var input_counter = 0;

    var log = {
        recording_presses : false,
        keypresses : 0,
        start_time : 0,
        end_time : 0
    };

    var ui = {
        buttons : {
            send : null,
        },
        inputs : {
            text : null,
            guess : null,
            autofill : null
        },
        info : {
            cards : null,
            score : null
        }
    };

    var initialize_ui = function(){
        ui.buttons.send = document.getElementById("send");
        ui.inputs.text = document.getElementById("text");
        ui.inputs.guess = document.getElementById("guess");
        ui.inputs.autofill = document.getElementById("autofill");
        ui.info.cards = document.getElementById("cards");
        ui.info.score = document.getElementById("score");
    };

    var bind_listeners = function(){
        ui.buttons.send.onclick = send;
        ui.inputs.text.onkeyup = key_up;
        ui.inputs.text.onkeydown = key_down;
    };

    var add_sentence = function(t){
        node.add_sentence(t);
    };

    var key_down = function(e){
        if(forbid_input){
            e.preventDefault();
            return false;
        }
        if(e.keyCode == 9){
            e.preventDefault();
            return false;
        }
        if(e.keyCode == 32){
            space_pressed = new Date().getTime();
            if((space_pressed - last_space_pressed) < 200){
                if(ui.inputs.text.value.length < ui.inputs.guess.value.length && ui.inputs.autofill.checked == true){
                    if(  navigator.userAgent.match(/Android/i)
                      || navigator.userAgent.match(/webOS/i)
                      || navigator.userAgent.match(/iPhone/i)
                      || navigator.userAgent.match(/iPad/i)
                      || navigator.userAgent.match(/iPod/i)
                      || navigator.userAgent.match(/BlackBerry/i)
                      || navigator.userAgent.match(/Windows Phone/i)
                      ){
                        e.preventDefault();
                        ui.inputs.text.value = node.guess_next(ui.inputs.text.value.substring(0, ui.inputs.text.value.length-1));
                        return false;
                    }
                }
            }
            last_space_pressed = new Date().getTime();
        }
    };

    var key_up = function(e){
        if(forbid_input){
            e.preventDefault();
            return false;
        }
        if(e.keyCode == 13){
            log.recording_presses = false;
            log.end_time = parseInt(new Date().getTime()/1000);
            send();
        }
        else if(e.keyCode == 38){
            if(input_counter > 0){
                input_counter--;
                ui.inputs.text.value = inputs[input_counter];
            }
            e.preventDefault();
        }
        else if(e.keyCode == 40){
            if(input_counter < inputs.length-1){
                input_counter++;
                ui.inputs.text.value = inputs[input_counter];
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
                log.start_time = parseInt(new Date().getTime()/1000);
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
    };

    var send = function(){
        var input = ui.inputs.text.value.trim().replace(/(\r\n|\n|\r)/gm,"");
        if(input.match(/\band\b/i)){
            return window.alert("Please only enter single-part sentences.");
        }

        ui.inputs.text.value = "";
        input_counter = inputs.length;

        var sentence = input.replace(/'/g, "\\'");
        var card;
        if(sentence.toLowerCase().indexOf("who ") == 0 || sentence.toLowerCase().indexOf("what ") == 0 || sentence.toLowerCase().indexOf("where ") == 0 || sentence.toLowerCase().indexOf("list ") == 0){
            card = "there is an ask card named 'msg_{uid}' that has '"+sentence+"' as content and is to the agent '"+node.agent.get_name().replace(/'/g, "\\'")+"' and is from the individual '"+user.name+"' and has the timestamp '{now}' as timestamp";
            add_card(input, true, null, user.name);
        }
        else{
            if(submitted_statements.indexOf(input.toLowerCase()) > -1 ){
                add_card("I cannot accept duplicate information from the same user.", false, null, "Sherlock");
                return window.alert("The input is invalid or you've already entered this information!");
            }
            submitted_statements.push(input.toLowerCase());

            card = "there is an nl card named 'msg_{uid}' that has '"+sentence+"' as content and is to the agent '"+node.agent.get_name().replace(/'/g, "\\'")+"' and is from the individual '"+user.name+"' and has the timestamp '{now}' as timestamp";
            add_card(input, true, null, user.name);

        }
        node.add_sentence(card);
    };

    this.confirm_card = function(id, content){
        document.getElementById("confirm_"+id).style.display = "none";
        document.getElementById("unconfirm_"+id).style.display = "none";
        forbid_input = false;

        if(submitted_statements.indexOf(content.toLowerCase()) > -1){
            add_card("I cannot accept duplicate information from the same user.", false, null, "Sherlock");
            return window.alert("You have already entered or conifirmed this statement.");
        }
        submitted_statements.push(content.toLowerCase());

        add_card("Yes.", true, null, user.name);
        var card = "there is a tell card named 'msg_{uid}' that has '"+content.replace(/'/g, "\\'")+"' as content and is to the agent '"+node.agent.get_name().replace(/'/g, "\\'")+"' and is from the individual '"+user.name+"' and has the timestamp '{now}' as timestamp";
        card+=" and has '"+log.keypresses+"' as number of keystrokes";
        card+=" and has '"+log.end_time+"' as submit time";
        card+=" and has '"+log.start_time+"' as start time";

        node.add_sentence(card);
    };

    this.unconfirm_card = function(id){
        document.getElementById("confirm_"+id).style.display = "none";
        document.getElementById("unconfirm_"+id).style.display = "none";
        add_card("No.", true, null, user.name);
        add_card("OK.", false, null, "Sherlock");
        forbid_input = false;
    };

    var add_card = function(content, local, id, author, linked_content, card_type){
        if(id == null || (id != null && shown_cards.indexOf(id) == -1)){
            if(author == user.name+" agent"){
                author = "Sherlock";
            }
            shown_cards.push(id);
            navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
            var c = '<div class="card';
            if(local){c+=' user';}
            else{
                c+=' friend';
                if(navigator.vibrate){
                    navigator.vibrate([70,40,200]);
                }
            }
            c+='">';
            if(author != null){
                c+= '<p class="author">'+author+'</p>';
            }
            c+='<p>';
            if(card_type != null && card_type == "confirm card"){
                c+='OK. Is this what you meant?<br /><br />';
            }
            c+=content.replace(/(?:\r\n|\r|\n)/g, ' <br /> ').replace(/  /g, '&nbsp;&nbsp;')+'</p>';
            if(linked_content != null){
                c+='<img src="'+linked_content+'" alt="Attachment" />';
            }
            if(card_type != null && card_type == "confirm card"){
                c+='<button id="confirm_'+id+'" class="confirm" onclick="chat.confirm_card(\''+id+'\', \''+content.replace(/'/g, "\\'")+'\')">Yes</button>';
                c+='<button id="unconfirm_'+id+'" class="unconfirm" onclick="chat.unconfirm_card(\''+id+'\')">No</button>';
                forbid_input = true;
            }
            c+='</div>';
            ui.info.cards.innerHTML+=c;
            ui.info.cards.scrollTop = ui.info.cards.scrollHeight;
        }
    };

    var check_cards = function(ins){
        for(var i = 0; i < ins.length; i++){
            try{
                var tos = ins[i].is_tos;
                for(var j = 0; j < tos.length; j++){
                    if(tos[j].name.toLowerCase() == user.name.toLowerCase()){
                        add_card(ins[i].content, false, ins[i].name, ins[i].is_from.name, ins[i].linked_content, ins[i].type.name);
                    }
                }
                var from = ins[i].is_froms;
                if(from.name.toLowerCase() == user.name.toLowerCase() && ins[i].type.name == "tell card"){
                    if(scored_cards.indexOf(ins[i].name) == -1){
                        user.score++;
                        scored_cards.push(ins[i].name);
                    }
                }
            }
            catch(err){}
        }
    };

    var poll_for_instances = function(){
        if(node == null){
            return;
        }
        setTimeout(function(){
            if(node != null){
                check_cards(node.get_instances("card", true));
                poll_for_instances();
            }
        },1000);
    };

    var check_online = function(){
        var now = new Date().getTime();
        var last = node.agent.get_last_successful_request();
        var diff = now - last;
        if(diff < 5000){
            ui.info.online_status.style.backgroundColor = "green";
        }
        else{
            ui.info.online_status.style.backgroundColor = "gray";
        }
        setTimeout(function(){
            check_online();
        }, 1000);
    };

    function log_cards(){
        try{
            var cards = node.get_instances("card", true);
            var unlogged_cards = [];
            for(var i = 0; i < cards.length; i++){
                if(logged_cards.indexOf(cards[i].name) == -1){
                    unlogged_cards.push(cards[i]);
                }
            }
            if(unlogged_cards.length == 0){
                setTimeout(function(){
                    log_cards();
                }, 3000);
                return;
            }

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "http://logger.cenode.io/cards/sherlocksam");
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4 && xhr.status == 200){
                  setTimeout(function(){
                    for(var i = 0; i < unlogged_cards.length; i++){
                      logged_cards.push(unlogged_cards[i].name);
                    }
                    log_cards();
                  }, 8000);
                }
                else if(xhr.readyState == 4 && xhr.status != 200){
                  setTimeout(function(){
                    log_cards();
                  }, 3000);
                }
            }
            xhr.send(JSON.stringify(unlogged_cards));
        }
        catch(err){
            console.log(err);
            setTimeout(function(){
                log_cards();
            }, 3000);
        }
    }

    this.init = function(){
        initialize_ui();
        bind_listeners();
        poll_for_instances();
        log_cards();
    };
    this.init();
}

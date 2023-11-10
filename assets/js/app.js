var UI = {
    'addChatMessage' : function(messageText, timeStamp, fromUser) {
		
        if (!messageText) return; // someone sent data outside of the UI (using REST for example) so ignore it
        var nPanel = document.createElement("div");
		var ownmasg;
		var avatar;
		if(fromUser == localStorage.getItem("username")){
			ownmasg = " user";
			avatar = "https://suggaro.eadcrm.eu/uploads/client_profile_images/"+localStorage.getItem('contact_id')+"/"+localStorage.getItem("profilepic");
		}
		else{
			ownmasg = "";
			avatar = localStorage.getItem(fromUser + "_pic");
			
		}
        var msg_template = '<div class="message-item' + ownmasg + '">'
								+'<img src="'+avatar+'" alt="avatar" class="avatar">'
								+'<div class="content">'
									+'<div class="title">' + fromUser  + '</div>'
									+'<div class="bubble">' + messageText.replace( /[<>]/ig, '' ) + '</div>'
									+'<div class="footer">' + timeStamp + '</div>'
								+'</div></div>';
        nPanel.innerHTML = msg_template;	
        
		var chatMessageLst = document.querySelector("#message-area");
        //append it to the list
        chatMessageLst.appendChild(nPanel);
		window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });

    },
   'clearBuddyList' : function(event) {
        var userlist = document.querySelector("#buddy-list");
        
        if (userlist.children) {
            for (var x=0; x <= userlist.children.length; ++x) {
                var e = userlist.children[0];
                userlist.removeChild(e);
            }
        }

        UI.updateRoomCount(0);
    },
    'handleLeaveEvent' : function(event) {
        console.log('received a ' + event.action + ' event');        
        var userElement = document.querySelector("#" + event.uuid)

        if (userElement != undefined) {
            console.log('removing uuid: ' + event.uuid);
            userElement.remove();
        }

        UI.updateRoomCount(event.occupancy);
    },
    'handleStateChange': function(uuid, state) {
        try {
            var userlist = document.querySelector("#buddy-list");
            var userElement = document.querySelector("#" + uuid);
            var userDiv = null;
            var li = null;

            if (userElement != null) {
                console.log('found existing element');
                userDiv = userElement.firstChild;
                li = userElement;
            }
            else {
                li = document.createElement('li');
                userDiv = document.createElement("div");
            }

            userDiv.className = 'user-presence-container';
            if (state == undefined) {
                state = {};
                state.username = "anonymous";
            }					
            userDiv.innerHTML = 	'<a href="chat.html" class="item">'
										+ '<div class="imageWrapper">'
											+ '<img src="assets/img/users/samples/15.jpg" alt="image" class="imaged w64">'
											+ '<div class="chat_picons">'
												+ '<img src="assets/img/flags/1x1/dk.svg" alt="country">'
												+ '<i class="chat-icon">'
													+ '<ion-icon name="play-outline"></ion-icon>'
												+ '</i>'
											+ '</div>'
										+ '</div>'
										+ '<div class="in">'
											+ '<div>'
												+ '<span class="badge badge-success badge-status"></span>'
												+ state.username
												+'<div class="text-muted">54 min ago</div>'
												+ '<div class="text-msg">'
													+ state.location
												+ '</div>'
											+ '</div>'
											+ '<span class="chat_status">UNREAD</span>'
										+ '</div>'
									+ '</a>';

            if (userElement === null) {
                li.appendChild(userDiv);
                li.setAttribute("class","list-group-item online");
                // li.setAttribute("data-uuid", uuid);
                li.setAttribute("id", uuid);
                userlist.appendChild(li);
            }
        } // try
        catch (err) {
            // couldn't find element with id
            // do nothing
        }
    },

    'updateRoomCount' : function(occupancy) {
        // var presence = document.querySelector("#presence");
        // presence.innerHTML = '<span class="badge">Total Participants: ' + occupancy + '</span>';
    },
    'formatTimeToken': function(timeToken) {
        var date = new Date(timeToken/10000);
        var month = date.getMonth()+1;
        var day = date.getDate();
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        
        var formattedTime = 
            year + '-' + month + '-' + day + " " + 
            hours + ':' + 
            minutes.substr(minutes.length-2) + ':' + 

            seconds.substr(seconds.length-2);
        return formattedTime;                        
    }
}

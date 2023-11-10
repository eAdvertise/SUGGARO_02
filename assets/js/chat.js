var surl="https://suggaro.eadcloud.eu/API/";
$(document).ready(function() {	
	if ((localStorage.getItem('contact_id') === null) || (localStorage.getItem('contact_id') === "undefined") || localStorage.getItem('contact_id') === " ") {
		window.location = "./login.html";
	}
	/**Clear old Localstorages **/
	var active_chat_username;
	var gender;
	var role;
	var country;
	var user_location;
	var birthday;
	var age;
	var daysonsuggaro;
	
	localStorage.removeItem("active_channel");
	localStorage.removeItem("active_channel_id");
	localStorage.removeItem("active_chat_userid");
	localStorage.removeItem("active_chat_username");
	localStorage.removeItem("pn-subscriptions");
	
	/**Set New Varianles And Localstorages**/
	localStorage.setItem("active_chat_userid",getUrlVarss()["contact"]);
	var user = getUrlVarss()["user"];
	var contact = getUrlVarss()["contact"];
	
	var postdata = {
		id: user,
		contactid: contact
	};
	$.ajax({    
		type: "POST",
		url: surl+"get_contact.php",             
		data: postdata,
		dataType: "json",
		encode: true,                  
		success: function(data){
			arr = data['customfields']; 
			if(data['profile_image']!=null){
				$("#user-avatar").attr("src","https://suggaro.eadcrm.eu/uploads/client_profile_images/" + contact + "/thumb_" + data['profile_image']);
				
			}
			$.each(arr, function(key, customefield){
				if(customefield.label === "Username"){
					$("#user-username").html(customefield.value);
					active_chat_username = customefield.value;	
					localStorage.setItem("active_chat_username",customefield.value);
					localStorage.setItem(active_chat_username + "_pic", "https://suggaro.eadcrm.eu/uploads/client_profile_images/" + contact + "/thumb_" + data['profile_image']);						
				}
				if(customefield.label === "Gender"){
					gender = customefield.value;
				}
						
				if(customefield.label === "Country"){
					country = customefield.value;
				}
				if(customefield.label === "Location"){
					user_location = customefield.value;
				}
				if(customefield.label === "Role"){
					role = customefield.value;
				}
					
			});	
				
		}
							
	});
	function getChannel(){
		messageList.empty();
		data = new Object();
		data['user1'] = localStorage.getItem('contact_id');
		data['user2'] = getUrlVarss()["contact"];
		$.ajax({    
			type: "POST",
			url: surl + "CHAT/getChannel.php",             
			data: data,
			dataType: "json",
			encode: true,                  
			success: function(channel){
				console.log(channel);
				
				if(channel > 0){
					localStorage.setItem("active_channel_id", channel);
					localStorage.setItem("active_channel", "SUGGARO_"+channel);
				}
				else{
					registerChannel();					
				}
			}
							
		});
	}
	function registerChannel(){
		messageList.empty();
		data = new Object();
		data['user1'] = localStorage.getItem('contact_id');
		data['user2'] = getUrlVarss()["contact"];
		data['action'] = 'addChannel';
		$.ajax({    
			type: "POST",
			url: surl + "CHAT/functions.php",             
			data: data,
			dataType: "json",
			encode: true,                  
			success: function(channel){
				console.log("Register Channel: "+channel);
				localStorage.setItem("active_channel_id", channel);
				localStorage.setItem("active_channel", "SUGGARO_"+channel);			
			}
							
		});
	}
	function getChatHistory(){
		messageList.empty();
				
		$.getJSON(surl + 'CHAT/getChatHistory.php?channel_id=' + localStorage.getItem("active_channel_id"), function(cData){
			var chatData = cData.items;
			$.each(chatData,function(index,chat_Data){
				var d = new Date(chat_Data.created);
				var Y = d.getFullYear();
				var M = addZero(d.getMonth() + 1);
				var D = addZero(d.getDate());
				var H = addZero(d.getHours());
				var mm = addZero(d.getMinutes());
				var time = D + '/' + M + '/' + Y + ' ' + H + ':' + mm;
				if(chat_Data.send==0){
					var messageEl = $('<div class="message-item">'
										+'<img src="'+localStorage.getItem(chat_Data.username + "_pic")+'" alt="avatar" class="avatar">'
										+'<div class="content">'
											+'<div class="title">'+message.username+'</div>'
											+'<div class="bubble">'
												+chat_Data.message
											+'</div>'
											+'<div class="footer">'+time+'</div>'
										+'</div>'
									+'</div>');
				}
				else{ 
					var messageEl = $('<div class="message-item user">'
										+'<img src="'+localStorage.getItem(message.username + "_pic")+'" alt="avatar" class="avatar">'
										+'<div class="content">'
											+'<div class="title">'+message.username+'</div>'
											+'<div class="bubble">'
												+chat_Data.message
											+'</div>'
											+'<div class="footer">'+time+'</div>'
										+'</div>'
									+'</div>');
				}
				messageList.append(messageEl);
			});
			$("html, body").animate({ scrollTop: $(document).height() - $(window).height() }, 'fast');
		});	
		
	}
	function addChatLog(message){
		url = surl + "functions.php";
		data = new Object();
		data['channel_id'] = localStorage.getItem("active_channel_id");
		data['msg'] = message;
		data['action'] = 'addChatLog';
		$.ajax({type: 'POST',url: url,data: data});
	}
	function addZero(i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	}
	function PubNub() {
		this.publishKey = 'pub-c-2c0ea513-d356-4b8c-b10b-884046854f75';
		this.subscribeKey = 'sub-c-a9e942de-be54-4067-ae49-d0525a9ecef7';
		this.subscriptions = localStorage["pn-subscriptions"] || [];

		if(typeof this.subscriptions == "string") {
			this.subscriptions = this.subscriptions.split(",");
		}
		this.subscriptions = $.unique(this.subscriptions);
	}

	PubNub.prototype.connect = function(username) {
		this.username = username;
		this.connection = new PubNub({
                publishKey:        this.publishKey,
                subscribeKey:      this.subscribeKey,
                logVerbosity:      false,
                uuid:              this.username,
                ssl:               true,
                heartbeatInterval: 60
           });
	};

	PubNub.prototype.addSubscription = function(channel) {
		this.subscriptions.push(channel);
		this.subscriptions = $.unique(this.subscriptions);
	};

	PubNub.prototype.removeSubscription = function(channel) {
		if (this.subscriptions.indexOf(channel) !== -1) {
			this.subscriptions.splice(this.subscriptions.indexOf(channel), 1);
		}
		this.saveSubscriptions();
	};

	PubNub.prototype.saveSubscriptions = function() {
		localStorage["pn-subscriptions"] = this.subscriptions;
	};

	PubNub.prototype.subscribe = function(options) {
		this.connection.subscribe.apply(this.connection, arguments);
		this.addSubscription(options.channel);
		this.saveSubscriptions();
	};

	PubNub.prototype.unsubscribe = function(options) {
		this.connection.unsubscribe.apply(this.connection, arguments);
	};

	PubNub.prototype.publish = function() {
		this.connection.publish.apply(this.connection, arguments);
	};

	var chatChannel = localStorage.getItem("active_channel"),
		username = localStorage.getItem("username"),
		users = [],
		chatRoomName = localStorage.getItem("active_chat_username"),
		chatButton = $("#startChatButton"),
		newChatButton = $("#newChatButton"),
		chatListEl = $("#message-area"),
		sendMessageButton = $("#send-button"),
		backButton = $("#backButton"),
		messageList = $("#message-area"),
		messageContent = $("#console-message-input"),
		pubnub = new PubNub(),
		isBlurred = false,
		timerId = -1,
		pages = {
			home: $("#chatPage"),
			delete: $("#delete")
		};

	
	

	////////
	// Home View
	/////
	function HomeView() {   
		getChannel();
		if(localStorage.getItem("active_channel")){
			pubnub.connect(localStorage.getItem("username"));
			var self = this;
			users = [];
			pubnub.subscribe({
				channel	: [localStorage.getItem("active_channel")],
				// message	: self.handleMessage,
				// presence: function( message, env, channel ) {
					// if (message.action == "join") {
						// console.log("Join to Channel.");
						// console.log(channel);
						// users.push(message.uuid);
					// } else {
						// users.splice(users.indexOf(message.uuid), 1);
					// }
				// }
			});
			
			getChatHistory();
		}
		else{
			getChannel();
			pubnub.connect(localStorage.getItem("username"));
			var self = this;
			users = [];
			pubnub.subscribe({
				channel	: [localStorage.getItem("active_channel")],
				// message	: self.handleMessage,
				// presence: function( message, env, channel ) {
					// if (message.action == "join") {
						// console.log("Join to Channel.");
						// console.log(channel);
						// users.push(message.uuid);
					// } else {
						// users.splice(users.indexOf(message.uuid), 1);
					// }
				// }
			});
			
			getChatHistory();
		}
		messageContent.off('keydown');
		messageContent.bind('keydown', function (event) {
			if((event.keyCode || event.charCode) !== 13) return true;
			sendMessageButton.click();
			return false;
		});

		sendMessageButton.off('click');
		sendMessageButton.click(function (event) {
			var message = messageContent.val();
			if(message !== "") {
				pubnub.publish({
					channel: [localStorage.getItem("active_channel")],
					message: {
						username: localStorage.getItem("username"),
						text: message
					}
				});
				messageContent.val("");
			}
		});

		backButton.off('click');
		backButton.click(function (event) {
			pubnub.unsubscribe({
				channel: [localStorage.getItem("active_channel")]
			});
		});	
	};  
	// This handles appending new messages to our chat list.
	HomeView.prototype.handleMessage = function (message, animate) {
		var d = new Date();
		var Y = d.getFullYear();
		var M = addZero(d.getMonth() + 1);
		var D = addZero(d.getDate());
		var H = addZero(d.getHours());
		var mm = addZero(d.getMinutes());
		var time = D + '/' + M + '/' + Y + ' ' + H + ':' + mm;
		if (animate !== false) animate = true;
		if(message.username != username){			
			var messageEl = $('<div class="message-item">'
				+'<img src="'+localStorage.getItem(message.username + "_pic")+'" alt="avatar" class="avatar">'
				+'<div class="content">'
					+'<div class="title">'+message.username+'</div>'
					+'<div class="bubble">'
						+message.text
					+'</div>'
					+'<div class="footer">'+time+'</div>'
				+'</div>'
			+'</div>');
			url = surl + "functions.php";
			data = new Object();
			data['channel_id'] = localStorage.getItem("active_channel_id");
			data['action'] = 'setAsRead';
			$.ajax({type: 'POST', url: url, data: data});
		}
		else{	
			var messageEl = $('<div class="message-item user">'
				+'<img src="'+localStorage.getItem(message.username + "_pic")+'" alt="avatar" class="avatar">'
				+'<div class="content">'
					+'<div class="title">'+message.username+'</div>'
					+'<div class="bubble">'
						+message.text
					+'</div>'
					+'<div class="footer">'+time+'</div>'
				+'</div>'
			+'</div>');
			addChatLog(message.text,1);
		}
		messageList.append(messageEl);
		messageList('refresh');
		
		// Scroll to bottom of page
		if (animate === true) {
			$("html, body").animate({ scrollTop: $(document).height() - $(window).height() }, 'slow');
		}

		
	};
	// Initially start off on the home page.
	var currentView = new HomeView();
});

		
var nChanel = localStorage.username+'_friends';

var pubnub = new PubNub({
                publishKey:        'sub-c-a9e942de-be54-4067-ae49-d0525a9ecef7',
                subscribeKey:      'pub-c-2c0ea513-d356-4b8c-b10b-884046854f75',
                logVerbosity:      false,
                uuid:              localStorage.getItem("username"),
                ssl:               true,
                heartbeatInterval: 60
            });
function errorHandler(error){alert(error.message);}

function successHandler(result) {
    console.log('Success: '+ result);
}
function errorHandlerN(error) {
    console.log('Error: '+ error);
}
// Publish the channel name and regid to PubNub
function registerDevice() {
	pubnub.subscribe({
        channel: [localStorage.getItem("active_channel")],
        callback: function(m) {
            console.log(m);
        }
    });  
}
function getUrlVarss(){var vars = {};var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {vars[key] = value;});return vars;}

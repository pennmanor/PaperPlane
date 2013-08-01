//---------------------------------------------------//
// PaperPlane 1.0.0
// link and file sharing web application
// Andrew Lobos <andrew@lobos.me>
// Benjamin Thomas <benjamin@thomasnetwork.net>
//---------------------------------------------------//

//-------------------- End Setup --------------------//
//----------------- Define Variables ----------------//
var username = "";
var room = "";
var socket = io.connect();
var title = "";
//-------------------- End Define -------------------//
//----------------- Define Functions ----------------//
function joinRoom()
{
	tmpUsername = $("#usernameField").val();
	tmpRoom = parseInt($("#roomNumberField").val());
	if ( tmpUsername != "" && tmpRoom )
	{
		$("#chatBody").html("");
		username = tmpUsername
		room = tmpRoom;
		$("#roomNumber").html(room);
		$("#changeRoom").modal("hide");
		$("#changeRoomFormAlert").hide();
		socket.emit("resync");
	}
	else
	{
		if( !tmpRoom )
			$("#changeRoomFormAlert").html("Please enter a number in the room field.");
		if( tmpUsername == "" )
			$("#changeRoomFormAlert").html("Please fill out the name field.");
		$("#changeRoomFormAlert").show();
	}
}
function setTitle()
{
	title = $.trim($("#urlTitleField").val());
	$("#urlTitleField").val("");
	$("#fileTitleField").val("");
	
	if ( title == "" ){
		$("#urlInfoButton").html("Set Title");
		$("#fileInfoButton").html("Set Title");
	}
	else{
		$("#urlInfoButton").html(title);
		$("#fileInfoButton").html(title);
	}	
	$("#changeTitle").modal("hide");
	barResize();
}
function submitUrl()
{
	url = $("#urlInputField").val();
	prefix = url.split(":")[0];
	if ( prefix != "http" && prefix != "https" )
	{
		$("#urlAlert").show();
		return;
	}
	socket.emit("link", {room:room, username:username, linkTitle:url, url:url, customTitle:title});
	$("#urlInfoButton").html("Set Title");
	$("#fileInfoButton").html("Set Title");
	title = '';
	$("#urlInputField").val("");
	$("#urlAlert").hide();
	barResize();
}
function appendLink(user, urlName, url, customTitle)
{
	if ( customTitle == "" ){
		data = createElement('p');
		insertElementAt(createElement('strong', null, user), data);
		insertElementAt(createText(' posted a link to '), data);
		insertElementAt(createElement('a', {'href':url, 'target':'_blank'}, urlName), data);
		$("#chatBody").prepend(data)
	}
	else{
		data = createElement('p');
		insertElementAt(createElement('strong', null, user), data);
		insertElementAt(createText(" posted a link: " + customTitle + " - "), data);
		insertElementAt(createElement('a', {'href':url, 'target':'_blank'}, urlName), data);
		$("#chatBody").prepend(data)
	}
}
function submitFile()
{
	var fileObj = document.getElementById("fileInput");
	if ( fileObj.files.length == 0 )
		return;
	
	var f = new FormData();
	f.append("file", fileObj.files[0]);
	f.append("room", room);
	f.append("username", username);
	f.append("title", title);
	
	$("#urlInfoButton").html("Set Title");
	$("#fileInfoButton").html("Set Title");
	title = '';
	$("#loading").modal("show");
	$.ajax({
		"url": "/uploadHandler",
		data: f,
		contentType: false,
		processData: false,
		type: "POST",
		success: function ()
		{
			$('.fileupload').fileupload('reset');
			barResize();
			$("#loading").modal("hide");
		}
	});
}
function barResize()
{
	var barSize = $('#chatBody').outerWidth();
	var setUrlButtonSize = $('#urlInfoButton').outerWidth();
	var sendUrlButtonSize = $('#urlSubmitButton').outerWidth();
	var setFileButtonSize = $('#fileInfoButton').outerWidth();
	var sendFileButtonSize = $('#fileSubmitButton').outerWidth();
	
	$('#urlInputField').outerWidth(barSize-setUrlButtonSize-sendUrlButtonSize);
	if(document.getElementById("fileInput").files.length == 0)
		$('#fileInputField').outerWidth(barSize-setFileButtonSize-sendFileButtonSize - $('#fileUploadButton').innerWidth());
	else
		$('#fileInputField').innerWidth(barSize-setFileButtonSize-sendFileButtonSize - $('#fileUploadButton').innerWidth() - $('#fileRemoveButton').innerWidth());
	
}
//-------------------- End Define -------------------//
//--------------- Setup Join room Modal -------------//
$("#changeRoom").modal({
	keyboard: false,
	backdrop: "static"	
});
$("#changeRoom").modal("show");
$('#usernameField').keypress(
	function(e)
	{
		if(e.which == 13)
			joinRoom();
	}
);
$('#roomNumberField').keypress(
	function(e)
	{
		if(e.which == 13)
			joinRoom();
	}
);
$("#joinRoomButton").click(joinRoom);
//-------------------- End Setup --------------------//
//------------ Setup Change Title Modal -------------//
$("#changeTitle").modal("hide");
$("#changeTitleBackButton").click(
	function()
	{
		$("#changeTitle").modal("hide");
	}
);
$("#setTitleButton").click(setTitle);
//-------------------- End Setup --------------------//
//---------------- Setup Loading Modal --------------//
$("#loading").modal({
	keyboard: false,
	backdrop: "static"	
});
$("#loading").modal("hide");
//-------------------- End Setup --------------------//
//----------------- Setup Submit Url ----------------//
$('#urlTitleField').keypress(
	function(e){
		if(e.which == 13)
			setTitle();
	}
);
$('#urlInputField').keypress(
	function(e)
	{
		if(e.which == 13)
			submitUrl();
	}
);
$("#urlInfoButton").click(
	function()
	{
		$("#changeTitle").modal("show");
	}
);
$("#urlSubmitButton").click(submitUrl);
//-------------------- End Setup --------------------//
//---------------- Setup Submit File ----------------//
$("#fileInfoButton").click(
	function()
	{
		$("#changeTitle").modal("show");
	}
);
$("#fileSubmitButton").click(submitFile);
$('#fileInput').change(
	function(evt)
	{
		barResize();
	}
);
//-------------------- End Setup --------------------//
//------------------ Setup Socket -------------------//
socket.on("link", function(data)
{
	if ( data.room == room )
		appendLink(data.username, data.linkTitle, data.url, data.customTitle);
});

socket.on("file", function(data)
{
	if ( data.room == room )
	{	
		ele = createElement('p');
		insertElementAt(createElement('strong', null, data.username), ele);
		insertElementAt(createText(' posted a file: '), ele);
		insertElementAt(createElement('a', {'href':"uploads/"+data.fsFileName, 'target':'_blank'}, data.title), ele);
		$("#chatBody").prepend(ele);
	}
});
//-------------------- End Setup --------------------//
//------------------ Setup Alerts -------------------//
$("#urlAlert").hide();
$("#changeRoomFormAlert").hide();
$("#changeRoomButton").click(
	function(){
		location.reload();
	}
);
//-------------------- End Setup --------------------//

$('a[data-toggle="tab"]').on('shown', function (e) {
	barResize();
});
$(document).ready(function() {
  barResize();
});

$(window).resize(barResize);


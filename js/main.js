var selectedRoom = "Chat";
var isSignedIn = false;
var dataRef;
var filters = ["_default"];
var currentMessageTags = ["_default"];

var username = "anonymous";

function assignUsername() {
  var adj = ["Anonymous", "Small", "Red", "Orange", "Yellow", "Blue", "hot", "Violet", "Shiny", "Sparkly", "Sexy", "Hot", "Cold", "Evil", "Kind", "Ugly", "Legendary", "Flaming", "Salty", "Slippery"];
  var noun = ["Bear", "Dog", "Cat", "Banana", "Pepper", "Bird", "Lion", "Apple", "Phoenix", "Diamond", "Person", "Whale", "Plant", "Duckling", "Thing", "Flame", "Number", "Cow", "Dragon", "Hedgehog", "Dick"];

  var rAdj = Math.floor(Math.random() * adj.length);
  var rNoun = Math.floor(Math.random() * noun.length);
  var name = adj[rAdj] + noun[rNoun];
  return name;
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var u = getCookie("unichat_uid");
  if (u != "") {
    if (u!= "iPhoenix")
    {
    alert("Welcome back to UniChat, " + u);
    var database = firebase.database();
    database.ref("Data/").push({
      text: u + " has entered the room. :]",
      ts: Date.now(),
      un: "[",
      tag: ["all"]
    });
      
    }
    var n = new Date(Date.now());
            var q = n.toString();
            firebase.database().ref("usernames/" + u).set(q);
  } else {
    u = prompt("Please Enter a Username:", assignUsername());
    u = u.replace(/\W/g, '');
    if (u != "" && u != null && u != "_iPhoenix_" && u != "Console" && u != "CONSOLE" && u != "DKKing" && u != "iPhoenix") {
      setCookie("unichat_uid",u,2*365);
      var n = new Date(Date.now());
            var q = n.toString();
            firebase.database().ref("usernames/" + u).set(q);
    } else {
      u = "_" + assignUsername();
    }
  }
  return u;
}
function reset()
{
  document.cookie = ""
  username = checkCookie();
  changeUsername();
}
function refresh() {
  var span, text;
  document.getElementById("filterDisplay").innerHTML = "";
  document.getElementById("tagDisplay").innerHTML = "";
  for (var filter = 1; filter < filters.length; filter++) {
    span = document.createElement("SPAN");
    text = document.createTextNode(filters[filter]);
    span.appendChild(text);
    document.getElementById("filterDisplay").appendChild(span);
  }
  
  for (var tag = 1; tag < currentMessageTags.length; tag++) {
    span = document.createElement("SPAN");
    text = document.createTextNode(currentMessageTags[tag]);
    span.appendChild(text);
    document.getElementById("tagDisplay").appendChild(span);
  }
}

function addTag(tag) {
  toggleArrayItem(currentMessageTags,tag.getAttribute("value"));
  refresh();
}

function toggleArrayItem(a, v) {
  var i = a.indexOf(v);
  if (i === -1)
    a.push(v);
  else
    a.splice(i, 1);
}

function toggleFilter(filter) {
  var value = filter.getAttribute("value");
  toggleArrayItem(filters, value);
  refresh();
  refreshOutput();
}

function submitMessage() {
  if (isSignedIn) {
    var database = firebase.database();
    var messageBox = document.getElementById("message");
    var recipient = -1;
    if (messageBox.value.substring(0,3) == "/pm")
    {
      var str = messageBox.value.substring(4, messageBox.value.length);
      var reg = /\w*/;
      var match = reg.exec(str);
      recipient = match[0];
    }
    if (messageBox.value != undefined && messageBox.value != "" && messageBox.value != '' && messageBox.value.length < 256) {
      database.ref("Data/").push({
        text: messageBox.value,
        ts: Date.now(),
        un: username,
        tag: currentMessageTags,
        to: recipient
      });
      messageBox.value = "";
      currentMessageTags = ["_default"];
      refresh();
    }
    else
    {
      messageBox.style.border = "3px solid #f00";
      window.setTimeout(function() {
        messageBox.style.border = "3px solid #ccc";
      }, 1000);
    }
  }
}

document.getElementById("message").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    if (isSignedIn) {
      submitMessage();
    }
  }
});

function changeUsername() {
  if (username == "TLM") 
    username = "TheLastMillennial";
  if (username == "VioletJewel")
    username = "Battlesquid";
  if (username == "xMarminq_________________________")
    username = "xMarminq_";
  if (username == "VioletPerson")
    username = "DKKing";
  setCookie("unichat_uid",username,2*365);
}
var formatTime = function(ts) {
  var dt = new Date(ts);

  var hours = dt.getHours() % 12;
  var minutes = dt.getMinutes();
  var seconds = dt.getSeconds();

  // the above dt.get...() functions return a single digit
  // so I prepend the zero here when needed
  if (hours < 10)
    hours = '0' + hours;

  if (minutes < 10)
    minutes = '0' + minutes;

  if (seconds < 10)
    seconds = '0' + seconds;
  
  if (hours == '00')
    hours = '12';
  
  return hours + ":" + minutes + ":" + seconds;
}

function filter(haystack, arr) {
  return arr.some(function(v) {
    return haystack.indexOf(v) > 0;
  });
};

function redirectFromHub() {
  if (isSignedIn) {
    dataRef.off();
  }
  var n = document.getElementById('output');
  while (n.hasChildNodes()) {
    n.removeChild(n.firstChild);
  }
  var data = document.getElementsByName("hubSelect");
  for (var i = 0; i < data.length; i++) {
    if (data[i].checked)
      selectedRoom = data[i].value;
  }
  username = checkCookie();
  changeUsername();
  dataRef = firebase.database().ref("Data/");
  isSignedIn = true;
  dataRef.orderByChild("ts").limitToLast(25).on('child_added', function(snapshot) {
    var data = snapshot.val();
    var message = data.text;

    var datePosted = data.ts;
    var tempDate = new Date;
    tempDate.setTime(datePosted);
    var dateString = formatTime(tempDate);

    var posterUsername = data.un;
    if (message != undefined && (filter(data.tag, filters) || (filters.length == 1)) ) {
      var node = document.createElement("DIV");
      var messageHeader = message.substring(0, 3);
      var textnode;
      if (messageHeader === "/me" && messageHeader !== "/pm") {
        textnode = document.createTextNode('\n' + "[" + dateString + "]  *" + posterUsername + ' ' + message.substring(3, message.length));
      } else {
        var str = message.substring(4, message.length);
        var reg = /\w*/;
        var match = reg.exec(str);
        var messagePM = message.substring(4 + match[0].length, message.length);
        if (messageHeader === "/pm" && match[0] == username) {
          textnode = document.createTextNode('\n' + "[" + dateString + "][PM]  ~" + posterUsername + ' whispers to you: ' + messagePM);
        } else {
          if (messageHeader !== "/pm") {
            textnode = document.createTextNode('\n' + "[" + dateString + "]  " + posterUsername + ': ' + message);
          }
        }
        if (match[0] == "TLM" && username == "TheLastMillennial")
        {
          textnode = document.createTextNode('\n' + "[" + dateString + "][PM]  ~" + posterUsername + ' whispers to you: ' + messagePM);
        }
      }
      if (username == "_iPhoenix_" || username == "iPhoenix")
      {
        notifyMe(posterUsername+": "+message);
      }
      node.appendChild(textnode);
      var textClass = "outputText";
      if (message.indexOf(username) != -1)
      {
        textClass = "highlight";
      }
      if (username == "TheLastMillennial" && message.indexOf("TLM") != -1)
      {
        textClass = "highlight";
      }
      node.setAttribute("class", textClass);
      document.getElementById("output").appendChild(node);

      var objDiv = document.getElementById("output");
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  });
}

redirectFromHub();

function refreshOutput() {
  document.getElementById("output").innerHTML = "";
  dataRef = firebase.database().ref("Data").orderByChild("ts").limitToLast(25);
  isSignedIn = true;
  dataRef.once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
    var data = childSnapshot.val();
    var message = data.text;
    var datePosted = data.ts;
    var tempDate = new Date;
    tempDate.setTime(datePosted);
    var dateString = formatTime(tempDate);

    var posterUsername = data.un;
    if (message != undefined && (filter(data.tag, filters) || (filters.length == 1))) {
      var node = document.createElement("DIV");
      var messageHeader = message.substring(0, 3);
      var textnode;
      if (messageHeader === "/me" && messageHeader !== "/pm") {
        textnode = document.createTextNode('\n' + "[" + dateString + "]  *" + posterUsername + ' ' + message.substring(3, message.length));
      } else {
        var str = message.substring(4, message.length);
        var reg = /\w*/;
        var match = reg.exec(str);
        var messagePM = message.substring(4 + match[0].length, message.length);
        if (messageHeader === "/pm" && match[0] == username) {
          textnode = document.createTextNode('\n[PM]' + "[" + dateString + "]  ~" + posterUsername + ' whispers to you: ' + messagePM);
        } else {
          if (messageHeader !== "/pm") {
            textnode = document.createTextNode('\n' + "[" + dateString + "]  " + posterUsername + ': ' + message);
          }
        }
      }
      node.appendChild(textnode);
      var textClass = "outputText";
      if (message.indexOf(username) != -1)
      {
        textClass = "highlight";
      }
      node.setAttribute("class", textClass);
      document.getElementById("output").appendChild(node);

      var objDiv = document.getElementById("output");
      objDiv.scrollTop = objDiv.scrollHeight;
    }
    });
  });
}

function getRecentPMs() {
  var output = document.getElementById("output");
  var node = document.createElement("DIV");
  var textNode = document.createTextNode("Here are your recent PM's:");
  var hasPMs = false;
  node.appendChild(textNode);
  node.setAttribute("class", "outputText");
  output.appendChild(node);
  output.scrollTop = output.scrollHeight;
  dataRef = firebase.database().ref("Data").orderByChild("to").equalTo(username).limitToLast(25);
  dataRef.once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
    hasPMs = true;
    node = document.createElement("DIV");
    var data = childSnapshot.val();
    var message = data.text;
    var datePosted = data.ts;
    var posterUsername = data.un;
    var messagePM = message.substring(4 + data.to.length, message.length);
    var tempDate = new Date;
    tempDate.setTime(datePosted);
    var dateString = formatTime(tempDate);
      textnode = document.createTextNode('\n[PM]' + "[" + dateString + "]  ~" + posterUsername + ' whispers to you: ' + messagePM);
      node.appendChild(textnode);
      node.setAttribute("class", "highlight");
      document.getElementById("output").appendChild(node);

      var objDiv = document.getElementById("output");
      objDiv.scrollTop = objDiv.scrollHeight;
    });
  });
  window.setTimeout(function(){if (!hasPMs)
  {
    node = document.createElement("DIV");
    textnode = document.createTextNode("You do not have any recent PM's.");
    node.appendChild(textnode);
    node.setAttribute("class","highlight");
    output.appendChild(textnode);
    var objDiv = document.getElementById("output");
      objDiv.scrollTop = objDiv.scrollHeight;
  }},1000);
}

function notifyMe(message) {
  // Let's check if the browser supports notifications

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(message);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(message);
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}

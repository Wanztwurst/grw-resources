var socket = null;
var phoneId = null;
var retry = 0;
var noerror = true;
var stopReloading = false; // stops reloading if set to true

function giveMeResources() {
    if(socket != null && socket.readyState > 0) {
        if(socket.readyState == 1) {
            // already connected and ready, just send the cash
            sendRes();
        } else {
            // something went wrong
            retryConnection();
        }
    } else {

    // new connection
    connect();
    }
}

// connect to running game
function connect() {
    // supported by browser?
    if (!("WebSocket" in window)) {
        log("WebSockets not supported by your Browser, this won't work");
        return;
    }

    // ample orange
    document.getElementById('ample').classList.add('connecting');

    // disable btn
    document.getElementById('btn_connect').disabled = true;

    // get ip
    var ip = document.getElementById('ip').value;
    if(ip == "") ip = '127.0.0.1';

    // start connection
    socket = new WebSocket("ws://"+ip+":8080/smartphone", "v1.phonescoring.gr.ubisoft.com");

    socket.onopen = function() {
        log('Step 0/3: connection open');
        noerror = true;

        // start
        getPhoneIdHandshake();
    };

    // wait for message - then continue
    socket.onmessage = function(e) {
        if(e.data != undefined) {
            parseMessage(e.data);
            //log(e.data);
        } else {
            log('unknown message type');
        }
    };

    socket.onerror = function() {
        noerror = false;
        log('error');
        retryConnection();
    };

    socket.onclose = function(e) {
        console.log(e);
        if(e.reason == 'CLOSE_MAX_PLAYERS_REACHED') {
            log('too many connections, try reloading the page');
        }else if(e.reason == 'CLOSE_PROTOCOL_ERROR') {
            log('closed by game, happens often - just wait it out');
            //retryConnection();
        } else if(e.code == 1006) {
            log('closed: is the game running on '+ip+'? firewall open?');
            //retryConnection();
        } else {
            log('closed with unexpected reason: '+e.reason);
            console.log(e);
        }
    };

}

// reload window, very most secure way to destroy all websocket remains and shit without having work
function retryConnection() {
    retry++;
    close();

    if(!stopReloading) {
        log('reloading in 1s... may take some tries');

        window.setTimeout(function() {
            if(findGetParameter('ip') != null) {
                // ip already in href, reload
                location.reload(); // magically works
            } else {
                // add ip to url, reload
                location.href = location.href + '?ip='+document.getElementById('ip').value;
            }
        }, 2000);
    }

    /*delete socket; // kind of works

    var ttw = retry * 2;
    log('retry #'+retry+' in '+ttw+'s');

    window.setTimeout(connect, ttw*1000);*/
}

// search for message with phoneID, then continue with step 2
function parseMessage(msg) {
    var json = JSON.parse(msg);

    if(json.phoneID != undefined) {
        // phoneID given, nice - let's go
        if(phoneId == null) { // only once, server may send id multiple times
            phoneId = json.phoneID;
            log('Step 1/3: PhoneID '+phoneId);

            sendSyncEnd();
        }

        // next step: end sync
        socket.onmessage = null;
    } else {
        //retryConnection();
    }
}

function getPhoneIdHandshake() {
    var handshake = '{"root":{"__class":"PhoneDataCmdHandshakeHello","clientVersion":"0.1"}}';
    socket.send(handshake);
}

// final connection
function sendSyncEnd() {
    log('Step 2/3: waiting for stable connection');

    var syncEnd = '{"root":{"__class":"PhoneDataCmdSyncEnd","phoneID":'+phoneId+'}}';
    socket.send(syncEnd);

    // wait 3s until unlocking button - probably works if there was no error yet
    window.setTimeout(testConnection, 2000);
}

// works after a stable connection is established, called by btn-click
function sendRes() {
    var fuel = document.getElementById('fuel').value;
    var food = document.getElementById('food').value;
    var coms = document.getElementById('coms').value;
    var meds = document.getElementById('meds').value;

    log('+ Resources sent');

    //var resStr = '{"root":{"__class":"PhoneDataCmdResourceUpdate","clientVersion":"0.1","Gasoline":500,"FoodPacks":1500,"ComTools":1500,"Medecine":1500}}'; // string to send
    var resStr = '{"root":{"__class":"PhoneDataCmdResourceUpdate","clientVersion":"0.1","Gasoline":'+fuel+',"FoodPacks":'+food+',"ComTools":'+coms+',"Medecine":'+meds+'}}'; // string to send
    socket.send(resStr);
}

// close connection
function close() {
    socket.close(); // close
}

// log visible
function log(str) {
    var log = document.getElementById('log');
    log.innerHTML = log.innerHTML + '<br />' + str;
}

// if there are no errors just assume connection is stable, unlock btn
function testConnection() {
    if(noerror) {
        // ample orange
        document.getElementById('ample').classList.remove('connecting');
        document.getElementById('ample').classList.add('connected');

        // enable btn
        document.getElementById('btn_giveMeRes').disabled = false;
        log('Step 3/3: looks stable now, you may smash dat button to transfer your resources');
        // ok
        log('<span style="color:#00ff00;">ok</span>');
        document.getElementById('btn_stopReloading').style.display = 'none';
    }
}

// get get param from url (ip backup)
// credits to Querty http://stackoverflow.com/a/21210643/179669
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
    return result;
}

// recover ip from href
function recoverIpAndConnect() {
    if(findGetParameter('ip') != null) {
        document.getElementById('ip').value = findGetParameter('ip');
        connect();

        document.getElementById('btn_stopReloading').style.display = 'block';
    }
}

recoverIpAndConnect();

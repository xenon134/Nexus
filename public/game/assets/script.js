let url = new URL(window.location);
url.protocol = "ws:"; url.pathname = '/game_ws';
const websocket = new WebSocket(url);

websocket.addEventListener("open", ({ data }) => {
    websocket.send(code); // code defined in header_script.js
});

websocket.addEventListener("message", ({ data }) => {
    if (data == "ALLGOOD") {
        myTurn = true;
    } else if (data == "BADCODE") {
        document.location.href = '/badcode.html';
    } else if (data.startsWith("WIN:")) {
        winningSquares = JSON.parse(data.substring(4));
        alert('You won!');
    } else if (data.startsWith("LOSE:")) {
        winningSquares = JSON.parse(data.substring(5));
        alert('You lost.');
        myTurn = false;
    } else {
        squares.push(JSON.parse("[" + data + ",0]"));
        myTurn = true;
    }
});

websocket.addEventListener("close", ({ data }) => {
    alert('Connection lost.');
    myTurn = false;
});

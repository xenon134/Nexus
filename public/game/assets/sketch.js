styleMap = {
    bgColor: 18, // #121212
    gridColor: 240, // #f0f0f0
    hoverColor: 140
}

/* factor by which graph is scaled up or down on scroll up or down.
 * Should be > 1. Values in (0, 1) will reverse scroll up and down.
 * <= 0 will plunge the page into an infinite loop in the draw method. */
var resizeFactor = 1.07;
/* Pan movements are scaled by this */
var panFactor = 0.8;
// coords of top left corner and size of each box in pixels
var tlX = 0.5, tlY = 0.5, boxSize = 100;

function Coord2CanvasX(xcoo) { return boxSize*(xcoo - tlX); }
function Coord2CanvasY(ycoo) { return boxSize*(ycoo - tlY); }
function Canvas2CoordX(xval) { return xval/boxSize + tlX; }
function Canvas2CoordY(yval) { return yval/boxSize + tlY; }

function setup() {
    windowResized();
    fill(styleMap.gridColor);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight-headerElem.offsetHeight-1);
}

const squares = [];
var winningSquares = null;
var myTurn = false;
var mouseOverBool = false;

function draw() {
    background(styleMap.bgColor);

    stroke(styleMap.gridColor);
    for (let i=Math.floor(tlY);; i++) {
        let y = Coord2CanvasY(i);
        if (y > height)
            break;
        line(0, y, width, y);
    }
    for (let i=Math.floor(tlX);; i++) {
        let x = Coord2CanvasX(i);
        if (x > width)
            break;
        line(x, 0, x, height);
    }

    if (myTurn && mouseOverBool) {
        fill(styleMap.hoverColor);
        rect( // highlight hover
            Coord2CanvasX(Math.floor(Canvas2CoordX(mouseX))),
            Coord2CanvasY(Math.floor(Canvas2CoordY(mouseY))),
            boxSize, boxSize);
        fill(styleMap.gridColor);
    }

    for (const i of squares) {
        rect(
            Coord2CanvasX(i[0]),
            Coord2CanvasY(i[1]),
            boxSize, boxSize);

        stroke(styleMap.bgColor);
        if (i[2]) { // cross
            line(Coord2CanvasX(i[0] + 0.1), Coord2CanvasY(i[1] + 0.1), Coord2CanvasX(i[0] + 0.9), Coord2CanvasY(i[1] + 0.9));
            line(Coord2CanvasX(i[0] + 0.1), Coord2CanvasY(i[1] + 0.9), Coord2CanvasX(i[0] + 0.9), Coord2CanvasY(i[1] + 0.1));
        } else // nought
            circle(Coord2CanvasX(i[0] + 0.5), Coord2CanvasY(i[1] + 0.5), boxSize*0.7);
    }

    if (winningSquares) {
        ;
    } else {
        ;
    }
}

var lastDraggedAt = 0;

function mouseDragged() {
    if (mouseOverBool) {
        tlX -= movedX/boxSize * panFactor;
        tlY -= movedY/boxSize * panFactor;
        lastDraggedAt = Date.now();
    }
}

function touchMoved() { /* same as mouseDragged() */
    console.log('Moved.');
    tlX -= movedX/boxSize * panFactor;
    tlY -= movedY/boxSize * panFactor;
    lastDraggedAt = Date.now();
}

function mouseClicked() {
    if (myTurn && mouseOverBool) {
        if (Date.now() - lastDraggedAt < 1000)
            return; // its just firing due to a drag so ignore
        myTurn = false;
        msg = [Math.floor(Canvas2CoordX(mouseX)), Math.floor(Canvas2CoordY(mouseY))]
        for (const i of squares) {
            if (i[0] == msg[0] && i[1] == msg[1])
                return; // already in entries
        }
        squares.push([msg[0], msg[1], 1]);
        websocket.send(msg.join(','));
    }
}

headerElem = document.getElementById("header");
mainElem = document.getElementById("main");
// not using the p5.js scroll function cause it tends to bunch up multiple scroll events into one big event
mainElem.addEventListener("wheel", function (event) {
    if (event.deltaY < 0) { // scroll up
        tlX += width / boxSize * (resizeFactor - 1) / 2;
        tlY += height / boxSize * (resizeFactor - 1) / 2;
        boxSize *= resizeFactor;
    } else if (event.deltaY > 0) { // scroll down
        tlX -= width / boxSize * (resizeFactor - 1) / 2;
        tlY -= height / boxSize * (resizeFactor - 1) / 2;
        boxSize /= resizeFactor;
    }
});

mainElem.addEventListener('mouseover', (event) => { mouseOverBool =  true; });
mainElem.addEventListener( 'mouseout', (event) => { mouseOverBool = false; });

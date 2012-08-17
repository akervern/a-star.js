/** A*.js ... **/

var canvasSize = 500;
var table = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 3, 0, 0, 0],
  [1, 0, 0, 3, 0, 0, 0],
  [0, 0, 0, 3, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
];
var nodes = [];

document.addEventListener('DOMContentLoaded', function() {
  initiate();
});

function initiate() {
  var canvas = document.getElementById('canvas');
  canvas.height = canvas.width = canvasSize;
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dest = {
      x: 6,
      y: 4
    }
    table[dest.y][dest.x] = 2;

    drawLoop(ctx); //start drawing loop
    updateLoop();

    computeNodesFor({
      x: 0,
      y: 2
    }, dest)
    autoRecompute(dest)
  }
}

function autoRecompute(dest) {
  setTimeout(function() {
    if (!computeNodesFor(findNextNode(), dest)) {
      console.log("not finish ...");
      autoRecompute(dest);
    }
  }, 500);
}

function updateLoop() {
  setTimeout(function() {
    updateLoop();
  }, 1000 / 24);
}

function drawLoop(ctx) {
  setTimeout(function() {
    draw(ctx);
    drawLoop(ctx);
  }, 1000 / 24);
}

function draw(ctx) {
  ctx.clearRect(0, 0, canvasSize, canvasSize);


  var nbY = table.length;
  var nbX = table[0].length;

  var piece = {
    height: canvasSize / nbY,
    width: canvasSize / nbX
  }

  // draw table lines
  for (var i = 1; i < nbX; i++) {
    drawLine(ctx, {
      x: i * piece.width,
      y: 0
    }, {
      x: i * piece.width,
      y: canvasSize
    })
  }
  for (var i = 1; i < nbY; i++) {
    drawLine(ctx, {
      x: 0,
      y: i * piece.height
    }, {
      x: canvasSize,
      y: i * piece.height
    })
  }

  // draw points
  for (var x = 0; x < nbX; x++) {
    for (var y = 0; y < nbY; y++) {
      var type = table[y][x];
      if (type == 0) {
        continue;
      }
      drawPoint(ctx, type, {
        x: x * piece.width + piece.width / 2,
        y: y * piece.height + piece.height / 2
      })
    }
  }

  // draw nodes
  for (var i = 0; i < nodes.length; i++) {
    drawNode(ctx, nodes[i], piece)
  }
}

function findNextNode() {
  if (nodes.length < 1) {
    return null;
  }

  var best = nodes[0];
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node.scoring <= best.scoring) {
      best = node;
    }
  }
  console.log("NextNode:")
  console.log(best)
  return best;
}

function computeNodesFor(pt, destination) {
  var possibleNodes = [{
    x: pt.x,
    y: pt.y + 1
  }, {
    x: pt.x,
    y: pt.y - 1
  }, {
    x: pt.x + 1,
    y: pt.y
  }, {
    x: pt.x - 1,
    y: pt.y
  }]

  console.log("Possible nodes:")
  console.log(possibleNodes)
  for (var i = 0; i < possibleNodes.length; i++) {
    var possibleNode = possibleNodes[i];

    // Check if we are in the bounddaries
    if (possibleNode.x < 0 || possibleNode.y >= table.length || possibleNode.x >= table[0].length || possibleNode.y < 0) {
      console.log("Skiping: " + JSON.stringify(possibleNode))
      continue;
    }

    //Check if we are winning
    if (possibleNode.x == destination.x && possibleNode.y == destination.y) {
      return true;
    }

    // handle end pts
    if (table[possibleNode.y][possibleNode.x] != 0) {
      console.log("Not empty: " + JSON.stringify(possibleNode))
      continue;
    }

    possibleNode.origin = pt;
    possibleNode.cost = 10;
    possibleNode.estimated = Math.ceil(Math.sqrt(Math.pow(10 * (destination.x - possibleNode.x), 2) + Math.pow(10 * (destination.y - possibleNode.y), 2)));
    possibleNode.scoring = possibleNode.cost + possibleNode.estimated;

    //remove duplicate
    //XXX optimize it ... \o/
    var found = false;
    for (var j = 0; j < nodes.length; j++) {
      var node = nodes[j];
      if (node.x == possibleNode.x && node.y == possibleNode.y) {
        found = true;
        break;
      }
    }
    console.log("Node found: " + found);
    if (!found) {
      nodes.push(possibleNode);
    }
  }
  return false;
}

function drawNode(ctx, node, piece) {
  var margin = 5;
  var topX = (node.x * piece.width);
  var topY = (node.y * piece.height);
  ctx.strokeStyle = "cyan"
  strokeRect(ctx, {
    x: topX + margin,
    y: topY + margin
  }, {
    width: piece.width - 2 * margin,
    height: piece.height - 2 * margin
  })

  ctx.fillStyle = "black"
  ctx.fillText("G = " + node.cost, topX + 7, topY + 15);
  ctx.fillText("H = " + node.estimated, topX + 7, topY + piece.height - 8);
  ctx.fillText("F = " + node.scoring, topX + piece.width - 40, topY + piece.height / 2);
}

/** DRAW FUNCTIONS **/

function strokeRect(ctx, pt, piece) {
  ctx.strokeRect(pt.x, pt.y, piece.width, piece.height);
}

function drawPoint(ctx, type, pt) {
  ctx.beginPath();

  switch (type) {
  case 1:
    ctx.fillStyle = "green";
    break;
  case 2:
    ctx.fillStyle = "blue";
    break;
  default:
    ctx.fillStyle = "darkgrey";
  }

  ctx.arc(pt.x, pt.y, 30, 0, 360, false);
  ctx.fill();

  ctx.closePath();
}

function drawLine(ctx, pt1, pt2) {
  ctx.beginPath();

  ctx.strokeStyle = "lightgrey"
  ctx.moveTo(pt1.x, pt1.y);
  ctx.lineTo(pt2.x, pt2.y);

  ctx.stroke();
  ctx.closePath();
}
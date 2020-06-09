const WIDTH = 900; 
const HEIGHT = 900;
const RADIUS = 10;

var k = document.getElementById("rangeK").value;
var sparness = document.getElementById("rangeSparseness").value;
var Y = [];
var Y_pred = [];
var Y_pred_old = [];
var points = [];
var clusters = [];

function euclideanDistance2D(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y)
}

function updateText(id, value) {
    document.getElementById(id).value = id + ": " + value;
}

function executeStep() {
    var elem = document.getElementById("button");
    switch(elem.innerText) {
        case "generate": {
            generate();
            elem.innerText = "assign";
            break;
        }
        case "assign": {           
            var done = Y_pred_old.every((val, i) => val.x == Y_pred[i].x && val.y == Y_pred[i].y); 
            if(Y_pred_old.length > 0 && done) {
                sendEndMessage();
                Y = [];
                Y_pred = [];
                Y_pred_old = [];
                points = [];
                clusters = [];
                elem.innerText = "generate";

                return;
            }
            assign();
            elem.innerText = "update";
            break;
        }
        case "update": {
            update();
            elem.innerText = "assign";
            break;
        }
    }
    draw();
}

async function generate() {
    sparness = document.getElementById("rangeSparseness").value;
    var nbRealClusters = document.getElementById("rangeRealCluster").value;
    k = document.getElementById("rangeK").value;

    for(var i = 0; i < nbRealClusters; i++) {
        var y = {
            x: Math.floor((Math.random() * (WIDTH - 2 * RADIUS - sparness) + RADIUS + sparness / 2)),
            y: Math.floor((Math.random() * (HEIGHT - 2 * RADIUS - sparness) + RADIUS + sparness / 2))};
        Y.push(y);

        for(var j = 0; j < document.getElementById("rangePointsPerCluster").value; j++) {
            var radius = Math.floor((Math.random() * sparness / 2));
            var angle = Math.random()*Math.PI*2;
            var point = {
                x: Math.floor(Math.cos(angle)*radius + y.x),
                y: Math.floor(Math.sin(angle)*radius + y.y)};
            points.push(point);
        }
    }

    for(var i = 0; i < k; i++) {
        clusters.push([]);
    }

    for(var i = 0; i < document.getElementById("rangeK").value; i++) {
        non_center_points = points.filter((value) => !Y_pred.find((pred) => pred == value));
        y_pred = non_center_points[Math.floor((Math.random() * non_center_points.length))];
        Y_pred.push(y_pred);
    }
}

function assign() {
    clusters = [];
    for(var i = 0; i < k; i++) {
        clusters.push([]);
    }
    points.forEach((point) => {
        min = Math.min(...Y_pred.map((y_pred) => euclideanDistance2D(point, y_pred)));
        index = Y_pred.findIndex((y_pred) => euclideanDistance2D(point, y_pred) == min)
        clusters[index].push(point);
    });
}

function update() {
    Y_pred_old = [...Y_pred];
    clusters.forEach((cluster, i) => {
        if(cluster.length > 0) {
            sum = cluster.reduce((mean, point) => {
                return {x:mean.x + point.x, y: mean.y + point.y};
            });
            Y_pred[i] = {x: sum.x / cluster.length, y: sum.y / cluster.length};
        } else {
            Y_pred[i] = {x: WIDTH / 2, y: HEIGHT / 2};
        }
    });
}

function sendEndMessage() {
    var ctx = document.getElementById('canvas').getContext('2d');
    ctx.font = "48px serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";    
    ctx.fillText("Done!", canvas.width / 2, canvas.height / 2);
}

function draw() {
    var ctx = document.getElementById("canvas").getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    clusters.forEach((pts, index) => {
        pts.forEach((point) => {
            drawLine(ctx, point, Y_pred[index]);
        });
    });

    points.forEach((point) => {
        drawPoint(ctx, point, 7, "rgba(0,0,255,0.5)");
    });

    Y_pred.forEach((y) => drawPoint(ctx, y, 7, "rgba(255,0,0,0.5)"));

    Y.forEach((y) => {
        drawPoint(ctx, y, 7, "rgba(0,255,0,0.5)");
        drawPoint(ctx, y, sparness / 2, "rgba(0,255,0,0.1)");
    });
}

function drawLine(ctx, a, b) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
}

function drawPoint(ctx, point, radius, color) { 
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

updateText('Real number of clusters', document.getElementById("rangeRealCluster").value);
updateText('K', document.getElementById("rangeK").value)
updateText('Sparseness', document.getElementById("rangeSparseness").value)
updateText('Points per cluster', document.getElementById("rangePointsPerCluster").value)
let terrData = {}
let startTerritory = ""
let goalTerritory = ""
fetch("neighborterrs.json").then(response => response.json()).then(data => terrData = data).then(setupSelects)


$('document').ready(function () {
    $("#start-terr").select2()
    $("#end-terr").select2()
    setupSelects()
})

function setupSelects() {
    for (terr of Object.keys(terrData)) {
        let option = document.createElement("option");
        option.text = terr
        document.getElementById("end-terr").add(option);
        option = document.createElement("option");
        option.text = terr
        document.getElementById("start-terr").add(option);
    }
}

function getShortestRoute() {
    try {

        let queue = [startTerritory]
        let shortestRoute = {}
        shortestRoute[startTerritory] = []
        let shortestDistance = {}
        for (terr of Object.keys(terrData)) {
            shortestDistance[terr] = Infinity;
        }
        shortestDistance[startTerritory] = 0

        while (queue.length > 0) {
            const currentTerr = queue.shift()
            for (neighbor of terrData[currentTerr]) {
                if (shortestDistance[currentTerr] + 1 < shortestDistance[neighbor]) {
                    queue.push(neighbor)
                    shortestDistance[neighbor] = shortestDistance[currentTerr] + 1
                    shortestRoute[neighbor] = shortestRoute[currentTerr].concat([neighbor])
                }
            }
        }
        console.log(shortestDistance[goalTerritory])
        console.log(shortestRoute[goalTerritory])
        let html = shortestDistance[goalTerritory] - -1 + " Territories:<br>"
        html += startTerritory + " -> <br>"
        html += shortestRoute[goalTerritory].join(" -> <br>")
        document.getElementById("result").innerHTML = html
    } catch (e) {
        document.getElementById("result").innerHTML = "Invalid Territories"
    }
}

$("#start-terr").change(function () {
    startTerritory = $("#start-terr").val()
})

$("#end-terr").change(function () {
    goalTerritory = $("#end-terr").val()
})

$("#calc-button").click(function () {
    getShortestRoute()
})
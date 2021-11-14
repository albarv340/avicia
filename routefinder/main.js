function doMap() {
    let terrData = {}
    let startTerritory = ""
    let goalTerritory = ""

    let rectangles = {};
    let tradingRoutes = {};
    const map = L.map("map", {
        crs: L.CRS.Simple,
        minZoom: 7,
        maxZoom: 10,
        zoomControl: false,
        zoom: 7,
        preferCanvas: true,
        markerZoomAnimation: false,
        inertia: false
    });

    map.fitBounds([[0, -3], [10, 3.15]]);
    // map.fitBounds([[0, 0], [6, 2]]);
    let y1 = 0.1;
    let x1 = -2.4;
    L.imageOverlay('./main-map.png', [[y1, x1], [y1 + 6.5, x1 + 4.1]]).addTo(map)
    fetch("./territories.json")
        .then(response =>
            response.json())
        .then(json => {
            for (let territory in json['territories']) {
                let location = json['territories'][territory].location
                const multiplier = .001;
                let bounds = [[location.startY * -multiplier, location.startX * multiplier], [location.endY * -multiplier, location.endX * multiplier]]
                let rectangle = L.rectangle(bounds,
                    {
                        color: "white", weight: 2, pane: "markerPane"
                    })

                rectangle.bindTooltip(`<div><div class="territory-tooltip" style='text-shadow:-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black,
				0px 0px 1px white,
				0px 0px 2px white,
				0px 0px 3px white,
				0px 0px 4px white,
				0px 0px 5px white,
        0px 0px 6px white !important; visibility:hidden;><div class='identifier'>
                    ${territory} </div>`, {
                    className: "guild-name",
                    permanent: true,
                    direction: "center"
                }).openTooltip();
                rectangle.bindPopup(`<div><p>${territory}</p><button class="btn btn-primary" onclick="setStartTerr('${territory}')">Set as start territory</button><br><button class="btn btn-warning" onclick="setEndTerr('${territory}')">Set as end territory</button></div>`)

                rectangles[territory] = rectangle;
                rectangle.addTo(map);
            }

        }).then(_ => {
            fetch("./terralldata.json")
                .then(response =>
                    response.json())
                .then(json => {
                    terrAllData = json;
                    for (rectangle in rectangles) {
                        try {
                            for (route of terrAllData[rectangle]['Trading Routes']) {
                                let polyline = L.polyline([rectangles[rectangle].getCenter(), rectangles[route].getCenter()], { color: 'rgba(0,0,0,0)', pane: "overlayPane" })
                                tradingRoutes[rectangle] ? tradingRoutes[rectangle].push(polyline) : tradingRoutes[rectangle] = [polyline]
                                polyline.addTo(map)
                            }
                        } catch (e) {
                            console.error(e)
                            console.log(rectangle)
                        }
                    }
                })

        });
    map.on('zoomend', _ => {
        if (map.getZoom() <= 8) {
            hideTradeRoutes()
        } else if (map.getZoom() > 8) {
            showTradeRoutes()
        }
        if (map.getZoom() > 9) {
            showTooltips()
        }
        if (map.getZoom() <= 9) {
            hideTooltips()
        }
    })
    function hideTradeRoutes() {
        for (territory in tradingRoutes) {
            for (route in tradingRoutes[territory]) {
                tradingRoutes[territory][route].setStyle({
                    color: 'rgba(0,0,0,0)'
                })
            }
        }
    }

    function showTradeRoutes() {
        for (territory in tradingRoutes) {
            for (route in tradingRoutes[territory]) {
                tradingRoutes[territory][route].setStyle({
                    color: 'white'
                })
            }
        }
    }

    function hideTooltips() {
        $('.territory-tooltip').each(function (i, obj) {
            obj.style.visibility = "hidden"
        });
    }

    function showTooltips() {
        $('.territory-tooltip').each(function (i, obj) {
            obj.style.visibility = "visible"
        });
    }

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

    routeLine = [];


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
                const currentTerr = queue.pop()
                for (neighbor of terrData[currentTerr]) {
                    if (shortestDistance[currentTerr] + 1 < shortestDistance[neighbor]) {
                        queue.push(neighbor)
                        shortestDistance[neighbor] = shortestDistance[currentTerr] + 1
                        shortestRoute[neighbor] = shortestRoute[currentTerr].concat([neighbor])
                    }
                }
            }
            let html = shortestDistance[goalTerritory] - -1 + " Territories"
            // html += startTerritory + " -> <br>"
            // html += shortestRoute[goalTerritory].join(" -> <br>")
            for (line of routeLine) {
                map.removeLayer(line);
            }
            routeLine = [];
            let route = [startTerritory].concat(shortestRoute[goalTerritory]);
            for (let i = 0; i < route.length - 1; i++) {
                // tradingRoutes[terr].color = "rgb(0,255,0)";
                let polyline = L.polyline([rectangles[route[i]].getCenter(), rectangles[route[i + 1]].getCenter()], { color: 'rgb(0,255,0)', weight: 7, pane: "overlayPane" })
                routeLine.push(polyline)
                polyline.addTo(map)
            }
            routeLine = routeLine;
            document.getElementById("result").innerHTML = html
        } catch (e) {
            console.error(e)
            document.getElementById("result").innerHTML = "Invalid Territories"
        }
    }

    $("#start-terr").change(function () {
        startTerritory = $("#start-terr").val()
        console.log(startTerritory)
    })

    $("#end-terr").change(function () {
        goalTerritory = $("#end-terr").val()
    })

    $("#calc-button").click(function () {
        getShortestRoute()
    })

}


function setStartTerr(terr) {
    $("#start-terr").val(terr);
    $("#start-terr").trigger('change')
}

function setEndTerr(terr) {
    $("#end-terr").val(terr);
    $("#end-terr").trigger('change')
}
doMap();
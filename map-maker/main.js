var Territories = {};
var Guilds = [];
let rectangles = [];
var selectedTerritory = [];
var actual_JSON;
var markers = [];
var map;
var rectangleselect = false;
var visible = true;
var areRoutesShown = true;
var areProductionIconsShown = true;
let tradingRoutes = []
let terrAllData = []
let undoTerritoryBackup = []
let redoTerritoryBackup = []
const defaultGuilds = {
    "AVO": "#1010FE",
    "IBT": "#99AAB5",
    "Shy": "#67178a",
    "TNL": "#133a17"
}
const colors = {
    "Blacklisted": "#333333",
    "Titans Valor": "#e6d8e7",
    "HackForums": "#9d28c8",
    "Mystica": "#3a1645",
    "Celestial Tigers": "#FF4500",
    "Kingdom Foxes": "#FF8200",
    "Bobs Torturers": "#7300ff",
    "Restive": "#0F6868",
    "Caeruleum Order": "#012142",
    "The Simple Ones": "#0fcad6",
    "Lunatic": "#fae600",
    "Nethers Ascent": "#4a0000",
    "Paladins United": "#9780bf",
    "BuildCraftia": "#1CE00B",
    "Holders of LE": "#28FFC5",
    "House of Sentinels": "#7F0000",
    "Imperial": "#990033",
    "The Hive": "#A550F3",
    "Audux": "#005FE8",
    "Emorians": "#005FE8",
    "IceBlue Team": "#99AAB5",
    "DiamondDeities": "#42A8C7",
    "Fantasy": "#21C8EC",
    "Sins of Seedia": "#6B0B0B",
    "Avicia": "#1010FE",
    "Project Ultimatum": "#133E7C",
    "The Nezaract": "#6cf3ff",
    "Beyond the Scene": "#99ac01",
    "TheNoLifes": "#133a17",
    "Eden": "#00ff4a",
    "Phantom Hearts": "#E74C3C",
    "ShadowFall": "#67178a"
}
const keyValueUrl = "https://script.google.com/macros/s/AKfycbwZIgGTJe_y-GBui-45XaJuNa5eH1_B60wnOkN-6k99uDMLV-C5/exec"

$(document).ready(function () {
    // Help popup
    $("#guilds").select2()
    $("#changeguild").select2()
    $("#removeguild").select2()

    $(function () {
        $('#help').popover({
            trigger: 'focus'
        })
    })
    // Inittialize controls
    $('body').bind('keypress', function (e) {
        if (e.target.id === "name") return;
        // if (typeof (e.target.attributes.role) != "undefined") return;
        if (e.which == 32) {
            toggleMenu();
        }
        else if (e.key == "h") {
            visible = !visible;
            if (visible) render();
            else changeVisibility();
        } else if (e.key == "l") {
            toggleLegend();
        } else if (e.key == "p") {
            areProductionIconsShown = !areProductionIconsShown;
            if (areProductionIconsShown) showProductionIcons();
            else hideProductionIcons();
        } else if (e.key == "t") {
            areRoutesShown = !areRoutesShown;
            if (areRoutesShown) showTradeRoutes();
            else hideTradeRoutes();
        }

    })
    // Initialize map
    var realButton = document.getElementById('file-button');
    var importButton = document.getElementById('import-button');
    let undoButton = document.getElementById('undo-button');
    let redoButton = document.getElementById('redo-button');
    let resetButton = document.getElementById('reset-button');

    importButton.addEventListener('click', function () {
        realButton.click();
        realButton.addEventListener('change', importMap, false);
    });
    undoButton.addEventListener('click', function () {
        console.log(undoTerritoryBackup)
        if (undoTerritoryBackup.length > 0) {
            redoTerritoryBackup.push(JSON.parse(JSON.stringify(Territories)))
            Territories = JSON.parse(JSON.stringify(undoTerritoryBackup.pop()))
            render()
            location.hash = getCompressedString()
        } else {
            alert("Nothing to undo!")
        }
    });
    redoButton.addEventListener('click', function () {
        if (redoTerritoryBackup.length > 0) {
            undoTerritoryBackup.push(JSON.parse(JSON.stringify(Territories)))
            Territories = JSON.parse(JSON.stringify(redoTerritoryBackup.pop()))
            render()
            location.hash = getCompressedString()
        } else {
            alert("Nothing to redo!")
        }
    });

    resetButton.addEventListener('click', function () {
        // location.hash = ""
        // location.reload()
        window.location.href = window.location.origin + window.location.pathname
    });

    actual_JSON = getData();
    run();

    for (guild in defaultGuilds) {
        Guilds.push(new Guild(guild, defaultGuilds[guild]))
    }
    updateSelects()

});

class Guild {
    constructor(name, color) {
        this.name = name;
        this.mapcolor = color;
        console.log(`New guild with the name ${name} and color ${color}`);
    }
    changecolor(ncolor) {
        this.mapcolor = ncolor;
    }
}

function removeselections() {
    for (territory of selectedTerritory) {
        rectangles[territory].setStyle({ dashArray: [0] })
    }
    selectedTerritory = [];
    reloadMenu();
}

function addguild() {
    let name = document.getElementById("name");
    let color = document.getElementById("color");
    if (!Guilds.every(g => { return g.name != name.value })) {
        alert("Guild already added!");
        return;
    }
    if (name.value === "") {
        alert("No guild name specified!");
        return;
    }
    Guilds.push(new Guild(name.value, color.value));
    updateSelects()
    name.value = "";
    color.value = "#000000";
    reloadLegend();
    alert("Successfully added the guild!");
}
function changecolor() {
    let select = document.getElementById('changeguild');
    let color = document.getElementById("changecolor");
    if (select.selectedIndex === 0) {
        alert("No guild selected!");
        return;
    }
    for (let i in Guilds) {
        if (Guilds[i].name === select.value) {
            Guilds[i].changecolor(color.value);
            Object.keys(Territories).forEach(territory => {
                let guild = Territories[territory];
                if (guild === select.value) {
                    rectangles[territory].unbindTooltip();
                    rectangles[territory].bindTooltip('<span class="territoryGuildName" style="color: ' + Guilds[i].mapcolor + '">' + Guilds[i].name + getProductionIconsHTML(territory) + '</span>', { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 })
                    rectangles[territory].setStyle({
                        color: Guilds[i].mapcolor,
                    });
                }
            });
            break;
        }
    }
    reloadLegend();
    alert(`Successfully changed ${select.value}'s color to ${color.value}`);
    select.selectedIndex = 0;
    color.value = '#000000';
}
function removeguild() {
    let select = document.getElementById("removeguild");
    if (select.selectedIndex === 0) {
        alert("No guild selected!");
        return;
    }
    Guilds = Guilds.filter(x => (x.name != select.value));
    Object.keys(Territories).forEach(territory => {
        let guild = Territories[territory];
        if (guild === select.value) {
            rectangles[territory].unbindTooltip();
            rectangles[territory].bindTooltip('<span class="territoryGuildName" style="color: #FFFFFF">FFA' + getProductionIconsHTML(territory) + '</span>', { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 })
            rectangles[territory].setStyle({
                color: 'rgba(255,255,255,1)'
            });
            Territories[territory] = null;
        }
    });
    updateSelects()
    reloadLegend()
    alert("Successfully removed the guild!");
}

function initTerrs() {
    fetch("./territories.json")
        .then(response =>
            response.json())
        .then(json => {
            territories = json['territories']
            for (let territory in territories) {
                Territories[territory] = null;
            }
        })
}


function removeselectionmarkers() {
    markers.forEach(element => {
        map.removeLayer(element);
    });
    markers = []
}

function onclickevent(e) {
    if (!rectangleselect)
        return;
    var coord = e.latlng;
    var lat = coord.lat;
    var lng = coord.lng;
    let length = markers.length;
    if (length <= 1) {
        let marker = L.marker([lat, lng]).addTo(map);
        markers.push(marker);
    }
    else {
        let marker = markers.reverse().pop()
        map.removeLayer(marker);
        marker = L.marker([lat, lng]).addTo(map);
        markers.push(marker);
    }
    if (markers.length == 2) {

        let first = markers[0].getLatLng();
        let second = markers[1].getLatLng();
        let rect = [[first.lat, first.lng], [second.lat, second.lng]];
        removeselections()
        Object.keys(rectangles).forEach(territory => {
            let bounds = rectangles[territory]._bounds;
            let current = [[bounds._southWest.lat, bounds._southWest.lng], [bounds._northEast.lat, bounds._northEast.lng]];
            let overlap = checkRectOverlap(rect, current);
            if (overlap) {
                selectedTerritory.push(territory);
                rectangles[territory].setStyle({ dashArray: [7] })
            }
        });
        reloadMenu();
    }
    // console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
}

function toggleMenu() {
    if (document.getElementById("menu").style.display !== "none") {
        document.getElementById("menu").style.display = "none";
    } else {
        document.getElementById("menu").style.display = "block";
    }
}

function toggleLegend() {
    if (document.getElementById("legend").style.display !== "none") {
        document.getElementById("legend").style.display = "none";
    } else {
        document.getElementById("legend").style.display = "block";
    }
}

function run() {
    initTerrs();
    // Initializing events
    var guildSelect = document.getElementById('guilds');
    // guildSelect.addEventListener('change', function () {
    $("#guilds").change(function () {
        undoTerritoryBackup.push(JSON.parse(JSON.stringify(Territories)))

        if (guildSelect.selectedIndex === 0) {
            Object.values(selectedTerritory).forEach(territory => {
                Territories[territory] = "-";
                rectangles[territory].unbindTooltip();
                rectangles[territory].bindTooltip('<span class="territoryGuildName" style="color: #FFFFFF">FFA' +
                    getProductionIconsHTML(territory) + '</span>', { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 })
                rectangles[territory].setStyle({
                    color: 'rgba(255,255,255,1)'
                });
            });
        }
        else {
            for (let i = 0; i < Guilds.length; i++) {
                if (Guilds[i].name === guildSelect.value) {
                    Object.values(selectedTerritory).forEach(territory => {
                        Territories[territory] = guildSelect.value;
                        rectangles[territory].unbindTooltip();
                        rectangles[territory].bindTooltip('<span class="territoryGuildName" style="color: ' + Guilds[i].mapcolor + '">' + Guilds[i].name + getProductionIconsHTML(territory) + '</span>', { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 })
                        rectangles[territory].setStyle({
                            color: Guilds[i].mapcolor,
                        });
                    });
                    break;
                }
            }
        }
        reloadLegend();
        location.hash = getCompressedString()
    });
    // initializing map
    let bounds = [];
    let images = [];
    // L.Map.ScrollWheelPan = L.Map.ScrollWheelZoom.extend({
    //     _performZoom: function () {
    //         var map = this._map,
    //             delta = this._delta;

    //         map.stop(); // stop panning and fly animations if any

    //         delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
    //         delta = Math.max(Math.min(delta, 4), -4);

    //         this._delta = 0;
    //         this._startTime = null;

    //         if (!delta) {
    //             return;
    //         }

    //         map.panBy([0, -delta * 40]); // Adjust 40 to your feeling.
    //     }
    // });

    // L.Map.addInitHook('addHandler', 'scrollWheelPan', L.Map.ScrollWheelPan);
    map = L.map("map", {
        crs: L.CRS.Simple,
        minZoom: 6,
        maxZoom: 10,
        zoomControl: false,
        zoom: 8,
        preferCanvas: true,
        markerZoomAnimation: false,
        inertia: false
        // ,
        // scrollWheelZoom: false,
        // scrollWheelPan: true
    });

    map.on('click', onclickevent);

    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    map.fitBounds([[0, -4], [6, 2]]);

    for (let a = 0; a < 4; a++) {
        for (let b = 0; b < 3; b++) {
            bounds.push([[a * 2, (2 * b) - 4], [(a + 1) * 2, (2 * (b + 1)) - 4]])
        }
    }

    for (let bound of bounds) {
        images.push(L.imageOverlay(`./tiles/${bound[0][1]}/${bound[0][0]}.png`,
            bound, {
            attribution: "<a href='https://wynndata.tk/map'>WYNNDATA</a>"
        }
        ));
    }

    for (let image of images) {
        image.addTo(map);
    }

    //initializing variables
    let prevZoom = 7;

    //setting up territories
    fetch("./territories.json")
        .then(response =>
            response.json())
        .then(json => {
            for (let territory in json['territories']) {
                // let bounds = [territory["start"].split(","), territory["end"].split(",")];
                // for (let i in bounds) {
                //     bounds[i][0] *= .001
                //     bounds[i][1] *= .001
                // }

                // bounds[0].reverse();
                // bounds[1].reverse();

                // bounds[0][0] *= -1;
                // bounds[1][0] *= -1;
                let location = json['territories'][territory].location
                let bounds = [[location.startY * -.001, location.startX * .001], [location.endY * -.001, location.endX * .001]]
                let rectangle = L.rectangle(bounds,
                    { color: "rgb(0, 0, 0, 0)", weight: 2, pane: "markerPane" })
                rectangles[territory] = rectangle;
                rectangle.on('click', function () {
                    if (selectedTerritory.includes(territory)) {
                        selectedTerritory = selectedTerritory.filter(index => index != territory);
                        rectangles[territory].setStyle({ dashArray: [0] })
                    }
                    else {
                        selectedTerritory.push(territory);
                        rectangles[territory].setStyle({ dashArray: [7] })
                    }
                    console.log('Selected ' + selectedTerritory);
                    reloadMenu();
                });
                rectangle.addTo(map);
            }
        }).then(() => {
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
                    } try {
                        if (location.hash.length > 1) {
                            const urlData = deCompressTerritoryString(location.hash.substr(1))
                            if (location.hash.length < 20) {
                                fetch(keyValueUrl + "?key=" + location.hash.substr(1)).then(response => {
                                    if (response.ok) {
                                        return response.json()
                                    } else {
                                        alert("Something went wrong when loading map")
                                    }
                                }).then(data => {
                                    if (data != null) {
                                        updateMapFromHash(deCompressTerritoryString(data))
                                    } else {
                                        alert("Invalid map url")
                                        window.location.hash = ""
                                    }
                                })
                            } else {
                                updateMapFromHash(urlData)
                            }

                            function updateMapFromHash(urlData) {
                                if (Object.keys(urlData.territories).length == Object.keys(terrAllData).length) {
                                    Territories = urlData.territories
                                    Guilds = urlData.guilds
                                    updateSelects()
                                    render();
                                } else {
                                    alert("Invalid map url")
                                    window.location.hash = ""
                                }
                            }
                        }
                    } catch (e) {
                        console.error(e)
                    }
                    render();
                    reloadLegend();
                })

        });

    //on zoom end, update map based on zoom
    map.on('zoomend', () => {
        if (map.getZoom() <= 8) {
            hideTradeRoutes()
            hideProductionIcons()
        } else if (map.getZoom() >= 8) {
            if (areRoutesShown) {
                showTradeRoutes()
            }
            if (areProductionIconsShown) {
                showProductionIcons()
            }
        }
        prevZoom = map.getZoom();
    });

    //setInterval(render, 2000)
}

function reloadLegend() {
    // Empty out the current list
    $('#guild-list').empty();
    // Get data for new list
    var data = [];
    var pos = 0;
    let ownedterrs = 0;
    Guilds.forEach(g => {
        let name = g.name;
        let color = g.mapcolor
        let currPos = pos;
        data[currPos] = [name, color, 0, []];
        for (let i in Territories) {
            let owner = Territories[i];
            if (owner === name) {
                const resources = terrAllData[i]['resources']
                for (production in resources) {
                    data[currPos][3][production] = data[currPos][3][production] ? data[currPos][3][production] - -resources[production] : resources[production]
                }
                data[currPos][2]++;
                ownedterrs++;
            }
        }
        pos++;
    });
    // Add data to legend
    data.sort((a, b) => b[2] - a[2]);
    let ffas = Object.keys(territories).length - ownedterrs;
    $('#guild-list').append(`
      <div>
      <a href="javascript:void(0)" data-target="#FFA-terrs" data-toggle="collapse" aria-expanded="false" aria-controls="FFA-terrs">
            <span class="guild-color" style="background-color: #FFFFFF"></span>
            <span class="menu-text guild-name">FFA - ${ffas}</span>
        </a>
      </div>
      <div class="collapse" id="FFA-terrs">
          <ul id="FFA-terr-list">
          </ul>
       </div>
      `);
    let terrs = [];
    for (let i in Territories) {
        if (!Territories[i] || Territories[i] === '-') {
            terrs.push(i);
        }
    }
    terrs.sort();
    for (let terr of terrs) {
        $(`#FFA-terr-list`).append(`
            <li><span class="menu-text guild-name">${terr}</span></li>
            `);
    }
    data.forEach(d => {
        $('#guild-list').append(`
          <div>
            <a href="javascript:void(0)" data-target="#${d[0]}-terrs" data-toggle="collapse" aria-expanded="false" aria-controls="${d[0]}-terrs">
                <span class="guild-color" style="background-color: ${d[1]}"></span>
                <span class="menu-text guild-name">${d[0]} - ${d[2]}</span>
            </a>
            <div>
            <small style="color:lightgray">Emeralds: ${numberWithCommas(d[3].emeralds)}<br>Crops: ${numberWithCommas(d[3].crops)}<br>Fish: ${numberWithCommas(d[3].fish)}<br>Wood: ${numberWithCommas(d[3].wood)}<br>Ore: ${numberWithCommas(d[3].ore)}</small>
            </div>
          </div>
          <div class="collapse" id="${d[0]}-terrs">
            <ul id="${d[0]}-terr-list">
            </ul>
          </div>`);
        let terrs = [];
        for (let i in Territories) {
            if (Territories[i] === d[0]) {
                terrs.push(i);
            }
        }
        terrs.sort();
        for (let terr of terrs) {
            $(`#${d[0]}-terr-list`).append(`
              <li><span class="menu-text guild-name">${terr}</span></li>
              `);
        }
    })
}
function reloadMenu() {
    // Change menu to territory
    var terr = document.getElementById('currentTerritory');
    terr.innerText = selectedTerritory;
    if (selectedTerritory.length > 5) {
        terr.innerText = "Selected more than 5 territories";
    }
    if (selectedTerritory.length === 0) {
        terr.innerText = "Select 1 or more territory to edit";
        var terrSelector = document.getElementById('terr-select');
        terrSelector.style.visibility = 'hidden'
        return;
    }

    // Show options
    var terrSelector = document.getElementById('terr-select');
    terrSelector.style.visibility = 'visible'

    // Show correct options
    //var territoryToggle = document.getElementById('territory-toggle');
    var guildSelect = document.getElementById('guilds');
    // Clear guild select
    var length = guildSelect.options.length;
    for (i = length - 1; i >= 0; i--) {
        guildSelect.options[i] = null;
    }
    // Insert current guild select
    var currentOwner = undefined;
    try {
        currentOwner = Territories[selectedTerritory[0]];
    } catch (error) {

    }
    var opt = document.createElement('option');
    opt.appendChild(document.createTextNode('--'));
    opt.value = null;
    if (!currentOwner) opt.selected = true;
    guildSelect.appendChild(opt);
    for (let guild of Guilds) {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(guild.name));
        opt.value = guild.name;
        if (guild.name === currentOwner) opt.selected = true;
        guildSelect.appendChild(opt);
    }
    reloadLegend();
}

function exportMap() {
    var json = {
        territories: Territories,
        guilds: Guilds
    }
    // console.log(JSON.stringify(getCompressedTerrData()))
    // console.log(getCompressedString())
    console.log(window.location.origin + window.location.pathname + "#" + getCompressedString())
    var data = JSON.stringify(json);
    // console.log(window.location.origin + window.location.pathname + "#" + btoa(JSON.stringify(getCompressedTerrData())))
    var a = document.createElement("a");
    var file = new Blob([data], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'Map.json';
    a.click();
}

function importMap(evt) {
    var file = evt.target.files[0];

    var reader = new FileReader();
    reader.onload = function (file) {
        // Reset values
        Guilds = [];
        Territories = {};
        // Get data
        var data = JSON.parse(file.target.result);
        console.log(data);
        // Check if file is valid
        if (data.territories.length == 0 || !data.territories || !data.guilds) return alert('Error: Invalid map save file provided')
        // Change data in the html
        Territories = data.territories;
        // Change html
        let repeat = false;
        for (let i in data.guilds) {
            if (Guilds.filter(g => g.name === data.guilds[i].name)[0]) {
                repeat = true
            }
            else {
                Guilds.push(new Guild(data.guilds[i].name, data.guilds[i].mapcolor))
                updateSelects()
            }
        }
        if (repeat) alert("There are errors in your map file! We have attempted to fix them, but please make sure to check if anything went wrong.")
        render();
        location.hash = getCompressedString()
    }
    reader.readAsText(file);
}

function stringToColor(str) {
    var crc32 = function (r) { for (var a, o = [], c = 0; c < 256; c++) { a = c; for (var f = 0; f < 8; f++)a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1; o[c] = a } for (var n = -1, t = 0; t < r.length; t++)n = n >>> 8 ^ o[255 & (n ^ r.charCodeAt(t))]; return (-1 ^ n) >>> 0 };
    return "#" + (crc32(str).toString(16).substr(2, 8).length == 6 ? crc32(str).toString(16).substr(2, 8) : crc32(str).toString(16).substr(1, 7))
}

function pullApi() {
    var c = confirm('WARNING: This will remove all current data. To save, press the Export button.');
    if (!c) return;
    var apiLoading = document.getElementById('api-loading');
    apiLoading.innerText = 'Loading... (This may take a long time)\nFetching the territory list...';
    Territories = {};
    Guilds = [];
    $('#changeguild').empty().append('<option selected="selected" value="null">--</option>');
    $('#removeguild').empty().append('<option selected="selected" value="null">--</option>');

    fetch('https://api.wynncraft.com/public_api.php?action=territoryList')
        .then(res => res.json())
        .then(json => {
            let territories = json.territories;
            let guilds = [];
            let guildPrefixes = {};
            let guildFromPrefixe = {};
            let longest = 0;
            for (let i in territories) {
                apiLoading.innerText = 'Loading... (This may take a long time)\nProcessing data...'
                setTimeout(function () {
                    if (guildPrefixes[territories[i].guild]) {
                        Territories[i] = guildPrefixes[territories[i].guild]
                        return;
                    }
                    let found = false;
                    if (actual_JSON) {
                        for (let j = 0; j < actual_JSON["guild"].length; j++) {
                            if (actual_JSON["guild"][j] === territories[i].guild) {
                                Territories[i] = actual_JSON["tag"][j];
                                if (!guilds.includes(actual_JSON["tag"][j])) guilds.push(actual_JSON["tag"][j]);
                                if (!guildPrefixes[territories[i].guild]) guildPrefixes[territories[i].guild] = actual_JSON["tag"][j];
                                if (!guildFromPrefixe[actual_JSON["tag"][j]]) guildFromPrefixe[actual_JSON["tag"][j]] = territories[i].guild;
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        apiLoading.innerText = 'Loading... (This may take a long time)\nGuild missing in cache! Fetching Wynn API...'
                        longest++;
                        fetch(`https://api.wynncraft.com/public_api.php?action=guildStats&command=${territories[i].guild}`)
                            .then(res => res.json())
                            .then(json => {
                                Territories[i] = json.prefix;
                                if (!guilds.includes(json.prefix)) guilds.push(json.prefix);
                                if (!guildPrefixes[territories[i].guild]) guildPrefixes[territories[i].guild] = json.prefix;
                                if (!guildFromPrefixe[json.prefix]) guildFromPrefixe[json.prefix] = territories[i].guild;
                            })
                    }
                }, longest * 250)
            }
            setTimeout(function () {
                Guilds = [];
                guilds.forEach(g => {
                    Guilds.push(new Guild(g, colors[guildFromPrefixe[g]] ? colors[guildFromPrefixe[g]] : stringToColor(guildFromPrefixe[g])));
                });
                updateSelects()
                apiLoading.innerText = 'Loaded!';
                setTimeout(render, 2000);
                alert('Wynn API has finished loading. Feel free to change around colors and territories.')
                location.hash = getCompressedString()
            }, longest * 250 + 1000)
        })
}

function getData() {
    var Data;
    function callback(data) {
        console.log("Data obtained successfully");
        Data = data
        actual_JSON = data;
    }
    var jqxhr = $.getJSON("guildTags.json", callback);
    return Data;
}

function checkRectOverlap(rect1, rect2) {
    /*
     * Each array in parameter is one rectangle
     * in each array, there is an array showing the co-ordinates of two opposite corners of the rectangle
     * Example:
     * [[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]
     */

    //Check whether there is an x overlap
    if ((rect1[0][0] < rect2[0][0] && rect2[0][0] < rect1[1][0]) //Event that x3 is inbetween x1 and x2
        || (rect1[0][0] < rect2[1][0] && rect2[1][0] < rect1[1][0]) //Event that x4 is inbetween x1 and x2
        || (rect2[0][0] < rect1[0][0] && rect1[1][0] < rect2[1][0])) {  //Event that x1 and x2 are inbetween x3 and x4
        //Check whether there is a y overlap using the same procedure
        if ((rect1[0][1] < rect2[0][1] && rect2[0][1] < rect1[1][1]) //Event that y3 is between y1 and y2
            || (rect1[0][1] < rect2[1][1] && rect2[1][1] < rect1[1][1]) //Event that y4 is between y1 and y2
            || (rect2[0][1] < rect1[0][1] && rect1[1][1] < rect2[1][1])) { //Event that y1 and y2 are between y3 and y4
            return true;
        }
    }
    return false;
}

function render() {
    console.log("RENDERING");
    Object.keys(Territories).forEach(territory => {
        let guild = Territories[territory];
        if (!guild || guild === "-") {
            rectangles[territory].unbindTooltip();
            try {
                rectangles[territory].bindTooltip('<span class="territoryGuildName" style="color: #FFFFFF">FFA' + getProductionIconsHTML(territory) + '</span>', { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 })
            } catch (e) {
                console.error(e)
                console.log(territory)
            }
            rectangles[territory].setStyle({
                color: 'rgba(255,255,255,1)'
            });
        } else {
            for (let i in Guilds) {
                if (Guilds[i].name === guild) {
                    rectangles[territory].unbindTooltip();
                    rectangles[territory].bindTooltip('<span class="territoryGuildName" style="color: ' + Guilds[i].mapcolor + '">' + Guilds[i].name + getProductionIconsHTML(territory) + '</span>', { sticky: true, interactive: false, permanent: true, direction: 'center', className: 'territoryName', opacity: 1 })
                    rectangles[territory].setStyle({
                        color: Guilds[i].mapcolor,
                    });
                    break;
                }
            }
        }
    });
    if (!visible) changeVisibility();
    reloadLegend();
}

function getProductionIconsHTML(territory) {
    return `
    <div class="production-icons" style=${map.getZoom() <= 8 ? "visibility:hidden !important" : ""}>${terrAllData[territory]['resources'].emeralds > 9000 ? "💸" : ""}
    ${terrAllData[territory]['resources'].ore > 3600 ? "⛏" : ""}
    ${terrAllData[territory]['resources'].crops > 3600 ? "🌿" : ""}
    ${terrAllData[territory]['resources'].fish > 3600 ? "🐟" : ""}
    ${terrAllData[territory]['resources'].wood > 3600 ? "🪓" : ""}
    ${terrAllData[territory]['resources'].ore > 0 ? "⛏" : ""}
    ${terrAllData[territory]['resources'].crops > 0 ? "🌿" : ""}
    ${terrAllData[territory]['resources'].fish > 0 ? "🐟" : ""} 
    ${terrAllData[territory]['resources'].wood > 0 ? "🪓" : ""}</div>`
}

function changeVisibility() {
    Object.keys(Territories).forEach(territory => {
        rectangles[territory].unbindTooltip();
    });
}

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

function hideProductionIcons() {
    $('.production-icons').each(function (i, obj) {
        // obj.setAttribute("style", "display: none !important;    text-align: center;")
        obj.setAttribute("style", "visibility: hidden !important;")
    });
}

function showProductionIcons() {
    $('.production-icons').each(function (i, obj) {
        // obj.setAttribute("style", "display: flex !important;   text-align: center;")
        obj.setAttribute("style", "visibility: visible !important;")
    });
}

function numberWithCommas(x) {
    if (typeof (x) == "undefined")
        return "0"
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateSelects() {
    let selects = []
    selects.push(document.getElementById("changeguild"))
    selects.push(document.getElementById("removeguild"))
    selects.push(document.getElementById("guilds"))
    for (select of selects) {
        select.options.length = 0;
        let option = document.createElement("option");
        option.text = "--"
        select.add(option)
        for (guild in Guilds) {
            let option = document.createElement("option");
            option.text = Guilds[guild].name
            select.add(option)
        }
    }
}


function toggleRectangleSelect() {
    rectangleselect = !rectangleselect;
    if (rectangleselect) {
        $("#toggle-rectangle-select").removeClass("btn-primary")
        $("#toggle-rectangle-select").addClass("btn-success")
    } else {
        $("#toggle-rectangle-select").removeClass("btn-success")
        $("#toggle-rectangle-select").addClass("btn-primary")
    }
}

const territoriesForCompression = ["Ragni", "Emerald Trail", "Ragni North Entrance", "Ragni North Suburbs", "Ragni Plains", "Maltic Coast", "Maltic Plains", "Pigmen Ravines Entrance", "South Pigmen Ravines", "Time Valley", "Sanctuary Bridge", "Elkurn Fields", "Nivla Woods", "South Nivla Woods", "Elkurn", "Corrupted Road", "Detlas Far Suburbs", "Detlas Close Suburbs", "South Farmers Valley", "Arachnid Route", "Tower of Ascension", "Mage Island", "Twain Mansion", "Nesaak Plains South East", "Nesaak Plains North East", "Nesaak Plains Upper North West", "Nesaak Bridge Transition", "Great Bridge Nesaak", "Jungle Lower", "Jungle Upper", "Temple of Legends", "Rymek East Lower", "Rymek East Upper", "Rymek West Mid", "Desert East Upper", "Desert East Lower", "Desert Mid-Upper", "Desert Lower", "Mummy's Tomb", "Desert West Lower", "Savannah East Upper", "Savannah West Upper", "Lion Lair", "Plains Coast", "Nemract Plains West", "Ancient Nemract", "Cathedral Harbour", "Rooster Island", "Selchar", "Durum Isles Upper", "Durum Isles Lower", "Skiens Island", "Nodguj Nation", "Dead Island South East", "Dead Island South West", "Volcano Upper", "Tree Island", "Ternaves Plains Upper", "Mining Base Upper", "Nesaak Transition", "Nether Plains Lower", "Mine Base Plains", "Nether Plains Upper", "Detlas Trail West Plains", "Llevigar Gate East", "Llevigar Farm Plains East", "Hive", "Llevigar Plains East Lower", "Llevigar Plains West Upper", "Swamp West Lower", "Swamp East Mid", "Swamp West Mid-Upper", "Swamp West Upper", "Swamp Dark Forest Transition Lower", "Swamp Dark Forest Transition Upper", "Entrance to Olux", "Swamp Mountain Base", "Swamp Mountain Transition Lower", "Swamp Mountain Transition Mid-Upper", "Quartz Mines South West", "Quartz Mines North West", "Sunspark Camp", "Orc Road", "Sablestone Camp", "Iron Road", "Llevigar Farm", "Goblin Plains East", "Leadin Fortress", "Efilim Village", "Efilim East Plains", "Light Forest North Entrance", "Light Forest South Entrance", "Light Forest South Exit", "Light Forest West Lower", "Light Forest West Upper", "Light Forest East Mid", "Hobbit River", "Light Forest Canyon", "Lone Farmstead", "Gelibord Corrupted Farm", "Taproot Descent", "Fortress South", "Twisted Housing", "Viscera Pits West", "Abandoned Manor", "Kander Mines", "Viscera Pits East", "Old Crossroads South", "Lexdale", "Decayed Basin", "Cinfras Entrance", "Fallen Village", "Guild Hall", "Cinfras's Small Farm", "Cinfras County Mid-Lower", "Cinfras County Upper", "Gylia Lake South West", "Gylia Lake North East", "Jitak's Farm", "Aldorei Valley Mid", "Aldorei's River", "Aldorei's North Exit", "Path To The Arch", "Burning Farm", "Cinfras Thanos Transition", "Path To Thanos", "Military Base", "Military Base Lower", "Path To Ozoth's Spire Mid", "Bandit Cave Lower", "Canyon Entrance Waterfall", "Canyon Path South East", "Canyon Upper North West", "Canyon Path South West", "Bandit Camp Exit", "Thanos Valley West", "Canyon Walk Way", "Canyon Mountain South", "Canyon Fortress", "Canyon Dropoff", "Bandits Toll", "Mountain Path", "Cliff Side of the Lost", "Temple of the Lost East", "Hive South", "Cliffside Waterfall", "Air Temple Lower", "Cliffside Lake", "Kandon-Beda", "Cliffside Passage", "Entrance to Thesead North", "Chained House", "Ranol's Farm", "Thesead", "Eltom", "Lava Lake", "Crater Descent", "Volcanic Slope", "Temple Island", "Dernel Jungle Lower", "Dernel Jungle Upper", "Corkus Castle", "Fallen Factory", "Corkus City Mine", "Factory Entrance", "Corkus Forest North", "Avos Workshop", "Corkus Countryside", "Ruined Houses", "Avos Temple", "Corkus Outskirts", "Sky Castle", "Path to Ahmsord Upper", "Old Coal Mine", "Astraulus' Tower", "Ahmsord Outskirts", "Angel Refuge", "Central Islands", "Sky Falls", "Raider's Base Lower", "Jofash Docks", "Lusuco", "Phinas Farm", "Cinfras Outskirts", "Llevigar", "Herb Cave", "Icy Island", "Fleris Trail", "Abandoned Pass", "Southern Outpost", "Corkus Sea Cove", "The Broken Road", "Grey Ruins", "Forest of Eyes", "Lutho", "Toxic Drip", "Gateway to Nothing", "Final Step", "The Gate", "Luminous Plateau", "Primal Fen", "Otherwordly Monolith", "Nexus of Light", "Ragni Main Entrance", "Katoa Ranch", "Coastal Trail", "Plains", "Little Wood", "Road to Time Valley", "Nivla Woods Exit", "Road to Elkurn", "Detlas Suburbs", "North Farmers Valley", "Half Moon Island", "Bob's Tomb", "Nesaak Plains Lower North West", "Nesaak Plains Mid North West", "Jungle Mid", "City of Troms", "Rymek West Lower", "Desert East Mid", "Desert Mid-Lower", "Desert West Upper", "Savannah West Lower", "Nemract Town", "Nemract Plains East", "The Bear Zoo", "Durum Isles Center", "Pirate Town", "Dead Island North East", "Maro Peaks", "Ternaves", "Mining Base Lower", "Plains Lake", "Detlas Trail East Plains", "Llevigar Gate West", "Cinfras", "Llevigar Plains East Upper", "Swamp West Mid", "Swamp East Upper", "Swamp Lower", "Swamp Plains Basin", "Swamp Mountain Transition Upper", "Quartz Mines North East", "Meteor Crater", "Goblin Plains West", "Pre-Light Forest Transition", "Efilim South Plains", "Light Forest Entrance", "Light Forest North Exit", "Light Forest East Upper", "Mantis Nest", "Gelibord", "Fortress North", "Lexdales Prison", "Mesquis Tower", "Dark Forest Village", "Fungal Grove", "Mushroom Hill", "Aldorei Valley South Entrance", "Cinfras County Mid-Upper", "Gylia Lake North West", "Aldorei Valley Lower", "Aldorei's Waterfall", "Ghostly Path", "Thanos", "Military Base Upper", "Path To Ozoth's Spire Upper", "Canyon Path North West", "Canyon Lower South East", "Canyon Valley South", "Canyon Mountain East", "Canyon Survivor", "Wizard Tower North", "Valley of the Lost", "Canyon High Path", "Air Temple Upper", "Kandon Farm", "Entrance to Thesead South", "Thesead Suburbs", "Molten Heights Portal", "Active Volcano", "Snail Island", "Corkus City", "Road To Mine", "Corkus Forest South", "Corkus Docks", "Corkus Statue", "Frozen Fort", "Kandon Ridge", "Molten Reach", "Wybel Island", "Raider's Base Upper", "Santa's Hideout", "Aldorei Lowlands", "Regular Island", "Royal Gate", "Lost Atoll", "The Silent Road", "Forgotten Town", "Paths of Sludge", "Void Valley", "Heavenly Ingress", "Azure Frontier", "Nivla Woods Entrance", "Maltic", "Abandoned Farm", "North Nivla Woods", "Detlas", "Twain Lake", "Nesaak Village", "Jungle Lake", "Rymek West Upper", "Almuj City", "Bremminglar", "Nemract Cathedral", "Durum Isles East", "Dead Island North West", "Ternaves Plains Lower", "Detlas Savannah Transition", "Llevigar Farm Plains West", "Swamp East Lower", "Swamp Dark Forest Transition Mid", "Swamp Mountain Transition Mid", "Orc Lake", "Forgotten Path", "Efilim South East Plains", "Light Forest West Mid", "Path to Cinfras", "Mansion of Insanity", "Path to Talor", "Heart of Decay", "Cinfras County Lower", "Gert Camp", "Aldorei's Arch", "Path To Military Base", "Bandit Cave Upper", "Canyon Path North Mid", "Canyon Waterfall Mid North", "Mountain Edge", "Cliffside Valley", "Cliffside Passage North", "Entrance to Rodoroc", "Ahmsord", "Corkus City South", "Corkus Mountain", "Bloody Beach", "Dragonling Nests", "Sky Island Ascent", "Icy Descent", "Twisted Ridge", "Lighthouse Plateau", "Sinister Forest", "Bizarre Passage", "Path to Light", "Ragni East Suburbs", "Nemract Quarry", "Nivla Woods Edge", "Great Bridge Jungle", "Desert Upper", "Nemract Road", "Dujgon Nation", "Desolate Valley", "Llevigar Plains West Lower", "Olux", "Loamsprout Camp", "Aldorei Valley West Entrance", "Gelibord Castle", "Old Crossroads North", "Gylia Lake South East", "Burning Airship", "Canyon Waterfall North", "Thanos Exit Upper", "Canyon Of The Lost", "Lava Lake Bridge", "Legendary Island", "Path to Ahmsord Lower", "Jofash Tunnel", "Orc Battlegrounds", "Toxic Caves", "Pigmen Ravines", "Nesaak Plains South West", "Savannah East Lower", "Volcano Lower", "Swamp East Mid-Upper", "Road To Light Forest", "Entrance to Kander", "Aldorei Valley Upper", "Thanos Exit", "Cherry Blossom Forest", "Corkus Sea Port", "Rodoroc", "Field of Life", "Nether Gate", "Zhight Island", "Quartz Mines South East", "Dark Forest Cinfras Transition", "Krolton's Cave", "Swamp Island", "Rymek East Mid", "Light Forest East Lower", "Dernel Jungle Mid", "Llevigar Entrance", "Worm Tunnel", "Path To Ozoth's Spire Lower", "Light Peninsula"]
const territoryIdForCompression = ["ao", "ap", "aq", "ar", "as", "at", "au", "av", "aw", "ax", "ay", "az", "aO", "aP", "aQ", "aR", "aS", "aT", "aU", "aV", "aW", "aX", "aY", "aZ", "bo", "bp", "bq", "br", "bs", "bt", "bu", "bv", "bw", "bx", "by", "bz", "bO", "bP", "bQ", "bR", "bS", "bT", "bU", "bV", "bW", "bX", "bY", "bZ", "co", "cp", "cq", "cr", "cs", "ct", "cu", "cv", "cw", "cx", "cy", "cz", "cO", "cP", "cQ", "cR", "cS", "cT", "cU", "cV", "cW", "cX", "cY", "cZ", "do", "dp", "dq", "dr", "ds", "dt", "du", "dv", "dw", "dx", "dy", "dz", "dO", "dP", "dQ", "dR", "dS", "dT", "dU", "dV", "dW", "dX", "dY", "dZ", "eo", "ep", "eq", "er", "es", "et", "eu", "ev", "ew", "ex", "ey", "ez", "eO", "eP", "eQ", "eR", "eS", "eT", "eU", "eV", "eW", "eX", "eY", "eZ", "fo", "fp", "fq", "fr", "fs", "ft", "fu", "fv", "fw", "fx", "fy", "fz", "fO", "fP", "fQ", "fR", "fS", "fT", "fU", "fV", "fW", "fX", "fY", "fZ", "go", "gp", "gq", "gr", "gs", "gt", "gu", "gv", "gw", "gx", "gy", "gz", "gO", "gP", "gQ", "gR", "gS", "gT", "gU", "gV", "gW", "gX", "gY", "gZ", "ho", "hp", "hq", "hr", "hs", "ht", "hu", "hv", "hw", "hx", "hy", "hz", "hO", "hP", "hQ", "hR", "hS", "hT", "hU", "hV", "hW", "hX", "hY", "hZ", "io", "ip", "iq", "ir", "is", "it", "iu", "iv", "iw", "ix", "iy", "iz", "iO", "iP", "iQ", "iR", "iS", "iT", "iU", "iV", "iW", "iX", "iY", "iZ", "jo", "jp", "jq", "jr", "js", "jt", "ju", "jv", "jw", "jx", "jy", "jz", "jO", "jP", "jQ", "jR", "jS", "jT", "jU", "jV", "jW", "jX", "jY", "jZ", "ko", "kp", "kq", "kr", "ks", "kt", "ku", "kv", "kw", "kx", "ky", "kz", "kO", "kP", "kQ", "kR", "kS", "kT", "kU", "kV", "kW", "kX", "kY", "kZ", "lo", "lp", "lq", "lr", "ls", "lt", "lu", "lv", "lw", "lx", "ly", "lz", "lO", "lP", "lQ", "lR", "lS", "lT", "lU", "lV", "lW", "lX", "lY", "lZ", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "mO", "mP", "mQ", "mR", "mS", "mT", "mU", "mV", "mW", "mX", "mY", "mZ", "Ao", "Ap", "Aq", "Ar", "As", "At", "Au", "Av", "Aw", "Ax", "Ay", "Az", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ", "Bo", "Bp", "Bq", "Br", "Bs", "Bt", "Bu", "Bv", "Bw", "Bx", "By", "Bz", "BO", "BP", "BQ", "BR", "BS", "BT", "BU", "BV", "BW", "BX", "BY", "BZ", "Co", "Cp", "Cq", "Cr", "Cs", "Ct", "Cu", "Cv", "Cw", "Cx", "Cy", "Cz", "CO", "CP", "CQ", "CR", "CS", "CT", "CU", "CV", "CW", "CX", "CY", "CZ", "Do", "Dp", "Dq", "Dr", "Ds", "Dt", "Du", "Dv", "Dw", "Dx", "Dy", "Dz", "DO", "DP", "DQ", "DR", "DS", "DT", "DU", "DV", "DW", "DX", "DY", "DZ", "Eo", "Ep", "Eq", "Er", "Es", "Et", "Eu", "Ev", "Ew", "Ex", "Ey", "Ez", "EO", "EP", "EQ", "ER", "ES", "ET", "EU", "EV", "EW", "EX", "EY", "EZ", "Fo", "Fp", "Fq", "Fr", "Fs", "Ft", "Fu", "Fv", "Fw", "Fx", "Fy", "Fz", "FO", "FP", "FQ", "FR", "FS", "FT", "FU", "FV", "FW", "FX", "FY", "FZ", "Go", "Gp", "Gq", "Gr", "Gs", "Gt", "Gu", "Gv", "Gw", "Gx", "Gy", "Gz", "GO", "GP", "GQ", "GR", "GS", "GT", "GU", "GV", "GW", "GX", "GY", "GZ", "Ho", "Hp", "Hq", "Hr", "Hs", "Ht", "Hu", "Hv", "Hw", "Hx", "Hy", "Hz", "HO", "HP", "HQ", "HR", "HS", "HT", "HU", "HV", "HW", "HX", "HY", "HZ", "Io", "Ip", "Iq", "Ir", "Is", "It", "Iu", "Iv", "Iw", "Ix", "Iy", "Iz", "IO", "IP", "IQ", "IR", "IS", "IT", "IU", "IV", "IW", "IX", "IY", "IZ", "Jo", "Jp", "Jq", "Jr", "Js", "Jt", "Ju", "Jv", "Jw", "Jx", "Jy", "Jz", "JO", "JP", "JQ", "JR", "JS", "JT", "JU", "JV", "JW", "JX", "JY", "JZ", "Ko", "Kp", "Kq", "Kr", "Ks", "Kt", "Ku", "Kv", "Kw", "Kx", "Ky", "Kz", "KO", "KP", "KQ", "KR", "KS", "KT", "KU", "KV", "KW", "KX", "KY", "KZ", "Lo", "Lp", "Lq", "Lr", "Ls", "Lt", "Lu", "Lv", "Lw", "Lx", "Ly", "Lz", "LO", "LP", "LQ", "LR", "LS", "LT", "LU", "LV", "LW", "LX", "LY", "LZ", "Mo", "Mp", "Mq", "Mr", "Ms", "Mt", "Mu", "Mv", "Mw", "Mx", "My", "Mz", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ"]

function getCompressedTerrData() {
    let tmpObj = {}
    for (terr in Territories) {
        if (typeof (tmpObj[Territories[terr]]) == "undefined") {
            tmpObj[Territories[terr]] = [territoriesForCompression.indexOf(terr)]
        } else {
            tmpObj[Territories[terr]].push(territoriesForCompression.indexOf(terr))
        }
    }
    for (guild of Guilds) {
        if (typeof (tmpObj[guild.name]) != "undefined") {
            tmpObj[guild.name].push(guild.mapcolor)
        }
    }
    return tmpObj
}

function getCompressedString() {
    tmpStr = ""
    compressedData = getCompressedTerrData()
    for (guild in compressedData) {
        tmpStr += "+" + guild + "-" + ((typeof (compressedData[guild].slice(-1)[0])) == "string" ? compressedData[guild].pop().substr(1) : "FFFFFF") + "="
        for (terr of compressedData[guild]) {
            tmpStr += territoryIdForCompression[terr]
        }
    }
    return tmpStr
}


function deCompressTerritoryString(compressedString) {
    let guildsData = []
    let territoryData = {}
    try {

        for (rawGuildString of compressedString.split("+").filter(s => { return s != "" })) {
            let guildName = rawGuildString.split("-")[0]
            let guildColor = "#" + rawGuildString.split("-")[1].split("=")[0]
            if (guildName != "null" && guildName != "--") {
                guildsData.push({ "name": guildName, "mapcolor": guildColor })
            }
            for (terrId of rawGuildString.split("-")[1].split("=")[1].match(/.{1,2}/g)) {
                territoryData[territoriesForCompression[territoryIdForCompression.indexOf(terrId)]] = (guildName == "null" ? null : guildName)
            }
        }
    } catch (e) {
        return { "territories": {}, "guilds": [] }
    }
    return { "territories": territoryData, "guilds": guildsData }
}

function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function copyMapLink() {
    fetch(keyValueUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'text/plain'
        },
        body: getCompressedString()
    }).then(response => {
        if (response.ok) {
            return response.json()
        } else {
            alert("Something went wrong getting short link")
        }
    }).then(data => {
        copyToClipboard(window.location.origin + window.location.pathname + "#" + data)
        alert("Copied link to clipboard!")
    })


}
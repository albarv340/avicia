var Territories = [];
var Guilds = [];
let rectangles = [];
var selectedTerritory = [];
var actual_JSON;
var markers = [];
var map;
var rectangleselect = false;
var visible = true;
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

$(document).ready(function () {
    // Help popup
    $(function () {
        $('#help').popover({
            trigger: 'focus'
        })
    })
    // Inittialize controls
    $('body').bind('keypress', function (e) {
        if (e.target.id === "name") return;
        if (e.which == 32) {
            toggleMenu();
        }
        else if (e.key == "h") {
            visible = !visible;
            if (visible) render();
            else changeVisibility();
        } else if (e.key == "l") {
            toggleLegend();
        }

    })
    // Initialize map
    var realButton = document.getElementById('file-button');
    var importButton = document.getElementById('import-button');
    let undoButton = document.getElementById('undo-button');
    let redoButton = document.getElementById('redo-button');

    importButton.addEventListener('click', function () {
        realButton.click();
        realButton.addEventListener('change', importMap, false);
    });
    undoButton.addEventListener('click', function () {
        if (undoTerritoryBackup.length > 0) {
            redoTerritoryBackup.push($.extend(true, [], Territories))
            Territories = $.extend(true, [], undoTerritoryBackup.pop())
            render()
        } else {
            alert("Nothing to undo!")
        }
    });
    redoButton.addEventListener('click', function () {
        if (redoTerritoryBackup.length > 0) {
            undoTerritoryBackup.push($.extend(true, [], Territories))
            Territories = $.extend(true, [], redoTerritoryBackup.pop())
            render()
        } else {
            alert("Nothing to redo!")
        }
    });
    actual_JSON = getData();
    run();

    for (guild in defaultGuilds) {
        Guilds.push(new Guild(guild, defaultGuilds[guild]))
    }
});

class Guild {
    constructor(name, color) {
        this.name = name;
        this.mapcolor = color;
        let option1 = document.createElement("option");
        let option2 = document.createElement("option");
        var select1 = document.getElementById("changeguild");
        var select2 = document.getElementById("removeguild");
        option1.text = name;
        option2.text = name;
        select1.add(option1);
        select2.add(option2);
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
    select.remove(select.selectedIndex);
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
        selectedTerritory = [];
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
    guildSelect.addEventListener('change', function () {
        undoTerritoryBackup.push($.extend(true, [], Territories))
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
    });
    // initializing map
    let bounds = [];
    let images = [];

    map = L.map("map", {
        crs: L.CRS.Simple,
        minZoom: 6,
        maxZoom: 10,
        zoomControl: false,
        zoom: 8,
        preferCanvas: true,
        markerZoomAnimation: false,
        inertia: false
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
                    { color: "rgb(0, 0, 0, 0)", weight: 2 })
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
                                let polyline = L.polyline([rectangles[rectangle].getCenter(), rectangles[route].getCenter()], { color: 'rgba(0,0,0,0)' })
                                tradingRoutes[rectangle] ? tradingRoutes[rectangle].push(polyline) : tradingRoutes[rectangle] = [polyline]
                                polyline.addTo(map)
                            }
                        } catch (e) {
                            console.error(e)
                            console.log(rectangle)
                        }
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
            showTradeRoutes()
            showProductionIcons()
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
    let ffas = territories.length - ownedterrs;
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
        var enableButton = document.getElementById('enable-button');
        var terrSelector = document.getElementById('terr-select');
        enableButton.style.visibility = 'hidden'
        terrSelector.style.visibility = 'hidden'
        return;
    }

    // Show options
    var enableButton = document.getElementById('enable-button');
    var terrSelector = document.getElementById('terr-select');
    enableButton.style.visibility = 'visible'
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
    console.log(json)
    var data = JSON.stringify(json);
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
        Territories = [];
        // Get data
        var data = JSON.parse(file.target.result);
        console.log(data);
        // Check if file is valid
        if (!data.territories || !data.guilds) return alert('Error: Invalid map save file provided')
        // Change data in the html
        Territories = data.territories;
        // Change html
        let repeat = false;
        for (let i in data.guilds) {
            if (Guilds.filter(g => g.name === data.guilds[i].name)[0]) repeat = true
            else Guilds.push(new Guild(data.guilds[i].name, data.guilds[i].mapcolor))
        }
        if (repeat) alert("There are errors in your map file! We have attempted to fix them, but please make sure to check if anything went wrong.")
        render();
    }
    reader.readAsText(file);
}

function stringToColor(str) {
    var crc32 = function (r) { for (var a, o = [], c = 0; c < 256; c++) { a = c; for (var f = 0; f < 8; f++)a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1; o[c] = a } for (var n = -1, t = 0; t < r.length; t++)n = n >>> 8 ^ o[255 & (n ^ r.charCodeAt(t))]; return (-1 ^ n) >>> 0 };
    return "#" + crc32(str).toString(16).substr(2, 8)
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
                apiLoading.innerText = 'Loaded!';
                setTimeout(render, 2000);
                alert('Wynn API has finished loading. Feel free to change around colors and territories.')
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
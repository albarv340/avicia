function stringToColor(str) {
  var crc32 = function (r) { for (var a, o = [], c = 0; c < 256; c++) { a = c; for (var f = 0; f < 8; f++)a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1; o[c] = a } for (var n = -1, t = 0; t < r.length; t++)n = n >>> 8 ^ o[255 & (n ^ r.charCodeAt(t))]; return (-1 ^ n) >>> 0 };
  let hexcode = crc32(str).toString(16).slice(-6)
  return "#" + (hexcode.length == 6 ? hexcode : hexcode.padEnd(6, "0"))
}

function secondsSince(date) {
  var now = new Date();
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  return (utc - new Date(date)) / 1000;
}

function copyToClipboard(str) {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function alertMessage(message) {
  document.getElementById("alert-message").innerHTML = message
  document.getElementById("alert-message-container").style.display = "flex"
  setTimeout(() => {
    document.getElementById("alert-message-container").style.display = "none"
  }, 1500);
}

async function run() {

  // initializing map
  let bounds = [];
  let images = [];

  const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: 6,
    maxZoom: 10,
    zoomControl: false,
    zoom: 8,
    preferCanvas: true,
    markerZoomAnimation: false,
    inertia: false
  });

  L.control.zoom({
    position: 'topright'
  }).addTo(map);

  map.fitBounds([[0, -4], [6, 2]]);

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      bounds.push([[a * 2, (2 * b) - 4], [(a + 1) * 2, (2 * (b + 1)) - 4]])
    }
  }
  bounds.push([[6, -2], [8, 0]])
  bounds.push([[-2, 0], [0, 2]])
  // bounds.push([[6, 0], [8, 2]])

  for (let bound of bounds) {
    images.push(L.imageOverlay(`./public/tiles/${bound[0][1]}/${bound[0][0]}.webp`,
      bound, {}
    ));
  }

  for (let image of images) {
    image.addTo(map);
  }

  //initializing variables
  let guildTerritories = [];
  let rectangles = [];
  let previousOwner = []
  let cdRectangles = [];
  let guilds = [];
  let territoryCount = []
  let leaderboard = [];
  let terrCds = [];
  let tradingRoutes = []
  let terrAllData = [];
  let prefixes = localStorage.getItem("prefixes") ? JSON.parse(localStorage.getItem("prefixes")) : { "None": null };
  let prevZoom = 7;
  let refresh = 30;
  let initialLoad = true;
  let areTooltipsVisible = false;
  let mouseX = 0;
  let mouseZ = 0;
  const cooldownTimer = 600;
  let colors = {
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
    "Emorians": "#6666ff",
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
    "ShadowFall": "#67178a",
    "Aequitas": "#ffd700",
    "the Avos": "#1010FF",
    "Upsilon": "#321e3b",
    "infilak": "#2dd6a6",
    "Doki Doki Literature Club": "#c2b039",
    "Nefarious Ravens": "#7111cc",
    "Profession Heaven": "#73e5ff"
  }
  //grabbing options elements
  let slider = document.getElementById("rate-option");
  let output = document.getElementById("rate-display");
  output.innerHTML = slider.value;

  let checkboxTerritory = document.getElementById("territory-toggle");
  let checkboxNames = document.getElementById("territory-names");
  let checkboxGuilds = document.getElementById("territory-guilds");
  let checkboxTradingRoutes = document.getElementById("trading-routes");
  let checkboxTimeHeld = document.getElementById("time-held");


  let territoryToggle = localStorage.getItem("checkboxTerritory") ? localStorage.getItem("checkboxTerritory") === 'true' : true;
  let territoryNames = localStorage.getItem("checkboxNames") ? localStorage.getItem("checkboxNames") === 'true' : false;
  let guildNames = localStorage.getItem("checkboxGuilds") ? localStorage.getItem("checkboxGuilds") === 'true' : true;
  let showTimeHeld = localStorage.getItem("checkboxTimeHeld") ? localStorage.getItem("checkboxTimeHeld") === 'true' : false;

  checkboxTerritory.checked = territoryToggle;
  checkboxNames.checked = territoryNames;
  checkboxGuilds.checked = guildNames;
  checkboxTimeHeld.checked = showTimeHeld;

  let counter = refresh
  document.getElementById("countdown").innerHTML = counter;

  slider.onmouseup = function () {
    refresh = this.value;
    update()
    output.innerHTML = this.value;
  }

  checkboxTerritory.oninput = function () {
    territoryToggle = this.checked;
    localStorage.setItem("checkboxTerritory", this.checked + "");
    render();
  }

  checkboxNames.oninput = function () {
    territoryNames = this.checked
    localStorage.setItem("checkboxNames", this.checked + "");
    update(true);
    render();
  }

  checkboxGuilds.oninput = function () {
    guildNames = this.checked
    localStorage.setItem("checkboxGuilds", this.checked + "");
    update(true);
    render();
  }

  checkboxTradingRoutes.oninput = function () {
    localStorage.setItem("checkboxTradingRoutes", this.checked + "");
    this.checked ? showTradeRoutes() : hideTradeRoutes()
  }

  checkboxTimeHeld.oninput = function () {
    showTimeHeld = this.checked
    localStorage.setItem("checkboxTimeHeld", this.checked + "");
    update(true);
    render();
  }



  //setting up territories
  fetch("./territories.json")
    .then(response =>
      response.json())
    .then(json => {
      for (let territory in json['territories']) {
        let location = json['territories'][territory].location
        let bounds = [[location.startY * -.001, location.startX * .001], [location.endY * -.001, location.endX * .001]]
        let rectangle = L.rectangle(bounds,
          {
            color: "rgb(0, 0, 0, 0)", weight: 2, pane: "markerPane"
          })

        rectangle.bindTooltip("", {
          className: "guild-name",
          permanent: true,
          direction: "center"
        }).openTooltip();

        rectangle.bindPopup("Loading...")
        rectangle.on("popupopen", function (ev) {
          setPopupContent(guildTerritories[territory]['guild'], territory)
          if (showTimeHeld) setContent(guildTerritories[territory]['guild'], territory, true);
        });



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
      update();
      let storedColors = localStorage.getItem("colors")
      if (storedColors == null) {
        localStorage.setItem("colors", JSON.stringify(colors));
      }
      else {
        colors = JSON.parse(storedColors);
      }
      getColors();
    });


  //calling wynn API every refresh seconds to check territory ownership
  let updateTimout = null
  function update(hardUpdate = false) {
    counter = refresh;
    fetch("https://api.wynncraft.com/public_api.php?action=territoryList")
      .then(response => response.json())
      .then(json => json["territories"])
      .then(territories => {
        try {

          render();
          Object.assign(guildTerritories, territories);
          if (Object.keys(territoryCount).length > 0) {
            territoryCount = []
          }
          if (typeof (terrAllData["Ragni"]) == "undefined") {
            setTimeout(() => {
              update(true);
            }, 200);
          }
          for (let territory of Object.keys(rectangles)) {
            setContent(guildTerritories[territory]["guild"], territory, hardUpdate);
            territoryCount[guildTerritories[territory]["guild"]] ? territoryCount[guildTerritories[territory]["guild"]]++ : territoryCount[guildTerritories[territory]["guild"]] = 1;
          }
        } catch (e) {
          console.error(e)
        }
        setTimeout(() => {
          if (map.getZoom() >= 8)
            showTooltips()
          updateLeaderboard()
        }, 1000);
        clearTimeout(updateTimout)
        updateTimout = setTimeout(_ => { console.log("Updating..."); update(); }, (refresh * 1000));
      }).catch(error => {
        console.error(error)
        clearTimeout(updateTimout)
        updateTimout = setTimeout(_ => { console.log("Updating..."); update(); }, (refresh * 1000));
      })
  }


  async function getGuilds(callback) {
    let url = 'https://api.wynncraft.com/public_api.php?action=statsLeaderboard&type=guild&timeframe=all';
    let obj = null;

    try {
      obj = await (await fetch(url)).json();
    } catch (e) {
      console.error(e);
    }
    res = []
    try {
      for (guild of obj.data) {
        res[guild.name] = guild
        prefixes[guild.name] = guild.prefix;
      }
      localStorage.setItem("prefixes", JSON.stringify(prefixes))
    } catch (e) {
      console.error(e)
    }
    callback(res)
    return res
  }

  async function getColors() {
    let url = "https://script.googleusercontent.com/macros/echo?user_content_key=1pn89A-6PcqCU0XbVSbtW3K2Dvdg5w613yopuRKugfw7NEIWmxeeZ_3QBaoHZ-AYNtHv2yQvMA_72B9rSRzEKVZyMiywn0pkm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnMl-QtOriP-1pEgb03w7kqa_7bKx4e_UGi8MDjl3NoU1XeM0XHfmOSfpysJqWYby8qKKesUYD1MSFb_502AQXJrnRfqXRCrqsA&lib=MrEX5pRl-n6fGBE1Px8iVhCMNGS6H3WL4";

    let obj = null;

    try {
      obj = await (await fetch(url)).json();
      colors = obj;
    } catch (e) {
      console.log('error');
    }
    localStorage.setItem("colors", JSON.stringify(colors));
    update();
  }

  //rendering territories based on territory location, ownership, and settings. also updates leaderboard div
  async function render() {
    await getGuilds(function (res) {
      for (g in res) {
        guilds[g] = res[g]
      }
      Object.keys(guildTerritories).forEach(territory => {
        let guild = guildTerritories[territory]["guild"];
        // console.log(guild)
        if (guild == null) guild = "None";
        if (!(Object.keys(colors).includes(guild))) {
          colors[guild] = stringToColor(guild)
        }
        if (!(Object.keys(prefixes).includes(guild))) {
          fetch(`https://api-legacy.wynncraft.com/public_api.php?action=guildStats&command=${guild.replaceAll(/ /g, "%20")}`)
            .then(response => response.json())
            .then(json => {
              guilds[guild] = json;
              prefixes[guild] = json.prefix;
              localStorage.setItem("prefixes", JSON.stringify(prefixes))
            })
            .then(_ => {
              setContent(guild, territory);

              if (territoryToggle) {
                rectangles[territory].setStyle({
                  color: colors[guild],
                })
              } else {
                rectangles[territory].setStyle({
                  color: 'rgba(0,0,0,0)'
                })
              }

            });

        } else {
          if (territoryToggle) {
            try {
              rectangles[territory].setStyle({
                color: colors[guild],
              })
            } catch (e) {
              console.log(territory)
              console.error(e)
            }
          } else {
            rectangles[territory].setStyle({
              color: 'rgba(0,0,0,0)'
            })
            setContent(guild, territory);
          }
        }

      });
    })

  }

  tick()

  function tick() {
    setTimeout(_ => {
      tick()
    }, 1000)

    counter -= 1;
    document.getElementById("countdown").innerHTML = counter;
    Object.keys(cdRectangles).forEach(territory => {
      setContent(guildTerritories[territory]["guild"], territory, showTimeHeld)
      try {
        if (cdRectangles[territory] ? cdRectangles[territory].isPopupOpen() : false) {
          setPopupContent(guildTerritories[territory]["guild"], territory)
        }
      } catch (e) {
        console.error(e)
      }
    })
  }

  //on zoom end, update map based on zoom
  map.on('zoomend', _ => {
    console.log(map.getZoom())
    if (map.getZoom() <= 8) {
      hideTradeRoutes()
      if (areTooltipsVisible && map.getZoom() != 8)
        hideTooltips()
      hideProductionIcons()
      hideTimeHelds()
    } else if (map.getZoom() >= 8) {
      showTooltips()
      showTimeHelds()
      showProductionIcons()
      if (checkboxTradingRoutes.checked) {
        showTradeRoutes()
      }
    }
    if (map.getZoom() == 8) {
      showTooltips()
      hideProductionIcons()
    }
    prevZoom = map.getZoom();
  })

  //sets tooltip and popup content
  function setContent(guild, territory, hardUpdate = false) {
    let tooltip = "<div>"
    let prefix = ""
    try {
      prefix = prefixes[guild] ? prefixes[guild] : guild

      if (prefix == null) {
        prefix = "None"
      }
    } catch (e) {
      console.error(e)
    }
    if (previousOwner[territory] != prefix || hardUpdate) {
      if (!initialLoad && !hardUpdate) {
        console.log(new Date().toLocaleTimeString() + " " + territory + ": " + previousOwner[territory] + " -> " + prefix)
      }
      previousOwner[territory] = prefix
      try {
        if (guildNames) tooltip +=
          `<div class="territory-tooltip" style='text-shadow:-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black,
				0px 0px 1px ${colors[guild]},
				0px 0px 2px ${colors[guild]},
				0px 0px 3px ${colors[guild]},
				0px 0px 4px ${colors[guild]},
				0px 0px 5px ${colors[guild]},
        0px 0px 6px ${colors[guild]} !important;  ${initialLoad ? "visibility:hidden;" : ""}'><div class="name-res-holder${showTimeHeld ? "" : " flex-column"}"><div class='identifier'>` +
          prefix + "</div>";
        if (typeof (terrAllData[territory]) != "undefined") {
          tooltip +=
            `<div class="production-icon">
              ${terrAllData[territory]['resources'].emeralds > 9000 ? "💸" : ""}
              ${terrAllData[territory]['resources'].ore > 3600 ? "⛏" : ""}
              ${terrAllData[territory]['resources'].crops > 3600 ? "🌿" : ""}
              ${terrAllData[territory]['resources'].fish > 3600 ? "🐟" : ""}
              ${terrAllData[territory]['resources'].wood > 3600 ? "🪓" : ""}
              ${terrAllData[territory]['resources'].ore > 0 ? "⛏" : ""}
              ${terrAllData[territory]['resources'].crops > 0 ? "🌿<br>" : ""}
              ${terrAllData[territory]['resources'].fish > 0 ? "🐟" : ""}
              ${terrAllData[territory]['resources'].wood > 0 ? "🪓" : ""}
              </div></div>`;
          let treasuryColor = getTreasuryColor(new Date(guildTerritories[territory]["acquired"]));
          tooltip += (showTimeHeld ? `<div class="time-held" style='color:#${treasuryColor}; font-weight:bold; text-shadow: 0.05em 0 black, 0 0.05em black,-0.05em 0 black,0 -0.05em black,-0.05em -0.05em black,-0.05em 0.05em black,0.05em -0.05em black,0.05em 0.05em black;'> ${getFancyTimeSince(new Date(guildTerritories[territory]["acquired"]), 2)}</div>` : "");
          tooltip += "</div>";
        }
        else {
          tooltip += "</div>"
        }
      } catch (e) {
        console.log(terrAllData)
        console.error(e)
      }

      if (territoryNames) tooltip += "<div class='territory'>"
        + territory
        + "</div>";

      tooltip += "</div>";

      // console.log(guildTerritories[territory].guild)
      // console.log(guild)
      rectangles[territory].setTooltipContent(tooltip);
    }

    var now = new Date();
    var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    let diff = (utc - new Date(guildTerritories[territory]["acquired"]));


    if (((diff / 1000) < cooldownTimer)) {
      if (!Object.keys(cdRectangles).includes(territory)) {

        let cdRectangle = L.rectangle(rectangles[territory].getBounds(), {
          color: "#FF000",
          weight: 5,
          dashArray: [7],
          pane: "markerPane"
        })
        cdRectangle.bindPopup("Loading...")

        cdRectangle.setStyle({
          color: "#FF0000",
        })

        cdRectangle.on("popupopen", function (ev) {
          setPopupContent(guild, territory)
        });

        cdRectangle.setTooltipContent(tooltip);

        cdRectangles[territory] = cdRectangle;
        cdRectangle.addTo(map);
        console.log("ADDING " + territory + " to cooldowns")
      } else {
        const colorCDModifier = cooldownTimer / 255;
        if (territoryToggle) {

          cdRectangles[territory].setStyle({
            color: `rgb(${(cooldownTimer / colorCDModifier) - (Math.round(diff / (colorCDModifier * 1000)) % 255)}, ${(Math.round(diff / (colorCDModifier * 1000)) % 255)}, 0)`,
          })
        } else {
          cdRectangles[territory].setStyle({
            color: "rgba(0,0,0,0)",
          })

        }
      }
    } else if (((diff / 1000) > cooldownTimer) && Object.keys(cdRectangles).includes(territory)) {
      console.log("REMOVING " + territory)
      cdRectangles[territory].remove();
      delete cdRectangles[territory];
    }

  }

  function getFancyTimeSince(timestamp, maxElems) {
    var now = new Date();
    var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    let diff = (utc - timestamp);

    let day, hour, minute, seconds;
    seconds = Math.floor(diff / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;

    time = { "d": day, "h": hour, "m": minute, "s": seconds }

    str = ""
    let counter = 0;

    for (let unit of Object.keys(time)) {
      if (time[unit] > 0 || unit === "s") {
        str += time[unit] + unit;
        if (++counter == maxElems) break;
        if (unit !== "s" && ((Object.values(time)).filter(v => v > 0).length > 2)) {
          str += ", "
        }
      }
    }
    return str;
  }

  function getTreasuryColor(timestamp) {
    var now = new Date();
    var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    let diff = (utc - timestamp);

    let day, hour, minute, seconds;
    seconds = Math.floor(diff / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    if (day >= 4) {
      return "55ff55"; // High / Very High
    }
    if (day >= 1 || hour >= 4) {
      return "ffff55"; // Medium
    }
    return "ff5555"; // Low / Very Low
  }

  function setPopupContent(guild, territory) {

    let str = getFancyTimeSince(new Date(guildTerritories[territory]["acquired"]));

    const productionHTML = `<hr>
    <div>${terrAllData[territory]['resources'].emeralds > 0 ? "+" + terrAllData[territory]['resources'].emeralds + " Emeralds" : ""}</div>
    <div>${terrAllData[territory]['resources'].ore > 0 ? "+" + terrAllData[territory]['resources'].ore + " Ore" : ""}</div>
    <div>${terrAllData[territory]['resources'].crops > 0 ? "+" + terrAllData[territory]['resources'].crops + " Crops" : ""}</div>
    <div>${terrAllData[territory]['resources'].fish > 0 ? "+" + terrAllData[territory]['resources'].fish + " Fish" : ""}</div>
    <div>${terrAllData[territory]['resources'].wood > 0 ? "+" + terrAllData[territory]['resources'].wood + " Wood" : ""}</div>
    <br>`
    if (cdRectangles[territory]) {
      try {
        cdRectangles[territory].setPopupContent(`<div id="info-popup">
        <div><b>${territory}</b></div>
        <div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a> [${guilds[guild]["level"]}]</div>
        ${productionHTML}
        <div>Acquired on ${guildTerritories[territory]["acquired"]}</div>
        <div>Held for ${str}.</div>
			</div>`);
      } catch (e) {
        console.error(e)
        cdRectangles[territory].setPopupContent(`<div id="info-popup">
			<div><b>${territory}</b></div>
			<div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a></div>
      ${productionHTML}
      <div>Acquired on ${guildTerritories[territory]["acquired"]}</div>
			<div>Held for ${str}.</div>
			</div>`);
      }
    } else {
      try {
        rectangles[territory].setPopupContent(`<div id="info-popup">
        <div><b>${territory}</b></div>
        <div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a> [${guilds[guild]["level"]}]</div>
        ${productionHTML}
        <div>Acquired on ${guildTerritories[territory]["acquired"]}</div>
        <div>Held for ${str}.</div>
			</div>`);
      } catch (e) {
        console.error(e)
        if (guild == null) guild = "None";
        rectangles[territory].setPopupContent(`<div id="info-popup">
			<div><b>${territory}</b></div>
			<div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a></div>
      ${productionHTML}
      <div>Acquired on ${guildTerritories[territory]["acquired"]}</div>
			<div>Held for ${str}.</div>
			</div>`);
      }
    }
  }

  function updateLeaderboard() {
    let guildsSorted = Object.keys(territoryCount).sort(function (a, b) { return territoryCount[b] - territoryCount[a] })
    leaderboard = []
    for (let key of guildsSorted) {
      leaderboard[key] = guilds[key];
    }

    let leaderDiv = document.getElementById("guild-leaderboard");
    leaderDiv.innerHTML = " ";
    if (Object.keys(leaderboard).length < 1) leaderDiv.innerHTML = "Loading ..."
    for (let guild of Object.keys(leaderboard)) {
      let p = document.createElement("p");
      p.classList.add("leaderboard-item");
      p.classList.add("menu-text");
      p.classList.add("guild-name");

      let span = document.createElement("span");
      span.appendChild(document.createTextNode("●"));
      span.style.color = colors[guild];
      p.appendChild(span);

      let a = document.createElement("a");
      a.appendChild(document.createTextNode(" " + guild))
      a.href = `https://www.wynndata.tk/stats/guild/${guild}`
      a.target = "_blank"
      p.appendChild(a);

      p.appendChild(document.createTextNode(" [" + territoryCount[guild] + "]"))
      leaderDiv.appendChild(p);
    }

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

  function hideTooltips() {
    areTooltipsVisible = false;
    $('.territory-tooltip').each(function (i, obj) {
      obj.style.visibility = "hidden"
    });
  }

  function showTooltips() {
    areTooltipsVisible = true;
    $('.territory-tooltip').each(function (i, obj) {
      obj.style.visibility = "visible"
    });
  }

  function hideProductionIcons() {
    $('.production-icon').each(function (i, obj) {
      obj.hidden = true
    });
  }

  function showProductionIcons() {
    $('.production-icon').each(function (i, obj) {
      obj.hidden = false
    });
  }

  function hideTimeHelds() {
    $('.time-held').each(function (i, obj) {
      obj.hidden = true
    });
  }

  function showTimeHelds() {
    $('.time-held').each(function (i, obj) {
      obj.hidden = false
    });
  }

  let mouseMoveCooldown;
  map.on("mousemove", function (event) {
    if (mouseMoveCooldown) clearTimeout(mouseMoveCooldown);
    mouseMoveCooldown = setTimeout(function () {
      let coordBox = document.getElementById("coord-box")
      mouseX = Math.round(event.latlng.lng * 1000)
      mouseZ = Math.round(event.latlng.lat * -1000)
      coordBox.innerHTML = "<strong>X</strong>: " + mouseX + " <strong>Z</strong>: " + mouseZ
    }, 1);
  });

  $("#map").on('auxclick', function (e) {
    if (e.which == 2) {
      e.preventDefault();
      copyToClipboard(`/compass ${mouseX} ${mouseZ}`)
      alertMessage(`Copied /compass ${mouseX} ${mouseZ} to clipboard!`)
    }
  });

  function slowHardUpdater(i) {
    // Used to update the timers without freezing the entire webpage 
    setTimeout(() => {
      if (map.getZoom() >= 9 && showTimeHeld) { // Timers only show when the zoom level is at least 9
        setContent(guildTerritories[Object.keys(rectangles)[i]]["guild"], Object.keys(rectangles)[i], true);
      }
      if (i == Object.keys(rectangles).length - 1) slowHardUpdater(0);
      slowHardUpdater(i + 1);
    }, 1);
  }

  setTimeout(() => {
    update()
    slowHardUpdater(0);
  }, 2000);
  setTimeout(() => {
    initialLoad = false;
  }, 9000);
}

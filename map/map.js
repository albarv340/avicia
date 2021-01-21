function stringToColor(str) {
  var crc32 = function (r) { for (var a, o = [], c = 0; c < 256; c++) { a = c; for (var f = 0; f < 8; f++)a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1; o[c] = a } for (var n = -1, t = 0; t < r.length; t++)n = n >>> 8 ^ o[255 & (n ^ r.charCodeAt(t))]; return (-1 ^ n) >>> 0 };
  return "#" + crc32(str).toString(16).substr(2, 8)
}

function secondsSince(date) {
  var now = new Date();
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  return (utc - new Date(date)) / 1000;
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
    zoom: 8
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
  bounds.push([[6, 0], [8, 2]])

  for (let bound of bounds) {
    images.push(L.imageOverlay(`./public/tiles/${bound[0][1]}/${bound[0][0]}.png`,
      bound, {
      attribution: "<a href='https://wynndata.tk/map'>WYNNDATA</a>"
    }
    ));
  }

  for (let image of images) {
    image.addTo(map);
  }

  //initializing variables
  let guildTerritories = [];
  let rectangles = [];
  let cdRectangles = [];
  let guilds = [];
  let territoryCount = []
  let leaderboard = [];
  let terrCds = [];
  let tradingRoutes = []
  let terrAllData = [];
  let prevZoom = 7;
  let refresh = 30;
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
    "ShadowFall": "#db10f6"
  }
  //grabbing options elements
  let slider = document.getElementById("rate-option");
  let output = document.getElementById("rate-display");
  output.innerHTML = slider.value;

  let checkboxTerritory = document.getElementById("territory-toggle");
  let checkboxNames = document.getElementById("territory-names");
  let checkboxGuilds = document.getElementById("territory-guilds");
  let checkboxTradingRoutes = document.getElementById("trading-routes");

  let territoryToggle = true;
  let territoryNames = false;
  let guildNames = true;

  let counter = refresh
  document.getElementById("countdown").innerHTML = counter;

  slider.onmouseup = function () {
    refresh = this.value;
    update()
    output.innerHTML = this.value;
  }

  checkboxTerritory.oninput = function () {
    territoryToggle = this.checked;

    checkboxNames.checked = this.checked;
    checkboxGuilds.checked = this.checked;
    territoryNames = this.checked;
    guildNames = this.checked;

    render();
  }

  checkboxNames.oninput = function () {
    territoryNames = this.checked
    render();
  }

  checkboxGuilds.oninput = function () {
    guildNames = this.checked
    render();
  }

  checkboxTradingRoutes.oninput = function () {
    this.checked ? showTradeRoutes() : hideTradeRoutes()
  }



  //setting up territories
  fetch("./territories.json")
    .then(response =>
      response.json())
    .then(json => {
      for (let territory of json) {
        let bounds = [territory["start"].split(","), territory["end"].split(",")];
        for (let i in bounds) {
          bounds[i][0] *= .001
          bounds[i][1] *= .001
        }

        bounds[0].reverse();
        bounds[1].reverse();

        bounds[0][0] *= -1;
        bounds[1][0] *= -1;
        let rectangle = L.rectangle(bounds,
          { color: "rgb(0, 0, 0, 0)", weight: 2 })

        rectangle.bindTooltip("", {
          className: "guild-name",
          permanent: true,
          direction: "center"
        }).openTooltip();

        rectangle.bindPopup("Loading...")
        rectangle.on("popupopen", function (ev) {
          setPopupContent(guildTerritories[territory['name']]['guild'], territory['name'])
        });



        rectangles[territory["name"]] = rectangle;
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
                let polyline = L.polyline([rectangles[rectangle].getCenter(), rectangles[route].getCenter()], { color: 'rgba(0,0,0,0)' })
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
    });


  //calling wynn API every refresh seconds to check territory ownership
  let updateTimout = null
  function update() {
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
          for (let territory of Object.keys(rectangles)) {
            setContent(guildTerritories[territory]["guild"], territory);
            territoryCount[guildTerritories[territory]["guild"]] ? territoryCount[guildTerritories[territory]["guild"]]++ : territoryCount[guildTerritories[territory]["guild"]] = 1;
          }
        } catch (e) { }
        updateLeaderboard()
        clearTimeout(updateTimout)
        updateTimout = setTimeout(_ => { console.log("Updating..."); update(); }, (refresh * 1000));
      })
  }


  async function getGuilds(callback) {
    let url = 'https://api.wynncraft.com/public_api.php?action=statsLeaderboard&type=guild&timeframe=d';
    let obj = null;

    try {
      obj = await (await fetch(url)).json();
    } catch (e) {
      console.log('error');
    }
    res = []
    try {
      for (guild of obj.data) {
        res[guild.name] = guild
      }
    } catch (e) { }
    callback(res)
    return res
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
        if (!(Object.keys(colors).includes(guild))) {
          colors[guild] = stringToColor(guild)
        }
        if (!(Object.keys(guilds).includes(guild))) {
          fetch(`https://api-legacy.wynncraft.com/public_api.php?action=guildStats&command=${guild}`)
            .then(response => response.json())
            .then(json => {
              guilds[guild] = json;
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
            rectangles[territory].setStyle({
              color: colors[guild],
            })
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
      setContent(guildTerritories[territory]["guild"], territory)
      try {
        if (cdRectangles[territory].isPopupOpen()) {
          setPopupContent(guildTerritories[territory]["guild"], territory)
        }
      } catch (e) { }
    })
  }

  //on zoom end, update map based on zoom
  map.on('zoomend', _ => {
    if ((map.getZoom() >= 7 && prevZoom <= 7) || (map.getZoom() <= 7 && prevZoom >= 7)) {
      for (let territory of Object.keys(rectangles)) {
        try {
          setContent(guildTerritories[territory]["guild"], territory);
        } catch (e) { }
      }
    }
    if (map.getZoom() <= 7) {
      hideTradeRoutes()
    } else if (map.getZoom() >= 7) {
      if (checkboxTradingRoutes.checked) {
        showTradeRoutes()
      }
    }
    prevZoom = map.getZoom();
  })

  //sets tooltip and popup content
  function setContent(guild, territory) {
    let tooltip = "<div>"
    try {
      if (guildNames) tooltip +=
        `<div style='text-shadow:-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black,
				0px 0px 1px ${colors[guild]},
				0px 0px 2px ${colors[guild]},
				0px 0px 3px ${colors[guild]},
				0px 0px 4px ${colors[guild]},
				0px 0px 5px ${colors[guild]},
        0px 0px 6px ${colors[guild]} !important;'><div class='identifier'>` +
        guilds[guild]["prefix"] + "</div>" + `
        <div>${terrAllData[territory]['resources'].ore > 0 ? "⛏" : ""}
        ${terrAllData[territory]['resources'].crops > 0 ? "🌿<br>" : ""}
        ${terrAllData[territory]['resources'].fish > 0 ? "🐟" : ""}
        ${terrAllData[territory]['resources'].wood > 0 ? "🪓" : ""}</div>`;
    } catch (e) {
      if (guildNames) tooltip +=
        `<div style='text-shadow:-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black,
				0px 0px 1px ${colors[guild]},
				0px 0px 2px ${colors[guild]},
				0px 0px 3px ${colors[guild]},
				0px 0px 4px ${colors[guild]},
				0px 0px 5px ${colors[guild]},
        0px 0px 6px ${colors[guild]} !important;'><div class='identifier'>` +
        guild + "</div>" + `
        <div>${terrAllData[territory]['resources'].ore > 0 ? "⛏" : ""}
        ${terrAllData[territory]['resources'].crops > 0 ? "🌿<br>" : ""}
        ${terrAllData[territory]['resources'].fish > 0 ? "🐟" : ""}
        ${terrAllData[territory]['resources'].wood > 0 ? "🪓" : ""}</div>`;
      setContent(guild, territory)
    }

    if (territoryNames) tooltip += "<div class='territory'>"
      + territory
      + "</div>";

    tooltip += "</div>";

    if (map.getZoom() > 7) {
      rectangles[territory].setTooltipContent(tooltip);
    } else if (Object.keys(cdRectangles).includes(territory)) {
      rectangles[territory].setTooltipContent(tooltip);
    } else {
      rectangles[territory].setTooltipContent(" ");
    }


    var now = new Date();
    var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    let diff = (utc - new Date(guildTerritories[territory]["acquired"]));


    if (((diff / 1000) < 180) && (!Object.keys(cdRectangles).includes(territory))) {
      let cdRectangle = L.rectangle(rectangles[territory].getBounds(), {
        color: "#FF000",
        weight: 5,
        dashArray: 7
      })
      cdRectangle.bindPopup("Loading...")
      cdRectangle.setStyle({
        color: "#FF0000",
      })
      cdRectangle.on("popupopen", function (ev) {
        setPopupContent(guild, territory)
      });

      cdRectangles[territory] = cdRectangle;
      cdRectangle.addTo(map);
      console.log("ADDING " + territory)
    } else if (((diff / 1000) > 180) && Object.keys(cdRectangles).includes(territory)) {
      console.log("REMOVING " + territory)
      cdRectangles[territory].remove();
      delete cdRectangles[territory];
      if (map.getZoom() <= 7) {
        rectangles[territory].bindTooltip(" ")
      }
    }
  }

  function setPopupContent(guild, territory) {
    var now = new Date();
    var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    let diff = (utc - new Date(guildTerritories[territory]["acquired"]));

    let day, hour, minute, seconds;
    seconds = Math.floor(diff / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;

    time = { "day": day, "hour": hour, "minute": minute, "second": seconds }

    str = ""

    for (let unit of Object.keys(time)) {
      if (time[unit] > 0 || unit === "second") {
        if (unit === "second" && ((Object.values(time)).filter((_, i) => i != 4)).filter(v => v > 0).length) {
          str += " and "
        }

        str += time[unit] + " " + unit;

        if (time[unit] !== 1) {
          str += "s"
        }
        if (unit !== "second" && ((Object.values(time)).filter(v => v > 0).length > 2)) {
          str += ", "
        }
      }
    }
    if (cdRectangles[territory]) {
      try {
        cdRectangles[territory].setPopupContent(`<div id="info-popup">
        <div><b>${territory}</b></div>
        <div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a> [${guilds[guild]["level"]}]</div>
        <div>Aqcuired on ${guildTerritories[territory]["acquired"]}</div>
        <div>Held for ${str}.</div>
			</div>`);
      } catch (e) {
        cdRectangles[territory].setPopupContent(`<div id="info-popup">
			<div><b>${territory}</b></div>
			<div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a></div>
			<div>Aqcuired on ${guildTerritories[territory]["acquired"]}</div>
			<div>Held for ${str}.</div>
			</div>`);
      }
    } else {
      try {
        rectangles[territory].setPopupContent(`<div id="info-popup">
        <div><b>${territory}</b></div>
        <div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a> [${guilds[guild]["level"]}]</div>
        <div>Aqcuired on ${guildTerritories[territory]["acquired"]}</div>
        <div>Held for ${str}.</div>
			</div>`);
      } catch (e) {
        rectangles[territory].setPopupContent(`<div id="info-popup">
			<div><b>${territory}</b></div>
			<div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a></div>
			<div>Aqcuired on ${guildTerritories[territory]["acquired"]}</div>
			<div>Held for ${str}.</div>
			</div>`);
      }
    }
  }

  function updateLeaderboard() {
    let guildsSorted = Object.keys(territoryCount).sort(function (a, b) { return territoryCount[b] - territoryCount[a] })
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

  setTimeout(() => {
    update()
  }, 2000);
}

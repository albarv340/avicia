function toggle() {
  if (document.getElementById("menu").style.display === "block") {
    document.getElementById("menu").style.display = "none";
  } else {
    document.getElementById("menu").style.display = "block";
  }
}

var stringToColor = function (str) {
  var hash = 0
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  var color = '#'
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).substr(-2)
  }
  return color
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
  let leaderboard = [];
  let tradingRoutes = []
  let prevZoom = 7;
  let refresh = 60;
  let colors = { "Blacklisted": "#333333", "Titans Valor": "#e6d8e7", "HackForums": "#9d28c8", "Mystica": "#3a1645", "Celestial Tigers": "#FF4500", "Kingdom Foxes": "#FF8200", "Bobs Torturers": "#7300ff", "Restive": "#0F6868", "Caeruleum Order": "#012142", "The Simple Ones": "#0fcad6", "Lunatic": "#fae600", "Nethers Ascent": "#4a0000", "Paladins United": "#9780bf", "BuildCraftia": "#1CE00B", "Holders of LE": "#28FFC5", "House of Sentinels": "#7F0000", "Imperial": "#990033", "The Hive": "#A550F3", "Audux": "#005FE8", "Emorians": "#005FE8", "IceBlue Team": "#99AAB5", "DiamondDeities": "#42A8C7", "Fantasy": "#21C8EC", "Sins of Seedia": "#6B0B0B", "Avicia": "#1010FE", "Project Ultimatum": "#133E7C", "The Nezaract": "#6cf3ff", "Beyond the Scene": "#99ac01" }

  //grabbing options elements
  // let slider = document.getElementById("rate-option");
  // let output = document.getElementById("rate-display");
  // output.innerHTML = slider.value;

  let checkboxTerritory = document.getElementById("territory-toggle");
  let checkboxNames = document.getElementById("territory-names");
  let checkboxGuilds = document.getElementById("territory-guilds");

  let territoryToggle = true;
  let territoryNames = false;
  let guildNames = true;

  // let counter = refresh
  // document.getElementById("countdown").innerHTML = counter;

  // slider.oninput = function () {
  //   refresh = this.value;
  //   output.innerHTML = this.value;
  // }

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

        rectangle.bindPopup("Loading...").openPopup();



        rectangles[territory["name"]] = rectangle;
        rectangle.addTo(map);
      }
    }).then(_ => {
      update();
    });


  //calling wynn API every refresh seconds to check territory ownership
  function update() {
    counter = refresh;
    fetch("./territory_data.json")
      .then(response => response.json())
      .then(territories => {
        guildTerritories = territories;
        for (rectangle in rectangles) {
          try {
            for (route of guildTerritories[rectangle]['Trading Routes']) {
              let polyline = L.polyline([rectangles[rectangle].getCenter(), rectangles[route].getCenter()], { color: 'rgba(0,0,0,0)' })
              tradingRoutes[rectangle] ? tradingRoutes[rectangle].push(polyline) : tradingRoutes[rectangle] = [polyline]
              polyline.bindPopup(rectangle + "<->" + route).openPopup();
              polyline.addTo(map)
            }
          } catch (e) { }
        }
        // console.log(tradingRoutes)
        render();
        // setTimeout(_ => { console.log("Updating..."); update(); }, (refresh * 1000));
      })
  }


  async function getGuilds() {
    let url = 'https://api.wynncraft.com/public_api.php?action=statsLeaderboard&type=guild&timeframe=d';
    let obj = null;

    try {
      obj = await (await fetch(url)).json();
    } catch (e) {
      console.log('error');
    }
    res = []
    for (guild of obj.data) {
      res[guild.name] = guild
    }
    return res
  }

  //rendering territories based on territory location, ownership, and settings. also updates leaderboard div
  async function render() {
    guilds = await getGuilds()
    Object.keys(guildTerritories).forEach(territory => {
      let guild = guildTerritories[territory]["guild"];
      // console.log(guild)
      if (!(Object.keys(colors).includes(guild))) {
        colors[guild] = stringToColor(guild)
      }
      if (territoryToggle) {
        try {

          rectangles[territory].setStyle({
            color: colors[guild],
            dashArray: guildTerritories[territory]['hq'] ? 7 : 0,
            weight: guildTerritories[territory]['hq'] ? 5 : 2
          })
        } catch (e) {
          console.log(territory)
        }
      } else {
        rectangles[territory].setStyle({
          color: 'rgba(0,0,0,0)'
        })
        setContent(guild, territory);
      }
    });
    // updateLeaderboard();
  }

  tick()

  function tick() {
    setTimeout(_ => {
      tick()
    }, 1000)

    // counter -= 1;
    // document.getElementById("countdown").innerHTML = counter;
    Object.keys(cdRectangles).forEach(territory => {
      let guild = guildTerritories[territory]["guild"];
      setContent(guildTerritories[territory]["guild"], territory)
    })


  }

  //on zoom end, update map based on zoom
  map.on('zoomend', _ => {
    if ((map.getZoom() >= 7 && prevZoom <= 7) || (map.getZoom() <= 7 && prevZoom >= 7)) {
      for (let territory of Object.keys(rectangles)) {
        try {
          setContent(guildTerritories[territory]["guild"], territory);
        } catch (e) {
          // console.log(territory, "old")
        }
      }
    }
    if (map.getZoom() <= 7) {
      for (territory in tradingRoutes) {
        for (route in tradingRoutes[territory]) {
          tradingRoutes[territory][route].setStyle({
            color: 'rgba(0,0,0,0)'
          })
        }
      }
    } else if (map.getZoom() >= 7) {
      for (territory in tradingRoutes) {
        for (route in tradingRoutes[territory]) {
          tradingRoutes[territory][route].setStyle({
            color: 'white'
          })
        }
      }
    }

    prevZoom = map.getZoom();
  })

  //sets tooltip and popup content
  function setContent(guild, territory) {
    let tooltip = "<div>"
    try {
      const color = guildTerritories[territory]['hq'] ? "#ff0000" : colors[guild]
      if (guildNames) tooltip +=
        `<div style='text-shadow:-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black,
				0px 0px 1px ${color},
				0px 0px 2px ${color},
				0px 0px 3px ${color},
				0px 0px 4px ${color},
				0px 0px 5px ${color},
        0px 0px 6px ${color} !important;'><div class='identifier'>` +
        guildTerritories[territory]['prefix'] + "<br>" + (guildTerritories[territory]['hq'] ? "HQ" : "") + "</div>"
        + `
        <div>${guildTerritories[territory]['resources'].ore > 0 ? "⛏" : ""}</div>
        <div>${guildTerritories[territory]['resources'].crops > 0 ? "🌿" : ""}</div>
        <div>${guildTerritories[territory]['resources'].fish > 0 ? "🐟" : ""}</div>
        <div>${guildTerritories[territory]['resources'].wood > 0 ? "🪓" : ""}</div>`;
    } catch (e) {
      // console.log(e)
    }

    if (territoryNames) tooltip += "<div class='territory'>"
      + territory
      + "</div>";

    tooltip += "</div>";

    if (map.getZoom() > 7) {
      rectangles[territory].setTooltipContent(tooltip);
    } else {
      rectangles[territory].setTooltipContent(" ");
    }

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
    try {

      rectangles[territory].setPopupContent(`<div id="info-popup">
			<div><b>${territory}</b></div>
      <div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a></div>
      <div>${guildTerritories[territory]['resources'].emeralds > 0 ? "+" + guildTerritories[territory]['resources'].emeralds + " Emeralds" : ""}</div>
      <div>${guildTerritories[territory]['resources'].ore > 0 ? "+" + guildTerritories[territory]['resources'].ore + " Ore" : ""}</div>
      <div>${guildTerritories[territory]['resources'].crops > 0 ? "+" + guildTerritories[territory]['resources'].crops + " Crops" : ""}</div>
      <div>${guildTerritories[territory]['resources'].fish > 0 ? "+" + guildTerritories[territory]['resources'].fish + " Fish" : ""}</div>
      <div>${guildTerritories[territory]['resources'].wood > 0 ? "+" + guildTerritories[territory]['resources'].wood + " Wood" : ""}</div>
      <br>
      <div>${guildTerritories[territory]['stored'].emeralds.length != 1 ? guildTerritories[territory]['stored'].emeralds + " Emeralds" : ""}</div>
      <div>${guildTerritories[territory]['stored'].ore.length != 1 ? guildTerritories[territory]['stored'].ore + " Ore" : ""}</div>
      <div>${guildTerritories[territory]['stored'].crops.length != 1 ? guildTerritories[territory]['stored'].crops + " Crops" : ""}</div>
      <div>${guildTerritories[territory]['stored'].fish.length != 1 ? guildTerritories[territory]['stored'].fish + " Fish" : ""}</div>
      <div>${guildTerritories[territory]['stored'].wood.length != 1 ? guildTerritories[territory]['stored'].wood + " Wood" : ""}</div>
      <br>
      <div><strong>Trading Routes:</strong></div>
      <div>${guildTerritories[territory]["Trading Routes"].join("</div><div>")}</div>
      <div>${guildTerritories[territory].hq ? "<br>HQ" : ""}</div>
      </div>`
      );
    } catch (e) {
      // console.log(e)
    }

    if (((diff / 1000) < 180) && (!Object.keys(cdRectangles).includes(territory))) {
      let cdRectangle = L.rectangle(rectangles[territory].getBounds(), {
        color: "#FF000",
        weight: 5
      })
      try {

        cdRectangle.bindPopup(`<div id="info-popup">
        <div><b>${territory}</b></div>
        <div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a></div>
        <div>Held for ${str}.</div>
        </div>`).openPopup();
      } catch (e) {
        // console.log(e)
      }
      cdRectangle.setStyle({
        color: "#FF0000",
      })

      cdRectangles[territory] = cdRectangle;
      cdRectangle.addTo(map);
      console.log("ADDING " + territory)
    } else if (((diff / 1000) > 180) && Object.keys(cdRectangles).includes(territory)) {
      console.log("REMOVING " + territory)
      cdRectangles[territory].remove();
      delete cdRectangles[territory];
    } else if (Object.keys(cdRectangles).includes(territory)) {
      try {
        cdRectangles[territory].setPopupContent(`<div id="info-popup">  
        <div><b>${territory}</b></div>
        <div><a target="_blank" href="https://www.wynndata.tk/stats/guild/${guild}">${guild}</a></div>
        <div>${guildTerritories[territory].hq ? "HQ" : ""}</div>
        </div>`);
      } catch (e) {
        // console.log(e)
      }
    }
  }

  function updateLeaderboard() {
    let guildsSorted = (Object.keys(guilds).filter(guild => guilds[guild]["territories"] > 0)).sort((a, b) => (guilds[b]["territories"] - guilds[a]["territories"]));
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
      p.appendChild(a);

      p.appendChild(document.createTextNode(" [" + leaderboard[guild]["territories"] + "]"))
      leaderDiv.appendChild(p);
    }
  }

  document.getElementById("info").style.opacity = 0;

  setTimeout(_ => {
    // updateLeaderboard()
    document.getElementById("info").style.display = "none";
  }, (2000));

}

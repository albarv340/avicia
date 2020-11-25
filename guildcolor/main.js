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


const scriptPromise = new Promise((resolve, reject) => {
  const script = document.createElement('script');
  document.body.appendChild(script);
  script.onload = resolve;
  script.onerror = reject;
  script.async = true;
  script.src = 'https://www.wynndata.tk/map/cache/layers.js';
});

scriptPromise.then(() => {
  const guildName = window.location.search.split("=").pop().replace(/%20/g, ' ');
  let color = ""
  console.log(guildName)
  if (guildName.length == 3) {
    fetch("http://avicia.ga/api/tag/?tag=" + guildName)
      .then(response => response.json())
      .then(data => {
        if (data != "null") {
          console.log(data)
          updateGuildColor(data)
        } else {
          updateGuildColor(guildName)
        }
      })
  } else {
    updateGuildColor(guildName)
  }
});


function updateGuildColor(guildName) {
  if (guildName in guildColors) {
    color = guildColors[guildName]
  } else {
    color = stringToColor(guildName)
  }
  if (guildName == "") {
    guildName = "Enter a guild in the url for example <a href='?guild=Avicia'>avicia.tk/guildcolor?guild=Avicia</a>"
  }
  document.body.style.backgroundColor = color
  const title = document.getElementById("title")
  const copyButton = document.getElementById("copyButton")
  title.style.color = "#" + invertHex(color.substr(1, 7))
  title.innerHTML = guildName
  copyButton.style.color = "#" + invertHex(color.substr(1, 7))
  copyButton.style.backgroundColor = color
  copyButton.innerHTML = color + " - Click to copy"
  copyButton.setAttribute(`onClick`, `copyColor("${color}")`);
}


function copyColor(color) {
  const el = document.createElement('textarea');
  el.value = color;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  alert("Copied the color: " + color);
}

function invertHex(hexnum) {
  if (hexnum.length != 6) {
    console.error("Hex color must be six hex numbers in length.");
    return false;
  }

  hexnum = hexnum.toUpperCase();
  var splitnum = hexnum.split("");
  var resultnum = "";
  var simplenum = "FEDCBA9876".split("");
  var complexnum = new Array();
  complexnum.A = "5";
  complexnum.B = "4";
  complexnum.C = "3";
  complexnum.D = "2";
  complexnum.E = "1";
  complexnum.F = "0";

  for (i = 0; i < 6; i++) {
    if (!isNaN(splitnum[i])) {
      resultnum += simplenum[splitnum[i]];
    } else if (complexnum[splitnum[i]]) {
      resultnum += complexnum[splitnum[i]];
    } else {
      console.error("Hex colors must only include hex numbers 0-9, and A-F");
      return false;
    }
  }

  return resultnum;
}

const guildName = window.location.search.split("=").pop().replace(/%20/g, ' ');
const refreshRate = 60;
let previousUpdateTime = null;
previousObj = {}
requestTimer = null;

async function getGuildData() {
    document.getElementById("title").innerText = "Wynncraft Guild XP - " + guildName
    let url = 'https://api.wynncraft.com/public_api.php?action=guildStats&command=' + guildName;

    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.log('error');
    }
    if (obj.error) {
        document.getElementById("title").innerHTML = "Invalid guild name. Example: <a href='?guild=Avicia'>Avicia</a>"
    } else {
        updateChangeLeaderboard(obj)
        previousObj = obj
        updateTotalLeaderboard(obj)
    }
}

function updateTotalLeaderboard(data) {
    let html = ""
    placement = 1;
    // console.log(data)
    for (player of data.members.sort((a, b) => b.contributed - a.contributed)) {
        // console.log(guild.level, estimateXpRequirement(guild.level))
        html += `
                    <tr><th scope="row">#${placement}</th>
                    <td><a href="//wynndata.tk/stats/player/${player.name}" target="_blank">${player.name}</a> </td>
                    <td>${makeNumberReadable(player.contributed)} XP</td>
                    </tr>`
        placement++;
    }
    document.getElementById("total-leaderboard").innerHTML = html
}


function updateChangeLeaderboard(data) {
    let xpDifferences = {}
    for (player of data.members) {
        try {
            console.log(previousUpdateTime)
            console.log(new Date() - previousUpdateTime)
            prevValue = previousObj.members.filter(p => p.name == player.name)
            if (prevValue.length == 1) {
                if (previousUpdateTime == null) {
                    xpDifferences[player.name] = player.contributed - prevValue[0].contributed
                } else {
                    // Compensate for if it takes longer or shorter than 60 seconds between updates, so it doesn't show misleadingly high numbers
                    xpDifferences[player.name] = Math.round((player.contributed - prevValue[0].contributed) / (((new Date() - previousUpdateTime) / 1000) / refreshRate))
                }
                console.log(player.contributed - prevValue[0].contributed, Math.round((player.contributed - prevValue[0].contributed) / (((new Date() - previousUpdateTime) / 1000) / refreshRate)))
            }
        } catch (e) {
            xpDifferences[player.name] = 0
        }
    }
    previousUpdateTime = new Date();
    let html = ""
    placement = 1;
    // console.log(xpDifferences)
    for (username in Object.fromEntries(Object.entries(xpDifferences).sort(([, a], [, b]) => b - a))) {
        html += `
        <tr><th scope="row">#${placement}</th>
        <td><a href="//wynndata.tk/stats/player/${username}" target="_blank">${username}</a> </td>
        <td>${makeNumberReadable(xpDifferences[username])} XP</td>
        </tr>`
        placement++;
    }
    document.getElementById("change-leaderboard").innerHTML = html

}


function makeNumberReadable(number) {
    return String(number).replace(/(.)(?=(\d{3})+$)/g, '$1,')
}

document.getElementById("guild-change").onsubmit = e => {
    e.preventDefault()
    const newGuild = document.getElementById("guild-name").value
    window.location.href = "?guild=" + newGuild
}

// document.getElementById("change-interval").onclick = e => {
//     const interval = document.getElementById("interval").value
//     if (interval < 60) {
//         alert("Intervals under 60s do not work properly, since the API doesn't update fast enough")
//     } else {
//         getGuildData()
//         clearInterval(requestTimer)
//         startRequestTimer(interval * 1000)
//     }
// }

function init() {
    document.getElementById("guild-name").value = guildName
    getGuildData()
    startRequestTimer(refreshRate * 1000)
}

function startRequestTimer(milliseconds) {
    timerHTML = document.getElementById("request-timer")
    timer = milliseconds / 1000
    requestTimer = setInterval(() => {
        timer -= 1;
        timerHTML.innerHTML = `${Math.floor(timer / refreshRate)}m ${timer % refreshRate}s`
        if (timer == 0) {
            getGuildData()
            clearInterval(requestTimer)
            startRequestTimer(milliseconds)
        }
    }, 1000);

}


init()
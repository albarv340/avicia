previousObj = {}
requestTimer = null;

async function getGuildData() {
    const guildName = window.location.search.split("=").pop().replace(/%20/g, ' ');
    document.getElementById("title").innerText = "Wynncraft Guild XP - " + guildName
    let url = 'https://api.wynncraft.com/public_api.php?action=guildStats&command=' + guildName;

    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.log('error');
    }
    if (obj.error) {
        document.getElementById("content").innerHTML = "Invalid guild name you need ?guild={Guild name} for example avicia.tk/guildxp/?guild=<a href='?guild=Avicia'>Avicia</a>"
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

            prevValue = previousObj.members.filter(p => p.name == player.name)
            console.log(prevValue)
            if (prevValue.length == 1) {
                xpDifferences[player.name] = player.contributed - prevValue[0].contributed
            }
        } catch (e) {
            xpDifferences[player.name] = 0
        }
    }
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
    getGuildData()
    startRequestTimer(60 * 1000)
}

function startRequestTimer(milliseconds) {
    timerHTML = document.getElementById("request-timer")
    timer = milliseconds / 1000
    requestTimer = setInterval(() => {
        timer -= 1;
        timerHTML.innerHTML = `${Math.floor(timer / 60)}m ${timer % 60}s`
        if (timer == 0) {
            getGuildData()
            clearInterval(requestTimer)
            startRequestTimer(milliseconds)
        }
    }, 1000);

}


init()
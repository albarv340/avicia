const refreshRate = 60;
let previousUpdateTime = null;

let previousObj = {}

async function getGuildData() {
    let url = 'https://api.wynncraft.com/public_api.php?action=guildStats&command=Avicia';
    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.error(e);
    }

    updateChangeLeaderboard(obj)
    previousObj = obj
}

function updateChangeLeaderboard(data) {
    let xpDifferences = {}
    let sum = 0;
    for (player of data.members) {
        try {
            prevValue = previousObj.members.filter(p => p.name == player.name)
            if (prevValue.length == 1) {
                if (previousUpdateTime == null) {
                    xpDifferences[player.name] = { "minuteXP": player.contributed - prevValue[0].contributed }
                } else {
                    // Compensate for if it takes longer or shorter than 60 seconds between updates, so it doesn't show misleadingly high numbers
                    xpDifferences[player.name] = { "minuteXP": Math.round((player.contributed - prevValue[0].contributed) / (((new Date() - previousUpdateTime) / 1000) / refreshRate)) }
                }
            }
        } catch (e) {
            xpDifferences[player.name] = { "minuteXP": 0 }
        }
        sum += xpDifferences[player.name];
    }
    previousUpdateTime = new Date();

    document.getElementById("minuteXP-leaderboard").innerHTML = generateLeaderboardHTML(xpDifferences, Object.keys(xpDifferences).sort((a, b) => xpDifferences[b].minuteXP - xpDifferences[a].minuteXP), "XP/m", "XP/m", "minuteXP", sum)

}

function init() {
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
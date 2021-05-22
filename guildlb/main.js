async function getLeaderboardData() {
    let url = 'https://api.wynncraft.com/public_api.php?action=statsLeaderboard&type=guild&timeframe=alltime';

    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.log('error');
    }
    console.log(obj.request)
    const leaderboardData = obj.data.sort((a, b) => b.xp - a.xp).sort((a, b) => b.level - a.level)
    updateLeaderboard(leaderboardData)
}

function updateLeaderboard(data) {
    let html = ""
    placement = 1;
    // console.log(data)
    for (guild of data) {
        // console.log(guild.level, estimateXpRequirement(guild.level))
        html += `
                    <tr><th scope="row">#${placement}</th>
                    <td><a href="//wynndata.tk/stats/guild/${guild.name}" target="_blank">${guild.name}</a> [${guild.prefix}]</td>
                    <td>Level: ${guild.level} - ${makeNumberReadable(guild.xp)} XP  ~${((guild.xp / estimateXpRequirement(guild.level)) * 100).toFixed(2)}%</td>
                    </tr>`
        placement++;
    }
    document.getElementById("leaderboard").innerHTML = html
}


function makeNumberReadable(number) {
    return String(number).replace(/(.)(?=(\d{3})+$)/g, '$1,')
}

function estimateXpRequirement(level) {
    return 2364629339 * Math.pow(1.15, level - 70)
}

function init() {
    getLeaderboardData()
    const uptadeInterval = 5 * 60 * 1000;
    startRequestTimer(uptadeInterval)
    setInterval(() => {
        getLeaderboardData()
        startRequestTimer(uptadeInterval)
    }, uptadeInterval);
}

function startRequestTimer(milliseconds) {
    timerHTML = document.getElementById("request-timer")
    timer = milliseconds / 1000
    interval = setInterval(() => {
        timer -= 1;
        timerHTML.innerHTML = `${Math.floor(timer / 60)}m ${timer % 60}s`
        if (timer == 0) clearInterval(interval)
    }, 1000);

}

init()

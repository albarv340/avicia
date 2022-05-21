async function getDataFromSheet() {
    let url = 'https://script.google.com/macros/s/AKfycbxhFzILlKO3msUgRStcvKI5P6Hv6pC76TGDsnw6BfIWQEr0DtS5Z_SjmVxMEG5cJxL2/exec';

    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.log('error');
    }

    document.getElementById("totalXP-leaderboard").innerHTML = generateLeaderboardHTML(obj.players, Object.keys(obj.players).sort((a, b) => obj.players[b].totalXP - obj.players[a].totalXP), "XP", "XP", "totalXP", obj.global.totalSum)
    document.getElementById("weeklyXP-leaderboard").innerHTML = generateLeaderboardHTML(obj.players, Object.keys(obj.players).sort((a, b) => obj.players[b].weeklyXP - obj.players[a].weeklyXP), "XP", "XP", "weeklyXP", obj.global.weeklySum)
    document.getElementById("dailyXP-leaderboard").innerHTML = generateLeaderboardHTML(obj.players, Object.keys(obj.players).sort((a, b) => obj.players[b].dailyXP - obj.players[a].dailyXP), "XP", "XP", "dailyXP", obj.global.dailySum)
}

function generateLeaderboardHTML(data, sortedPlayers, unit, singleUnit, lb, sum, formatFunction = makeNumberReadable) {
    let html = ""
    placement = 1;
    for (player of sortedPlayers) {
        switch (placement) {
            case 1:
                document.getElementById(lb + "-div-1st").innerHTML = `
                <img src="https://www.mc-heads.net/player/${player}"/>
                <div class="first-place-text">
                <h1>#${placement}</h1>
                <h4>${player}</h4>
                <h5>${formatFunction(data[player][lb])} ${data[player][lb] == 1 ? singleUnit : unit}<br> ${((data[player][lb] / sum) * 100 || 0).toFixed(2)}%</h5>
                
                </div>`
                break;
            case 2:
                document.getElementById(lb + "-div-2nd").innerHTML = `
                <img src="https://www.mc-heads.net/body/${player}/right" />
                <div class="second-place-text">
                <h3>#${placement}</h3>
                <h6>${player}</h6>
                <p>${formatFunction(data[player][lb])} ${data[player][lb] == 1 ? singleUnit : unit}<br> ${((data[player][lb] / sum) * 100 || 0).toFixed(2)}%</p>
                </div>
                `
                break;
            case 3:
                document.getElementById(lb + "-div-3rd").innerHTML = `
                <img src="https://www.mc-heads.net/body/${player}/left"/>
                <div class="third-place-text">
                <h5>#${placement}</h5>
                <h6>${player}</h6>
                <p>${formatFunction(data[player][lb])} ${data[player][lb] == 1 ? singleUnit : unit}<br> ${((data[player][lb] / sum) * 100 || 0).toFixed(2)}%</p>
                </div>
                `
                break;
            default:
                html += `<tr title=" Sum of all players: ${String(sum).replace(/(.)(?=(\d{3})+$)/g, '$1,')} ${data[player][lb] == 1 ? singleUnit : unit}">
                <th scope="row">#${placement}</th>
                <td><img class="player-face" src="https://www.mc-heads.net/avatar/${player}/100"> ${player}</td>
                <td>${formatFunction(data[player][lb])} ${data[player][lb] == 1 ? singleUnit : unit}</td>
                <td title="% of total">${((data[player][lb] / sum) * 100 || 0).toFixed(2)}%</td>
                </tr>`
        }
        placement++;
    }
    return html
}

function makeNumberReadable(number) {
    return String(number).replace(/(.)(?=(\d{3})+$)/g, '$1,')
}

tick()

function tick() {
    getDataFromSheet()
    setTimeout(() => { tick() }, 10 * 1000);
}
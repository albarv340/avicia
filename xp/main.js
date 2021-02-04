let xpTotalData = {}
let xpWeeklyData = {}
const totalFirstPlaceDiv = document.getElementById("total-div-1st")
const totalSecondPlaceDiv = document.getElementById("total-div-2nd")
const totalThirdPlaceDiv = document.getElementById("total-div-3rd")
const weeklyFirstPlaceDiv = document.getElementById("weekly-div-1st")
const weeklySecondPlaceDiv = document.getElementById("weekly-div-2nd")
const weeklyThirdPlaceDiv = document.getElementById("weekly-div-3rd")


async function getDataFromSheet() {
    let url = 'https://spreadsheets.google.com/feeds/list/1IEhwvAdHA0aApOCVkJcIHODgiN_jO_z2xjw36Jr1V28/od6/public/values?alt=json';

    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.log('error');
    }
    let readableXpTotal = {}
    let readableXpWeekly = {}
    for (player of obj.feed.entry) {
        readableXpTotal[getColumnValue(player, "name")] = getColumnValue(player, "xptotal")
        readableXpWeekly[getColumnValue(player, "name")] = getColumnValue(player, "xpweekly")
    }
    xpTotalData = Object.fromEntries(Object.entries(readableXpTotal).sort(([, a], [, b]) => b - a));
    xpWeeklyData = Object.fromEntries(Object.entries(readableXpWeekly).sort(([, a], [, b]) => b - a));
    updateLeaderboard()
}

function getColumnValue(row, col) {
    return row["gsx$" + col].$t
}
tick()

function tick() {
    getDataFromSheet()
    setTimeout(() => { tick() }, 60 * 1000);
}

function updateLeaderboard() {
    let xpTotalHtml = ""
    let placement = 1
    for (player in xpTotalData) {
        switch (placement) {
            case 1:
                totalFirstPlaceDiv.innerHTML = `
                <img src="https://www.mc-heads.net/player/${player}"/>
                <div class="first-place-text">
                <h1>#${placement}</h1>
                <h4>${player}</h4>
                <h5>${String(xpTotalData[player]).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</h5>
                </div>`
                break;
            case 2:
                totalSecondPlaceDiv.innerHTML = `
                <img src="https://www.mc-heads.net/body/${player}/right" />
                <div class="second-place-text">
                <h3>#${placement}</h3>
                <h6>${player}</h6>
                <p>${String(xpTotalData[player]).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</p>
                </div>
                `
                break;
            case 3:
                totalThirdPlaceDiv.innerHTML = `
                <img src="https://www.mc-heads.net/body/${player}/left"/>
                <div class="third-place-text">
                <h5>#${placement}</h5>
                <h6>${player}</h6>
                <p>${String(xpTotalData[player]).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</p>
                </div>
                `
                break;
            default:
                xpTotalHtml += `<tr>
                <th scope="row">#${placement}</th>
                <td><img class="total-player-face" src="https://www.mc-heads.net/avatar/${player}/100"> ${player}</td>
                <td>${String(xpTotalData[player]).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</td>
                </tr>`
        }
        placement++;
        // <td title="${String(data[user].exacttotal)}%">${String(data[user].total).replace(/(.)(?=(\d{3})+$)/g, '$1,')}%</td>
    }
    document.getElementById("total-leaderboard").innerHTML = xpTotalHtml
    let xpWeeklyHtml = ""
    placement = 1;
    for (player in xpWeeklyData) {
        switch (placement) {
            case 1:
                weeklyFirstPlaceDiv.innerHTML = `
                <img src="https://www.mc-heads.net/player/${player}"/>
                <div class="first-place-text">
                <h1>#${placement}</h1>
                <h4>${player}</h4>
                <h5>${String(xpWeeklyData[player]).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</h5>
                </div>`
                break;
            case 2:
                weeklySecondPlaceDiv.innerHTML = `
                <img src="https://www.mc-heads.net/body/${player}/right" />
                <div class="second-place-text">
                <h3>#${placement}</h3>
                <h6>${player}</h6>
                <p>${String(xpWeeklyData[player]).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</p>
                </div>
                `
                break;
            case 3:
                weeklyThirdPlaceDiv.innerHTML = `
                <img src="https://www.mc-heads.net/body/${player}/left"/>
                <div class="third-place-text">
                <h5>#${placement}</h5>
                <h6>${player}</h6>
                <p>${String(xpWeeklyData[player]).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</p>
                </div>
                `
                break;
            default:
                xpWeeklyHtml += `<tr>
                <th scope="row">#${placement}</th>
                <td><img class="total-player-face" src="https://www.mc-heads.net/avatar/${player}/100"> ${player}</td>
                <td>${String(xpWeeklyData[player]).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</td>
                </tr>`
        }
        placement++;
        // <td title="${String(data[user].exacttotal)}%">${String(data[user].total).replace(/(.)(?=(\d{3})+$)/g, '$1,')}%</td>
    }
    document.getElementById("weekly-leaderboard").innerHTML = xpWeeklyHtml
}
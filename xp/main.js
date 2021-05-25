let guildLevel = 0;
let xpTotalData = {}
let xpWeeklyData = {}
let xpDailyData = {}
let DailyWinsData = {}
let weeklyTimeData = {}
let xpScoreData = {}
let firstPlaceDiv = {}
let secondPlaceDiv = {}
let thirdPlaceDiv = {}
const leaderboards = ["total", "weekly", "daily", "minute-xp", "daily-wins", "weekly-time", "xp-score"]
for (lb of leaderboards) {
    firstPlaceDiv[lb] = document.getElementById(lb + "-div-1st")
    secondPlaceDiv[lb] = document.getElementById(lb + "-div-2nd")
    thirdPlaceDiv[lb] = document.getElementById(lb + "-div-3rd")
}
let sumOfXpTotal = 0
let sumOfXpWeekly = 0
let sumOfXpDaily = 0
let sumOfMinuteXp = 0
let sumOfDailyWins = 0
let sumOfWeeklyTime = 0
let sumOfXpScore = 0
const dailyGoal = 3000000000;
const weeklyGoal = 30000000000;
const hundredGoal = 136152150806;

async function getDataFromSheet() {
    let url = 'https://spreadsheets.google.com/feeds/list/1IEhwvAdHA0aApOCVkJcIHODgiN_jO_z2xjw36Jr1V28/od6/public/values?alt=json';

    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.log('error');
    }
    guildLevel = getColumnValue(obj.feed.entry[0], "guildlevel")
    let readableXpTotal = {}
    let readableXpWeekly = {}
    let readableXpDaily = {}
    let readableMinuteXp = {}
    let readableDailyWins = {}
    let readableWeeklyTime = {}
    let readableXpScore = {}
    for (player of obj.feed.entry) {
        readableXpTotal[getColumnValue(player, "name")] = getColumnValue(player, "xptotal")
        readableXpWeekly[getColumnValue(player, "name")] = getColumnValue(player, "xpweekly")
        readableXpDaily[getColumnValue(player, "name")] = getColumnValue(player, "xpdaily")
        readableMinuteXp[getColumnValue(player, "name")] = getColumnValue(player, "xpmin")
        readableDailyWins[getColumnValue(player, "name")] = getColumnValue(player, "dailywins")
        readableWeeklyTime[getColumnValue(player, "name")] = getColumnValue(player, "weeklytime")
        readableXpScore[getColumnValue(player, "name")] = getColumnValue(player, "xpscoretotal")
    }
    xpTotalData = Object.fromEntries(Object.entries(readableXpTotal).sort(([, a], [, b]) => b - a));
    xpWeeklyData = Object.fromEntries(Object.entries(readableXpWeekly).sort(([, a], [, b]) => b - a));
    xpDailyData = Object.fromEntries(Object.entries(readableXpDaily).sort(([, a], [, b]) => b - a));
    minuteXpData = Object.fromEntries(Object.entries(readableMinuteXp).sort(([, a], [, b]) => b - a));
    DailyWinsData = Object.fromEntries(Object.entries(readableDailyWins).sort(([, a], [, b]) => b - a));
    weeklyTimeData = Object.fromEntries(Object.entries(readableWeeklyTime).sort(([, a], [, b]) => b - a));
    xpScoreData = Object.fromEntries(Object.entries(readableXpScore).sort(([, a], [, b]) => b - a));
    sumOfXpTotal = getColumnValue(obj.feed.entry[0], "sumoftotal")
    sumOfXpWeekly = getColumnValue(obj.feed.entry[0], "sumofweekly")
    sumOfXpDaily = getColumnValue(obj.feed.entry[0], "sumofdaily")
    sumOfMinuteXp = getColumnValue(obj.feed.entry[0], "sumoflastminute")
    sumOfDailyWins = getColumnValue(obj.feed.entry[0], "sumofdailywins")
    sumOfWeeklyTime = getColumnValue(obj.feed.entry[0], "sumofweeklytime")
    sumOfXpScore = getColumnValue(obj.feed.entry[0], "sumofxpscore")
    updateLeaderboard()
}

function getColumnValue(row, col) {
    return row["gsx$" + col].$t
}
tick()

function tick() {
    getDataFromSheet()
    setTimeout(() => { tick() }, 10 * 1000);
}

function updateLeaderboard() {
    const weeklyGoalHTML = document.getElementById("weekly-goal")
    weeklyGoalHTML.style.width = Math.round((sumOfXpWeekly / weeklyGoal) * 100) + "%";
    weeklyGoalHTML.parentElement.title = "Weekly Goal Progress: " + makeNumberReadable(sumOfXpWeekly) + " XP / " + makeNumberReadable(weeklyGoal) + " XP"
    weeklyGoalHTML.innerHTML = ((sumOfXpWeekly / weeklyGoal) * 100).toFixed(2) + "%"
    const dailyGoalHTML = document.getElementById("daily-goal")
    dailyGoalHTML.style.width = Math.round((sumOfXpDaily / dailyGoal) * 100) + "%";
    dailyGoalHTML.parentElement.title = "Daily Goal Progress: " + makeNumberReadable(sumOfXpDaily) + " XP / " + makeNumberReadable(dailyGoal) + " XP"
    dailyGoalHTML.innerHTML = ((sumOfXpDaily / dailyGoal) * 100).toFixed(2) + "%"
    const hundredGoalHTML = document.getElementById("hundred-goal")
    const totBefore99 = 964654571418;
    hundredGoalHTML.style.width = Math.round(((sumOfXpTotal - totBefore99) / hundredGoal) * 100) + "%";
    hundredGoalHTML.parentElement.title = "Level 99-100 Progress ≈ " + makeNumberReadable(sumOfXpTotal - totBefore99) + " XP / " + makeNumberReadable(hundredGoal) + " XP"
    hundredGoalHTML.innerHTML = (((sumOfXpTotal - totBefore99) / hundredGoal) * 100).toFixed(2) + "%"
    const timeForPercentHTML = document.getElementById("time-for-percent")
    timeForPercentHTML.innerHTML = `<span id="xp-rate">Current XP rate: ${minutesToReadableTime(Math.round((estimateXpRequirement(guildLevel) / 100) / sumOfMinuteXp))} per %</span>`
    timeForPercentHTML.title = `${makeNumberReadable(sumOfMinuteXp)} XP/min & ~${makeNumberReadable(Math.round(estimateXpRequirement(guildLevel) / 100))} XP/%`

    document.getElementById("total-leaderboard").innerHTML = generateLeaderboardHTML(xpTotalData, "XP", "XP", "total", sumOfXpTotal)
    document.getElementById("weekly-leaderboard").innerHTML = generateLeaderboardHTML(xpWeeklyData, "XP", "XP", "weekly", sumOfXpWeekly)
    document.getElementById("daily-leaderboard").innerHTML = generateLeaderboardHTML(xpDailyData, "XP", "XP", "daily", sumOfXpDaily)
    document.getElementById("minute-xp-leaderboard").innerHTML = generateLeaderboardHTML(minuteXpData, "XP/min", "XP/min", "minute-xp", sumOfMinuteXp)
    document.getElementById("daily-wins-leaderboard").innerHTML = generateLeaderboardHTML(DailyWinsData, "Wins", "Win", "daily-wins", sumOfDailyWins)
    document.getElementById("weekly-time-leaderboard").innerHTML = generateLeaderboardHTML(weeklyTimeData, "", "", "weekly-time", sumOfWeeklyTime, minutesToReadableTime)
    document.getElementById("xp-score-leaderboard").innerHTML = generateLeaderboardHTML(xpScoreData, "Points", "Point", "xp-score", sumOfXpScore)
}

function generateLeaderboardHTML(data, unit, singleUnit, lb, sum, formatFunction = makeNumberReadable) {
    let html = ""
    placement = 1;
    for (player in data) {
        switch (placement) {
            case 1:
                firstPlaceDiv[lb].innerHTML = `
                <img src="https://www.mc-heads.net/player/${player}"/>
                <div class="first-place-text">
                <h1>#${placement}</h1>
                <h4>${player}</h4>
                <h5>${formatFunction(data[player])} ${data[player] == 1 ? singleUnit : unit}<br> ${((data[player] / sum) * 100 || 0).toFixed(2)}%</h5>
                
                </div>`
                break;
            case 2:
                secondPlaceDiv[lb].innerHTML = `
                <img src="https://www.mc-heads.net/body/${player}/right" />
                <div class="second-place-text">
                <h3>#${placement}</h3>
                <h6>${player}</h6>
                <p>${formatFunction(data[player])} ${data[player] == 1 ? singleUnit : unit}<br> ${((data[player] / sum) * 100 || 0).toFixed(2)}%</p>
                </div>
                `
                break;
            case 3:
                thirdPlaceDiv[lb].innerHTML = `
                <img src="https://www.mc-heads.net/body/${player}/left"/>
                <div class="third-place-text">
                <h5>#${placement}</h5>
                <h6>${player}</h6>
                <p>${formatFunction(data[player])} ${data[player] == 1 ? singleUnit : unit}<br> ${((data[player] / sum) * 100 || 0).toFixed(2)}%</p>
                </div>
                `
                break;
            default:
                html += `<tr title=" Sum of all players: ${String(sum).replace(/(.)(?=(\d{3})+$)/g, '$1,')} ${data[player] == 1 ? singleUnit : unit}">
                <th scope="row">#${placement}</th>
                <td><img class="player-face" src="https://www.mc-heads.net/avatar/${player}/100"> ${player}</td>
                <td>${formatFunction(data[player])} ${data[player] == 1 ? singleUnit : unit}</td>
                <td title="% of total">${((data[player] / sum) * 100 || 0).toFixed(2)}%</td>
                </tr>`
        }
        placement++;
        // <td title="${String(data[user].exacttotal)}%">${String(data[user].total).replace(/(.)(?=(\d{3})+$)/g, '$1,')}%</td>
    }
    return html
}

function makeNumberReadable(number) {
    return String(number).replace(/(.)(?=(\d{3})+$)/g, '$1,')
}

function minutesToReadableTime(minutes) {
    if (!isFinite(minutes)) return "∞min"
    return ((minutes >= 60) ? (makeNumberReadable(Math.floor(minutes / 60)) + "h ") : "") + (minutes % 60) + "min"
}

function estimateXpRequirement(level) {
    return 2364629339 * Math.pow(1.15, level - 70)
}
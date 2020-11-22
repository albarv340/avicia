let total = {}
let lastUpdatedEmeralds = "";

async function getDataFromSheet() {
    let url = 'https://spreadsheets.google.com/feeds/list/10OzD-lY4Rhk1nE6n44uM54M-ycCnBb33zFII3sovvhw/od6/public/values?alt=json';
    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.log('error');
    }
    const sheetData = obj.feed.entry
    total.xp = Number(sheetData[0].gsx$totalxp.$t)
    total.emeralds = Number(sheetData[0].gsx$totalemeralds.$t)
    total.wars = Number(sheetData[0].gsx$totalwars.$t)
    total.playerwars = Number(sheetData[0].gsx$totalplayerwars.$t)
    lastUpdatedEmeralds = sheetData[0].gsx$lastupdatedemeralds.$t
    console.log(total)

    return sheetDataToReadableArray(sheetData)
}

function sheetDataToReadableArray(sheetData) {
    let users = []
    let xp = []
    let emeralds = []
    let wars = []
    for (user in sheetData) {
        let userData = sheetData[user].content.$t.split(/, |: /);
        let tmpXp = {}
        tmpXp[userData[2]] = userData[3]
        xp[userData[1]] = tmpXp
    }
    for (user in sheetData) {
        let userData = sheetData[user].content.$t.split(/, |: /);
        let tmpEm = {}
        tmpEm[userData[6]] = userData[7]
        emeralds[userData[5]] = tmpEm
    }
    for (user in sheetData) {
        let userData = sheetData[user].content.$t.split(/, |: /);
        let tmpWars = {}
        tmpWars[userData[10]] = userData[11]
        wars[userData[9]] = tmpWars
    }
    for (userEm in emeralds) {
        let tmpUser = {}
        for (userXp in xp) {
            if (userEm == userXp) {
                tmpUser.emeralds = emeralds[userEm].emerald
                tmpUser.xp = xp[userXp].xp
                if (typeof (wars[userXp]) != "undefined") {
                    tmpUser.wars = wars[userXp].wars
                } else {
                    tmpUser.wars = 0
                }
            }
        }
        users[userEm] = tmpUser
    }
    for (user in users) {
        let tmpUser = {}
        let portXP = 0
        let portEmeralds = 0
        let portWars = 0
        tmpUser.xp = Number(users[user].xp)
        tmpUser.emeralds = Number(users[user].emeralds)
        tmpUser.wars = Number(users[user].wars)
        portXP = (tmpUser.xp / total.xp) * 100 || 0
        portEmeralds = (tmpUser.emeralds / total.emeralds) * 100 || 0
        portWars = (tmpUser.wars / total.playerwars) * 100 || 0
        console.log(portWars)
        tmpUser.total = Math.round((portXP - -portEmeralds - -portWars) / 3 * 100) / 100
        tmpUser.exacttotal = (portXP - -portEmeralds - -portWars) / 3
        console.log(tmpUser)
        users[user] = tmpUser
    }
    return users
}

async function showInfo(order) {
    let users = await getDataFromSheet();
    let leaderboard = document.getElementById("leaderboard")
    let selected = document.getElementById(order)
    let headers = document.getElementsByTagName("th")
    for (header of headers) {
        header.style.backgroundColor = "#454d55"
    }
    selected.style.backgroundColor = "#656d75"
    leaderboard.innerHTML = `<tr>
                            <th>0</th>
                            <td scope="row">Total:</td>
                            <td>${String(total.xp).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</td>
                            <td title="Last updated: ${String(lastUpdatedEmeralds)} UTC + 0">${String(total.emeralds).replace(/(.)(?=(\d{3})+$)/g, '$1,')} Emeralds</td>
                            <td>${String(total.wars).replace(/(.)(?=(\d{3})+$)/g, '$1,')} Wars</td>
                            <td>100%</td>
                        </tr>`
    if (typeof (total[order]) == "undefined") {
        leaderboard.innerHTML += leaderboardGenerator(users, "exacttotal")
    } else {
        leaderboard.innerHTML += leaderboardGenerator(users, order)
    }
}

function leaderboardGenerator(data, area) {
    let areaData = {}
    let res = ""
    for (user in data) {
        areaData[user] = data[user][area]
    }
    areaDataSorted = Object.keys(areaData).sort(function (a, b) { return areaData[b] - areaData[a] })
    let placement = 1
    for (user of areaDataSorted) {
        res += `<tr>
                    <th scope="row">${placement}</th>
                    <td>${user}</td>
                    <td>${String(data[user].xp).replace(/(.)(?=(\d{3})+$)/g, '$1,')} XP</td>
                    <td title="Last updated: ${String(lastUpdatedEmeralds)} UTC + 0">${String(data[user].emeralds).replace(/(.)(?=(\d{3})+$)/g, '$1,')} Emeralds</td>
                    <td>${String(data[user].wars).replace(/(.)(?=(\d{3})+$)/g, '$1,')} Wars</td>
                    <td title="${String(data[user].exacttotal)}%">${String(data[user].total).replace(/(.)(?=(\d{3})+$)/g, '$1,')}%</td>
                </tr>`
        placement++
    }
    return res
}

showInfo("exacttotal")
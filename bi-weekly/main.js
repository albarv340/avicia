let total = {}

async function getDataFromSheet() {
    let url = 'https://spreadsheets.google.com/feeds/list/10OzD-lY4Rhk1nE6n44uM54M-ycCnBb33zFII3sovvhw/od6/public/values?alt=json';
    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.log('error');
    }
    const sheetData = obj.feed.entry
    total.xp = sheetData[0].gsx$totalxp.$t
    total.emeralds = sheetData[0].gsx$totalemeralds.$t
    total.wars = sheetData[0].gsx$totalwars.$t
    total.playerwars = sheetData[0].gsx$totalplayerwars.$t

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
                if (typeof(wars[userXp]) != "undefined") {
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
        tmpUser.xp = users[user].xp
        tmpUser.emeralds = users[user].emeralds
        tmpUser.wars = users[user].wars
        portXP = (tmpUser.xp / total.xp) * 100
        portEmeralds = (tmpUser.emeralds / total.emeralds) * 100
        portWars = (tmpUser.wars / total.playerwars) * 100
        tmpUser.total = Math.round((portXP - -portEmeralds - -portWars) / 3 * 100) / 100
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
                            <td>${String(total.xp).replace(/(.)(?=(\d{3})+$)/g,'$1,')} XP</td>
                            <td>${String(total.emeralds).replace(/(.)(?=(\d{3})+$)/g,'$1,')} Emeralds</td>
                            <td>${String(total.wars).replace(/(.)(?=(\d{3})+$)/g,'$1,')} Wars</td>
                            <td>100%</td>
                        </tr>`
    if (typeof(total[order]) == "undefined") {
        leaderboard.innerHTML += leaderboardGenerator(users, "total")
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
    areaDataSorted = Object.keys(areaData).sort(function(a, b) { return areaData[a] - areaData[b] })
    let placement = 1
    for (user of areaDataSorted.reverse()) {
        res += `<tr>
                    <th scope="row">${placement}</th>
                    <td>${user}</td>
                    <td>${String(data[user].xp).replace(/(.)(?=(\d{3})+$)/g,'$1,')} XP</td>
                    <td>${String(data[user].emeralds).replace(/(.)(?=(\d{3})+$)/g,'$1,')} Emeralds</td>
                    <td>${String(data[user].wars).replace(/(.)(?=(\d{3})+$)/g,'$1,')} Wars</td>
                    <td>${String(data[user].total).replace(/(.)(?=(\d{3})+$)/g,'$1,')}%</td>
                </tr>`
        placement++
    }
    return res
}

showInfo("total")
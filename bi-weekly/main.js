async function getDataFromSheet() {
    let url = 'https://spreadsheets.google.com/feeds/list/10OzD-lY4Rhk1nE6n44uM54M-ycCnBb33zFII3sovvhw/od6/public/values?alt=json#gid=251992215';
    let obj = null;

    try {
        obj = await (await fetch(url)).json();
    } catch (e) {
        console.log('error');
    }
    const sheetData = obj.feed.entry
    return sheetDataToReadableArray(sheetData)
}

function sheetDataToReadableArray(sheetData) {
    let users = []
    let xp = []
    let emeralds = []
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
    for (userEm in emeralds) {
        let tmpUser = {}
        for (userXp in xp) {
            if (userEm == userXp) {
                tmpUser.emeralds = emeralds[userEm].emerald
                tmpUser.xp = xp[userXp].xp
            }
        }
        users[userEm] = tmpUser
    }
    console.log(users)
    return users
}

async function showInfo() {
    let users = await getDataFromSheet();
    let XPHTML = document.getElementById("xp-leaderboard")
    let emHTML = document.getElementById("em-leaderboard")
    XPHTML.innerHTML += leaderboardGenerator(users, "xp", "XP")
    emHTML.innerHTML += leaderboardGenerator(users, "emeralds", "Emeralds")
}

function leaderboardGenerator(data, area, name) {
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
                    <td>${String(data[user][area]).replace(/(.)(?=(\d{3})+$)/g,'$1,')} ${name}</td>
                </tr>`
        placement++
    }
    return res
}

showInfo()
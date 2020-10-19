async function getDataFromSheet() {
    let url = 'https://spreadsheets.google.com/feeds/list/1-NkrIfI4RrHkQJ7np1lgfaxUa_RVs2yPcx49LdGc9x0/od6/public/values?alt=json';
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
    users = []
    for (user in sheetData) {
        let username = sheetData[user].gsx$name.$t;
        let userData = sheetData[user].content.$t.split(/, |: /);
        let tmpUser = {}
        for (let i = 0; i < 12; i += 2) {
            tmpUser[userData[i]] = userData[i + 1]
        }
        users[username] = tmpUser
    }
    return users
}

async function showInfo() {
    let users = await getDataFromSheet();
    let XPHTML = document.getElementById("xp-leaderboard")
    let emHTML = document.getElementById("em-leaderboard")
    XPHTML.innerHTML += leaderboardGenerator(users, "xptotal", "XP")
    emHTML.innerHTML += leaderboardGenerator(users, "etotal", "Emeralds")
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
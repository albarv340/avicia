const playerName = window.location.search.split("=").pop().replace(/%20/g, ' ');
const maxValues = {
    "Total Level": 23660, "combat": 1484, "farming": 1848, "fishing": 1848, "mining": 1848, "woodcutting": 1848, "alchemism": 1848, "armouring": 1848, "cooking": 1848, "jeweling": 1848, "scribing": 1848, "tailoring": 1848, "weaponsmithing": 1848, "woodworking": 1848,
    'Main Quests': 1666,
    'Slaying Mini-Quests': 406,
    'Gathering Mini-Quests': 1344,
    'Discoveries': 8320,
    'Unique Dungeons': 238,
    'Unique Raids': 56
}

const colorScheme = ["#888888", "#888888", "#6562be", "#6562be", "#6562be", "#6562be", "#6562be", "#6562be", "#6562be", "#6562be", "#6562be", "#6562be", "#6562be", "#6562be", "#2c57ab", "#2c57ab", "#2c57ab", "#0f592f", "#0f592f", "#0f592f"]

async function getPlayerData() {
    document.getElementById("title").innerText = "Wynncraft Completionist Status - " + playerName
    let res = {};
    const url = `https://api.wynncraft.com/v2/player/${playerName}/stats`;
    let obj = null;

    try {
        obj = await (await fetch(url)).json();
        res = obj
    } catch (e) {
        console.log('error');
        document.getElementById("title").innerHTML = "Invalid player name. Example: <a href='?player=Salted'>Salted</a>"
    }

    let levels = {}
    levels['Total Level'] = 0;
    levels['Main Quests'] = 0;
    levels['Slaying Mini-Quests'] = 0;
    levels['Gathering Mini-Quests'] = 0;
    levels['Discoveries'] = 0;
    levels['Unique Dungeons'] = 0;
    levels['Unique Raids'] = 0;
    for (const c in res.data[0].characters) {
        const character = res.data[0].characters[c]
        for (const prof in character.professions) {
            typeof (levels[prof]) == 'undefined' ? levels[prof] = character.professions[prof].level : levels[prof] += character.professions[prof].level
            levels['Total Level'] += character.professions[prof].level;
        }
        levels['Main Quests'] += character.quests.list.filter(a => !a.includes("Mini-Quest")).length;
        levels['Slaying Mini-Quests'] += character.quests.list.filter(a => a.includes("Mini-Quest - Slay")).length;
        levels['Gathering Mini-Quests'] += character.quests.list.filter(a => a.includes("Mini-Quest - Gather")).length;
        levels['Discoveries'] += character.discoveries;
        levels['Unique Dungeons'] += character.dungeons.list.length;
        levels['Unique Raids'] += character.raids.list.length;
    }

    let html = ""
    let index = 0;
    for (const prof in maxValues) {
        const percent = (levels[prof] / maxValues[prof]) * 100;
        html += `<span style="color:${colorScheme[index]}">${(prof[0].toUpperCase() + prof.slice(1)).padEnd(25)}</span> | ${(levels[prof] + "").padStart(6)} / ${(maxValues[prof] + "").padEnd(6)} | <span style="color:rgb(${(100 - percent) * 5}, ${percent * 5}, 0)">${percent.toFixed(2).padStart(6)}% </span><br>`
        index++;
    }
    document.getElementById('content').innerHTML = html;
}
getPlayerData();

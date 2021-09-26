const resultElement = document.getElementById('result');
let goodItemData = {};



let allItemData = {}
fetch("./itemList.json").then(response =>
    response.json())
    .then(json => {
        allItemData = json
        setUpNewItem("Discoverer")
    })

function getEncodedCharacterForNumber(number) {
    let baseValue = 1003520; // 0xF5000
    return String.fromCodePoint(baseValue - -number)
}

function getStatEditingHtml(itemName) {
    let item = allItemData['items'].filter(e => e.displayName == itemName)[0]
    goodItemData[itemName] = {}
    let html = `<h3>${itemName}</h3><form id="statsForm">`;
    let orderedStats = Object.keys(item.statuses).sort((a, b) => (allItemData['identificationOrder']['order'][a] || -1) - (allItemData['identificationOrder']['order'][b] || -1)).filter(e => !item.statuses[e].isFixed)
    for (stat of orderedStats) {
        let statValue = item.statuses[stat].baseValue;
        let minRoll = Math.round(statValue * .3);
        let maxRoll = Math.round(statValue * 1.3);
        if (statValue < 0 || allItemData['identificationOrder']['inverted'].includes(stat)) {
            minRoll = Math.round(statValue * 1.3);
            maxRoll = Math.round(statValue * .7);
        }
        html += `${stat}: ${minRoll} - ${maxRoll} <input type="${document.getElementById('inputTypes').value}" min="${minRoll}" max="${maxRoll}" value="${statValue}" id="${stat}" name="${stat}"></input><br>`;
        goodItemData[itemName][stat] = {}
        goodItemData[itemName][stat].min = minRoll;
        goodItemData[itemName][stat].max = maxRoll;
    }
    html += `Rerolls: <input type="number" min="0" value=6 id="rerolls">`
    html += `<input type="submit"/></form>`
    return html;
}

function setUpNewItem(itemName) {
    document.getElementById('editor').innerHTML = getStatEditingHtml(itemName)
    document.getElementById("statsForm").addEventListener("submit", e => {
        e.preventDefault();
        let itemName = document.getElementById("editor").children[0].innerHTML;
        let resultText = "󵿰" + itemName + "󵿲"; // Start + Name + Separator
        let data = new FormData(document.getElementById("statsForm"));
        for (const [name, value] of data) {
            let wynntilsRepresentation = (value - goodItemData[itemName][name].min) * 4;
            if (goodItemData[itemName][name].max - goodItemData[itemName][name].min > 100) {
                if (value < 0) {
                    wynntilsRepresentation = Math.round(((value - goodItemData[itemName][name].min) / (goodItemData[itemName][name].max - goodItemData[itemName][name].min)) * 100) * -2.4 + 400
                } else {
                    wynntilsRepresentation = Math.round(((value - goodItemData[itemName][name].min) / (goodItemData[itemName][name].max - goodItemData[itemName][name].min)) * 100) * 4
                }
                if (wynntilsRepresentation % 1 != 0) {
                    alert("invalid value of " + name)
                }
            }
            resultText += getEncodedCharacterForNumber(wynntilsRepresentation);
        }
        resultText += "󵿲󵀀" + getEncodedCharacterForNumber(document.getElementById('rerolls').value) + "󵿱"; // Rerolls and powders
        resultElement.innerHTML = resultText;
        copyToClipboard(resultText)
        alert("copied " + resultText + " to clipboard")
    })
}

function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

document.getElementById('changeItemButton').addEventListener('click', e => {
    try {
        setUpNewItem(document.getElementById('ItemName').value)
    } catch (e) {
        alert("Invalid item (case sensitive)")
    }
})

document.getElementById('ItemName').addEventListener('keypress', e => {
    if (e.key == "Enter") {
        try {
            setUpNewItem(document.getElementById('ItemName').value)
        } catch (e) {
            alert("Invalid item (case sensitive)")
        }
    }
})
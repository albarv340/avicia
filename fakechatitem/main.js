const resultElement = document.getElementById('result');
let goodItemData = {};
let currentItem = "";


let allItemData = {}
fetch("./itemList.json").then(response =>
    response.json())
    .then(json => {
        allItemData = json
        setUpNewItem("Discoverer")
        autocomplete(document.getElementById("ItemName"), json.items.map(e => e.displayName));
    })

function getEncodedCharacterForNumber(number) {
    let baseValue = 1003520; // 0xF5000
    return String.fromCodePoint(baseValue - -number)
}

function getStatEditingHtml(itemName) {
    let item = allItemData['items'].filter(e => e.displayName == itemName)[0]
    goodItemData[itemName] = {}
    let html = `<h3>${itemName} <span id="totalPercent"></span></h3><form id="statsForm">`;
    let orderedStats = Object.keys(item.statuses).sort((a, b) => (allItemData['identificationOrder']['order'][a] || -1) - (allItemData['identificationOrder']['order'][b] || -1)).filter(e => !item.statuses[e].isFixed)
    for (stat of orderedStats) {
        let statValue = item.statuses[stat].baseValue;
        let minRoll = Math.round(statValue * .3);
        let maxRoll = Math.round(statValue * 1.3);
        if (statValue < 0 || allItemData['identificationOrder']['inverted'].includes(stat)) {
            minRoll = Math.round(statValue * 1.3);
            maxRoll = Math.round(statValue * .7);
        }
        if (statValue == 1) {
            minRoll = 1;
            maxRoll = 1;
        }
        html += `<div class="itemStat">${stat}: ${minRoll} - ${maxRoll} <input type="range" min="${minRoll}" max="${maxRoll}" value="${statValue}" id="${stat}Range" name="${stat}" onchange="updateTextField('${stat}')"></input>`;
        html += `<input type="number" min="${minRoll}" max="${maxRoll}" value="${statValue}" id="${stat}TextField" onchange="updateRange('${stat}')"></input><div id="${stat}Percentage"></div><br></div>`;
        goodItemData[itemName][stat] = {}
        goodItemData[itemName][stat].min = minRoll;
        goodItemData[itemName][stat].max = maxRoll;
    }
    html += `Rerolls: <input type="number" min="0" value=6 id="rerolls"><br><br>`
    html += `<input type="submit"/></form>`
    return html;
}

function setUpNewItem(itemName) {
    currentItem = itemName;
    document.getElementById('editor').innerHTML = getStatEditingHtml(itemName)
    document.getElementById("statsForm").addEventListener("submit", e => {
        e.preventDefault();
        let resultText = "󵿰" + itemName + "󵿲"; // Start + Name + Separator
        let data = new FormData(document.getElementById("statsForm"));
        for (const [name, value] of data) {
            let wynntilsRepresentation = (value - goodItemData[itemName][name].min) * 4;
            item = allItemData['items'].filter(e => e.displayName == itemName)[0]
            if (Math.abs(item.statuses[name].baseValue) > 100) {
                wynntilsRepresentation = Math.round((value * 100.0 / item.statuses[name].baseValue) - 30) * 4; // Calculates the % roll
            }
            resultText += getEncodedCharacterForNumber(wynntilsRepresentation);
        }
        resultText += "󵿲󵀀" + getEncodedCharacterForNumber(document.getElementById('rerolls').value) + "󵿱"; // Rerolls and powders
        copyToClipboard(resultText)
        resultElement.innerHTML = `Copied <code style='color:lightblue;padding:3px;cursor:pointer' onclick="copyToClipboard('${resultText}')"> ${resultText} </code> to clipboard`;
    })
    updatePercentages();
}

function updatePercentages() {
    let data = new FormData(document.getElementById("statsForm"));
    let percentageSum = 0;
    let amountOfStats = 0;
    for (const [name, value] of data) {
        let item = allItemData['items'].filter(e => e.displayName == currentItem)[0]
        let rollLimits = goodItemData[currentItem][name];
        let percentage = Math.floor((value - rollLimits.min) / (rollLimits.max - rollLimits.min) * 100); // Calculates the % roll
        if (allItemData['identificationOrder']['inverted'].includes(name)) {
            percentage = 100 - percentage;
        }
        if (!isNaN(percentage)) {
            document.getElementById(name + "Percentage").innerHTML = percentage + "%";
            percentageSum += percentage;
            amountOfStats++;
        }
        console.log(percentage)
    }
    document.getElementById("totalPercent").innerHTML = Math.floor(percentageSum / amountOfStats) + "%"
}

function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function updateRange(range) {
    document.getElementById(range + 'Range').value = document.getElementById(range + 'TextField').value
    updatePercentages();
}

function updateTextField(textField) {
    document.getElementById(textField + 'TextField').value = document.getElementById(textField + 'Range').value
    updatePercentages()
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
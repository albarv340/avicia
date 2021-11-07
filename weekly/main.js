const nf = Intl.NumberFormat();

let allData = {};
const scoringSystem = {
    'ΔXP': { 'threshold': 1000000000, 'perTicket': 50000000, 'perTicketAfterThreshold': 250000000 },
    'ΔChests': { 'threshold': 1000, 'perTicket': 200, 'perTicketAfterThreshold': Infinity },
    'ΔWars': { 'threshold': Infinity, 'perTicket': 5, 'perTicketAfterThreshold': 5 },
    'ΔRaids': { 'threshold': 5, 'perTicket': 1, 'perTicketAfterThreshold': Infinity },
    'ΔMobs': { 'threshold': 2500, 'perTicket': 500, 'perTicketAfterThreshold': Infinity },
}
let order = "Tickets";

async function getAllData() {
    const url = "https://script.googleusercontent.com/macros/echo?user_content_key=s5BK0P0Q0R74mD7Ecrsj_6lTfSvYB0YYCzv9_yKeDRe4wZHJ9SvxZXBpfvmWz9LNpF3OWz7XFHiN2oukYnpDecr8XOj0n1BGm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnDC9E2c7REtGCXhOApFyPxhXuwQND4iUDsMzWa9-JsO_L11ofpxE8_98rotzPrOg47hSWPPZDw65nz4TRABXsspa7xjVlnIHINz9Jw9Md8uu&lib=MpkOu-RVQ6F5GCQ0aXfNKxmDMFUOG0MwY";

    let obj = null;

    try {
        obj = await (await fetch(url)).json();
        allData = obj;
    } catch (e) {
        console.log('error');
    }
    updateLeaderboard(order);
}

function tableRow(player, position) {
    const stats = ['Tickets', 'ΔXP', 'ΔChests', 'ΔMobs', 'ΔRaids', 'ΔWars']
    return `<tr ${order == 'Tickets' ? `class="position${position}` : ''}">
    <th scope="row">#${position}</th>
    <td><img class="player-face" src="https://www.mc-heads.net/avatar/${player.Name}/100"> ${player.Name}</td>
    ${stats.map((e) => { return `<td title="${tdTitle(e, player)}">${nf.format(player[e])}</td>!` }).toString().replaceAll(/!,|!|\[|\]/g, '')}
    </tr>`
    // The elaborate map function turns the array into an array of html elements then turns it into a string and replaces the placeholder character ! and also the commas and the square brackets that get added between every element of the list and at the start and end, so that the html code doesn't have a bunch of extra commas in it
}

function tdTitle(stat, player) {
    if (!scoringSystem[stat]) return '';
    const threshold = scoringSystem[stat]['threshold'];
    const perTicket = scoringSystem[stat]['perTicket'];
    const perTicketAfterThreshold = scoringSystem[stat]['perTicketAfterThreshold'];
    return `
${nf.format(player[stat])} / ${nf.format(threshold)} ${stat}
${player[stat] > threshold ? Math.floor((threshold / perTicket + (player[stat] - threshold) / perTicketAfterThreshold)) : Math.floor(player[stat] / perTicket)} Earned tickets
${player[stat] > threshold ? nf.format(perTicketAfterThreshold - ((player[stat] - threshold) % perTicketAfterThreshold)) : nf.format(perTicket - (player[stat] % perTicket))} ${stat} Until next ticket
`;
}

function tableHeader(orderBy) {
    const headers = ['Player', 'Tickets', 'ΔXP', 'ΔChests', 'ΔMobs', 'ΔRaids', 'ΔWars']
    return `<tr><th>#</th>${headers.map((e) => { return `<td class="header" onclick="updateLeaderboard('${e}')">${e + (orderBy == e ? ' ↓' : '')}</td>!` }).toString().replaceAll(/!,|!|\[|\]/g, '')}</tr>`;
    // The elaborate map function turns the array into an array of html elements then turns it into a string and replaces the placeholder character ! and also the commas and the square brackets that get added between every element of the list and at the start and end, so that the html code doesn't have a bunch of extra commas in it
}

function updateLeaderboard(orderBy) {
    order = orderBy;
    let table = document.getElementById('table');
    let html = tableHeader(orderBy);
    let leaderboard = Object.keys(allData).sort((a, b) => allData[b][orderBy] - allData[a][orderBy])
    for (const player in leaderboard) {
        html += tableRow(allData[leaderboard[player]], player - - 1);
    }
    console.log(html)
    table.innerHTML = html;
}
getAllData()
setInterval(() => {
    console.log('hi')
    getAllData();
}, 60 * 1000);
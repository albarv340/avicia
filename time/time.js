let queryDict = {}
location.search.substr(1).split("&").forEach(function (item) { queryDict[item.split("=")[0]] = item.split("=")[1] })
let contentHTML = document.getElementById("content")

// console.log(queryDict.ms.length)

if (typeof (queryDict.ms) == "undefined" || !/^\d\d\%3A\d\d/.test(queryDict.ms)) {
    contentHTML.innerHTML = `<form action="" id="time-selector">
                                <label for="appt">Select a UTC time:</label>
                                <input type="time" id="ms" name="ms">
                                <input type="submit">
                            </form>`
} else {
    const hour = Number(queryDict.ms.substr(0, 2))
    const hourString = queryDict.ms.substr(0, 2)
    const minute = Number(queryDict.ms.substr(5, 7))
    const minuteString = queryDict.ms.substr(5, 7)
    const UTCTime = `${hourString}:${minuteString}:00 UTC is `
    const timeString = new Date(new Date().setHours(hour, minute - new Date().getTimezoneOffset(), 0)).toTimeString()
    const time = timeString.substr(0, 8)
    const timeZone = timeString.substr(9, timeString.length)
    document.querySelector('meta[name="description"]').setAttribute("content", UTCTime + time + " in " + timeZone);
    contentHTML.innerHTML = `<p>${UTCTime}</p><h1>${time}</h1><p>in ${timeZone}</p>`
}

export function parseDate (dateString) {
    let eventTime = new Date(dateString)
    let currentTime = new Date()
    let hours = eventTime.getHours()
    let partOfDay = hours >= 12 ? "pm" : "am"
    if (hours > 12) {
        hours = hours % 12
    }
    if(hours == 0) {
        hours = 12
    }
    let minutes = eventTime.getMinutes() + ""
    if (minutes.length === 1) {
        minutes = "0" + minutes
    }

    let timeString = hours + ":" + minutes + partOfDay

    let choppedEvent = new Date(dateString)
    let choppedCurrent = new Date()
    choppedEvent.setMilliseconds(0); choppedEvent.setSeconds(0); choppedEvent.setMinutes(0); choppedEvent.setHours(0);
    choppedCurrent.setMilliseconds(0); choppedCurrent.setSeconds(0); choppedCurrent.setMinutes(0); choppedCurrent.setHours(0);

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    eventMonth = months[eventTime.getMonth()]

    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    let dayOfWeek = days[eventTime.getDay()]


    let dayInMilli = 24 * 60 * 60 * 1000

    if (eventTime.getDate() === currentTime.getDate()) {
        return "Today at " + timeString
    }
    else if (choppedEvent - choppedCurrent <= dayInMilli && choppedEvent - choppedCurrent > 0)
        return "Tomorrow at " + timeString
    else if (choppedCurrent - choppedEvent <= dayInMilli && choppedCurrent - choppedEvent > 0)
        return "Yesterday at " + timeString
    else if (choppedCurrent - choppedEvent > 0) {
        return eventMonth + " " + eventTime.getDate() + ", " + eventTime.getFullYear()
    }
    else {
        return dayOfWeek + " at " + timeString
    }
}
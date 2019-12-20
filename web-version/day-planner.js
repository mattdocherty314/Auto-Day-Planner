function pageLoad() {
    let startButton = document.getElementById("start");
    startButton.addEventListener("click", main);
}

function main() {
    let output = document.getElementById("output");
    output.innerHTML = "";

    let allTimes = createAllTimes();
    let emptyDay = createEmptyDay();
    let schedule = dict(allTimes, emptyDay);

    let events = getEvents();
    let times = getTimes();
    let durations = getDurations();
    if (times === -1 || durations === -1) {
        return;
    }
    if (events.length !== times.length || events.length !== durations.length) {
        output.innerHTML += "You have mismatching amounts of items";
        return;
    }

    let sortedIndices = getOrder(durations);
    let sortedArrays = sortArrays(events, times, durations, sortedIndices);
    events = sortedArrays["events"];
    times = sortedArrays["times"];
    durations = sortedArrays["durations"];

    schedule = placeFixedSchedule(events, times, durations, schedule);
    if (schedule === null) {
        return;
    }
    schedule = organiseTimes(events, times, durations, schedule);

    displaySchedule(schedule);
}

function createAllTimes() {
    let times = []
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m++) {
            if (m < 10) {
                times.push(`${h}:0${m}`);
            } else {
                times.push(`${h}:${m}`);
            }
        }
    }

    return times;
}

function createEmptyDay() {
    let times = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m++) {
            times.push("Empty");
        }
    }

    return times;
}

function getEvents() {
    let eventsElement = document.getElementById("events-list");
    return eventsElement.value.split(", ");
}

function getTimes() {
    let timesElement = document.getElementById("times-list");
    let times = timesElement.value.split(", ");
    for (let t = 0; t < times.length; t++) {
        if (!isValidTime(times[t])) {
            return -1;
        }
    }
    return times;
}

function getDurations() {
    let durationsElement = document.getElementById("durations-list");
    let durations = durationsElement.value.split(", ");
    for (let d = 0; d < durations.length; d++) {
        if (!isValidDur(durations[d])) {
            return -1;
        }
    }
    return durations;
}

function getOrder(drs) {
    let sortOrder = [];
    let tempDur = [];
    
    drs.forEach(d => {
        tempDur.push(d);
    });

    tempDur.forEach(i => {
        highDurVal = 0;
        highDurIdx = -1;
        for (let d = 0; d < tempDur.length; d++) {
            if (tempDur[d] !== null) {
                if (parseInt(tempDur[d]) > highDurVal) {
                    highDurVal = parseInt(tempDur[d]);
                    highDurIdx = d;
                }
            }
        }
        tempDur[highDurIdx] = null;
        sortOrder.push(highDurIdx);
    });

    return sortOrder;
}

function sortArrays(evs, tms, drs, srt) {
    let tempEvs = [];
    let tempTms = [];
    let tempDrs = [];

    srt.forEach(s => {
        tempEvs.push(evs[s]);
        tempTms.push(tms[s]);
        tempDrs.push(drs[s]);
    });

    return {
        "events": tempEvs,
        "times": tempTms,
        "durations": tempDrs
    }
}

function placeFixedSchedule(evs, tms, drs, sch) {
    let output = document.getElementById("output");

    for (let e = 0; e < evs.length; e++) {
        if (tms[e] !== "") {
            for (let d = 0; d < parseInt(drs[e]); d++) {
                if (d === 0) {
                    time = time = tms[e].split(":");
                }
                if (parseInt(time[1]) < 10 && time[1].length < 2) {
                    time[1] = `0${time[1]}`
                }
                if (parseInt(time[1]) === 60) {
                    time[1] = "00";
                    time[0] = (parseInt(time[0])+1).toString();
                }
                if (parseInt(time[0]) > 23) {
                    output.innerHTML += `${evs[e]} is going ${parseInt(drs[e]-d)} minutes into the next day.<br/>`;
                    return;
                }
                else {
                    let schTime = time.join(":");
                    if (sch[schTime] !== "Empty") {
                        output.innerHTML += `Scheduling conflict at ${schTime}, between '${sch[schTime]}' and '${evs[e]}'!<br/>`;
                        output.innerHTML += "Stopping program."
                        return null;
                    }
                    sch[schTime] = evs[e];
                    time[1] = (parseInt(time[1])+1).toString();
                }
            }
        }
    }

    return sch;
}

function organiseTimes(evs, tms, drs, sch) {
    let output = document.getElementById("output");

    for (let e = 0; e < evs.length; e++) {
        if (tms[e] === "") {
            for (let event_time of Object.entries(sch))  {
                let time = event_time[0];
                let event = event_time[1];

                let possTime = time;
                let timeUsed = true;
                
                if (event === "Empty") {
                    timeUsed = false;
                    let testTime = [];
                    for (let d = 0; d < parseInt(drs[e]); d++) {
                        if (d === 0) {
                            testTime = possTime.split(":");
                        }
                        if ((parseInt(testTime[1]) < 10) && (testTime[1].length < 2)) {
                            testTime[1] = `0${testTime[1]}`;
                        }
                        if (parseInt(testTime[1]) === 60) {
                            testTime[1] = "00";
                            testTime[0] = (parseInt(testTime[0])+1).toString();
                        }
                        if (parseInt(testTime[0]) > 23) {
                            break;
                        }
                        else {
                            let schTime = testTime.join(":");
                            testTime[1] = (parseInt(testTime[1])+1).toString();
                            if (sch[schTime] !== "Empty") {
                                timeUsed = true;
                            }
                        }
                    }
                    
                    if (timeUsed === false) {
                        let testTime = [];
                        for (let d = 0; d < parseInt(drs[e]); d++) {
                            if (d === 0) {
                                testTime = possTime.split(":");
                            }
                            if ((parseInt(testTime[1]) < 10) && (testTime[1].length < 2)) {
                                testTime[1] = `0${testTime[1]}`;
                            }
                            if (parseInt(testTime[1]) === 60) {
                                testTime[1] = "00";
                                testTime[0] = (parseInt(testTime[0])+1).toString();
                            }
                            if (parseInt(testTime[0]) > 23) {
                                output.innerHTML += `${evs[e]} is going ${parseInt(drs[e])-d} minutes into the next day.<br/>`;
                                break;
                            }
                            else {
                                schTime = testTime.join(":");
                                sch[schTime] = evs[e];
                                testTime[1] = (parseInt(testTime[1])+1).toString();
                            } 
                        }
                        break;
                    }
                }
            };
        }
    }

    return sch;
}

function displaySchedule(sch) {
    let output = document.getElementById("output");
    output.innerHTML += "Your schedule for the day is: <br/>";

    let curEvt = "";
    Object.entries(sch).forEach((event_time) => {
        if (curEvt !== event_time[1]) {
            curEvt = event_time[1];
            output.innerHTML += `${event_time[0]}: ${event_time[1]}<br/>`
        }
    });
}

function isValidDur(string) {
    let output = document.getElementById("output");

    let numStr = parseInt(string);

    if (isNaN(numStr)) {
        output.innerHTML += "One of the durations is not a number."
        return false;
    }
    else if (numStr > 1440) {
        output.innerHTML += `You cannot have a duration greater than 1440 minutes`;
        return false;
    }

    return true;
}

function isValidTime(string) {
    let output = document.getElementById("output");

    let time = string.split(":");
    let hr = parseInt(time[0]);
    let min = parseInt(time[1]);

    if (isNaN(hr) && time[0] !== "") {
        output.innerHTML += "One of the times is not a valid time.";
        return false;
    } else if (isNaN(min) && time[0] !== "") {
        output.innerHTML += "One of the times is not a valid time.";
        return false;
    } else if (time.length !== 2 && time[0] !== "") {
        output.innerHTML += "One of the times is not a valid time.";
        return false;
    } else if ((hr > 24) || (hr < 0)) {
        output.innerHTML += "One of the times is not a valid time.";
        return false;
    } else if ((min > 60) || (min < 0)) {
        output.innerHTML += "One of the times is not a valid time.";
        return false;
    }

    return true;
}

function dict(indicies, values) {
    let combine = {};
    for (let i = 0; i < indicies.length; i++) {
        combine[indicies[i]] = values[i];
    }

    return combine;
}


window.addEventListener("load", pageLoad);
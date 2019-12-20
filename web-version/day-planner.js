function pageLoad() {
    let startButton = document.getElementById("start");
    startButton.addEventListener("click", main);
}

function main() {
    let allTimes = createAllTimes();
    let emptyDay = createEmptyDay();
    let schedule = dict(allTimes, emptyDay);

    let events = getEvents();
    let times = getTimes();
    let durations = getDurations();

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
    console.log(schedule);

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
    return timesElement.value.split(", ");
}

function getDurations() {
    let durationsElement = document.getElementById("durations-list");
    return durationsElement.value.split(", ");
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
    output.innerHTML = "";

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
    output.innerHTML = "";

    for (let e = 0; e < evs.length; e++) {
        if (tms[e] === "") {
            sch.forEach((event, time) => {
                let possTime = time;
                let timeUsed = true;

                if (event === "Empty") {
                    timeUsed = false;
                    for (let d = 0; d < parseInt(drs[e]); d++) {
                        if (d === 0) {
                            let testTime = possTime.split(":");
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
                        for (let d = 0; d < parseInt(drs[e]); d++) {
                            if (d === 0) {
                                let testTime = possTime.split(":");
                            }
                            if ((parseInt(testTime[1]) < 10) && (testTime[1].length < 2)) {
                                testTime[1] = `0${testTime[1]}`;
                            }
                            if (parseInt(testTime[1]) === 60) {
                                testTime[1] = "00";
                                testTime[0] = (parseInt(testTime[0])+1).toString();
                            }
                            if (parseInt(testTime[0]) > 23) {
                                output.innerHTML += `${evs[e]} + " is going ${parseInt(drs[e])-d} minutes into the next day.<br/>`;
                                break;
                            }
                            else {
                                schTime = testTime.join(":");
                                sch[schTime] = evs[e];
                                testTime[1] = (parseInt(testTime[1])+1).toString();
                            }
                            break;
                        }
                    }
                }
            });
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

function dict(indicies, values) {
    let combine = {};
    for (let i = 0; i < indicies.length; i++) {
        combine[indicies[i]] = values[i];
    }

    return combine;
}


window.addEventListener("load", pageLoad);


/*

def isValidDur(string):
  try:
    if (int(string) <= 1440):
      return True
    else:
      return False
  except ValueError:
    return False

def isValidTime(string):
    try:
        time.strptime(string, '%H:%M')
        return True
    except ValueError:
        return False

main()
*/
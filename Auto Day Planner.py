import math
import time

def main():
  openingMessage()
  allTimes = createAllTimes()
  emptyDay = createEmptyDay()
  schedule = dict(zip(allTimes, emptyDay))
  addInput = "y"
  while (addInput is not "n"):
    displaySchedule(schedule)
    addInput = input("Would you like to add anything to your schedule (y/n)? ")
    if (addInput is 'n'):
      break
    events = getEvents()
    times = getTimes(events)
    durations = getDurations(events)
    sortedIndices = getOrder(durations)
    events, times, durations = sortArrays(events, times, durations, sortedIndices)
    placeFixedSchedule(events, times, durations, schedule)
    organiseTimes(events, times, durations, schedule)
  print("Thank you for using the 'Auto Day Planner'. Here is your final schedule:")
  displaySchedule(schedule)

def openingMessage():
  print('''This is an 'Auto Day Planner', created by Matthew Docherty.
You simply put in all of your events, times and durations and the
schedule will be made for you. Any events not able to be placed
will be omitted from the final schedule.''')
  

def createEmptyDay():
  times = []
  for h in range(24):
    for m in range(60):
      t = "Empty"
      times.append(t)
  return times

def createAllTimes():
  times = []
  for h in range(24):
    for m in range(60):
      if m < 10:
        t = str(h)+":0"+str(m)
      else:
        t = str(h)+":"+str(m)
      times.append(t)
  return times

def displaySchedule(sch):
  print ("Your schedule for the day is: ")
  curEvt = ""
  for evt in sch:
    if curEvt is not sch[evt]:
      curEvt = sch[evt]
      print (evt+"+: "+sch[evt])

def getDurations(evnts):
  durs = []
  for e in range(len(evnts)):
    validDur = False
    while (validDur is False):
      durInput = input("Enter a duration (mins) for '"+evnts[e]+"': ")
      validDur = isValidDur(durInput)
      if (validDur is False):
        print("You must insert a number below 1440.")
    durs.append(durInput)
  return durs

def getEvents():
  eventInput = " "
  evnts = []
  while eventInput is not "":
    eventInput = input("Enter an event name (leave blank to quit): ")
    evnts.append(eventInput)
  return evnts[0:-1]
  
def getTimes(evnts):
  tmes = []
  for e in range(len(evnts)):
    validInput = False
    while (validInput is False):
      timeInput = input("Enter a start time (h:mm) for '"+evnts[e]+"' (leave blank for anytime): ")
      validInput = isValidTime(timeInput) or ''
      if (validInput is False):
        print("Please enter a valid time.")
    tmes.append(timeInput)
  return tmes

def getOrder(drs):
  sortOrder = []
  tempDur = []
  for d in drs:
    tempDur.append(d)
  for i in tempDur:
    highDurVal = 0
    highDurIdx = -1
    for d in range(len(tempDur)):
      if (tempDur[d] is not None):
        if (int(tempDur[d]) > highDurVal):
          highDurVal = int(tempDur[d])
          highDurIdx = d
    tempDur[highDurIdx] = None
    sortOrder.append(highDurIdx)
  return sortOrder

def organiseTimes(evs, tms, drs, sch):
  for e in range(len(evs)):
    if (tms[e] is ''):
      for time in sch:
        possTime = time
        timeUsed = True
        if (sch[time] is "Empty"):
          timeUsed = False
          for d in range(int(drs[e])):
            if (d is 0):
              testTime = possTime.split(":")
            if ((int(testTime[1]) < 10) and (len(testTime[1]) < 2)):
              testTime[1] = "0"+testTime[1]
            if (int(testTime[1]) == 60):
        	    testTime[1] = "00"
        	    testTime[0] = str(int(testTime[0])+1)
            if (int(testTime[0]) > 23):
        	    break
            else:
              schTime = ':'.join(testTime)
              testTime[1] = str(int(testTime[1])+1)
              if (sch[schTime] is not "Empty"):
                timeUsed = True
          if (timeUsed is False):
            for d in range(int(drs[e])):
              if (d is 0):
                testTime = possTime.split(":")
              if ((int(testTime[1]) < 10) and (len(testTime[1]) < 2)):
                testTime[1] = "0"+testTime[1]
              if (int(testTime[1]) == 60):
          	    testTime[1] = "00"
          	    testTime[0] = str(int(testTime[0])+1)
              if (int(testTime[0]) > 23):
          	    print(evs[e] + " is going "+str(int(drs[e])-d)+" minutes into the next day.")
          	    break
              else:
          	    schTime = ':'.join(testTime)
          	    sch[schTime] = evs[e]
          	    testTime[1] = str(int(testTime[1])+1)
            break
            	    
def placeFixedSchedule(evs, tms, drs, sch):
  for e in range(len(evs)):
    if (tms[e] is not ''):
    	for d in range(int(drs[e])):
    	  if (d is 0):
    	    time = tms[e].split(':')
    	  if ((int(time[1]) < 10) and (len(time[1]) < 2)):
    	    time[1] = "0"+time[1]
    	  if (int(time[1]) == 60):
    	    time[1] = "00"
    	    time[0] = str(int(time[0])+1)
    	  if (int(time[0]) > 23):
    	    print(evs[e] + " is going "+str(int(drs[e])-d)+" minutes into the next day.")
    	    break
    	  else:
    	    schTime = ':'.join(time)
    	    if (sch[schTime] is not "Empty"):
    	      print ("Scheduling conflict at "+schTime+", between: '"+sch[schTime]+"' and '"+evs[e]+"'!")
    	      print ("Restaring program...")
    	      main()
    	    sch[schTime] = evs[e]
    	    time[1] = str(int(time[1])+1)

def sortArrays(evs, tms, drs, srt):
  tempEvs = []
  tempTms = []
  tempDrs = []
  for s in srt:
    tempEvs.append(evs[s])
    tempTms.append(tms[s])
    tempDrs.append(drs[s])
  return tempEvs, tempTms, tempDrs


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

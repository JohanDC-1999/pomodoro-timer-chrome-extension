let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let isWorkSession = true;
let completedPomodoros = 0;

chrome.storage.local.get(['timeLeft', 'isRunning', 'isWorkSession', 'completedPomodoros'], (result) => {
  timeLeft = result.timeLeft || 25 * 60;
  isRunning = result.isRunning || false;
  isWorkSession = result.isWorkSession !== undefined ? result.isWorkSession : true;
  completedPomodoros = result.completedPomodoros || 0;

  if (isRunning) {
    chrome.alarms.create('pomodoroTimer', { periodInMinutes: 1/60 });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    timeLeft--;
    if (timeLeft === 0) {
      isRunning = false;
      if (isWorkSession) {
        completedPomodoros++;
        timeLeft = 5 * 60; // 5-minute break
      } else {
        timeLeft = 25 * 60; // 25-minute work session
      }
      isWorkSession = !isWorkSession;
      notifyUser();
    }
    updateStorage();
    updatePopup();
  }
});

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    chrome.alarms.create('pomodoroTimer', { periodInMinutes: 1/60 });
    updateStorage();
  }
}

function pauseTimer() {
  chrome.alarms.clear('pomodoroTimer');
  isRunning = false;
  updateStorage();
}

function resetTimer() {
  chrome.alarms.clear('pomodoroTimer');
  isRunning = false;
  isWorkSession = true;
  timeLeft = 25 * 60;
  completedPomodoros = 0;
  updateStorage();
}

function notifyUser() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Pomodoro Timer',
    message: isWorkSession ? 'Time to work!' : 'Time for a break!',
  });
}

function updateStorage() {
  chrome.storage.local.set({ timeLeft, isRunning, isWorkSession, completedPomodoros });
}

function updatePopup() {
  chrome.runtime.sendMessage({
    action: 'updateTimer',
    timeLeft: timeLeft,
    isWorkSession: isWorkSession,
    completedPomodoros: completedPomodoros,
    isRunning: isRunning
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);
  switch(request.action) {
    case 'startTimer':
      startTimer();
      break;
    case 'pauseTimer':
      pauseTimer();
      break;
    case 'resetTimer':
      resetTimer();
      break;
    case 'getState':
      sendResponse({
        timeLeft: timeLeft,
        isWorkSession: isWorkSession,
        completedPomodoros: completedPomodoros,
        isRunning: isRunning
      });
      break;
  }
  updatePopup();
  return true; // Indicates that the response is sent asynchronously
});

console.log("Background service worker initialized");

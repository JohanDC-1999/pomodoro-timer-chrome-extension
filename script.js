const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionTypeDisplay = document.getElementById('sessionType');
const completedPomodorosDisplay = document.getElementById('completedPomodoros');

function updateDisplay(data) {
    const minutes = Math.floor(data.timeLeft / 60);
    const seconds = data.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    sessionTypeDisplay.textContent = data.isWorkSession ? 'Work' : 'Break';
    completedPomodorosDisplay.textContent = data.completedPomodoros;
    startBtn.disabled = data.isRunning;
    pauseBtn.disabled = !data.isRunning;
}

function sendMessage(action) {
    chrome.runtime.sendMessage({ action: action }, function(response) {
        if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
        }
    });
}

startBtn.addEventListener('click', () => sendMessage('startTimer'));
pauseBtn.addEventListener('click', () => sendMessage('pauseTimer'));
resetBtn.addEventListener('click', () => sendMessage('resetTimer'));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateTimer') {
        updateDisplay(request);
    }
});

// Initial state update
chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (chrome.runtime.lastError) {
        console.error("Error getting initial state:", chrome.runtime.lastError);
    } else {
        updateDisplay(response);
    }
});

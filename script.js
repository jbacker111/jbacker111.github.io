// Configuration
const FIRST_SEGMENT = 30;           // 30 seconds
const SECOND_SEGMENT = 60;          // 60 seconds
const TOTAL_TIME = 9 * 60;         // 9 minutes = 540 seconds
const YELLOW = "yellow";
const YELLOW_ALLOWED_TIMES = [60, 90, 120];
const GREEN = "green";
const RED = "red";
const GREEN_AND_RED_ALLOWED_TIMES = [30, 60];

let wakeLock = null;

// Try to request wake lock
async function enableWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");

    // Re-acquire wake lock if it is released (e.g., screen rotates)
    wakeLock.addEventListener("release", () => {
      console.log("Wake Lock was released");
    });

    console.log("Wake Lock active");
  } catch (err) {
    console.error("Wake Lock error:", err);
  }
}

// Re-enable wake lock if tab becomes visible again
document.addEventListener("visibilitychange", () => {
  if (wakeLock !== null && document.visibilityState === "visible") {
    enableWakeLock();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("startBtn");
  
  enableWakeLock();
   
  // Utility: wait for 1 second
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Countdown function for any time segment
  async function countdown(seconds) {
    for (let s = seconds; s > 0; s--) {
      display.textContent = `${s}`;
      await wait(1000);
    }
  }

  async function startSequence() {
    let elapsed = 0;
	var color = GREEN;

    // First 30 seconds
	document.body.style.backgroundColor = color;
    await countdown(FIRST_SEGMENT);
    elapsed += FIRST_SEGMENT;

    // Next 60 seconds
	color = YELLOW;
	document.body.style.backgroundColor = color;
    await countdown(SECOND_SEGMENT);
    elapsed += SECOND_SEGMENT;

    // Continue random segments until total reaches 9 minutes
    while (elapsed < TOTAL_TIME) {
	  color = getNextColor(color);
	  document.body.style.backgroundColor = color;
      let randomLen = getNextSegmentTime(color);

      // If this segment would exceed the 9-minute total, shorten it
      if (elapsed + randomLen > TOTAL_TIME) {
        randomLen = TOTAL_TIME - elapsed;
      }

      await countdown(randomLen);
      elapsed += randomLen;
    }

    display.textContent = "Finished!";
	startBtn.style.visibility = 'visible';
  }

  // Random integer generator
  function getNextSegmentTime(color) {
	  var allowedNumbers;
	  if (YELLOW == color) {
		  allowedNumbers = YELLOW_ALLOWED_TIMES;
		  const randomIndex = Math.floor(Math.random() * allowedNumbers.length);
		  return allowedNumbers[randomIndex];
	  } else {
		  allowedNumbers = GREEN_AND_RED_ALLOWED_TIMES;
	  }
	  const randomIndex = Math.floor(Math.random() * allowedNumbers.length);
	  return allowedNumbers[randomIndex];
  }
  
  function getNextColor(currentColor) {
	  var num = Math.round(Math.random());
	  if (GREEN == currentColor) {
		  return num == 0 ? YELLOW : RED;
	  }
	  if (YELLOW == currentColor) {
		  return num == 0 ? GREEN : RED;
	  }
	  return num == 0 ? GREEN : YELLOW;
  }

  startBtn.addEventListener("click", () => {
	startBtn.style.visibility = 'hidden';
	startSequence();
  });
});


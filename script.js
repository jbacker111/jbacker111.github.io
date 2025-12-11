// Configuration
const FIRST_SEGMENT = 30;  // 30 seconds
const SECOND_SEGMENT = 60; // 60 seconds
const TOTAL_TIME = 9 * 60; // 9 minutes = 540 seconds
const GREEN = "green";
const YELLOW = "yellow";
const RED = "red";
const GREEN_ALLOWED_TIMES = [30];
const YELLOW_ALLOWED_TIMES = [30, 60, 90, 120];
const RED_ALLOWED_TIMES = [30, 60];

// Create a seed from the current date
const now = new Date();
let seed = now.getFullYear() * 10000 +
           (now.getMonth() + 1) * 100 +
           now.getDate();  // YYYYMMDD

let wakeLock = null;

// Register service worker if available
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service worker registered"))
    .catch(err => console.error("Service worker registration failed:", err));
}

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

    display.textContent = "";
	startBtn.style.visibility = 'visible';
  }

  function getNextSegmentTime(color) {
	  var allowedNumbers;
	  if (GREEN == color) {
		  allowedNumbers = GREEN_ALLOWED_TIMES;
	  } else if (YELLOW == color) {
		  allowedNumbers = YELLOW_ALLOWED_TIMES;
	  } else {
		  allowedNumbers = RED_ALLOWED_TIMES;
	  }
	  const randomIndex = Math.floor(seededRandom() * allowedNumbers.length);
	  return allowedNumbers[randomIndex];
  }
  
  function getNextColor(currentColor) {
	  var num = Math.round(seededRandom());
	  if (GREEN == currentColor) {
		  return num == 0 ? YELLOW : RED;
	  }
	  if (YELLOW == currentColor) {
		  return num == 0 ? GREEN : RED;
	  }
	  return num == 0 ? GREEN : YELLOW;
  }

  // Use this so everyone gets the same workout for a specific day
  function seededRandom() {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
  }
  startBtn.addEventListener("click", () => {
	startBtn.style.visibility = 'hidden';
	startSequence();
  });
});


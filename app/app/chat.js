const input = document.getElementById("userInput");
const gptMessage = document.querySelector("h4.gptmessage");
let qaData = [];

const qaDataScript = document.getElementById("qaData");
if (qaDataScript) {
  try {
    qaData = JSON.parse(qaDataScript.textContent);
  } catch (err) {
    console.error("Failed to parse inline QA data", err);
  }
}

const chatArea = document.getElementById("chatArea");
chatArea.style.maxHeight = "90vh";
chatArea.style.overflowY = "auto";
chatArea.style.padding = "10px";
chatArea.style.marginBottom = "60px";

function showTypingDots() {
  const typingWrapper = document.createElement("div");
  typingWrapper.id = "typingIndicator";
  typingWrapper.className = "d-flex justify-content-start mb-2";
  typingWrapper.innerHTML = `
    <div class="px-3 py-2 rounded-4 bg-light">
      <span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>
    </div>`;
  chatArea.appendChild(typingWrapper);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function hideTypingDots() {
  const typing = document.getElementById("typingIndicator");
  if (typing) typing.remove();
}

function addMessage(text, sender = "bot", animated = false) {
  if (gptMessage) gptMessage.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = `d-flex ${sender === "user" ? "justify-content-end" : "justify-content-start"} mb-2`;

  const bubble = document.createElement("div");
  bubble.className = "px-3 py-2 rounded-4 chat-bubble";
  bubble.style.maxWidth = "80%";
  bubble.style.whiteSpace = "pre-line";
  bubble.style.backgroundColor = sender === "user" ? "#d1fce3" : "#f1f1f1";
  bubble.style.fontFamily = "rubik";
  bubble.style.fontSize = "16px";
  bubble.textContent = animated ? "" : text;

  wrapper.appendChild(bubble);
  chatArea.appendChild(wrapper);
  chatArea.scrollTop = chatArea.scrollHeight;

  if (animated) {
    let i = 0;
    const interval = setInterval(() => {
      bubble.textContent += text[i];
      i++;
      chatArea.scrollTop = chatArea.scrollHeight;
      if (i >= text.length) clearInterval(interval);
    }, 30);
  }
}

function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
  return "en-IN";
}

function sendMessage() {
  const message = input.value.trim();
  if (!message) return;
  addMessage(message, "user");
  input.value = "";
  respondToUser(message);
}

function respondToUser(msg) {
  const lower = msg.toLowerCase();
  const userLang = detectLanguage(msg);

  let reply =
    userLang === "hi-IN"
      ? "माफ़ कीजिए, मैं इसका उत्तर नहीं जानता लेकिन मैं रोज़ कुछ नया सीख रहा हूँ। 😊"
      : "I’m not sure how to respond to that, but I’m learning every day! 😊";

  let bestMatch = null;
  let bestScore = 0;

  for (let item of qaData) {
    for (let q of item.questions) {
      const qLower = q.toLowerCase();
      const score = getMatchScore(lower, qLower);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  if (bestMatch) {
    reply = bestMatch.answer;
  }

  showTypingDots();
  setTimeout(() => {
    hideTypingDots();
    showBotResponse(reply);
  }, 1000);
}

function getMatchScore(userInput, question) {
  const userWords = userInput.split(/\s+/);
  const questionWords = question.split(/\s+/);
  return questionWords.filter((qWord) => userWords.includes(qWord)).length;
}

function showBotResponse(answer) {
  addMessage(answer, "bot", true);
  speakText(answer);

  const keywords = [
    "proceeding with payment",
    "payment to confirm",
    "secure payment page",
    "using your saved visa card"
  ];

  if (keywords.some(k => answer.toLowerCase().includes(k))) {
    triggerFakePaymentFlow();
  }
}

function triggerFakePaymentFlow() {
  const modal = new bootstrap.Modal(document.getElementById("paymentModal"));
  const processing = document.getElementById("paymentProcessing");
  const success = document.getElementById("paymentSuccess");
  const sound = document.getElementById("successSound");

  processing.style.display = "block";
  success.style.display = "none";
  modal.show();

  setTimeout(() => {
    processing.style.display = "none";
    success.style.display = "block";
    if (sound) sound.play();

    setTimeout(() => {
      addMessage("✅ Payment processed successfully. Your ticket is booked!", "bot", true);
      speakText("Payment processed successfully. Your ticket is booked!");
    }, 500);

    setTimeout(() => {
      const summary = `🎫 Ticket Details:
From: Delhi (DEL)
To: Mumbai (BOM)
Date: 15th June 2025
Time: 05:55 AM
Airline: Akasa Air
Seat: Window
Email: rohan.mehra@gmail.com
Booking ID: VT-15JUN-ROH2341`;
      addMessage(summary, "bot", true);
      speakText("Here are your final ticket details.");
    }, 2500);

    setTimeout(() => {
      const options = `Would you like to:
📲 Book a cab to the airport
🔁 Add return flight
🔔 Set a reminder`;
      addMessage(options, "bot", true);
      speakText("Would you like to book a cab or add a return flight?");
    }, 5000);
  }, 3000);

  setTimeout(() => {
    modal.hide();
  }, 7500);
}

function speakText(text) {
  const detectedLang = detectLanguage(text);

  if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
    window.flutter_inappwebview.callHandler("speakTTS", text);
    return;
  }

  if (!window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = detectedLang;
  utter.pitch = 1;
  utter.rate = detectedLang === "en-IN" ? 0.93 : 1;

  const preferredVoice = voices.find(
    (v) =>
      v.lang === detectedLang &&
      (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google"))
  );

  if (preferredVoice) utter.voice = preferredVoice;

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function receiveSpeech(text) {
  input.value = text;
  sendMessage();
}

const micBtn = document.querySelector(".bi-mic-fill");
const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (recognition) {
  const recog = new recognition();
  recog.lang = "en-IN";
  recog.interimResults = false;
  recog.continuous = false;

  micBtn.addEventListener("click", () => {
    recog.start();
    micBtn.classList.add("mic-active");
  });

  recog.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    input.value = transcript;
    sendMessage();
    micBtn.classList.remove("mic-active");
  };

  recog.onerror = () => micBtn.classList.remove("mic-active");
} else {
  if (micBtn) micBtn.style.display = "none";
}

window.onload = () => {
  setTimeout(() => {
    addMessage("Hi! I’m V-Trip, your travel assistant. How can I help you today?", "bot", true);
  }, 500);

  window.speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
};

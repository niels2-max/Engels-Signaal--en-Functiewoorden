// Flashcard State
let currentCard = null;
let cardFlipped = false;
let currentWordList = [];

// Quiz State
let quizScore = 0;
let quizTotal = 0;
let currentQuestion = null;
let quizAnswered = false;
let quizMode = null; // 'meerkeuze' or 'invullen'

// Helper function to shuffle array properly (Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Normalize text for comparison (remove capitals, punctuation)
function normalizeText(text) {
  return text.toLowerCase().replace(/[.,!?;:\-]/g, '').trim();
}

function showScreen(screenId) {
  document
    .querySelectorAll("section")
    .forEach(section => {
      section.classList.add("hidden");
    });

  document
    .getElementById(screenId)
    .classList.remove("hidden");

  // Reset quiz when showing quiz section
  if (screenId === "quiz") {
    document.getElementById("quizModeSelection").style.display = "block";
    document.getElementById("question").innerHTML = "";
  }
}

function startFlashcards() {
  const type = document.getElementById("wordTypeSelect").value;
  const category = document.getElementById("categorySelect").value;

  let words = type === "signaal" ? signalwoorden : functiewoorden;

  if (category !== "all" && type === "signaal") {
    words = signalwoorden.filter(w => w.category === category);
  }

  if (words.length === 0) {
    document.getElementById("flashcard").innerHTML =
      '<p>Geen woorden beschikbaar.</p>';
    return;
  }

  currentWordList = words;
  currentCard = words[Math.floor(Math.random() * words.length)];
  cardFlipped = false;

  renderCard();
}

function renderCard() {
  const card = document.getElementById("flashcard");

  if (!currentCard) {
    return;
  }

  card.innerHTML = cardFlipped
    ? `
      <div class="flashcard-content flipped">
        <h2>${currentCard.dutch}</h2>
        <p class="category">${currentCard.category}</p>
        <p class="flip-hint">Klik voor volgend woord</p>
      </div>
    `
    : `
      <div class="flashcard-content">
        <h2>${currentCard.english}</h2>
        <p class="flip-hint">Klik om om te draaien</p>
      </div>
    `;

  card.onclick = () => {
    if (!cardFlipped) {
      cardFlipped = true;
      renderCard();
    } else {
      startFlashcards();
    }
  };
}

function startQuiz(mode) {
  quizMode = mode;
  const type = document.getElementById("quizTypeSelect").value;
  const category = document.getElementById("quizCategorySelect").value;

  let words = type === "signaal" ? signalwoorden : functiewoorden;

  if (category !== "all" && type === "signaal") {
    words = signalwoorden.filter(w => w.category === category);
  }

  if (words.length < 4) {
    document.getElementById("question").innerHTML =
      '<p>Niet genoeg woorden voor een quiz (minimum 4).</p>';
    return;
  }

  quizScore = 0;
  quizTotal = 0;
  currentWordList = words;
  
  // Hide mode selection
  document.getElementById("quizModeSelection").style.display = "none";
  
  showNextQuestion();
}

function showNextQuestion() {
  quizAnswered = false;
  quizTotal++;

  if (quizTotal > 10) {
    const percentage = Math.round((quizScore / 10) * 100);
    document.getElementById("question").innerHTML = `
      <div class="quiz-results">
        <h2>Quiz voltooid! 🎉</h2>
        <p class="result-text">Je score: <strong>${quizScore}/10</strong> (${percentage}%)</p>
        <div class="score-bar">
          <div class="score-fill" style="width: ${quizScore * 10}%"></div>
        </div>
        <p class="score-feedback">${getScoreFeedback(percentage)}</p>
        <button onclick="resetQuiz()" class="retry-btn">Opnieuw proberen</button>
      </div>
    `;
    return;
  }

  const q = currentWordList[Math.floor(Math.random() * currentWordList.length)];

  if (quizMode === "meerkeuze") {
    showMultipleChoice(q);
  } else if (quizMode === "invullen") {
    showFillIn(q);
  }
}

function showMultipleChoice(q) {
  let answers = shuffle(currentWordList)
    .slice(0, 3)
    .filter(w => w.dutch !== q.dutch)
    .map(w => w.dutch);

  if (answers.length < 3) {
    answers = shuffle(currentWordList)
      .slice(0, 3)
      .map(w => w.dutch);
  }

  // Make sure the correct answer is in there
  if (!answers.includes(q.dutch)) {
    answers[Math.floor(Math.random() * answers.length)] = q.dutch;
  }

  answers = shuffle(answers);
  currentQuestion = q;

  document.getElementById("question").innerHTML = `
    <div class="quiz-header">
      <h3>Wat betekent "${q.english}"?</h3>
      <p class="progress">Vraag ${quizTotal}/10</p>
      <div class="score-display">Score: <strong>${quizScore}/${quizTotal - 1}</strong></div>
    </div>

    <div class="answers-container">
      ${answers
        .map(
          (answer) => `
        <button class="answer-btn" onclick="checkAnswerMultiple('${answer.replace(/'/g, "\\'")}', '${q.dutch.replace(/'/g, "\\'")}')">
          ${answer}
        </button>
      `
        )
        .join("")}
    </div>
  `;
}

function showFillIn(q) {
  currentQuestion = q;

  document.getElementById("question").innerHTML = `
    <div class="quiz-header">
      <h3>Vul in: wat betekent "${q.english}"?</h3>
      <p class="progress">Vraag ${quizTotal}/10</p>
      <div class="score-display">Score: <strong>${quizScore}/${quizTotal - 1}</strong></div>
    </div>

    <div class="fillin-container">
      <input type="text" id="fillinInput" class="fillin-input" placeholder="Typ het antwoord hier...">
      <button class="fillin-submit" onclick="checkAnswerFillIn()">✓ Controleer</button>
    </div>
    <p style="text-align: center; color: #999; font-size: 0.9em;">💡 Hoofd/kleine letters en leestekens doen niet ter zake</p>
  `;

  // Focus on input field and set up Enter key
  setTimeout(() => {
    const inputField = document.getElementById("fillinInput");
    inputField.focus();
    inputField.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        checkAnswerFillIn();
      }
    });
  }, 0);
}

function checkAnswerMultiple(selected, correct) {
  if (quizAnswered) return;

  quizAnswered = true;
  const isCorrect = selected === correct;

  if (isCorrect) {
    quizScore++;
  }

  const allButtons = document.querySelectorAll(".answer-btn");
  allButtons.forEach((btn) => {
    if (btn.textContent.trim() === correct) {
      btn.classList.add("correct");
    } else if (btn.textContent.trim() === selected && !isCorrect) {
      btn.classList.add("incorrect");
    }
    btn.disabled = true;
  });

  const feedback = document.createElement("div");
  feedback.className = isCorrect ? "feedback correct" : "feedback incorrect";
  feedback.textContent = isCorrect
    ? "✓ Goed! Het antwoord is: " + correct
    : "✗ Fout. Het antwoord is: " + correct;

  document.querySelector(".answers-container").appendChild(feedback);

  setTimeout(() => {
    showNextQuestion();
  }, 1500);
}

function checkAnswerFillIn() {
  if (quizAnswered) return;

  quizAnswered = true;
  const userAnswer = document.getElementById("fillinInput").value;
  const correctAnswer = currentQuestion.dutch;
  
  // Normalize both answers for comparison
  const isCorrect = normalizeText(userAnswer) === normalizeText(correctAnswer);

  if (isCorrect) {
    quizScore++;
  }

  const input = document.getElementById("fillinInput");
  const feedback = document.createElement("div");
  feedback.className = isCorrect ? "feedback correct" : "feedback incorrect";
  feedback.textContent = isCorrect
    ? "✓ Goed! Het antwoord is: " + correctAnswer
    : "✗ Fout. Het antwoord is: " + correctAnswer;

  input.disabled = true;
  input.classList.add(isCorrect ? "correct" : "incorrect");
  document.querySelector(".fillin-submit").disabled = true;
  document.querySelector(".fillin-container").appendChild(feedback);

  setTimeout(() => {
    showNextQuestion();
  }, 1500);
}

function resetQuiz() {
  quizMode = null;
  quizScore = 0;
  quizTotal = 0;
  document.getElementById("quizModeSelection").style.display = "block";
  document.getElementById("question").innerHTML = "";
}

function getScoreFeedback(percentage) {
  if (percentage === 100) return "Perfecte score! Je bent een expert! 🏆";
  if (percentage >= 80) return "Fantastisch! Je beheerst de woorden heel goed! 🌟";
  if (percentage >= 60) return "Goed gedaan! Nog wat oefenen helpt! 💪";
  if (percentage >= 40) return "Je bent op de goede weg. Meer oefenen nodig! 📚";
  return "Nog wat meer oefenen nodig. Je redt het! 💪";
}

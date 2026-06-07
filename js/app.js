// Flashcard State
let currentCard = null;
let cardFlipped = false;

// Quiz State
let quizScore = 0;
let quizTotal = 0;
let currentQuestion = null;
let quizAnswered = false;

// Helper function to shuffle array properly
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
}

function startFlashcards() {
  const category = document.getElementById("categorySelect").value;

  let words = signalwoorden;

  if (category !== "all") {
    words = signalwoorden.filter(w => w.category === category);
  }

  if (words.length === 0) {
    document.getElementById("flashcard").innerHTML =
      '<p>Geen woorden in deze categorie.</p>';
    return;
  }

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

function startQuiz() {
  quizScore = 0;
  quizTotal = 0;
  showNextQuestion();
}

function showNextQuestion() {
  quizAnswered = false;
  quizTotal++;

  if (quizTotal > 10) {
    document.getElementById("question").innerHTML = `
      <div class="quiz-results">
        <h2>Quiz voltooid! 🎉</h2>
        <p class="result-text">Je score: <strong>${quizScore}/10</strong></p>
        <div class="score-bar">
          <div class="score-fill" style="width: ${quizScore * 10}%"></div>
        </div>
        <button onclick="startQuiz()" class="retry-btn">Opnieuw proberen</button>
      </div>
    `;
    return;
  }

  const q = signalwoorden[Math.floor(Math.random() * signalwoorden.length)];

  let answers = shuffle(signalwoorden)
    .slice(0, 3)
    .map(w => w.dutch);

  // Make sure the correct answer is in there
  if (!answers.includes(q.dutch)) {
    answers[Math.floor(Math.random() * 3)] = q.dutch;
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
        <button class="answer-btn" onclick="checkAnswer('${answer}', '${q.dutch}')">
          ${answer}
        </button>
      `
        )
        .join("")}
    </div>
  `;
}

function checkAnswer(selected, correct) {
  if (quizAnswered) return;

  quizAnswered = true;
  const isCorrect = selected === correct;

  if (isCorrect) {
    quizScore++;
  }

  const allButtons = document.querySelectorAll(".answer-btn");
  allButtons.forEach((btn) => {
    if (btn.textContent === correct) {
      btn.classList.add("correct");
    } else if (btn.textContent === selected && !isCorrect) {
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
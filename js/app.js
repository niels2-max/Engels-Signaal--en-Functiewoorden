function showScreen(screenId){

  document
    .querySelectorAll("section")
    .forEach(section => {
      section.classList.add("hidden");
    });

  document
    .getElementById(screenId)
    .classList.remove("hidden");
}

let currentCard = null;
let cardFlipped = false;

function startFlashcards(){

  const category =
    document.getElementById("categorySelect").value;

  let words = signalwoorden;

  if(category !== "all"){
    words = signalwoorden.filter(
      w => w.category === category
    );
  }

  currentCard =
    words[Math.floor(Math.random()*words.length)];

  cardFlipped = false;

  renderCard();
}

function renderCard(){

  const card =
    document.getElementById("flashcard");

  if(!currentCard){
    return;
  }

  card.innerHTML = cardFlipped
    ? `
      <h2>${currentCard.dutch}</h2>
      <p>${currentCard.category}</p>
    `
    : `
      <h2>${currentCard.english}</h2>
      <p>Klik om om te draaien</p>
    `;

  card.onclick = () => {

    if(!cardFlipped){

      cardFlipped = true;
      renderCard();

    } else {

      startFlashcards();

    }
  };
}

function startQuiz(){

  const q =
    signalwoorden[
      Math.floor(
        Math.random() * signalwoorden.length
      )
    ];

  const answers =
    signalwoorden
      .sort(() => 0.5 - Math.random())
      .slice(0,3)
      .map(w => w.dutch);

  answers.push(q.dutch);

  answers.sort(() => 0.5 - Math.random());

  document.getElementById("question")
    .innerHTML = `
      <h3>Wat betekent "${q.english}"?</h3>

      ${answers.map(answer => `
        <button class="answer"
          onclick="
            alert(
              '${answer === q.dutch ? 'Goed!' : 'Fout!'}'
            )
          ">
          ${answer}
        </button>
      `).join("")}
    `;
}

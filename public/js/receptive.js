let cards;
let currentCard;

window.addEventListener("load", () => {
  cards = new Shuffler(parseFlashcardData());
  currentCard = cards.drawNext();
  cards.empty ? renderEmpty() : renderCard(currentCard);
});

document.querySelector(".next-button").addEventListener("click", () => {
  currentCard = cards.drawNext();
  cards.empty ? renderEmpty() : renderCard(currentCard);
});

document.querySelectorAll(".response-option").forEach((option) => {
  option.addEventListener("click", () => {
    option.innerHTML =
      option.innerHTML.trim() === currentCard.name ? "Correct!" : "Incorrect";
  });
});

function renderCard(card) {
  document.querySelector(
    ".gif-container"
  ).innerHTML = `<img class="gif" src="${card.gifURL}" alt="Error with URL">`;
  const options = new Shuffler(cards.elements.slice());
  const rightAnswerShuffler = new Shuffler([true, false, false, false]);
  document.querySelectorAll(".response-option").forEach((option) => {
    if (!options.empty) {
      option.innerHTML = rightAnswerShuffler.drawNext()
        ? card.name
        : options.drawNext().name;
    } else option.innerHTML = rightAnswerShuffler.empty ? "" : card.name;
  });
}

function renderEmpty() {
  document.querySelector(
    ".gif-container"
  ).innerHTML = `<h1>No more flashcards</h1>`;
  document.querySelector(".responses").innerHTML =
    "<p>add some more to this deck, or refresh to practice again!</p>";
}

function parseFlashcardData() {
  const cards = document.querySelectorAll(".id");

  const flashcards = [];

  cards.forEach((card) => {
    const id = card.innerHTML.trim();
    console.log(id);
    const name = document.querySelector(`.${id}.name`).innerHTML.trim();
    const gifURL = document.querySelector(`.${id}.gif-url`).innerHTML.trim();
    const category = document.querySelector(`.${id}.category`).innerHTML.trim();
    flashcards.push({ name, gifURL, category });
  });
  return flashcards;
}

class Shuffler {
  constructor(array) {
    this.elements = array;
    let remainingElements = this.elements.length,
      elementToSwap,
      nextElementIndex;

    while (remainingElements > 0) {
      nextElementIndex = Math.floor(Math.random() * remainingElements--);
      elementToSwap = this.elements[remainingElements];
      this.elements[remainingElements] = this.elements[nextElementIndex];
      this.elements[nextElementIndex] = elementToSwap;
    }
    this.empty = this.elements.length > 0 ? false : true;
  }

  drawNext() {
    if (this.elements.length === 1) this.empty = true;
    return this.elements.pop();
  }
}

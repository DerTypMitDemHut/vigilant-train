let flashcards = [];
let quizQuestions = [];
let mathTasks = [];
let flashcardIndex = 0;
let knewCount = 0;
let didntKnowCount = 0;

async function loadData() {
  flashcards = await fetch('data/lernkarten.json').then(r => r.json());
  quizQuestions = await fetch('data/quizfragen.json').then(r => r.json());
  mathTasks = await fetch('data/rechenaufgaben.json').then(r => r.json());
  const custom = JSON.parse(localStorage.getItem('customCards') || '[]');
  originalFlashcards = flashcards.concat(custom);
  flashcards = originalFlashcards;
  initFlashcards();
  initQuiz();
  initMath();
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupMenu();
  document.getElementById('editor-form').addEventListener('submit', saveFlashcard);
});

function setupMenu() {
  document.querySelectorAll('#menu button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
      document.getElementById(btn.dataset.target).classList.remove('hidden');
    });
  });
}

// Flashcards
function initFlashcards() {
  const categorySelect = document.getElementById('category-filter');
  const categories = [...new Set(flashcards.map(f => f.kategorie))];
  categorySelect.innerHTML = '<option value="alle">Alle Kategorien</option>' +
    categories.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById('show-answer').addEventListener('click', () => {
    document.getElementById('flashcard-answer').classList.remove('hidden');
  });
  document.getElementById('knew').addEventListener('click', () => {
    knewCount++; nextFlashcard();
  });
  document.getElementById('didnt-know').addEventListener('click', () => {
    didntKnowCount++; nextFlashcard();
  });
  document.getElementById('shuffle').addEventListener('change', startFlashcards);
  categorySelect.addEventListener('change', startFlashcards);
  startFlashcards();
}

function startFlashcards() {
  flashcardIndex = 0;
  let cards = filterFlashcards();
  if (document.getElementById('shuffle').checked) {
    cards = cards.sort(() => Math.random() - 0.5);
  }
  flashcards = cards;
  knewCount = didntKnowCount = 0;
  showFlashcard();
  updateProgress();
}

function filterFlashcards() {
  const cat = document.getElementById('category-filter').value;
  if (cat === 'alle') return originalFlashcards;
  return originalFlashcards.filter(f => f.kategorie === cat);
}

function showFlashcard() {
  if (flashcardIndex >= flashcards.length) {
    document.getElementById('flashcard-question').textContent = 'Fertig!';
    document.getElementById('flashcard-answer').textContent = '';
    return;
  }
  const card = flashcards[flashcardIndex];
  document.getElementById('flashcard-question').textContent = card.frage;
  document.getElementById('flashcard-answer').textContent = card.antwort;
  document.getElementById('flashcard-answer').classList.add('hidden');
  updateProgress();
}

function nextFlashcard() {
  flashcardIndex++;
  showFlashcard();
}

function updateProgress() {
  const progress = ((flashcardIndex) / flashcards.length) * 100;
  document.getElementById('flashcard-progress').textContent = `Fortschritt: ${flashcardIndex} / ${flashcards.length}`;
}

let originalFlashcards = [];

// Quiz
function initQuiz() {
  const container = document.getElementById('quiz-container');
  quizQuestions.forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'quiz-question';
    const h3 = document.createElement('h3');
    h3.textContent = q.frage;
    div.appendChild(h3);
    if (q.typen === 'mc') {
      q.antworten.forEach((a, i) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'q' + idx;
        input.value = i;
        label.appendChild(input);
        label.append(' ' + a);
        div.appendChild(label);
        div.appendChild(document.createElement('br'));
      });
      const btn = document.createElement('button');
      btn.textContent = 'Antwort prüfen';
      btn.addEventListener('click', () => {
        const selected = div.querySelector('input:checked');
        if (!selected) return;
        const correct = parseInt(selected.value) === q.loesung;
        if (correct) btn.textContent = 'Richtig!';
        else btn.textContent = 'Falsch!';
      });
      div.appendChild(btn);
    } else {
      const btn = document.createElement('button');
      btn.textContent = 'Lösung anzeigen';
      const ans = document.createElement('div');
      ans.className = 'hidden';
      ans.textContent = q.loesung;
      btn.addEventListener('click', () => ans.classList.toggle('hidden'));
      div.appendChild(btn);
      div.appendChild(ans);
    }
    container.appendChild(div);
  });
}

// Math tasks
function initMath() {
  const container = document.getElementById('math-container');
  mathTasks.forEach((t, idx) => {
    const div = document.createElement('div');
    div.className = 'math-task';
    const q = document.createElement('div');
    q.textContent = t.frage;
    const input = document.createElement('input');
    input.type = 'number';
    const btn = document.createElement('button');
    btn.textContent = 'Berechnen';
    const feedback = document.createElement('span');
    btn.addEventListener('click', () => {
      const value = parseFloat(input.value);
      if (Math.abs(value - t.loesung) < 0.01) {
        feedback.textContent = 'Richtig!';
      } else {
        feedback.textContent = `Falsch! Lösung: ${t.loesung}`;
      }
    });
    div.appendChild(q);
    div.appendChild(input);
    div.appendChild(btn);
    div.appendChild(feedback);
    container.appendChild(div);
  });
}

function saveFlashcard(e) {
  e.preventDefault();
  const card = {
    frage: document.getElementById('editor-question').value,
    antwort: document.getElementById('editor-answer').value,
    kategorie: document.getElementById('editor-category').value || 'Allgemein'
  };
  const stored = JSON.parse(localStorage.getItem('customCards') || '[]');
  stored.push(card);
  localStorage.setItem('customCards', JSON.stringify(stored));
  alert('Gespeichert!');
  e.target.reset();
}

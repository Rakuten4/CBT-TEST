const fs = require('fs');
const path = require('path');

// Configuration
const exams = ['waec','jamb','neco','gce'];
const subjects = [
  { id: 'maths', name: 'Mathematics' },
  { id: 'english', name: 'English' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
  { id: 'government', name: 'Government' },
  { id: 'literature', name: 'Literature in English' },
  { id: 'crs', name: 'CRS' },
  { id: 'accounting', name: 'Accounting' },
  { id: 'commerce', name: 'Commerce' },
  { id: 'business', name: 'Business Studies' }
];

const QUESTIONS_PER_SUBJECT = 150;
const TOUGH_COUNT = 100; // per subject
const EASY_COUNT = 50; // per subject

function randInt(max){ return Math.floor(Math.random()*max); }

function makeQuestion(exam, subject, idx, difficulty){
  const id = `${exam}-${subject.id}-${idx}`;
  const q = `${subject.name} Q${idx} (${difficulty}) — ${exam.toUpperCase()} practice: choose the correct option.`;
  const options = [
    `${subject.name} concept ${idx} — option A`,
    `${subject.name} concept ${idx} — option B`,
    `${subject.name} concept ${idx} — option C`,
    `${subject.name} concept ${idx} — option D`
  ];
  const answer = randInt(4);
  return { id, q, options, answer, subject: subject.id, difficulty };
}

const out = {};
for(const exam of exams){
  out[exam] = [];
  for(const subject of subjects){
    for(let i=1;i<=QUESTIONS_PER_SUBJECT;i++){
      const difficulty = (i <= TOUGH_COUNT) ? 'tough' : 'easy';
      out[exam].push(makeQuestion(exam, subject, i, difficulty));
    }
  }
}

const outPath = path.join(__dirname, '..', 'data', 'questions.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Generated questions written to', outPath);

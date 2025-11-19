const fs = require('fs');
const path = require('path');

// Realistic generator: produces original, subject-appropriate MCQs
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

function randInt(max){ return Math.floor(Math.random()*max); }
function pick(arr){ return arr[randInt(arr.length)]; }

// Subject-specific generators produce { q, options, answer }
function genMath(idx, difficulty){
  if(difficulty==='easy'){
    const a = randInt(90)+1;
    const b = randInt(90)+1;
    const q = `Calculate: ${a} + ${b} = ?`;
    const options = [a+b, a+b+1, Math.abs(a-b), a*b].map(String);
    return { q, options, answer: 0 };
  }
  // tough
  const a = randInt(9)+1; const x = randInt(10)+1; const b = randInt(20);
  const c = a*x + b;
  const q = `If ${a}x + ${b} = ${c}, what is x?`;
  const options = [x, x+1, x-1, x+2].map(String);
  return { q, options, answer: 0 };
}

function genEnglish(idx, difficulty){
  if(difficulty==='easy'){
    const pairs = [['big','large'],['quick','fast'],['smart','intelligent'],['happy','joyful']];
    const p = pick(pairs);
    const q = `Which is a synonym of '${p[0]}'?`;
    const options = [p[1],'small','slow','sad'];
    return { q, options, answer:0 };
  }
  const q = `Choose the correct sentence:`;
  const correct = `She has lived here for five years.`;
  const options = [correct, `She live here for five years.`, `She is living here since five years.`, `She lived here since five years.`];
  return { q, options, answer:0 };
}

function genPhysics(idx, difficulty){
  if(difficulty==='easy'){
    const q = `Which SI unit is used to measure force?`;
    return { q, options: ['Newton','Joule','Watt','Pascal'], answer:0 };
  }
  const d = randInt(90)+10; const t = randInt(9)+1; const v = +(d/t).toFixed(1);
  const q = `A car travels ${d} m in ${t} s. What is its average speed (m/s)? (to 1dp)`;
  const options = [v, +(v+1).toFixed(1), +(v-1).toFixed(1), +(v+2).toFixed(1)].map(String);
  return { q, options, answer:0 };
}

function genChemistry(idx, difficulty){
  if(difficulty==='easy'){
    return { q: `Which of these is an alkali metal?`, options: ['Sodium','Carbon','Oxygen','Chlorine'], answer:0 };
  }
  return { q: `Which statement about catalysts is true?`, options: ['They are consumed in reactions','They lower activation energy','They change equilibrium','They always increase product yield'], answer:1 };
}

function genBiology(idx, difficulty){
  if(difficulty==='easy'){
    return { q:`Which organelle is known as the powerhouse of the cell?`, options:['Mitochondrion','Ribosome','Nucleus','Golgi apparatus'], answer:0 };
  }
  return { q:`Which process produces haploid cells from diploid cells?`, options:['Mitosis','Meiosis','Binary fission','Budding'], answer:1 };
}

function genGovernment(idx, difficulty){
  if(difficulty==='easy') return { q:`Which system relies on supply and demand to allocate resources?`, options:['Market economy','Planned economy','Traditional economy','Command economy'], answer:0 };
  return { q:`Which of the following is a feature of a federal system of government?`, options:['Centralization of all power','Division of powers between national and subnational governments','Single-party rule','Lack of written constitution'], answer:1 };
}

function genLiterature(idx, difficulty){
  if(difficulty==='easy') return { q:`Which device gives human traits to non-human things?`, options:['Personification','Metaphor','Alliteration','Irony'], answer:0 };
  return { q:`An unreliable narrator in literature is best described as:`, options:['A narrator with compromised credibility','A narrator who omits punctuation','A narrator from the future','A narrator who only reports dialogue'], answer:0 };
}

function genCRS(idx, difficulty){
  if(difficulty==='easy') return { q:`Which religion is associated with the Bible as a sacred text?`, options:['Christianity','Islam','Hinduism','Buddhism'], answer:0 };
  return { q:`In Christian teaching, the Beatitudes are found in which book?`, options:['Matthew','Genesis','Psalms','Acts'], answer:0 };
}

function genAccounting(idx, difficulty){
  if(difficulty==='easy') return { q:`In accounting, assets = liabilities + ______.`, options:['Equity','Revenue','Expenses','Profit'], answer:0 };
  const a = randInt(9000)+1000; const l = randInt(5000)+500; const e = a - l;
  return { q:`If a business has assets of ${a} and liabilities of ${l}, what is owner's equity?`, options:[String(e), String(e+100), String(e-100), String(Math.max(0,e-200))], answer:0 };
}

function genCommerce(idx, difficulty){
  if(difficulty==='easy') return { q:`Which business term describes total sales before expenses?`, options:['Revenue','Profit','Cost','Liability'], answer:0 };
  return { q:`Which market structure is characterized by many sellers and identical products?`, options:['Perfect competition','Monopoly','Oligopoly','Monopolistic competition'], answer:0 };
}

function genBusiness(idx, difficulty){
  if(difficulty==='easy') return { q:`Which functional area of business handles payroll and hiring?`, options:['Human resources','Marketing','Production','Sales'], answer:0 };
  return { q:`Which activity is part of strategic management?`, options:['Setting long-term objectives','Processing payroll','Packaging goods','Maintaining records'], answer:0 };
}

function makeQuestion(exam, subject, idx, difficulty){
  const id = `${exam}-${subject.id}-${idx}`;
  let gen;
  switch(subject.id){
    case 'maths': gen = genMath(idx,difficulty); break;
    case 'english': gen = genEnglish(idx,difficulty); break;
    case 'physics': gen = genPhysics(idx,difficulty); break;
    case 'chemistry': gen = genChemistry(idx,difficulty); break;
    case 'biology': gen = genBiology(idx,difficulty); break;
    case 'government': gen = genGovernment(idx,difficulty); break;
    case 'literature': gen = genLiterature(idx,difficulty); break;
    case 'crs': gen = genCRS(idx,difficulty); break;
    case 'accounting': gen = genAccounting(idx,difficulty); break;
    case 'commerce': gen = genCommerce(idx,difficulty); break;
    case 'business': gen = genBusiness(idx,difficulty); break;
    default: gen = { q: `${subject.name} Q${idx}`, options:['A','B','C','D'], answer:0 };
  }
  const options = gen.options.map(o=>typeof o==='number'?String(o):o);
  return { id, q: gen.q, options, answer: gen.answer, subject: subject.id, difficulty };
}

// Backup current file
const dataPath = path.join(__dirname, '..', 'data', 'questions.json');
try{
  if(fs.existsSync(dataPath)){
    const bak = path.join(__dirname, '..', 'data', `questions.backup.${Date.now()}.json`);
    fs.copyFileSync(dataPath, bak);
    console.log('Backup created at', bak);
  }
}catch(e){ console.warn('Backup failed:', e.message); }

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

fs.writeFileSync(dataPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Generated realistic questions written to', dataPath);

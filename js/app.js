// Simple CBT quiz app
(function(){
  const el = id=>document.getElementById(id);
  const examSelect = el('exam-select');
  const startBtn = el('start-btn');
  const numInput = el('num-questions');
  const quizSection = el('quiz');
  const questionText = el('question-text');
  const optionsDiv = el('options');
  const currentSpan = el('current');
  const totalSpan = el('total');
  const nextBtn = el('next-btn');
  const quitBtn = el('quit-btn');
  const resultSection = el('result');
  const scoreText = el('score-text');
  const retryBtn = el('retry-btn');
  const swStatus = el('sw-status');

  // admin elements
  const adminBtn = el('admin-btn');
  const adminSection = el('admin');
  const adminExam = el('admin-exam-select');
  const adminList = el('admin-list');
  const adminQ = el('admin-q');
  const adminOpts = Array.from(document.getElementsByClassName('admin-opt'));
  const adminAnswer = el('admin-answer');
  const adminAdd = el('admin-add');
  const adminSave = el('admin-save');
  const adminCancel = el('admin-cancel');
  const submitSection = el('submit');
  const submitBtn = el('submit-btn');
  const submitCancel = el('submit-cancel');

  let data = null;
  let qlist = [];
  let idx = 0;
  let score = 0;
  let selected = null;
  let answers = [];
  let editingIndex = null; // for admin edit tracking

  function show(elm){elm.classList.remove('hidden')}
  function hide(elm){elm.classList.add('hidden')}

  function shuffle(a){
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]
    }
  }

  async function loadData(){
    // Load question data via fetch, fallback to localStorage cache when offline
    try{
      const res = await fetch('data/questions.json', {cache: 'no-store'});
      if(!res.ok) throw new Error('Failed to load');
      data = await res.json();
      try{ localStorage.setItem('cbt_questions_cache', JSON.stringify(data)); }catch(e){}
    }catch(err){
      const cached = localStorage.getItem('cbt_questions_cache');
      if(cached) data = JSON.parse(cached);
      else {
        console.error('Could not load questions:', err);
        alert('Could not load question data. If you opened the file directly from the filesystem, try serving via a local HTTP server.');
      }
    }
  }

  function persistData(){
    // Persist edits to localStorage (browser-only static app)
    try{ localStorage.setItem('cbt_questions_cache', JSON.stringify(data)); }catch(e){console.warn('Could not persist locally', e)}
  }

  function startQuiz(){
    const exam = examSelect.value;
    const pool = (data && data[exam]) ? data[exam].slice() : [];
    if(pool.length===0){alert('No questions available for this exam');return}
    shuffle(pool);
    // Enforce at least 50 questions for practice if available
    let num;
    if(pool.length >= 50) num = 50; else { num = pool.length; alert('Only ' + pool.length + ' questions available for this exam.'); }
    qlist = pool.slice(0, Math.min(num, pool.length));
    idx = 0; score = 0; selected = null; answers = new Array(qlist.length).fill(null);
    totalSpan.textContent = qlist.length;
    show(quizSection); hide(resultSection);
    renderQuestion();
  }

  function renderQuestion(){
    const q = qlist[idx];
    // show numbering starting from total and counting down
    currentSpan.textContent = (qlist.length - idx);
    questionText.textContent = q.q;
    optionsDiv.innerHTML = '';
    q.options.forEach((opt,i)=>{
      const d = document.createElement('div');
      d.className = 'option'; d.tabIndex=0; d.textContent = String.fromCharCode(65+i)+'.  '+opt;
      d.dataset.index = i;
      d.addEventListener('click', ()=>selectOption(d));
      d.addEventListener('keydown', (e)=>{ if(e.key==='Enter') selectOption(d); });
      optionsDiv.appendChild(d);
    });
    // restore previous selection if any
    selected = answers && answers[idx] !== null ? answers[idx] : null;
    if(selected !== null){
      const node = Array.from(optionsDiv.children).find(c=>Number(c.dataset.index)===selected);
      if(node) node.classList.add('selected');
      nextBtn.disabled = false;
    }else{
      nextBtn.disabled = true;
    }
  }

  function selectOption(node){
    Array.from(optionsDiv.children).forEach(c=>c.classList.remove('selected'));
    node.classList.add('selected');
    selected = Number(node.dataset.index);
    nextBtn.disabled = false;
  }

  // store user's choice and advance without revealing correctness
  function next(){
    if(selected === null){ alert('Please select an option before proceeding.'); return; }
    answers[idx] = selected;
    nextBtn.disabled = true;
    // clear selection visually before moving
    Array.from(optionsDiv.children).forEach(c=>c.classList.remove('selected'));
    idx++;
    if(idx >= qlist.length) showSubmit(); else renderQuestion();
  }

  function showResults(){
    // calculate score and show review with correct answers
    let s = 0;
    const reviewList = el('review-list');
    reviewList.innerHTML = '';
    qlist.forEach((q,i)=>{
      const user = answers[i];
      if(user === q.answer) s++;
      const card = document.createElement('div');
      card.className = 'card';
      const qh = document.createElement('div'); qh.className='question-text'; qh.textContent = (i+1)+'. '+q.q;
      const opts = document.createElement('div'); opts.className='options';
      q.options.forEach((opt,j)=>{
        const o = document.createElement('div'); o.className='option'; o.textContent = String.fromCharCode(65+j)+'. '+opt;
        // do not mark correct/wrong here per user request
        opts.appendChild(o);
      });
      const meta = document.createElement('div'); meta.className = 'note';
      const correctLabel = String.fromCharCode(65 + q.answer) + '. ' + q.options[q.answer];
      const userLabel = (user === null || user === undefined) ? 'No answer' : (String.fromCharCode(65 + user) + '. ' + q.options[user]);
      meta.innerHTML = `<strong>Correct answer:</strong> ${correctLabel}<br><strong>Your answer:</strong> ${userLabel}`;
      card.appendChild(qh); card.appendChild(opts); card.appendChild(meta);
      reviewList.appendChild(card);
    });
    score = s;
    hide(quizSection);
    show(resultSection);
    scoreText.textContent = `${score} / ${qlist.length} (${Math.round(score/qlist.length*100)}%)`;
    // persist collected answers (optional) — note: admin edits already persisted elsewhere
  }

  function showSubmit(){
    hide(quizSection);
    hide(resultSection);
    show(submitSection);
  }

  // submit button handlers
  if(submitBtn) submitBtn.addEventListener('click', ()=>{
    hide(submitSection);
    showResults();
  });
  if(submitCancel) submitCancel.addEventListener('click', ()=>{
    // return to last question so user can review before final submit
    if(qlist && qlist.length>0){ idx = qlist.length - 1; }
    hide(submitSection);
    show(quizSection);
    renderQuestion();
  });

  function resetAll(){ hide(resultSection); hide(quizSection); }

  // ---------- Admin functions ----------
  function openAdmin(){
    if(!data) { alert('Data not loaded yet'); return; }
    populateAdminExam();
    show(adminSection);
  }

  function closeAdmin(){
    hide(adminSection);
    clearAdminForm();
  }

  function populateAdminExam(){
    renderAdminList();
  }

  function renderAdminList(){
    const exam = adminExam.value;
    const list = (data && data[exam]) ? data[exam] : [];
    adminList.innerHTML = '';
    if(list.length===0){ adminList.textContent = 'No questions yet for this exam.'; return; }
    list.forEach((q,i)=>{
      const div = document.createElement('div');
      div.className = 'admin-item';
      const left = document.createElement('div');
      left.innerHTML = `<div class="meta">${i+1}. ${q.q}</div>`;
      const right = document.createElement('div');
      const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Edit';
      const del = document.createElement('button'); del.className='btn alt'; del.textContent='Delete';
      edit.addEventListener('click', ()=>{ loadIntoForm(exam, i); });
      del.addEventListener('click', ()=>{ if(confirm('Delete this question?')){ list.splice(i,1); persistData(); renderAdminList(); } });
      right.appendChild(edit); right.appendChild(del);
      div.appendChild(left); div.appendChild(right);
      adminList.appendChild(div);
    });
  }

  function loadIntoForm(exam, index){
    const q = data[exam][index];
    adminQ.value = q.q || '';
    Array.from(adminOpts).forEach((inp,ii)=>{ inp.value = q.options[ii] || ''; });
    adminAnswer.value = (typeof q.answer === 'number') ? String(q.answer) : '0';
    editingIndex = { exam, index };
  }

  function clearAdminForm(){
    adminQ.value = '';
    adminOpts.forEach(i=>i.value='');
    adminAnswer.value = '0';
    editingIndex = null;
  }

  function addAdminQuestion(){
    const exam = adminExam.value;
    const qtext = adminQ.value.trim();
    if(!qtext){ alert('Enter a question'); return; }
    const opts = adminOpts.map(i=>i.value.trim()).filter(v=>v.length>0);
    if(opts.length < 2){ alert('Provide at least two options'); return; }
    const ans = Number(adminAnswer.value) || 0;
    data[exam] = data[exam] || [];
    data[exam].push({ id: Date.now(), q: qtext, options: opts, answer: ans });
    persistData();
    renderAdminList();
    clearAdminForm();
  }

  function saveAdminQuestion(){
    if(!editingIndex){ alert('No question selected for editing'); return; }
    const { exam, index } = editingIndex;
    const qtext = adminQ.value.trim();
    const opts = adminOpts.map(i=>i.value.trim()).filter(v=>v.length>0);
    const ans = Number(adminAnswer.value) || 0;
    if(!qtext || opts.length<2){ alert('Question and at least two options required'); return; }
    data[exam][index] = { id: data[exam][index].id || Date.now(), q: qtext, options: opts, answer: ans };
    persistData();
    renderAdminList();
    clearAdminForm();
  }

  // events
  startBtn.addEventListener('click', ()=>{ if(!data) alert('Loading data — wait a moment and try again.'); else startQuiz(); });
  nextBtn.addEventListener('click', next);
  quitBtn.addEventListener('click', ()=>{ if(confirm('Quit quiz?')) resetAll(); });
  retryBtn.addEventListener('click', ()=>{ resetAll(); });

  // admin events
  adminBtn.addEventListener('click', openAdmin);
  adminCancel.addEventListener('click', closeAdmin);
  adminAdd.addEventListener('click', addAdminQuestion);
  adminSave.addEventListener('click', saveAdminQuestion);
  adminExam.addEventListener('change', renderAdminList);

  // init
  (async function init(){
    await loadData();
    // Service worker removed: this project is intended to be hosted on a web server.
    try{ swStatus.textContent = 'SW: removed (hosted web app)'; }catch(e){ }
  })();

})();

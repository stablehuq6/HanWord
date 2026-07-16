// ---- FLASHCARD ----
let fcIdx = 0;
function updateCard() {
  const v = currentVocab[fcIdx];
  document.getElementById('fc-hanzi').textContent = v.hanzi;
  document.getElementById('fc-pinyin').textContent = v.pinyin;
  document.getElementById('fc-meaning').textContent = v.meaning;
  const [zh, vi] = v.example.split('|');
  document.getElementById('fc-example').innerHTML = zh + '<br><em>' + vi + '</em>';
  document.getElementById('fc-counter').textContent = (fcIdx+1) + ' / ' + currentVocab.length;
  document.getElementById('fc-progress').style.width = ((fcIdx+1)/currentVocab.length*100) + '%';
  document.getElementById('fc-card').classList.remove('flipped');
}
function flipCard() { document.getElementById('fc-card').classList.toggle('flipped'); }
function nextCard() { fcIdx = (fcIdx+1) % currentVocab.length; updateCard(); }
function prevCard() { fcIdx = (fcIdx-1+currentVocab.length) % currentVocab.length; updateCard(); }
updateCard();

// ---- DRAGON HUNTER ----
let dragonGame = null, dragonScore = 0, dragonLives = 3, dragonTargets = [], dragonFrame = null;
const dCanvas = document.getElementById('dragon-canvas');
const dCtx = dCanvas.getContext('2d');
const colors = ['#e74c3c','#8e44ad','#2980b9','#16a085','#d35400','#c0392b'];

function stopDragon() { if(dragonFrame){cancelAnimationFrame(dragonFrame);dragonFrame=null;} dragonTargets=[]; }
function startDragon() {
  dragonScore=0; dragonLives=3; dragonTargets=[];
  document.getElementById('dragon-start').style.display='none';
  document.getElementById('dragon-score').textContent='Điểm: 0';
  document.getElementById('dragon-lives').textContent='❤️ ❤️ ❤️';
  let qIdx = Math.floor(Math.random()*dragonVocab.length);
  setDragonQuestion(qIdx);
  dragonLoop();
}
let dQuestion = null, dAnswerIdx = 0;
function setDragonQuestion(idx) {
  dAnswerIdx = idx;
  dQuestion = dragonVocab[idx];
  document.getElementById('dragon-question').textContent = '🐉 Tìm từ nghĩa: "' + dQuestion.meaning + '"';
}
function dragonLoop() {
  if(dragonTargets.length < 4 && Math.random() < 0.02) spawnTarget();
  dCtx.clearRect(0,0,440,320);
  dCtx.fillStyle = '#1a3a1a';
  dCtx.fillRect(0,0,440,320);
  // draw stars
  dCtx.fillStyle='rgba(255,255,255,0.3)';
  for(let i=0;i<30;i++){dCtx.fillRect((i*47+13)%440,(i*31+7)%320,2,2);}
  let lost = false;
  dragonTargets.forEach((t,i) => {
    t.x += t.vx; t.y += t.vy;
    if(t.x < 40 || t.x > 400) t.vx *= -1;
    if(t.y > 310) { dragonTargets.splice(i,1); if(t.isAnswer){dragonLives--;updateLives();if(dragonLives<=0)lost=true;} }
    // draw dragon target
    dCtx.save();
    dCtx.globalAlpha=0.9;
    dCtx.fillStyle=t.color;
    dCtx.shadowColor=t.color;
    dCtx.shadowBlur=15;
    dCtx.beginPath();
    dCtx.ellipse(t.x,t.y,38,28,0,0,Math.PI*2);
    dCtx.fill();
    dCtx.restore();
    dCtx.fillStyle='rgba(255,255,255,0.15)';
    dCtx.beginPath();
    dCtx.ellipse(t.x-8,t.y-8,15,10,0.5,0,Math.PI*2);
    dCtx.fill();
    dCtx.font = 'bold 18px "Ma Shan Zheng", serif';
    dCtx.fillStyle='#fff';
    dCtx.textAlign='center';
    dCtx.textBaseline='middle';
    dCtx.fillText(t.hanzi,t.x,t.y);
  });
  if(lost){endDragon();return;}
  dragonFrame = requestAnimationFrame(dragonLoop);
}
function spawnTarget() {
  const isAnswer = Math.random() < 0.35;
  const v = isAnswer ? dQuestion : dragonVocab[Math.floor(Math.random()*dragonVocab.length)];
  dragonTargets.push({x:60+Math.random()*320,y:20,vx:(Math.random()-0.5)*1.2,vy:0.42+Math.random()*0.42,hanzi:v.hanzi,color:colors[Math.floor(Math.random()*colors.length)],isAnswer});
}
function updateLives() {
  const h=['❤️ ❤️ ❤️','❤️ ❤️','❤️','💔'];
  document.getElementById('dragon-lives').textContent=h[3-dragonLives]||'💔';
}
dCanvas.addEventListener('click',(e)=>{
  if(!dragonFrame)return;
  const rect=dCanvas.getBoundingClientRect();
  const mx=(e.clientX-rect.left)*(440/rect.width),my=(e.clientY-rect.top)*(320/rect.height);
  for(let i=dragonTargets.length-1;i>=0;i--){
    const t=dragonTargets[i];
    if(Math.hypot(mx-t.x,my-t.y)<40){
      if(t.isAnswer){dragonScore+=10;showPopup(t.x,t.y,'✓+10',dCanvas);let ni=Math.floor(Math.random()*dragonVocab.length);setDragonQuestion(ni);}
      else{dragonScore=Math.max(0,dragonScore-5);showPopup(t.x,t.y,'-5',dCanvas);}
      dragonTargets.splice(i,1);
      document.getElementById('dragon-score').textContent='Điểm: '+dragonScore;
      return;
    }
  }
});
function endDragon() {
  cancelAnimationFrame(dragonFrame);dragonFrame=null;
  dCtx.fillStyle='rgba(0,0,0,0.7)';dCtx.fillRect(0,0,440,320);
  dCtx.font='bold 32px Nunito';dCtx.fillStyle='#ffd700';dCtx.textAlign='center';
  dCtx.fillText('Trò chơi kết thúc!',220,130);
  dCtx.font='24px Nunito';dCtx.fillStyle='#fff';
  dCtx.fillText('Điểm: '+dragonScore,220,175);
  document.getElementById('dragon-start').style.display='block';
  document.getElementById('dragon-start').textContent='🐉 Chơi lại!';
  document.getElementById('dragon-question').textContent='';
}

// ---- ĐẦU HỒ 投壶 (Click-to-shoot edition) ----
const DH_W=440, DH_H=400;
const DH_JARS = [
  { x:80,  color:'#8b4513' },
  { x:186, color:'#6b3410' },
  { x:292, color:'#a0522d' },
  { x:398, color:'#7a3b1e' },
];
const DH_JAR_MOUTH_W=48, DH_JAR_BODY_W=56, DH_JAR_H=80, DH_JAR_Y=240;
// Archer position (bottom center)
const DH_ARCHER_X=220, DH_ARCHER_Y=360;

let dhCanvas, dhCtx, dhRunning=false, dhAnimId=null;
let dhScore=0, dhStreak=0, dhArrows=8;
let dhCurrentWord=null, dhJarWords=[], dhAnswerJarIdx=-1;
// Arrow animation state
let dhArrow=null; // {x,y,tx,ty,progress,targetJar,isCorrect}
let dhLocked=false; // prevent click during animation
// Hover state
let dhHoverJar=-1;
// Particles & anims
let dhParticles=[], dhJarAnim=[];

function stopDauho(){
  dhRunning=false;
  if(dhAnimId){cancelAnimationFrame(dhAnimId);dhAnimId=null;}
  dhParticles=[]; dhArrow=null; dhLocked=false;
  dhCanvas && dhCanvas.removeEventListener('click', dhOnClick);
  dhCanvas && dhCanvas.removeEventListener('mousemove', dhOnMouseMove);
  dhCanvas && dhCanvas.removeEventListener('touchend', dhOnTouch);
}

function startDauho(){
  dhCanvas=document.getElementById('dh-canvas');
  dhCtx=dhCanvas.getContext('2d');
  dhRunning=true; dhScore=0; dhStreak=0; dhArrows=8;
  dhArrow=null; dhParticles=[]; dhJarAnim=[]; dhLocked=false; dhHoverJar=-1;
  document.getElementById('dh-start').style.display='none';
  document.getElementById('dh-result-msg').textContent='';
  updateDhHud();
  newDhRound();
  dhLoop();
  dhCanvas.addEventListener('click', dhOnClick);
  dhCanvas.addEventListener('mousemove', dhOnMouseMove);
  dhCanvas.addEventListener('touchend', dhOnTouch, {passive:false});
}

function newDhRound(){
  dhCurrentWord = dauhoVocab[Math.floor(Math.random()*dauhoVocab.length)];
  document.getElementById('dh-hanzi').textContent = dhCurrentWord.hanzi;
  document.getElementById('dh-pin').textContent   = dhCurrentWord.pinyin;
  document.getElementById('dh-hint').textContent  = '👆 Nhấn vào bình có nghĩa đúng!';
  const wrongs = dauhoVocab.filter(v=>v.hanzi!==dhCurrentWord.hanzi).sort(()=>Math.random()-0.5).slice(0,3);
  const pool = [dhCurrentWord,...wrongs].sort(()=>Math.random()-0.5);
  dhJarWords = pool;
  dhAnswerJarIdx = pool.findIndex(v=>v.hanzi===dhCurrentWord.hanzi);
  dhArrow=null; dhLocked=false;
}

function updateDhHud(){
  document.getElementById('dh-score').textContent  = dhScore;
  document.getElementById('dh-streak').textContent = '🎯'+dhStreak;
  document.getElementById('dh-arrows').textContent = '🏹'.repeat(Math.max(0,dhArrows));
}

function dhCanvasXY(e){
  const r=dhCanvas.getBoundingClientRect();
  return {x:(e.clientX-r.left)*(DH_W/r.width), y:(e.clientY-r.top)*(DH_H/r.height)};
}
function dhGetClickedJar(px,py){
  for(let i=0;i<DH_JARS.length;i++){
    const j=DH_JARS[i];
    // clickable region: full jar body + label area below
    if(px>=j.x-DH_JAR_BODY_W/2-6 && px<=j.x+DH_JAR_BODY_W/2+6
    && py>=DH_JAR_Y-8 && py<=DH_JAR_Y+DH_JAR_H+30) return i;
  }
  return -1;
}
function dhOnMouseMove(e){
  if(dhLocked||!dhRunning) return;
  const p=dhCanvasXY(e);
  const j=dhGetClickedJar(p.x,p.y);
  dhHoverJar=j;
  dhCanvas.style.cursor = j>=0 ? 'pointer' : 'default';
}
function dhOnClick(e){
  if(dhLocked||!dhRunning||dhArrow) return;
  const p=dhCanvasXY(e);
  const j=dhGetClickedJar(p.x,p.y);
  if(j<0) return;
  dhFireArrow(j);
}
function dhOnTouch(e){
  e.preventDefault();
  if(dhLocked||!dhRunning||dhArrow) return;
  const t=e.changedTouches[0];
  const p=dhCanvasXY(t);
  const j=dhGetClickedJar(p.x,p.y);
  if(j<0) return;
  dhFireArrow(j);
}

function dhFireArrow(jarIdx){
  dhLocked=true; dhArrows--;
  updateDhHud();
  const targetX=DH_JARS[jarIdx].x, targetY=DH_JAR_Y+4;
  dhArrow={
    x:DH_ARCHER_X, y:DH_ARCHER_Y,
    tx:targetX, ty:targetY,
    progress:0, speed:0.018,
    targetJar:jarIdx,
    isCorrect:jarIdx===dhAnswerJarIdx,
    trail:[]
  };
}

function dhLoop(){
  if(!dhRunning) return;
  dhCtx.clearRect(0,0,DH_W,DH_H);
  drawDhBg();
  drawDhJars();
  drawDhArcher();
  updateDrawDhArrow();
  drawDhParticles();
  drawDhJarAnims();
  dhAnimId=requestAnimationFrame(dhLoop);
}

function drawDhBg(){
  // Sky gradient
  const sky=dhCtx.createLinearGradient(0,0,0,DH_JAR_Y+DH_JAR_H);
  sky.addColorStop(0,'#0d0800'); sky.addColorStop(1,'#2a1400');
  dhCtx.fillStyle=sky; dhCtx.fillRect(0,0,DH_W,DH_H);
  // Floor
  const floorY=DH_JAR_Y+DH_JAR_H-8;
  const floorGrad=dhCtx.createLinearGradient(0,floorY,0,DH_H);
  floorGrad.addColorStop(0,'#3a1a00'); floorGrad.addColorStop(1,'#1a0900');
  dhCtx.fillStyle=floorGrad; dhCtx.fillRect(0,floorY,DH_W,DH_H-floorY);
  // Plank lines
  dhCtx.strokeStyle='rgba(255,140,40,0.07)'; dhCtx.lineWidth=1;
  for(let i=0;i<8;i++){dhCtx.beginPath();dhCtx.moveTo(i*60,floorY);dhCtx.lineTo(i*60,DH_H);dhCtx.stroke();}
  // Stars
  dhCtx.fillStyle='rgba(255,220,100,0.18)';
  for(let i=0;i<25;i++) dhCtx.fillRect((i*73+11)%DH_W,(i*37+3)%(DH_JAR_Y-30),i%3===0?2:1.5,i%3===0?2:1.5);
  // Rope top deco
  dhCtx.strokeStyle='rgba(200,134,10,0.2)'; dhCtx.lineWidth=2;
  dhCtx.beginPath(); dhCtx.moveTo(0,16); dhCtx.lineTo(DH_W,16); dhCtx.stroke();
  // Ground shadow under jars
  dhCtx.fillStyle='rgba(0,0,0,0.4)';
  DH_JARS.forEach(j=>{
    dhCtx.beginPath();
    dhCtx.ellipse(j.x,DH_JAR_Y+DH_JAR_H-2,30,9,0,0,Math.PI*2);
    dhCtx.fill();
  });
}

function drawJarShape(ctx, cx, jy, mouth, body, h, color, glow, hover){
  const shoulderY=jy+h*0.2, bellyY=jy+h*0.6, bellyW=body, baseY=jy+h, baseW=body*0.7;
  if(glow){ ctx.save(); ctx.shadowColor=glow; ctx.shadowBlur=28; }
  if(hover){ ctx.save(); ctx.shadowColor='rgba(255,215,0,0.9)'; ctx.shadowBlur=22; }
  ctx.beginPath();
  ctx.moveTo(cx-mouth/2, jy);
  ctx.bezierCurveTo(cx-mouth/2,shoulderY, cx-bellyW/2,shoulderY, cx-bellyW/2,bellyY);
  ctx.bezierCurveTo(cx-bellyW/2,baseY-6, cx-baseW/2,baseY-2, cx-baseW/2,baseY);
  ctx.lineTo(cx+baseW/2,baseY);
  ctx.bezierCurveTo(cx+baseW/2,baseY-2, cx+bellyW/2,baseY-6, cx+bellyW/2,bellyY);
  ctx.bezierCurveTo(cx+bellyW/2,shoulderY, cx+mouth/2,shoulderY, cx+mouth/2,jy);
  ctx.closePath();
  const g=ctx.createLinearGradient(cx-bellyW/2,jy,cx+bellyW/2,jy);
  g.addColorStop(0,'#2a1200'); g.addColorStop(0.2,color);
  g.addColorStop(0.5,'#d4a24a'); g.addColorStop(0.75,color); g.addColorStop(1,'#1a0800');
  ctx.fillStyle=g; ctx.fill();
  ctx.strokeStyle=hover?'rgba(255,215,0,0.9)':'rgba(255,180,60,0.45)'; ctx.lineWidth=hover?2.5:1.5; ctx.stroke();
  // shine
  ctx.save(); ctx.globalAlpha=0.18;
  ctx.beginPath(); ctx.ellipse(cx-bellyW*0.18,jy+h*0.3,bellyW*0.12,h*0.2,-0.3,0,Math.PI*2);
  ctx.fillStyle='#fff'; ctx.fill(); ctx.restore();
  // mouth ring
  ctx.beginPath(); ctx.ellipse(cx,jy,mouth/2,5,0,0,Math.PI*2);
  ctx.fillStyle='#7a3b1e'; ctx.fill();
  ctx.strokeStyle='rgba(255,200,80,0.6)'; ctx.lineWidth=1.5; ctx.stroke();
  // belly band
  ctx.save(); ctx.globalAlpha=0.35;
  ctx.beginPath(); ctx.ellipse(cx,jy+h*0.5,bellyW/2-2,7,0,0,Math.PI*2);
  ctx.strokeStyle='#ffd700'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
  if(glow||hover) ctx.restore();
}

function drawDhJars(){
  DH_JARS.forEach((j,i)=>{
    const word=dhJarWords[i];
    const isHover=i===dhHoverJar && !dhLocked;
    drawJarShape(dhCtx, j.x, DH_JAR_Y, DH_JAR_MOUTH_W, DH_JAR_BODY_W, DH_JAR_H, j.color, null, isHover);
    // Meaning label below
    if(word){
      const txt=word.meaning.length>11?word.meaning.slice(0,11)+'…':word.meaning;
      dhCtx.save();
      if(isHover){ dhCtx.shadowColor='#ffd700'; dhCtx.shadowBlur=10; }
      dhCtx.font=`bold 11px "Nunito",sans-serif`;
      dhCtx.fillStyle=isHover?'#ffd700':'rgba(255,200,100,0.85)';
      dhCtx.textAlign='center'; dhCtx.textBaseline='top';
      dhCtx.fillText(txt, j.x, DH_JAR_Y+DH_JAR_H+8);
      dhCtx.restore();
    }
  });
}

function drawDhArcher(){
  const ax=DH_ARCHER_X, ay=DH_ARCHER_Y;
  dhCtx.save();
  // Body
  dhCtx.fillStyle='#c8860a';
  dhCtx.beginPath(); dhCtx.ellipse(ax,ay,14,20,0,0,Math.PI*2); dhCtx.fill();
  // Head
  dhCtx.beginPath(); dhCtx.arc(ax,ay-26,10,0,Math.PI*2);
  dhCtx.fillStyle='#f0c060'; dhCtx.fill();
  // hat
  dhCtx.fillStyle='#8b0000';
  dhCtx.beginPath(); dhCtx.ellipse(ax,ay-35,13,5,0,0,Math.PI*2); dhCtx.fill();
  dhCtx.fillRect(ax-7,ay-42,14,12); dhCtx.fill();
  // bow arm
  dhCtx.strokeStyle='#8b4513'; dhCtx.lineWidth=3; dhCtx.lineCap='round';
  dhCtx.beginPath(); dhCtx.moveTo(ax-8,ay-10); dhCtx.lineTo(ax-22,ay-20); dhCtx.stroke();
  // bow arc
  dhCtx.strokeStyle='#a0522d'; dhCtx.lineWidth=2.5;
  dhCtx.beginPath(); dhCtx.arc(ax-22,ay-5,20,-Math.PI*0.8,-Math.PI*0.1); dhCtx.stroke();
  // bowstring
  dhCtx.strokeStyle='rgba(255,220,150,0.8)'; dhCtx.lineWidth=1;
  dhCtx.beginPath(); dhCtx.moveTo(ax-22,ay-24); dhCtx.lineTo(ax-22,ay+14); dhCtx.stroke();
  // idle arrow
  if(!dhArrow && !dhLocked){
    dhCtx.strokeStyle='#c8860a'; dhCtx.lineWidth=2.5;
    dhCtx.beginPath(); dhCtx.moveTo(ax-22,ay-10); dhCtx.lineTo(ax-5,ay-10); dhCtx.stroke();
    dhCtx.fillStyle='#c8860a';
    dhCtx.beginPath(); dhCtx.moveTo(ax-5,ay-10); dhCtx.lineTo(ax-11,ay-14); dhCtx.lineTo(ax-11,ay-6); dhCtx.closePath(); dhCtx.fill();
  }
  dhCtx.restore();
  // "click jar" hint when idle
  if(!dhArrow && !dhLocked){
    dhCtx.save();
    dhCtx.font='bold 10px Nunito'; dhCtx.fillStyle='rgba(200,134,10,0.7)';
    dhCtx.textAlign='center'; dhCtx.fillText('NHẤN VÀO LỌ ↑', ax, ay+32);
    dhCtx.restore();
  }
}

function updateDrawDhArrow(){
  if(!dhArrow) return;
  dhArrow.progress+=dhArrow.speed;
  // Bezier path: start -> arc up -> target
  const t=dhArrow.progress;
  const sx=DH_ARCHER_X, sy=DH_ARCHER_Y-10;
  const ex=dhArrow.tx, ey=dhArrow.ty;
  // control point: midpoint, raised up for arc
  const cx2=(sx+ex)/2, cy2=Math.min(sy,ey)-120-Math.abs(ex-sx)*0.15;
  // quadratic bezier
  const bx=(1-t)*(1-t)*sx + 2*(1-t)*t*cx2 + t*t*ex;
  const by=(1-t)*(1-t)*sy + 2*(1-t)*t*cy2 + t*t*ey;
  // angle = derivative
  const dtx=2*(1-t)*(cx2-sx)+2*t*(ex-cx2);
  const dty=2*(1-t)*(cy2-sy)+2*t*(ey-cy2);
  const ang=Math.atan2(dty,dtx);

  dhArrow.trail.push({x:bx,y:by});
  if(dhArrow.trail.length>18) dhArrow.trail.shift();
  // draw trail
  dhArrow.trail.forEach((p,i)=>{
    dhCtx.save(); dhCtx.globalAlpha=i/dhArrow.trail.length*0.4;
    dhCtx.fillStyle='#ffd700';
    dhCtx.beginPath(); dhCtx.arc(p.x,p.y,2,0,Math.PI*2); dhCtx.fill();
    dhCtx.restore();
  });
  // draw arrow
  dhCtx.save();
  dhCtx.translate(bx,by); dhCtx.rotate(ang);
  dhCtx.shadowColor='#ffd700'; dhCtx.shadowBlur=10;
  dhCtx.strokeStyle='#c8860a'; dhCtx.lineWidth=3; dhCtx.lineCap='round';
  dhCtx.beginPath(); dhCtx.moveTo(-18,0); dhCtx.lineTo(12,0); dhCtx.stroke();
  dhCtx.fillStyle='#e8a020';
  dhCtx.beginPath(); dhCtx.moveTo(12,0); dhCtx.lineTo(5,-5); dhCtx.lineTo(5,5); dhCtx.closePath(); dhCtx.fill();
  // tail feather
  dhCtx.strokeStyle='rgba(255,100,0,0.8)'; dhCtx.lineWidth=2;
  dhCtx.beginPath(); dhCtx.moveTo(-14,-6); dhCtx.lineTo(-18,0); dhCtx.lineTo(-14,6); dhCtx.stroke();
  dhCtx.restore();

  if(dhArrow.progress>=1){
    // Arrow arrived!
    const jarIdx=dhArrow.targetJar;
    dhArrow=null;
    dhOnHit(jarIdx);
  }
}

function dhOnHit(jarIdx){
  const isCorrect = jarIdx===dhAnswerJarIdx;
  spawnDhParticles(DH_JARS[jarIdx].x, DH_JAR_Y, isCorrect?'#ffd700':'#e74c3c', isCorrect?24:14, isCorrect?'correct':'wrong');
  dhJarAnim.push({jar:jarIdx, t:0, type:isCorrect?'hit':'miss'});

  if(isCorrect){
    dhScore+=10*(1+Math.floor(dhStreak/3)); dhStreak++;
    document.getElementById('dh-result-msg').style.color='#2ecc71';
    document.getElementById('dh-result-msg').textContent='🎯 Trúng! +'+(10*(1+Math.floor((dhStreak-1)/3)));
    dhArrows+=1; // bonus arrow
  } else {
    dhStreak=0;
    document.getElementById('dh-result-msg').style.color='#e74c3c';
    document.getElementById('dh-result-msg').textContent='💥 Sai! Đáp án: "'+dhCurrentWord.meaning+'"';
  }
  updateDhHud();
  setTimeout(()=>{
    dhArrow=null;
    if(dhArrows<=0){ endDauho(); return; }
    newDhRound();
    document.getElementById('dh-result-msg').textContent='';
  }, isCorrect?1800:2400);
}

function spawnDhParticles(x,y,color,n,type){
  for(let i=0;i<n;i++){
    const angle=Math.random()*Math.PI*2;
    const sp=1+Math.random()*4;
    dhParticles.push({x,y,vx:Math.cos(angle)*sp,vy:Math.sin(angle)*sp-1,color,life:30+Math.random()*20,maxLife:50,size:2+Math.random()*3,type});
  }
  // hanzi burst on correct
  if(type==='correct'&&dhCurrentWord){
    dhCurrentWord.hanzi.split('').forEach((ch,ci)=>{
      dhParticles.push({x,y,vx:(Math.random()-0.5)*3,vy:-2-Math.random()*2,color:'#ffd700',life:110,maxLife:110,size:18,type:'hanzi',ch});
    });
  }
}

function drawDhParticles(){
  dhParticles=dhParticles.filter(p=>{
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.life--;
    if(p.life<=0)return false;
    const alpha=p.life/p.maxLife;
    dhCtx.save(); dhCtx.globalAlpha=alpha;
    if(p.type==='hanzi'){
      dhCtx.font=`bold ${p.size}px "Ma Shan Zheng",serif`;
      dhCtx.fillStyle=p.color; dhCtx.textAlign='center'; dhCtx.textBaseline='middle';
      dhCtx.shadowColor='#ffd700'; dhCtx.shadowBlur=10;
      dhCtx.fillText(p.ch,p.x,p.y);
    } else {
      dhCtx.fillStyle=p.color;
      dhCtx.beginPath();dhCtx.arc(p.x,p.y,p.size,0,Math.PI*2);dhCtx.fill();
    }
    dhCtx.restore();
    return true;
  });
}

function drawDhJarAnims(){
  dhJarAnim=dhJarAnim.filter(a=>{
    a.t+=2;
    if(a.t>40)return false;
    const j=DH_JARS[a.jar];
    const alpha=1-a.t/40;
    dhCtx.save(); dhCtx.globalAlpha=alpha*0.8;
    dhCtx.strokeStyle=a.type==='hit'?'#ffd700':'#e74c3c';
    dhCtx.lineWidth=3;
    dhCtx.beginPath();dhCtx.ellipse(j.x,DH_JAR_Y,DH_JAR_MOUTH_W/2+a.t*0.6,8+a.t*0.3,0,0,Math.PI*2);dhCtx.stroke();
    dhCtx.restore();
    return true;
  });
}

function endDauho(){
  dhRunning=false;
  cancelAnimationFrame(dhAnimId); dhAnimId=null;
  dhCtx.fillStyle='rgba(0,0,0,0.78)'; dhCtx.fillRect(0,0,DH_W,DH_H);
  dhCtx.font='bold 28px Nunito'; dhCtx.fillStyle='#c8860a'; dhCtx.textAlign='center';
  dhCtx.fillText('🏺 Hết tên!', DH_W/2, 150);
  dhCtx.font='22px Nunito'; dhCtx.fillStyle='#ffd700';
  dhCtx.fillText('Điểm: '+dhScore, DH_W/2, 195);
  const msgs=['Luyện thêm nhé! 加油！','Không tệ! 不错！','Giỏi lắm! 厉害！','Cao thủ! 太棒了！'];
  dhCtx.font='16px Nunito'; dhCtx.fillStyle='rgba(255,255,255,0.7)';
  dhCtx.fillText(msgs[Math.min(3,Math.floor(dhScore/40))], DH_W/2, 232);
  document.getElementById('dh-start').textContent='🏺 Chơi lại!';
  document.getElementById('dh-start').style.display='block';
  dhCanvas.removeEventListener('click',dhOnClick);
  dhCanvas.removeEventListener('mousemove',dhOnMouseMove);
  dhCanvas.removeEventListener('touchend',dhOnTouch);
  dhCanvas.style.cursor='default';
}

// ---- TYPING RACE ----
let tyScore=0,tyCombo=1,tyTime=30,tyInterval=null,tyWord=null,tyRunning=false;
function stopTyping() { if(tyInterval){clearInterval(tyInterval);tyInterval=null;} tyRunning=false; }
function startTyping() {
  stopTyping(); tyScore=0;tyCombo=1;tyTime=30;tyRunning=true;
  document.getElementById('ty-result').style.display='none';
  document.getElementById('ty-start').style.display='none';
  document.getElementById('ty-input').disabled=false;
  document.getElementById('ty-input').value='';
  document.getElementById('ty-input').focus();
  updateTypingStats();
  nextTypingWord();
  tyInterval=setInterval(()=>{
    tyTime--;
    document.getElementById('ty-time').textContent=tyTime;
    document.getElementById('ty-timer').style.width=(tyTime/30*100)+'%';
    if(tyTime<=0){endTyping();}
  },1000);
}
function nextTypingWord() {
  tyWord=typingVocab[Math.floor(Math.random()*typingVocab.length)];
  document.getElementById('ty-hanzi').textContent=tyWord.hanzi;
  document.getElementById('ty-meaning').textContent=tyWord.meaning;
  document.getElementById('ty-input').value='';
  document.getElementById('ty-input').className='typing-input';
}
function checkTyping() {
  if(!tyRunning)return;
  const val=document.getElementById('ty-input').value.toLowerCase().trim();
  const ans=tyWord.pinyin.toLowerCase().replace(/[āáǎàōóǒòūúǔùīíǐì]/g,(c)=>{const m={ā:'a',á:'a',ǎ:'a',à:'a',ō:'o',ó:'o',ǒ:'o',ò:'o',ū:'u',ú:'u',ǔ:'u',ù:'u',ī:'i',í:'i',ǐ:'i',ì:'i'};return m[c]||c;}).replace(/\s/g,'');
  const clean=val.replace(/\s/g,'');
  if(clean===ans){
    tyScore+=10*tyCombo; tyCombo++;
    document.getElementById('ty-input').className='typing-input correct';
    setTimeout(nextTypingWord,700);
  } else if(ans.startsWith(clean)) {
    document.getElementById('ty-input').className='typing-input';
  } else {
    document.getElementById('ty-input').className='typing-input wrong';
    tyCombo=1;
  }
  updateTypingStats();
}
function updateTypingStats() {
  document.getElementById('ty-score').textContent=tyScore;
  document.getElementById('ty-combo').textContent='x'+tyCombo;
}
function endTyping() {
  clearInterval(tyInterval); tyInterval=null; tyRunning=false;
  document.getElementById('ty-input').disabled=true;
  document.getElementById('ty-result').style.display='block';
  document.getElementById('ty-final-score').textContent=tyScore;
  const msgs=['Cần luyện thêm! 加油！','Không tệ! 不错！','Giỏi lắm! 很好！','Xuất sắc! 太棒了！'];
  const idx=Math.min(3,Math.floor(tyScore/50));
  document.getElementById('ty-final-msg').textContent=msgs[idx];
  document.getElementById('ty-start').textContent='⌨️ Chơi lại!';
  document.getElementById('ty-start').style.display='block';
}

function showPopup(x,y,text,canvas){
  const rect=canvas.getBoundingClientRect();
  const el=document.createElement('div');
  el.textContent=text;
  el.style.cssText=`position:fixed;left:${rect.left+x*(rect.width/440)}px;top:${rect.top+y*(rect.height/320)}px;color:${text.includes('-')?'#ff6b6b':'#2ecc71'};font-weight:800;font-size:1.2rem;pointer-events:none;z-index:999;transition:all 1.4s;font-family:Nunito`;
  document.body.appendChild(el);
  setTimeout(()=>{el.style.transform='translateY(-50px)';el.style.opacity='0';},200);
  setTimeout(()=>el.remove(),1700);
}

// ==================== BAO LÌ XÌ TẾT ====================


let lxScore=0, lxStreak=0, lxPool=[], lxCurrent=null, lxRunning=false;

function stopLixi() { lxRunning=false; }

function startLixi() {
  lxScore=0; lxStreak=0; lxRunning=true;
  document.getElementById('lx-start').style.display='none';
  document.getElementById('lx-result').style.display='none';
  document.getElementById('lx-quiz-box').style.display='none';
  lxPool = [...lixiVocab].sort(()=>Math.random()-0.5).slice(0,8);
  updateLxStats();
  renderEnvelopes();
}

function updateLxStats() {
  document.getElementById('lx-score').textContent = lxScore;
  document.getElementById('lx-streak').textContent = '🔥'+lxStreak;
  document.getElementById('lx-left').textContent = lxPool.length;
}

function renderEnvelopes() {
  const area = document.getElementById('lx-envelopes');
  area.innerHTML='';
  lxPool.forEach((w,i)=>{
    const el=document.createElement('div');
    el.className='envelope';
    el.id='env-'+i;
    el.innerHTML=`<span class="env-deco">🧧</span><span class="env-label">Nhấn<br>mở!</span><span class="reveal-hanzi">${w.hanzi}</span><span class="reveal-pin">${w.pinyin}</span>`;
    el.onclick=()=>openEnvelope(i,el,w);
    area.appendChild(el);
  });
}

function openEnvelope(i, el, word) {
  if(el.classList.contains('opened')) return;
  el.classList.add('opened');
  lxCurrent = word;
  setTimeout(()=>showLxQuiz(word), 400);
}

function showLxQuiz(word) {
  const box = document.getElementById('lx-quiz-box');
  box.style.display='block';
  document.getElementById('lx-question').textContent = '🧧 "'+word.hanzi+'" ('+word.pinyin+') nghĩa là gì?';
  const wrongPool = lixiVocab.filter(v=>v.hanzi!==word.hanzi);
  const wrongs = wrongPool.sort(()=>Math.random()-0.5).slice(0,3);
  const choices = [word,...wrongs].sort(()=>Math.random()-0.5);
  const choiceDiv = document.getElementById('lx-choices');
  choiceDiv.innerHTML='';
  choices.forEach(c=>{
    const btn=document.createElement('button');
    btn.className='tet-choice';
    btn.textContent=c.meaning;
    btn.onclick=()=>answerLx(btn, c.hanzi===word.hanzi, word);
    choiceDiv.appendChild(btn);
  });
}

function answerLx(btn, correct, word) {
  const allBtns = document.querySelectorAll('.tet-choice');
  allBtns.forEach(b=>{b.onclick=null;});
  if(correct) {
    btn.classList.add('correct-ans');
    lxStreak++;
    const pts = 10 + (lxStreak>2?10:0);
    lxScore += pts;
    spawnGoldCoins();
    // Remove from pool
    lxPool = lxPool.filter(v=>v.hanzi!==word.hanzi);
    updateLxStats();
    setTimeout(()=>{
      document.getElementById('lx-quiz-box').style.display='none';
      if(lxPool.length===0){ endLixi(); }
    },1800);
  } else {
    btn.classList.add('wrong-ans');
    // highlight correct
    allBtns.forEach(b=>{ if(b.textContent===word.meaning) b.classList.add('correct-ans'); });
    lxStreak=0;
    updateLxStats();
    setTimeout(()=>{ document.getElementById('lx-quiz-box').style.display='none'; },2200);
  }
}

function endLixi() {
  lxRunning=false;
  document.getElementById('lx-envelopes').innerHTML='';
  const res=document.getElementById('lx-result');
  document.getElementById('lx-final-score').textContent=lxScore;
  const msgs=['Chúc mừng năm mới! 新年快乐！🎉','Tuyệt vời! 厉害！🧧','Giỏi lắm! 很好！❤️','Cần luyện thêm! 加油！'];
  document.getElementById('lx-final-msg').textContent = lxScore>=60?msgs[0]:lxScore>=40?msgs[1]:lxScore>=20?msgs[2]:msgs[3];
  res.style.display='block';
}

function spawnGoldCoins() {
  for(let i=0;i<6;i++){
    const coin=document.createElement('div');
    coin.className='gold-coin';
    coin.textContent=['🪙','💰','✨','🎊','🎉'][Math.floor(Math.random()*5)];
    coin.style.left=(10+Math.random()*80)+'%';
    coin.style.top='20%';
    coin.style.animationDelay=(Math.random()*0.3)+'s';
    document.body.appendChild(coin);
    setTimeout(()=>coin.remove(),1500);
  }
}

// ==================== PHÁO HOA CHỮ (CANNON/FUSE) ====================


let fwCanvas2, fwCtx2, fwRunning=false, fwAnimId=null;
let fwParticles2=[], fwRockets2=[], fwScore=0, fwCombo=1;
let fwCurrentWord=null, fwAnswering=true;
const FW_COLORS2=['#ff4444','#ff8800','#ffff00','#00ff88','#00aaff','#aa44ff','#ff44aa','#ffd700','#ff6688','#44ffcc'];
const CANNON_COLORS=['#e74c3c','#3498db','#2ecc71','#f39c12'];

function stopFirework() {
  fwRunning=false;
  if(fwAnimId){cancelAnimationFrame(fwAnimId);fwAnimId=null;}
  fwParticles2=[]; fwRockets2=[];
}

function startFirework() {
  document.getElementById('fw-overlay').style.display='none';
  const wrap = document.getElementById('fw-wrap');
  fwCanvas2 = document.getElementById('fw-canvas');
  fwCanvas2.width = wrap.offsetWidth;
  fwCanvas2.height = wrap.offsetHeight;
  fwCtx2 = fwCanvas2.getContext('2d');
  fwRunning=true; fwScore=0; fwCombo=1;
  fwParticles2=[]; fwRockets2=[];
  document.getElementById('fw-score').textContent='0';
  nextFwWord();
  fwLoop2();
}

function nextFwWord() {
  fwAnswering=true;
  fwCurrentWord = fireworkVocab[Math.floor(Math.random()*fireworkVocab.length)];
  document.getElementById('fw-hanzi').textContent = fwCurrentWord.hanzi;
  document.getElementById('fw-pin').textContent = fwCurrentWord.pinyin;
  document.getElementById('fw-prompt').textContent = '🧨 Châm ngòi đúng!';
  document.getElementById('fw-result-text').textContent = '';
  document.getElementById('fw-result-text').style.color='#fff';
  hideFwReveal();

  // Build 4 cannon choices
  const wrongs = fireworkVocab.filter(v=>v.hanzi!==fwCurrentWord.hanzi).sort(()=>Math.random()-0.5).slice(0,3);
  const choices = [fwCurrentWord,...wrongs].sort(()=>Math.random()-0.5);
  const area = document.getElementById('fw-cannons');
  area.innerHTML='';

  choices.forEach((c, i) => {
    const isCorrect = c.hanzi===fwCurrentWord.hanzi;
    const col = CANNON_COLORS[i];
    const div = document.createElement('div');
    div.className='fw-cannon';
    div.id='cannon-'+i;
    div.innerHTML=`
      <div class="fw-cannon-label" id="cannon-label-${i}">${c.meaning}</div>
      <div class="fw-tube" style="border-color:${col}40;background:linear-gradient(180deg,${col} 0%,${darken(col)} 60%,${darken(darken(col))} 100%)">
        <div class="fw-tube-shine"></div>
      </div>`;
    div.onclick = () => fireCannon(div, i, isCorrect, c, col);
    area.appendChild(div);
  });
}

function darken(hex) {
  // simple darken by reducing rgb
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `#${Math.max(0,r-60).toString(16).padStart(2,'0')}${Math.max(0,g-60).toString(16).padStart(2,'0')}${Math.max(0,b-60).toString(16).padStart(2,'0')}`;
}

function fireCannon(div, idx, isCorrect, choice, col) {
  if(!fwAnswering) return;
  fwAnswering=false;
  // Disable all
  document.querySelectorAll('.fw-cannon').forEach(c=>{c.onclick=null;});

  if(isCorrect) {
    div.classList.add('correct-cannon');
    fwScore += 15 * fwCombo; fwCombo++;
    document.getElementById('fw-score').textContent=fwScore;
    document.getElementById('fw-result-text').textContent = '🎆 正确！ Bắn lên!';
    document.getElementById('fw-result-text').style.color='#2ecc71';
    showFwReveal(fwCurrentWord.meaning, true);
    updateFwComboBadge();
    // Get cannon position and launch
    const rect = div.querySelector('.fw-tube').getBoundingClientRect();
    const wrapRect = document.getElementById('fw-wrap').getBoundingClientRect();
    const cx = rect.left - wrapRect.left + rect.width/2;
    const cy = rect.top - wrapRect.top;
    // Fuse spark animation then launch
    animateFuse(div, col, ()=>{
      launchRocket2(cx, col, fwCurrentWord);
      if(fwCombo > 2) {
        setTimeout(()=>launchRocket2(cx-30+Math.random()*60, FW_COLORS2[Math.floor(Math.random()*FW_COLORS2.length)], null), 300);
        setTimeout(()=>launchRocket2(cx-30+Math.random()*60, FW_COLORS2[Math.floor(Math.random()*FW_COLORS2.length)], null), 600);
      }
    });
    setTimeout(nextFwWord, 3800);
  } else {
    div.classList.add('wrong-cannon');
    document.getElementById('fw-result-text').textContent = '💥 Sai rồi! Đáp án:';
    document.getElementById('fw-result-text').style.color='#e74c3c';
    fwCombo=1; updateFwComboBadge();
    // Highlight correct
    document.querySelectorAll('.fw-cannon').forEach(c=>{
      if(!c.classList.contains('wrong-cannon')) {
        const lbl = c.querySelector('.fw-cannon-label');
        if(lbl && lbl.textContent===fwCurrentWord.meaning) c.classList.add('correct-cannon');
      }
    });
    showFwReveal(fwCurrentWord.meaning, false);
    // small wrong burst
    const rect = div.querySelector('.fw-tube').getBoundingClientRect();
    const wrapRect = document.getElementById('fw-wrap').getBoundingClientRect();
    wrongBurst(rect.left-wrapRect.left+rect.width/2, rect.top-wrapRect.top);
    setTimeout(nextFwWord, 3200);
  }
}

function animateFuse(div, col, cb) {
  // Visual: tube glows then fires
  const tube = div.querySelector('.fw-tube');
  tube.style.transition='box-shadow 0.3s';
  tube.style.boxShadow=`0 0 30px ${col}, 0 0 60px ${col}80`;
  // Spark particles from tube mouth
  const rect = tube.getBoundingClientRect();
  const wrapRect = document.getElementById('fw-wrap').getBoundingClientRect();
  const cx = rect.left-wrapRect.left+rect.width/2;
  const cy = rect.top-wrapRect.top;
  for(let i=0;i<12;i++){
    const angle = -Math.PI/2 + (Math.random()-0.5)*0.8;
    const speed = 2+Math.random()*3;
    fwParticles2.push({x:cx,y:cy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,color:'#ffaa00',life:25,maxLife:25,size:2+Math.random()*2,isText:false,isSpark:true});
  }
  setTimeout(cb, 350);
}

function launchRocket2(x, color, word) {
  const targetY = 60 + Math.random() * (fwCanvas2.height * 0.45);
  fwRockets2.push({
    x, y: fwCanvas2.height * 0.72,
    targetY,
    vx: (Math.random()-0.5)*1.2,
    vy: -9 - Math.random()*4,
    color, trail:[], word, exploded:false
  });
}

function wrongBurst(x, y) {
  for(let i=0;i<20;i++){
    const angle=Math.random()*Math.PI*2;
    fwParticles2.push({x,y,vx:Math.cos(angle)*(1+Math.random()*2),vy:Math.sin(angle)*(1+Math.random()*2),color:'#e74c3c',life:30,maxLife:30,size:2,isText:false});
  }
}

function fwLoop2() {
  if(!fwRunning) return;
  // Fade trail
  fwCtx2.fillStyle='rgba(0,5,20,0.22)';
  fwCtx2.fillRect(0,0,fwCanvas2.width,fwCanvas2.height);

  // Draw ground glow
  const grd = fwCtx2.createLinearGradient(0,fwCanvas2.height*0.7,0,fwCanvas2.height);
  grd.addColorStop(0,'rgba(60,0,0,0)'); grd.addColorStop(1,'rgba(60,0,0,0.15)');
  fwCtx2.fillStyle=grd; fwCtx2.fillRect(0,fwCanvas2.height*0.7,fwCanvas2.width,fwCanvas2.height*0.3);

  // Stars background
  fwCtx2.fillStyle='rgba(255,255,255,0.25)';
  for(let i=0;i<40;i++) fwCtx2.fillRect((i*73+11)%fwCanvas2.width,(i*41+7)%(fwCanvas2.height*0.68),1.5,1.5);

  // Rockets
  fwRockets2 = fwRockets2.filter(r=>{
    if(r.exploded) return false;
    r.x+=r.vx; r.y+=r.vy; r.vy*=0.97;
    r.trail.push({x:r.x,y:r.y});
    if(r.trail.length>16) r.trail.shift();
    r.trail.forEach((p,i)=>{
      fwCtx2.globalAlpha=i/r.trail.length*0.6;
      fwCtx2.fillStyle=r.color;
      fwCtx2.beginPath();fwCtx2.arc(p.x,p.y,2.5,0,Math.PI*2);fwCtx2.fill();
    });
    fwCtx2.globalAlpha=1;
    fwCtx2.save();
    fwCtx2.shadowColor=r.color; fwCtx2.shadowBlur=18;
    fwCtx2.fillStyle=r.color;
    fwCtx2.beginPath();fwCtx2.arc(r.x,r.y,5,0,Math.PI*2);fwCtx2.fill();
    fwCtx2.restore();
    if(r.y <= r.targetY || r.vy >= 0){ explode2(r); r.exploded=true; return false; }
    return true;
  });

  // Particles
  fwParticles2 = fwParticles2.filter(p=>{
    p.x+=p.vx; p.y+=p.vy; p.vy+=p.isSpark?0.1:0.055; p.vx*=0.97; p.life--;
    if(p.life<=0) return false;
    const alpha=p.life/p.maxLife;
    fwCtx2.globalAlpha=alpha;
    fwCtx2.save();
    fwCtx2.shadowColor=p.color; fwCtx2.shadowBlur=p.isText?8:4;
    if(p.isText){
      fwCtx2.font=`bold ${p.size}px "Ma Shan Zheng",serif`;
      fwCtx2.fillStyle=p.color; fwCtx2.textAlign='center'; fwCtx2.textBaseline='middle';
      fwCtx2.fillText(p.char,p.x,p.y);
    } else {
      fwCtx2.fillStyle=p.color;
      fwCtx2.beginPath();fwCtx2.arc(p.x,p.y,p.size,0,Math.PI*2);fwCtx2.fill();
    }
    fwCtx2.restore();
    return true;
  });
  fwCtx2.globalAlpha=1;
  fwAnimId=requestAnimationFrame(fwLoop2);
}

function explode2(r) {
  const count = 55 + fwCombo*5 + Math.floor(Math.random()*30);
  const hanziChars = r.word ? r.word.hanzi.split('') : [];
  const pinChars = r.word ? r.word.pinyin.replace(/\s/g,'').split('') : [];
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=(1+Math.random()*5)*(0.7+fwCombo*0.1);
    // Some particles show hanzi/pinyin chars
    const isHanzi = hanziChars.length && i<12 && Math.random()<0.5;
    const isPin = pinChars.length && i>=12 && i<22 && Math.random()<0.35;
    const isText = isHanzi||isPin;
    fwParticles2.push({
      x:r.x, y:r.y,
      vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
      color: isText ? '#ffd700' : r.color,
      life: isText ? 120+Math.random()*60 : 55+Math.random()*50,
      maxLife: isText ? 180 : 105,
      size: isText ? (14+Math.random()*10) : (1.5+Math.random()*3),
      isText, isSpark:false,
      char: isHanzi ? hanziChars[Math.floor(Math.random()*hanziChars.length)]
           : isPin ? pinChars[Math.floor(Math.random()*pinChars.length)] : null
    });
  }
  // Flash ring
  fwCtx2.save();
  fwCtx2.globalAlpha=0.25;
  const g=fwCtx2.createRadialGradient(r.x,r.y,0,r.x,r.y,80);
  g.addColorStop(0,r.color); g.addColorStop(1,'transparent');
  fwCtx2.fillStyle=g; fwCtx2.beginPath();fwCtx2.arc(r.x,r.y,80,0,Math.PI*2);fwCtx2.fill();
  fwCtx2.restore();
  // Show floating word badge
  if(r.word) showFwBadge(r.x, r.y, r.word, r.color);
}

function showFwBadge(x, y, word, col) {
  const wrap = document.getElementById('fw-wrap');
  const badge = document.createElement('div');
  const px = Math.min(Math.max(x-60, 10), wrap.offsetWidth-130);
  const py = Math.min(Math.max(y-20, 10), wrap.offsetHeight*0.6);
  badge.style.cssText=`position:absolute;left:${px}px;top:${py}px;background:rgba(0,0,0,0.85);border:1.5px solid ${col};border-radius:10px;padding:8px 16px;z-index:12;pointer-events:none;text-align:center;transition:all 2.5s ease;font-size:1.1rem;`;
  badge.innerHTML=`<div style="font-family:'Ma Shan Zheng',serif;font-size:1.5rem;color:${col}">${word.hanzi}</div><div style="font-size:0.7rem;color:rgba(255,255,255,0.8)">${word.pinyin} · ${word.meaning}</div>`;
  wrap.appendChild(badge);
  setTimeout(()=>{ badge.style.transform='translateY(-60px)'; badge.style.opacity='0'; },800);
  setTimeout(()=>badge.remove(),3500);
}

function showFwReveal(meaning, correct) {
  const el = document.getElementById('fw-answer-reveal');
  el.textContent = (correct ? '✅ ' : '❌ Đáp án: ') + meaning;
  el.style.borderColor = correct ? '#2ecc71' : '#e74c3c';
  el.style.color = correct ? '#2ecc71' : '#ff8888';
  el.style.opacity='1';
}
function hideFwReveal() { document.getElementById('fw-answer-reveal').style.opacity='0'; }

function updateFwComboBadge() {
  const b = document.getElementById('fw-combo-badge');
  if(fwCombo > 1) {
    b.style.opacity='1';
    b.textContent = '🔥 x'+fwCombo;
    b.style.background='rgba(255,'+(Math.min(fwCombo*20,180))+',0,0.2)';
  } else { b.style.opacity='0'; }
}
// ==================== CHỌN CHỦ ĐỀ ====================
let currentTopicKey = null;

function updateFlashcardTopicLabel() {
  const el = document.getElementById('fc-topic-name');
  if (!el) return;
  const meta = TOPIC_META[currentTopicKey] || { name: '', icon: '' };
  el.textContent = `${meta.icon} ${meta.name}`;
};
const TOPIC_META = {
  general:  { name: 'Tổng hợp',  icon: '🌟' },
  animals:  { name: 'Động vật',  icon: '🐾' },
  objects:  { name: 'Đồ dùng',   icon: '🧰' },
  food:     { name: 'Đồ ăn',     icon: '🍜' },
  numbers:  { name: 'Số đếm',    icon: '🔢' },
  travel:   { name: 'Du lịch',   icon: '🧳' },
  nature:   { name: 'Thiên nhiên', icon: '🌿' },
  clothing: { name: 'Quần áo',   icon: '👕' },
  vehicle:  { name: 'Phương tiện', icon: '🚗' }
};

const GAME_MIN_WORDS = {
  flashcard: 1, dragon: 2, dauho: 4, typing: 1, lixì: 4, firework: 4
};

let topicPickerTarget = null;
let topicPickerBackScreen = 'home';

function openTopicPicker(target, backScreen) {
  topicPickerTarget = target;
  topicPickerBackScreen = backScreen || 'home';
  document.getElementById('topic-picker-title').textContent =
    target === 'flashcard' ? '📚 Chọn chủ đề học từ vựng' : '🎮 Chọn chủ đề luyện tập';
  renderTopicPicker();
  showScreen('topic-picker');
}

function renderTopicPicker() {
  const minWords = GAME_MIN_WORDS[topicPickerTarget] || 1;
  const grid = document.getElementById('topic-picker-grid');
  grid.innerHTML = Object.keys(TOPICS).map(key => {
    const words = TOPICS[key];
    const meta = TOPIC_META[key] || { name: key, icon: '📖' };
    const enough = words.length >= minWords;
    return `
      <div class="menu-card" style="${enough ? '' : 'opacity:0.35;cursor:not-allowed;'}"
           ${enough ? `onclick="selectTopic('${key}')"` : ''}>
        <div class="icon-box icon-purple">${meta.icon}</div>
        <div class="name">${meta.name}</div>
        <div class="desc">${words.length} từ${enough ? '' : ' · chưa đủ cho trò này'}</div>
        <div class="arrow-row"><span>${enough ? 'Bắt đầu' : 'Cần thêm từ'}</span><span class="arrow">→</span></div>
      </div>`;
  }).join('');
}

function selectTopic(key) {
  const vocab = TOPICS[key];
  const tipBox = document.getElementById('fc-tip');
  if (tipBox) {
    if (TOPIC_TIPS[key]) { tipBox.innerHTML = TOPIC_TIPS[key]; tipBox.style.display = 'block'; }
    else tipBox.style.display = 'none';
  }
  switch (topicPickerTarget) {
    case 'flashcard':
      currentVocab = vocab;
      currentTopicKey = key;
      fcIdx = 0;
      updateCard();
      updateFlashcardTopicLabel();
      showScreen('flashcard');
      break;
    case 'dragon':    dragonVocab = vocab;   showScreen('dragon'); break;
    case 'dauho':     dauhoVocab = vocab;    showScreen('dauho'); break;
    case 'typing':    typingVocab = vocab;   showScreen('typing'); break;
    case 'lixì':      lixiVocab = vocab;     showScreen('lixì'); break;
    case 'firework':  fireworkVocab = vocab; showScreen('firework'); break;
  }
}

window.openTopicPicker = openTopicPicker;
window.selectTopic = selectTopic;
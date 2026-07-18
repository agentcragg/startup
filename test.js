const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html','utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const m2 = {exports:{}};
new Function('module', script)(m2);
const L = m2.exports;

let fails = 0;
function eq(name, got, want){
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log((ok?'PASS':'FAIL')+' '+name+' -> '+JSON.stringify(got)+(ok?'':' (want '+JSON.stringify(want)+')'));
  if(!ok) fails++;
}
const D = (m,d)=> new Date(2026, m-1, d);
const S = days => ({days});
const full = {l:1,p:1,d:0,g:0,t:0};

// core
eq('core max 2', L.corePts(full), 2);
eq('core 1', L.corePts({l:1,p:0}), 1);

// week: Mon 3 Aug - Sun 9 Aug
{
  const days = {};
  for(let d=3; d<=9; d++) days['2026-08-0'+d] = {...full, d:(d===7||d===8)?1:0, g:(d===8||d===9)?1:0, t:d===9?1:0};
  const w = L.weekAgg(S(days), D(8,5), D(8,12)); // week over
  eq('drinks counted', w.drinks, 2);
  eq('gym counted (no pts)', w.gym, 2);
  eq('drink bonus at 2 drinks', w.drinkBonus, 3);
  eq('tw bonus at 1', w.twBonus, 3);
  eq('week pts 14+6', w.pts, 20);
}
// 3 drink days -> no bonus
{
  const days = {};
  for(let d=3; d<=9; d++) days['2026-08-0'+d] = {...full, d:d<=5?1:0};
  eq('no drink bonus at 3', L.weekAgg(S(days), D(8,5), D(8,12)).drinkBonus, 0);
}
// bonuses withheld mid-week, but pending shown
{
  const days = {'2026-08-03': {...full}};
  const w = L.weekAgg(S(days), D(8,3), D(8,5));
  eq('no bonus mid-week', w.drinkBonus + w.twBonus, 0);
  eq('pending +6 mid-week', w.pending, 6);
}
// empty week: no bonus, no pending
{
  const w = L.weekAgg(S({}), D(8,3), D(8,12));
  eq('empty week no bonus', w.pts, 0);
  eq('empty week no pending', w.pending, 0);
}
// rangePts full week
{
  const days = {};
  for(let d=3; d<=9; d++) days['2026-08-0'+d] = {...full};
  eq('range full week 20', L.rangePts(S(days), D(8,3), D(8,9), D(8,12)), 20);
}
// streak on logging only
{
  const days = {'2026-08-01':{l:1,p:0},'2026-08-02':{l:1,p:0},'2026-08-03':{l:1,p:1}};
  eq('log streak 3', L.streak(S(days), D(8,3)), 3);
  eq('streak skips unlogged today', L.streak(S(days), D(8,4)), 3);
  eq('protein-only does not extend', L.streak({days:{'2026-08-01':{l:0,p:1}}}, D(8,1)), 0);
}
// gym total
{
  const days = {'2026-08-01':{...full,g:1},'2026-09-10':{...full,g:1},'2026-10-30':{...full,g:1}};
  eq('gym total 3', L.gymTotal(S(days)), 3);
}
// weekPlan: fresh campaign, first Monday
{
  const p = L.weekPlan(S({}), D(8,1)); // Sat 1 Aug, week of Jul 27
  eq('weeks left 14', p.weeksLeft, 14);
  eq('target ceil(182/14)=13', p.target, 13);
  eq('need = 13 fresh', p.need, 13);
}
// weekPlan: mid-campaign, ahead of pace
{
  const days = {};
  for(let d=new Date(D(8,1)); d<=D(8,31); d.setDate(d.getDate()+1)) days[L.iso(d)] = {...full};
  const p = L.weekPlan(S(days), D(9,1)); // Tue 1 Sep, week of Aug 31
  // earned Aug 1-30 = rangePts; remaining should have shrunk, target < 13 plausible
  console.log('     (info) sep-1 plan: target '+p.target+', remaining '+p.remaining+', weeksLeft '+p.weeksLeft);
  eq('weeks left at Sep 1', p.weeksLeft, 9);
  eq('need never negative', p.need >= 0, true);
}
// weekPlan target capped at 20
{
  const p = L.weekPlan(S({}), D(10,26)); // last week, nothing earned all campaign
  eq('target capped at 20', p.target, 20);
}
// paceStatus: the front-page read
{
  eq('day one, nothing logged yet: on track', L.paceStatus(S({}), D(8,1)), 'ontrack');
  eq('mid-week, nothing logged: behind', L.paceStatus(S({}), D(8,5)), 'behind');
  const sofar = {'2026-08-03':{...full},'2026-08-04':{...full}};
  eq('perfect so far: on track', L.paceStatus(S(sofar), D(8,5)), 'ontrack');
  const wk = {};
  for(let d=3; d<=9; d++) wk['2026-08-0'+d] = {...full};
  eq('target cleared: hit', L.paceStatus(S(wk), D(8,9)), 'hit');
}

// periods
eq('pmax 14d = 40', L.periodMax(L.PERIODS[0]), 40);
eq('pmax 17d = 49', L.periodMax(L.PERIODS[1]), 49);
eq('period for Oct 20', L.periodFor(D(10,20))[0], 'Checkpoint 6');

// perfect campaign clears win line
{
  const days = {};
  for(let d=new Date(L.START); d<=L.END; d.setDate(d.getDate()+1)) days[L.iso(d)] = {...full};
  const total = L.rangePts(S(days), L.START, L.END, D(11,5));
  console.log('     (info) perfect campaign total = '+total);
  eq('perfect >= 182', total >= 182, true);
  eq('perfect sane (<= 270)', total <= 270, true);
}
// empty state safe
eq('empty range 0', L.rangePts(S({}), L.START, L.END, D(11,5)), 0);

console.log(fails ? '\n'+fails+' FAILURES' : '\nALL PASS');
process.exit(fails ? 1 : 0);

(function(root){
  'use strict';
  var games={
    tic_tac_toe:{label:'Tic Tac Toe',metric:'Wins',higher:true},
    memory_match:{label:'Memory Match',metric:'Score',higher:true},
    paper_pilot:{label:'Paper Pilot',metric:'Score',higher:true}
  };
  var styleReady=false;

  function config(){
    var url=String(root.PTEC_SUPABASE_URL||'').trim();
    var key=String(root.PTEC_SUPABASE_PUBLISHABLE_KEY||root.PTEC_SUPABASE_ANON_KEY||'').trim();
    try{var u=new URL(url);if(u.protocol!=='https:'||u.username||u.password)return null;}catch(e){return null;}
    if(!key||key.indexOf('sb_secret_')===0||key.indexOf('service_role')>=0)return null;
    return {url:url.replace(/\/$/,''),key:key};
  }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function info(game){return games[game]||games.paper_pilot;}
  function keyFor(game){return String(game).replace(/[^a-z0-9]+/gi,'-').toLowerCase();}
  function ensureStyle(){
    if(styleReady||!root.document)return;styleReady=true;
    var s=root.document.createElement('style');s.textContent=''+
      '#ptecLeaderboard{margin:18px auto 0;max-width:520px;text-align:left}'+
      '#ptecLeaderboard .ptec-lb-title{font-weight:800;margin-bottom:8px}'+
      '#ptecLeaderboard .ptec-lb-sub{font-size:12px;opacity:.75;margin:0 0 10px}'+
      '#ptecLeaderboard .ptec-lb-row{display:grid;grid-template-columns:32px 1fr auto;gap:8px;align-items:center;padding:8px 10px;border-bottom:1px solid rgba(127,127,127,.18);font-size:13px}'+
      '#ptecLeaderboard .ptec-lb-rank{opacity:.65}'+
      '#ptecLeaderboard .ptec-lb-score{font-weight:800;white-space:nowrap}'+
      '#ptecLeaderboard .ptec-lb-form{margin-top:12px;padding:12px;border-radius:12px;background:rgba(127,127,127,.10)}'+
      '#ptecLeaderboard .ptec-lb-form label{display:block;font-size:12px;margin-bottom:6px}'+
      '#ptecLeaderboard .ptec-lb-form input{width:100%;padding:10px;border-radius:9px;border:1px solid rgba(127,127,127,.35);background:transparent;color:inherit}'+
      '#ptecLeaderboard .ptec-lb-form button{margin-top:8px}'+
      '#ptecLeaderboard .ptec-lb-status{font-size:12px;margin-top:8px;min-height:1.2em}';
    (root.document.head||root.document.documentElement).appendChild(s);
  }
  function load(game){
    var c=config(),g=info(game);if(!c)return Promise.reject(new Error('Leaderboard setup is required.'));
    var order=g.higher?'score.desc,created_at.asc':'score.asc,created_at.asc';
    var url=c.url+'/rest/v1/leaderboards?select=id,player_name,score,created_at&game=eq.'+encodeURIComponent(game)+'&order='+encodeURIComponent(order)+'&limit=10';
    return fetch(url,{headers:{apikey:c.key,Accept:'application/json'}}).then(function(r){return r.ok?r.json():r.json().then(function(x){throw new Error(x.message||'Leaderboard is unavailable.');});});
  }
  function qualifies(game,score,rows){
    var g=info(game),n=Number(score);if(!isFinite(n)||n<=0)return false;if(rows.length<10)return true;
    var last=Number(rows[rows.length-1].score);return g.higher?n>last:n<last;
  }
  function scoreLabel(game,score){return info(game).metric+': '+esc(score);}
  function draw(rootEl,game,score,rows,message,formVisible){
    var g=info(game),name=keyFor(game),lines=rows.map(function(x,i){return '<div class="ptec-lb-row"><span class="ptec-lb-rank">'+(i+1)+'</span><span>'+esc(x.player_name)+'</span><span class="ptec-lb-score">'+esc(x.score)+'</span></div>';}).join('');
    rootEl.innerHTML='<div id="ptecLeaderboard"><div class="ptec-lb-title">🏆 '+esc(g.label)+' leaderboard</div><p class="ptec-lb-sub">'+esc(g.metric)+(g.higher?' — higher is better':' — fewer is better')+'</p><div class="ptec-lb-list">'+(lines||'<div class="ptec-lb-sub">No scores yet.</div>')+'</div>'+(formVisible?'<form class="ptec-lb-form"><label for="ptecLbName_'+name+'">You made a leaderboard score</label><input id="ptecLbName_'+name+'" maxlength="100" required placeholder="Name, Batch No., Department" autocomplete="name"><button class="btn" type="submit">Save score</button><div class="ptec-lb-status" role="status"></div></form>':'')+'<div class="ptec-lb-status" data-lb-message role="status">'+esc(message||'')+'</div></div>';
    if(formVisible){
      var form=rootEl.querySelector('form'),input=rootEl.querySelector('input'),status=rootEl.querySelector('.ptec-lb-form .ptec-lb-status');
      form.addEventListener('keydown',function(e){e.stopPropagation();});
      form.addEventListener('submit',function(e){e.preventDefault();var v=input.value.trim();if(v.length<3){status.textContent='Please enter your name, batch and department.';return;}status.textContent='Saving…';submit(game,score,v).then(function(){rootEl.dataset.lbSubmitted='1';return load(game);}).then(function(next){draw(rootEl,game,score,next,'Score saved.',false);}).catch(function(err){status.textContent=err.message||'Unable to save score.';});});
    }
  }
  function submit(game,score,name){
    var c=config();if(!c)return Promise.reject(new Error('Leaderboard setup is required.'));
    /* Scores go through a database RPC instead of direct table INSERT. The
       RPC applies server-side validation and a small per-name rate limit. */
    return fetch(c.url+'/rest/v1/rpc/submit_leaderboard_score',{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({p_game:game,p_score:Number(score),p_player_name:String(name||'').trim()})}).then(function(r){if(!r.ok)return r.json().catch(function(){return {};}).then(function(x){throw new Error(x.message||'Unable to save score.');});});
  }
  function mount(game,rootEl,score){
    if(!rootEl)return;ensureStyle();delete rootEl.dataset.lbSubmitted;rootEl.dataset.lbGame=game;rootEl.dataset.lbScore=String(score||0);rootEl.innerHTML='<div id="ptecLeaderboard"><div class="ptec-lb-title">🏆 '+esc(info(game).label)+' leaderboard</div><div class="ptec-lb-status" data-lb-message>Loading…</div></div>';
    load(game).then(function(rows){draw(rootEl,game,Number(score)||0,rows,'',false);}).catch(function(err){draw(rootEl,game,Number(score)||0,[],err.message||'Leaderboard is unavailable.',false);});
  }
  function update(game,score,rootEl){
    if(!rootEl||Number(score)<=0)return;ensureStyle();load(game).then(function(rows){var show=qualifies(game,Number(score),rows)&&rootEl.dataset.lbSubmitted!=='1';draw(rootEl,game,Number(score),rows,show?'':'',show);}).catch(function(err){if(!rootEl.querySelector('#ptecLeaderboard'))mount(game,rootEl,score);else{var m=rootEl.querySelector('[data-lb-message]');if(m)m.textContent=err.message||'Leaderboard is unavailable.';}});
  }
  root.PtecLeaderboard={mount:mount,update:update};
})(window);

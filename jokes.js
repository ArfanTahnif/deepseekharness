/* Textile jokes and private, account-synced favourites. */
(function () {
  'use strict';
  var pool = [], bag = [], current = null, lastKey = '', saved = [], user = null, seenText = Object.create(null);
  var open = false, busy = false, message = '', authEpoch = 0, pendingSave = null;
  var clientPromise = null;

  function escapeHTML(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function add(key, text, kind) {
    text = String(text).trim();
    if (!text || seenText[text]) return;
    seenText[text] = true;
    pool.push({key:key, text:text, kind:kind || 'joke'});
  }

  [
    'Why did the yarn break up with the fabric? — Too much tension in the relationship!',
    'What do you call a weaver who is great at maths? A loom-atician!',
    'Teacher: Why are you sleeping in class? Student: Sir, testing the fabric handle… in my dream!',
    'Why don\'t textile students get lost? They always follow the warp way!',
    'My yarn count and my sleep schedule have one thing in common: both are getting finer.',
    'Why was the loom so good at networking? It knew how to make connections across the weft.',
    'I told the dye bath a secret. Now the whole fabric has heard it.',
    'Why did the cotton bring a suitcase? It was ready for a spin.',
    'The lab report said “repeat the experiment.” My coffee said “repeat the refill.”',
    'Why did the fabric refuse to argue? It did not want any more tension.',
    'What is a textile student\'s favourite plot twist? Finding the right end of the yarn.',
    'The warp and weft tried a long-distance relationship. They kept crossing paths.',
    'Why did the knitting needle get promoted? It was always in the loop.',
    'My fabric sample looked perfect—until the teacher turned it over.',
    'I asked the spinning frame for a break. It said, “Keep the process running.”',
    'Why does a merchandiser carry a calendar? Every thread has a deadline.',
    'The dyeing lab promised an exact shade. The fabric chose its own personality.',
    'Why did the seam allowance feel left out? Nobody gave it enough room.',
    'I came to study fibre properties. The fibre studied my patience instead.',
    'A yarn cone walks into a bar. The bartender says, “You look wound up.”',
    'Why did the lab coat stay calm? It had everything under control—or at least under a stain.',
    'My assignment is like a fabric roll: somehow longer every time I measure it.',
    'Why did the pattern maker win the argument? The facts fit perfectly.',
    'I thought “wash fastness” meant the laundry would finish quickly. The lab disagreed.'
  ].forEach(function (text, i) { add('classic-' + i, text); });

  [
    'Me: “I’ll leave the lab at 5.” The loom: “Interesting hypothesis.”',
    'My GPA is like a fabric sample: it looks better under good lighting.',
    'I asked for a little tension in life. The loom took it personally.',
    'If patience were a fibre, mine would fail the abrasion test.',
    'I measured twice, cut once, and still blamed the pattern.',
    'My supervisor said “small correction.” It grew into a new project.',
    'The lab demands repeatability. My mistakes are already perfectly repeatable.',
    'A textile student’s love language is: “I saved you a seat near the socket.”',
    'We don’t ghost people; we lose them in the sample room.',
    'There are two students: those who label samples and those who learn why labels matter.',
    'The loom is not loud; it is expressing itself in all caps.',
    'I don’t procrastinate. I let the fabric develop character.',
    'The viva asked for a definition. My brain supplied a loading spinner.',
    'A good seam is invisible. So is my confidence before viva.',
    'I came for a quick lab. The lab had other plans and an attendance sheet.',
    'My calculator has seen more of my tears than my friends.',
    'I wanted a stable relationship, then I met yarn twist.',
    'The only thing shrinking faster than this fabric is my free time.',
    'When the teacher says “you should know this,” that sentence has no GSM but enormous weight.',
    'Our group project has a beautiful pattern: one works, three ask for updates.',
    'The dye bath and my mood share one property: both change with temperature.',
    'The fabric passed the test. I did not pass the test of watching it.',
    'I tried to explain my absence. The excuse had poor colour fastness.',
    'Textile engineering: turning cotton into fabric and free time into memories.',
    'I don’t need therapy; I need the sample to match the approved standard.',
    'The report deadline is a finishing process: everything happens at the end.',
    'A fabric roll is a very long way of saying “not done yet.”',
    'Exam prep is like carding: separate useful knowledge from every random fact.',
    'My friend said “let’s meet for ten minutes.” We accidentally planned a production line.',
    'If the yarn tangles before submission, that is practical training in patience.',
    'Our department has two seasons: viva and preparation for viva.',
    'I can identify any fabric by touch, except the one in my own laundry.',
    'The pattern was right. The scissors had creative differences.',
    'I love deadlines. They add excellent tension to the semester.',
    'Every sample has a story. Ours starts with “we were out of time.”',
    'A yarn cone walks into a bar. The bartender says, “You look wound up.”',
    'The warp and weft tried long-distance dating. They kept crossing paths.',
    'A knitting needle got promoted because it was always in the loop.',
    'The fabric refused to argue. It did not want more tension.',
    'Wash fastness sounds like quick laundry. The lab disagrees.',
    'The pattern maker won the argument because every point fit perfectly.',
    'The dye bath knows all my secrets. They are permanently fixed.',
    'A merchandiser carries a calendar because every thread has a deadline.',
    'The lab coat stayed calm because it had everything under control—and under a stain.',
    'The machine stopped making noise, so everyone became more worried.',
    'My assignment is like a fabric roll: longer every time I measure it.',
    'The teacher said “short viva.” The question paper heard “surprise.”',
    'My fabric sample looked perfect until the teacher turned it over.',
    'I asked the spinning frame for a break. It said, “Keep the process running.”',
    'What do you call a weaver who is good at maths? A loom-atician!'
  ].forEach(function (text, i) { add('curated-' + i, text, i < 28 ? 'joke' : 'meme'); });
  [
    'POV: You wrote “as discussed” in the report and hope nobody asks what was discussed.',
    'Teacher: submit by 5. Me at 4:59: discovering a new weave structure.',
    'Me opening the result: please be a normal number.',
    'When the shade is approved and the client says, “Slightly different.”',
    'Friend: how is the project? Me: structurally sound, emotionally unstable.',
    'When you find the loose end after 20 minutes and it was attached to your sleeve.',
    'The sample is 99% perfect. The 1% has a name: rework.',
    'When your lab partner says, “I know this machine.”',
    'Me: I understand the formula. Also me: enters 30 where 300 belongs.',
    'A quick wash test became a full relationship with the washing machine.',
    'When the machine stops, don’t celebrate. Ask why.',
    'That one friend who calls every fabric “cotton.”',
    'Exam hall: my memory has excellent shrinkage.',
    'When the lab manual says “simple procedure.”',
    'The report references are longer than the report.',
    'Group project status: one person weaving, one person spinning, everyone else hoping.',
    'When you submit the final PDF and notice the wrong batch number.',
    'My sample is not late; it is in finishing.',
    'When the viva examiner smiles before asking a question.',
    'The canteen tea has stronger bonding than our group project.',
    'I came to count yarn; the yarn counted my patience.',
    'When the calculated GSM is exactly right: screenshot it before reality changes.',
    'The pattern pieces fit. We are calling it a miracle.',
    'Every textile student carries samples in one hand and panic in the other.',
    'When someone says “just one small correction” and opens a new document.',
    'Me after lab: body present, mind still at the loom.',
    'The sample room is where missing pens go to start new lives.',
    'When the teacher asks who did the calculation and everyone studies the ceiling.',
    'I don’t need a mood ring; the dye bath changes colour for me.',
    'Final year project: 10% research, 90% locating the latest file.',
    'When the printer jams exactly on the title page.',
    'My notebook has two modes: blank page and emergency masterpiece.',
    'When attendance is compulsory and the machine says overtime.',
    'A textile student hears “warp” and thinks of three definitions before breakfast.',
    'The only thing more tangled than yarn is our group chat.',
    'When your fabric passes the strength test but your explanation fails.',
    'The sample looks different in every light. It has more range than I do.',
    'When the lab coat has more colour history than the fabric.',
    'Submission day: suddenly everyone becomes an expert in file naming.',
    'My project timeline is a plain weave: over, under, repeat, panic.',
    'When the result says “see instructor”—the most expensive three words in college.',
    'The machine is not broken; it is teaching us troubleshooting.',
    'If it looks intentional, call it a design feature.',
    'A textile student never loses a thread; they conduct an extended search.',
    'When the correct answer is in your notes, on page one, underlined twice.',
    'My sleep schedule has a higher twist than my yarn.',
    'When the deadline moves closer, my typing speed becomes industrial.',
    'A good group project is like a good fabric: strong in every direction.',
    'The report is finished when the supervisor says finished—not when the student says finished.',
    'Textile students: professionally trained to find defects and personally trained to ignore their own.'
  ].forEach(function (text, i) { add('caption-' + i, text, 'meme'); });

  function refill() {
    bag = pool.map(function (_, i) { return i; });
    for (var i = bag.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp;
    }
    if (bag.length > 1 && pool[bag[bag.length - 1]].key === lastKey) {
      var swap = bag[0]; bag[0] = bag[bag.length - 1]; bag[bag.length - 1] = swap;
    }
  }
  function nextValue() {
    if (!bag.length) refill();
    current = pool[bag.pop()]; lastKey = current.key;
  }
  current = pool[0]; lastKey = current.key;
  refill();

  function favourite() { return saved.some(function (item) { return item.joke_key === current.key; }); }
  function html() {
    var has = favourite();
    var rows = saved.length ? saved.map(function (item) {
      return '<div class="card"><p>' + escapeHTML(item.joke_text) + '</p><button class="btn ghost" type="button" onclick="PtecJokes.remove(' + Number(item.id) + ')"' + (busy ? ' disabled' : '') + '>Remove</button></div>';
    }).join('') : '<div class="card small">No saved jokes yet.</div>';
    var vault = !open ? '' : '<h3 class="sec">♡ Saved jokes</h3>' +
      (user ? '<div class="card small">Signed in as ' + escapeHTML(user.email || 'your account') + ' · <button class="btn ghost" type="button" onclick="PtecJokes.signOut()"' + (busy ? ' disabled' : '') + '>Log out</button></div>' + rows : '<div class="card small">Sign in with Google from the More menu to sync saved jokes across devices.</div>');
    return '<h2 class="sec rv">😄 Jokes</h2>' +
      '<div class="card rv" id="jokeCard" style="font-size:16px;line-height:1.6">' + escapeHTML(current.text) + '</div>' +
      '<div class="joke-actions"><button class="btn" type="button" onclick="PtecJokes.next()">Once More !</button>' +
      '<button class="joke-love" type="button" aria-label="' + (has ? 'Saved joke' : 'Save joke') + '" title="' + (has ? 'Saved joke' : 'Save joke') + '" aria-pressed="' + has + '" onclick="PtecJokes.save()"' + (busy ? ' disabled' : '') + '>' + (has ? '♥' : '♡') + '</button>' +
      '<button class="btn ghost" type="button" aria-expanded="' + open + '" onclick="PtecJokes.toggleSaved()">Saved jokes' + (saved.length ? ' (' + saved.length + ')' : '') + '</button></div>' +
      (message ? '<p class="small" role="status">' + escapeHTML(message) + '</p>' : '') + vault +
      '<span class="bigem rv">😂</span>';
  }
  function refreshView() {
    var root = document.getElementById('jokeSection');
    if (!root) return;
    root.innerHTML = html();
    if (typeof reveal === 'function') reveal(root);
  }
  function client() {
    if (clientPromise) return clientPromise;
    var config = typeof adminConfig === 'function' && adminConfig();
    if (!config) return Promise.reject(new Error('Joke sync is not configured.'));
    function exchangeOAuth(api) {
      var code = '';
      var oauthError = '';
      try {
        var authParams = new URL(window.location.href).searchParams;
        code = authParams.get('code') || '';
        oauthError = authParams.get('error_description') || authParams.get('error') || '';
      } catch (e) {}
      if (!code && oauthError) {
        try { if (typeof hReplace === 'function') hReplace(); } catch (e) {}
        return Promise.reject(new Error(decodeURIComponent(String(oauthError).replace(/\+/g, ' '))));
      }
      if (!code || !api.auth || typeof api.auth.exchangeCodeForSession !== 'function') return Promise.resolve(api);
      function clearOAuthCallback() {
        try {
          if (typeof hReplace === 'function') hReplace();
          else {
            var callbackUrl = new URL(window.location.href);
            callbackUrl.searchParams.delete('code');
            callbackUrl.searchParams.delete('error');
            callbackUrl.searchParams.delete('error_description');
            history.replaceState(history.state, '', callbackUrl.pathname + callbackUrl.search + callbackUrl.hash);
          }
        } catch (e) {}
      }
      function exchangeCode() {
        return api.auth.exchangeCodeForSession(code).then(function (response) {
          if (response && response.error) throw response.error;
          if (!response || !response.data || !response.data.session) {
            throw new Error('Google sign-in did not return a Supabase session.');
          }
          clearOAuthCallback();
          return api;
        });
      }
      /* A Supabase auth code is single-use. Multiple startup readers must not
         exchange it again after the first exchange created a session. */
      if (typeof api.auth.getSession === 'function') {
        return api.auth.getSession().then(function (current) {
          if (current && !current.error && current.data && current.data.session) {
            clearOAuthCallback();
            return api;
          }
          return exchangeCode();
        });
      }
      return exchangeCode();
    }
    /* The main app already creates one Supabase client for public materials
       and admin checks. Reuse it so auth state has one owner in the browser. */
    if (window.PtecSupabaseClient || window.PtecSupabaseClientPromise) {
      clientPromise = Promise.resolve(window.PtecSupabaseClientPromise || window.PtecSupabaseClient).then(function (api) {
        return exchangeOAuth(api);
      }).catch(function (error) {
        clientPromise = null; throw error;
      });
      return clientPromise;
    }
    clientPromise = loadAdminSDK().then(function (sdk) {
      var memory = Object.create(null);
      var stores = [];
      /* Prefer the tab's session storage after OAuth redirects, then fall
         back to persistent storage for normal repeat visits. */
      try { if (window.sessionStorage) stores.push(window.sessionStorage); } catch (e) {}
      try { if (window.localStorage) stores.push(window.localStorage); } catch (e) {}
      var store = {
        getItem:function (key) {
          for (var i = 0; i < stores.length; i++) {
            try { var value = stores[i].getItem(key); if (value) return value; } catch (e) {}
          }
          return memory[key] || null;
        },
        setItem:function (key, value) {
          memory[key] = value;
          for (var i = 0; i < stores.length; i++) {
            try { stores[i].setItem(key, value); } catch (e) {}
          }
        },
        removeItem:function (key) {
          delete memory[key];
          for (var i = 0; i < stores.length; i++) {
            try { stores[i].removeItem(key); } catch (e) {}
          }
        }
      };
      /* Use the PKCE callback explicitly. This avoids a race where the page
         asks for the user before Supabase has exchanged Google's `code` for a
         browser session after the redirect. */
      var api = sdk.createClient(config.url, config.key, {auth:{storageKey:'ptec-joke-vault',storage:store,persistSession:true,autoRefreshToken:true,flowType:'pkce',detectSessionInUrl:false}});
      /* OAuth redirects back to the app with a code/token in the URL. Keep the
         shared drawer in sync as soon as Supabase finishes restoring it. */
      if(api.auth&&typeof api.auth.onAuthStateChange==='function')api.auth.onAuthStateChange(function(event, session){
        setTimeout(function(){
          user = session && session.user || null;
          if(!user) saved = [];
          if(typeof window.renderDrawerAccount === 'function') window.renderDrawerAccount();
          if(typeof window.refreshSettingsAccount === 'function') window.refreshSettingsAccount();
          if(typeof refreshView === 'function') refreshView();
        },0);
      });
      return exchangeOAuth(api);
    }).catch(function (error) { clientPromise = null; throw error; });
    return clientPromise;
  }
  async function loadSaved(api, epoch) {
    var result = [], offset = 0, response;
    do {
      response = await api.from('saved_jokes').select('id,joke_key,joke_text,created_at').order('created_at', {ascending:false}).range(offset, offset + 499);
      if (response.error) throw response.error;
      result = result.concat(response.data || []);
      offset += 500;
    } while (response.data && response.data.length === 500);
    if (epoch === authEpoch) { saved = result; refreshView(); }
  }
  async function mount() {
    var epoch = ++authEpoch;
    try {
      var api = await client(), response = await readCurrentUser(api);
      if (epoch !== authEpoch) return;
      user = response;
      if (user) await loadSaved(api, epoch);
      else { saved = []; refreshView(); }
    } catch (e) { if (epoch === authEpoch) { saved = []; message = 'Saved jokes could not load. Check the connection and run joke-favorites-schema.sql in Supabase.'; refreshView(); } }
  }
  function next() { nextValue(); message = ''; refreshView(); }
  function toggleSaved() { open = !open; message = ''; refreshView(); }
  function notify(text) {
    message = text;
    if (typeof window.setWelcomeAuthStatus === 'function') window.setWelcomeAuthStatus(text);
    refreshView();
  }
  async function getUser() {
    var api = await client(), current = await readCurrentUser(api);
    user = current;
    if (!user) saved = [];
    return current;
  }
  /* Restore the browser session before asking Supabase for the server-side
     user. OAuth callbacks can finish asynchronously, so getSession() is the
     reliable first read immediately after returning from Google. */
  async function readCurrentUser(api) {
    /* Keep the small fallback useful for older Supabase SDK builds and for
       embedded clients that expose getUser() but not getSession(). */
    if(!api.auth||typeof api.auth.getSession!=='function'){
      var legacy = await api.auth.getUser();
      return legacy.error ? null : legacy.data && legacy.data.user;
    }
    var sessionResponse = null, session = null;
    for (var attempt = 0; attempt < 3 && !session; attempt++) {
      sessionResponse = await api.auth.getSession();
      session = !sessionResponse.error && sessionResponse.data && sessionResponse.data.session;
      if (!session && attempt < 2) await new Promise(function (resolve) { setTimeout(resolve, 250 * (attempt + 1)); });
    }
    if (!session || !session.user) {
      /* Some older clients restore the user through getUser() without
         exposing it through getSession() yet. */
      var fallback = await api.auth.getUser();
      return fallback.error ? null : fallback.data && fallback.data.user;
    }
    var response = await api.auth.getUser();
    /* A valid local session is enough to identify the signed-in account in
       the drawer even when a temporary network refresh fails. */
    return response.error ? session.user : (response.data && response.data.user) || session.user;
  }
  async function googleLogin() {
    if (busy) return false;
    if (window.location && window.location.protocol === 'file:') {
      notify('Gmail login works after the website is published on HTTPS.');
      return false;
    }
    busy = true; notify('Opening Google sign-in…');
    try {
      var api = await client();
      /* Keep the OAuth callback on this exact site origin and pathname;
         arbitrary query strings must not become redirect targets. */
      var redirectTo = window.location.origin + window.location.pathname;
      var response = await api.auth.signInWithOAuth({provider:'google',options:{redirectTo:redirectTo}});
      if (response.error) throw response.error;
      return true;
    } catch (e) {
      busy = false;
      notify('Google login could not start. '+(e&&e.message?e.message:'Check the Supabase Google provider settings.'));
      throw e;
    }
  }
  async function save() {
    if (busy) return;
    if (!user) { pendingSave = current; open = true; message = 'Open More → Continue with Google to save jokes across devices.'; refreshView(); return; }
    if (favourite()) { message = 'This joke is already saved.'; refreshView(); return; }
    var joke = current, epoch = authEpoch; busy = true; message = 'Saving…'; refreshView();
    try {
      var api = await client(), result = await api.from('saved_jokes').insert({user_id:user.id,joke_key:joke.key,joke_text:joke.text});
      if (result.error && result.error.code !== '23505') throw result.error;
      await loadSaved(api, epoch);
      if (epoch === authEpoch) message = 'Joke saved to your account.';
    } catch (e) { if (epoch === authEpoch) message = 'Could not save. Check your connection and database setup.'; }
    finally { busy = false; if (epoch === authEpoch) refreshView(); }
  }
  async function auth(mode) {
    if (busy) return;
    var email = document.getElementById('jokeEmail'), password = document.getElementById('jokePassword');
    if (!email || !password || !email.value.trim() || password.value.length < 6) { message = 'Enter an email and a password of at least 6 characters.'; refreshView(); return; }
    var address = email.value.trim(), secret = password.value, epoch = ++authEpoch;
    password.value = ''; busy = true; message = mode === 'signup' ? 'Creating account…' : 'Signing in…'; refreshView();
    try {
      var api = await client();
      var response = mode === 'signup' ? await api.auth.signUp({email:address,password:secret}) : await api.auth.signInWithPassword({email:address,password:secret});
      secret = '';
      if (response.error) throw response.error;
      if (epoch !== authEpoch) return;
      if (!response.data || !response.data.session) {
        user = null; saved = []; message = 'Check your email to confirm the account, then log in.'; return;
      }
      user = response.data.user;
      await loadSaved(api, epoch);
      if (epoch === authEpoch) message = 'Signed in. Your saved jokes are ready.';
      if (epoch === authEpoch && pendingSave) {
        var wanted = pendingSave; pendingSave = null;
        if (!saved.some(function (row) { return row.joke_key === wanted.key; })) {
          var added = await api.from('saved_jokes').insert({user_id:user.id,joke_key:wanted.key,joke_text:wanted.text});
          if (added.error && added.error.code !== '23505') throw added.error;
          await loadSaved(api, epoch);
          if (epoch === authEpoch) message = 'Joke saved to your account.';
        }
      }
    } catch (e) {
      if (epoch === authEpoch) message = user ? 'Signed in, but saved jokes could not load. Run joke-favorites-schema.sql in Supabase.' :
        mode === 'signup' ? 'Account could not be created. Check the email, password and sign-up settings.' : 'Login failed. Check your email and password.';
    } finally { secret = ''; busy = false; if (epoch === authEpoch) refreshView(); }
  }
  async function signOut() {
    if (busy) return;
    var epoch = ++authEpoch; busy = true;
    try {
      var api = await client(), result = await api.auth.signOut({scope:'local'});
      if (result.error) throw result.error;
      if (epoch === authEpoch) { user = null; saved = []; pendingSave = null; message = 'Logged out.'; }
    } catch (e) { if (epoch === authEpoch) message = 'Could not log out. Please retry.'; }
    finally { busy = false; if (epoch === authEpoch) refreshView(); }
  }
  async function remove(id) {
    if (busy || !user || !Number.isSafeInteger(id)) return;
    var epoch = authEpoch; busy = true; message = 'Removing…'; refreshView();
    try {
      var api = await client(), result = await api.from('saved_jokes').delete().eq('id', id).eq('user_id', user.id);
      if (result.error) throw result.error;
      await loadSaved(api, epoch);
      if (epoch === authEpoch) message = 'Removed from saved jokes.';
    } catch (e) { if (epoch === authEpoch) message = 'Could not remove the joke. Please retry.'; }
    finally { busy = false; if (epoch === authEpoch) refreshView(); }
  }
  window.PtecJokes = {html:html,mount:mount,next:next,toggleSaved:toggleSaved,save:save,auth:auth,signOut:signOut,remove:remove,getUser:getUser,googleLogin:googleLogin};
})();

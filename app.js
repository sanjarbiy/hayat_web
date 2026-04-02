/* Hayat */

const _d=document.createElement('div');
function ic(n,s){return`<i class="ti ${n}"${s?' style="font-size:'+s+'px"':''}></i>`}
function esc(s){_d.textContent=s;return _d.innerHTML}

/* ── Background: WebGL Fluid Gradient ── */
function initMesh(){
    const c=document.getElementById('mesh');
    const gl=c.getContext('webgl')||c.getContext('experimental-webgl');
    if(!gl){initMeshFB(c);return}

    const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}';
    const fs=`precision mediump float;
uniform float t;uniform vec2 r;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float sm3(vec2 p){float v=0.,a=.6;for(int i=0;i<3;i++){v+=a*noise(p);p*=1.8;a*=.45;}return v;}
void main(){
    vec2 uv=gl_FragCoord.xy/r;
    vec2 p=(uv-.5)*vec2(r.x/r.y,1.);
    float w1=sm3(p*.6+t*.04),w2=sm3(p*.5-t*.035+4.);
    vec2 wp=p+vec2(w1-.5,w2-.5)*.35;
    vec2 bd=(wp-vec2(-.2+sin(t*.06)*.2,.2+cos(t*.05)*.1))*vec2(.5,1.);
    float bm=smoothstep(.6,.0,length(bd));
    vec2 gd=(wp-vec2(.25+cos(t*.055)*.18,-.18+sin(t*.045)*.12))*vec2(.55,1.);
    float gm=smoothstep(.55,.0,length(gd));
    float dm=smoothstep(.3,.7,sm3(wp*.7+t*.02+2.))*.12;
    vec3 c=vec3(.102,.039,.078);
    c=mix(c,vec3(.07,.03,.055),dm);
    c=mix(c,vec3(.44,.12,.28),bm*.4*(.65+.35*sin(t*.15)));
    c=mix(c,vec3(.45,.36,.14),gm*.3*(.65+.35*cos(t*.12)));
    c+=vec3(.01,.02,.01)*bm*gm;
    float l=dot(c,vec3(.3,.59,.11));
    c+=c*smoothstep(.06,.2,l)*.08;
    c+=(noise(uv*300.+t)-.5)*.012;
    gl_FragColor=vec4(clamp(c,0.,1.),1.);
}`;

    function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s}
    const pg=gl.createProgram();
    gl.attachShader(pg,sh(gl.VERTEX_SHADER,vs));
    gl.attachShader(pg,sh(gl.FRAGMENT_SHADER,fs));
    gl.linkProgram(pg);gl.useProgram(pg);
    const buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const pa=gl.getAttribLocation(pg,'p');
    gl.enableVertexAttribArray(pa);gl.vertexAttribPointer(pa,2,gl.FLOAT,false,0,0);
    const ut=gl.getUniformLocation(pg,'t'),ur=gl.getUniformLocation(pg,'r');
    let w,h;
    function resize(){const d=Math.min(devicePixelRatio,1.5);w=innerWidth;h=innerHeight;c.width=w*d;c.height=h*d;c.style.width=w+'px';c.style.height=h+'px';gl.viewport(0,0,c.width,c.height)}
    addEventListener('resize',resize);resize();
    const start=performance.now();
    (function loop(){const t=(performance.now()-start)*.001;gl.uniform1f(ut,t);gl.uniform2f(ur,c.width,c.height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(loop)})();
}

function initMeshFB(c){
    const ctx=c.getContext('2d');let w,h,t=0;
    function resize(){const d=Math.min(devicePixelRatio,2);w=innerWidth;h=innerHeight;c.width=w*d;c.height=h*d;c.style.width=w+'px';c.style.height=h+'px';ctx.setTransform(d,0,0,d,0,0)}
    addEventListener('resize',resize);resize();
    function ellipse(cx,cy,rx,ry,r,g,b,a){
        const gr=ctx.createRadialGradient(cx,cy,0,cx,cy,rx);
        gr.addColorStop(0,`rgba(${r},${g},${b},${a})`);
        gr.addColorStop(.3,`rgba(${r},${g},${b},${a*.33})`);
        gr.addColorStop(.6,`rgba(${r},${g},${b},${a*.07})`);
        gr.addColorStop(1,`rgba(${r},${g},${b},0)`);
        ctx.save();ctx.translate(cx,cy);ctx.scale(1,ry/rx);ctx.translate(-cx,-cy);ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);ctx.restore();
    }
    (function draw(){
        t+=.002;ctx.fillStyle='#1A0A14';ctx.fillRect(0,0,w,h);
        ellipse((.35+Math.sin(t*.3)*.1)*w,(.35+Math.cos(t*.25)*.06)*h,w*.4,h*.28,170,50,110,.3);
        ellipse((.65+Math.cos(t*.28)*.1)*w,(.6+Math.sin(t*.22)*.08)*h,w*.35,h*.25,115,92,36,.22);
        requestAnimationFrame(draw);
    })();
}

/* ── Render ── */
function render(D){
    document.getElementById('root').innerHTML=[
        navH(D.nav),heroH(D),statsH(D.stats),featH(D.features),
        howH(D.how),commH(D.community),ctaH(D.cta),footH(D.nav,D.footer)
    ].join('');
}

function navH(d){
    return`<nav class="nav" id="nav"><div class="nav-bar">
    <a href="/" class="nav-logo"><div class="nav-m">${esc(d.mark)}</div><span class="nav-wm">${esc(d.wordmark[0])}<b>${esc(d.wordmark[1])}</b></span></a>
    <div class="nav-c">${d.links.map(l=>`<a href="${l.href}">${esc(l.label)}</a>`).join('')}</div>
    <div class="nav-r"><a href="${d.signup.href}" class="btn btn-m btn-fill">${ic(d.signup.icon,15)} ${esc(d.signup.label)}</a><button class="mm" aria-label="Menu">${ic('ti-menu-2')}</button></div>
    </div></nav>`;
}

function heroH(D){
    const d=D.hero,m=d.mockup;
    const chips=m.topics.map(t=>`<div class="mk-chip${t.on?' on':''}" data-topic>${ic(t.icon,14)}${esc(t.name)}</div>`).join('');
    const posts=m.posts.map(p=>`<div class="mk-post">
        <div class="mk-av" style="background:${p.color}">${esc(p.initials)}</div>
        <div style="flex:1;min-width:0">
            <div class="mk-ph"><span class="mk-pn">${esc(p.name)}</span><span class="mk-pt">${ic(p.topicIcon,10)}${esc(p.topic)}</span></div>
            <div class="mk-pb">${esc(p.text)}</div>
            ${p.hasImg?`<div class="mk-pi">${ic('ti-photo',18)}</div>`:''}
            <div class="mk-pm"><span>${ic(m.likeIcon,13)}${esc(p.likes)}</span><span>${ic(m.commentIcon,13)}${esc(p.comments)}</span></div>
        </div></div>`).join('');

    return`<section class="hero"><div class="w hero-g">
    <div class="hero-text">
        <div class="hero-tag rv"><span class="hero-tag-ic">${ic(d.tagIcon,14)}</span>${esc(d.tag)}</div>
        <h1 class="hero-t rv">${esc(d.title[0])}<em>${esc(d.title[1])}</em>${esc(d.title[2])}</h1>
        <p class="hero-d rv">${esc(d.desc)}</p>
        <div class="hero-a rv"><a href="${d.cta.href}" class="btn btn-l btn-fill">${esc(d.cta.label)} ${ic(d.ctaIcon)}</a><a href="${d.cta2.href}" class="btn btn-l btn-ghost">${esc(d.cta2.label)}</a></div>
        <div class="hero-note rv">${ic(d.noteIcon,14)} ${esc(d.note)}</div>
    </div>
    <div class="hero-visual rv"><div class="mockup">
        <div class="mk-bar"><div class="mk-dot"></div><div class="mk-dot"></div><div class="mk-dot"></div><span class="mk-url">${esc(m.url)}</span></div>
        <div class="mk-body">
            <div class="mk-lbl">${esc(m.topicsLabel)}</div>
            <div class="mk-topics">${chips}</div>
            <div class="mk-hr"></div>
            ${posts}
            <div class="mk-comp"><span>${esc(m.composePlaceholder)}</span><div class="mk-ci">${m.composeIcons.map(n=>ic(n,17)).join('')}</div></div>
        </div>
    </div></div>
    </div></section>`;
}

function statsH(d){
    return`<section class="stats"><div class="w stats-g">${d.map(s=>
        `<div class="stat rv"><div class="stat-ic">${ic(s.icon,22)}</div><div class="stat-v">${esc(s.value)}</div><div class="stat-l">${esc(s.label)}</div></div>`
    ).join('')}</div></section>`;
}

function featH(d){
    return`<section class="features" id="features"><div class="w">
    <div class="sec-h rv"><div class="sec-lbl">${esc(d.label)}</div><h2 class="sec-t">${esc(d.title)}</h2><p class="sec-d">${esc(d.desc)}</p></div>
    <div class="feat-g">${d.items.map(f=>
        `<div class="feat rv"><div class="feat-ic">${ic(f.icon,24)}</div><h3 class="feat-t">${esc(f.title)}</h3><p class="feat-d">${esc(f.desc)}</p></div>`
    ).join('')}</div></div></section>`;
}

function howH(d){
    const p=d.picker,cnt=p.items.filter(i=>i.on).length;
    return`<section class="how" id="how"><div class="w how-g">
    <div>
        <div class="sec-lbl rv">${esc(d.label)}</div>
        <h2 class="sec-t rv">${esc(d.title)}</h2>
        <p class="sec-d rv">${esc(d.desc)}</p>
        <div class="how-steps">${d.steps.map(s=>
            `<div class="how-s rv"><div class="how-n">${ic(s.icon,20)}</div><div><div class="how-st">${esc(s.title)}</div><div class="how-sd">${esc(s.desc)}</div></div></div>`
        ).join('')}</div>
    </div>
    <div class="rv"><div class="tp">
        <div class="tp-h">${esc(p.title)}</div><div class="tp-s">${esc(p.sub)}</div>
        <div class="tp-g">${p.items.map(i=>
            `<div class="tp-c${i.on?' on':''}" data-pick>${ic(i.icon,32)}<span>${esc(i.name)}</span></div>`
        ).join('')}</div>
        <div class="tp-bar"><span class="tp-bar-c"><b class="tp-count">${cnt}</b> ${esc(p.countTemplate.replace('{n}',''))}</span><button class="tp-bar-b">${esc(p.btnLabel)}</button></div>
    </div></div>
    </div></section>`;
}

function commH(d){
    return`<section class="comm" id="community"><div class="w">
    <div class="comm-h"><div class="sec-lbl rv">${esc(d.label)}</div><h2 class="sec-t rv">${esc(d.title)}</h2><p class="sec-d rv" style="max-width:100%">${esc(d.desc)}</p></div>
    <div class="q-g">${d.quotes.map(q=>
        `<div class="q rv"><p class="q-t">\u201C${esc(q.text)}\u201D</p><div class="q-a"><div class="q-av" style="background:${q.color}">${esc(q.initials)}</div><div><div class="q-n">${esc(q.name)}</div><div class="q-h">${esc(q.handle)}</div></div></div></div>`
    ).join('')}</div></div></section>`;
}

function ctaH(d){
    return`<section class="cta-s"><div class="cta-in rv">
    <h2 class="sec-t">${esc(d.title)}</h2>
    <p class="sec-d" style="max-width:100%;margin-bottom:32px">${esc(d.desc)}</p>
    <a href="${d.btn.href}" class="btn btn-l btn-fill">${esc(d.btn.label)} ${ic(d.btnIcon)}</a>
    <div class="cta-note">${ic(d.noteIcon,14)} ${esc(d.note)}</div>
    </div></section>`;
}

function footH(nav,d){
    return`<footer class="footer"><div class="w">
    <div class="ft-g">
        <div><a href="/" class="nav-logo" style="display:inline-flex;margin-bottom:2px"><div class="nav-m">${esc(nav.mark)}</div><span class="nav-wm">${esc(nav.wordmark[0])}<b>${esc(nav.wordmark[1])}</b></span></a><p class="ft-d">${esc(d.desc)}</p></div>
        ${d.columns.map(c=>`<div><div class="ft-ct">${esc(c.title)}</div><div class="ft-lk">${c.links.map(l=>`<a href="${l.href}">${esc(l.label)}</a>`).join('')}</div></div>`).join('')}
    </div>
    <div class="ft-bot"><span class="ft-cp">${d.copy}</span><div class="ft-so">${d.socials.map(s=>`<a href="${s.href}" aria-label="${esc(s.label)}">${ic(s.icon,16)}</a>`).join('')}</div></div>
    </div></footer>`;
}

/* ── Init ── */
(async function(){
    let D;
    try{D=await(await fetch('data.json')).json()}
    catch(e){document.getElementById('root').innerHTML='<p style="color:#fff;text-align:center;padding:200px 24px;font-size:18px">Serverni ishga tushiring: <code>python3 -m http.server</code></p>';return}

    render(D);
    initMesh();

    const nav=document.getElementById('nav');
    addEventListener('scroll',()=>nav.classList.toggle('s',scrollY>24),{passive:true});

    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
        e.preventDefault();document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth',block:'start'});
    }));

    document.querySelectorAll('[data-pick]').forEach(el=>el.addEventListener('click',()=>{
        el.classList.toggle('on');
        gsap.fromTo(el,{scale:.92},{scale:1,duration:.4,ease:'elastic.out(1,.4)'});
        document.querySelector('.tp-count').textContent=document.querySelectorAll('[data-pick].on').length;
    }));

    document.querySelectorAll('[data-topic]').forEach(el=>el.addEventListener('click',()=>{
        el.classList.toggle('on');
        gsap.fromTo(el,{scale:.9},{scale:1,duration:.35,ease:'elastic.out(1,.5)'});
    }));

    gsap.registerPlugin(ScrollTrigger);

    // Hero
    gsap.fromTo('.hero .rv',{opacity:0,y:50,scale:.95},{opacity:1,y:0,scale:1,duration:.9,stagger:.12,ease:'back.out(1.4)',delay:.2});
    gsap.to('.mockup',{y:-10,duration:3,ease:'power1.inOut',yoyo:true,repeat:-1});

    // Scroll reveals — batched by selector
    const reveals=[
        {sel:'.stat',from:{opacity:0,y:40,scale:.9},to:{duration:.7,ease:'back.out(1.7)'},stagger:.08,trigger:null},
        {sel:'.feat',from:{opacity:0,y:50,rotateX:8},to:{duration:.7,ease:'power3.out'},stagger:.1,trigger:'.feat-g'},
        {sel:'.how-s',from:{opacity:0,x:-40},to:{duration:.6,ease:'power2.out'},stagger:.08,trigger:null},
        {sel:'.tp-c',from:{opacity:0,scale:.8},to:{duration:.5,ease:'back.out(2)'},stagger:.05,trigger:'.tp-g'},
        {sel:'.q',from:{opacity:0,y:40,scale:.95},to:{duration:.7,ease:'back.out(1.4)'},stagger:.12,trigger:'.q-g'}
    ];

    reveals.forEach(r=>{
        document.querySelectorAll(r.sel).forEach((el,i)=>{
            gsap.fromTo(el,r.from,Object.assign({
                scrollTrigger:{trigger:r.trigger||el,start:'top 88%'},
                opacity:1,y:0,x:0,scale:1,rotateX:0,delay:i*r.stagger
            },r.to));
        });
    });

    gsap.fromTo('.tp',{opacity:0,scale:.9,y:30},{scrollTrigger:{trigger:'.tp',start:'top 85%'},opacity:1,scale:1,y:0,duration:.8,ease:'back.out(1.3)'});
    gsap.fromTo('.cta-in',{opacity:0,scale:.88,y:40},{scrollTrigger:{trigger:'.cta-s',start:'top 80%'},opacity:1,scale:1,y:0,duration:.9,ease:'back.out(1.3)'});

    // Generic reveals
    document.querySelectorAll('.rv').forEach(el=>{
        if(el.closest('.hero,.stat,.feat,.how-s,.q')||el.classList.contains('tp'))return;
        gsap.fromTo(el,{opacity:0,y:30},{scrollTrigger:{trigger:el,start:'top 88%'},opacity:1,y:0,duration:.6,ease:'power2.out'});
    });

    gsap.to('.hero-visual',{scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.5},y:60,ease:'none'});
})();

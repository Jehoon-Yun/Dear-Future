/* 디어퓨처 가이드북 — 인터랙션
   등장 애니메이션 · 스크롤스파이 목차 · 컬러 클릭 복사 · 모바일 목차 */
(function(){
  'use strict';

  /* ── 등장 애니메이션 ── */
  function initReveal(){
    const els = document.querySelectorAll('.reveal');
    // 기본 상태는 '보임'. 아래 조건이면 애니메이션 없이 그대로 둔다(콘텐츠 항상 표시).
    if(localStorage.getItem('df-noanim')==='1') return;
    if(!('IntersectionObserver' in window)) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // JS가 살아있을 때만, 다음 프레임에 숨김 클래스를 켜고 스크롤로 등장시킨다.
    requestAnimationFrame(function(){
      document.documentElement.classList.add('anim-on');
      let ioFired = false;
      const io = new IntersectionObserver((entries)=>{
        ioFired = true;
        entries.forEach(en=>{
          if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
      els.forEach(e=>io.observe(e));
      // 안전장치: IO 콜백이 한 번도 안 떴으면(스로틀 등) 전부 노출.
      setTimeout(()=>{ if(!ioFired){ els.forEach(e=>e.classList.add('is-in')); } }, 1600);
    });
  }

  /* ── 스크롤스파이 목차 ── */
  function initScrollSpy(){
    const links = Array.from(document.querySelectorAll('.toc__link'));
    const map = {};
    links.forEach(l=>{ map[l.dataset.target] = l; });
    const sections = Array.from(document.querySelectorAll('.chapter[id]'));
    if(!sections.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          links.forEach(l=>l.classList.remove('is-active'));
          const active = map[en.target.id];
          if(active) active.classList.add('is-active');
        }
      });
    }, { threshold: 0, rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s=>io.observe(s));
  }

  /* ── 컬러 클릭 복사 ── */
  function initCopy(){
    document.addEventListener('click', function(e){
      const el = e.target.closest('[data-copy]');
      if(!el) return;
      const val = el.getAttribute('data-copy');
      const done = ()=>{
        el.classList.add('is-copied');
        const note = el.querySelector('.copy-note');
        const prev = note ? note.textContent : null;
        if(note) note.textContent = '복사됨 ✓';
        setTimeout(()=>{ el.classList.remove('is-copied'); if(note && prev!==null) note.textContent = prev; }, 1300);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(val).then(done).catch(done);
      } else {
        const ta=document.createElement('textarea'); ta.value=val; document.body.appendChild(ta);
        ta.select(); try{document.execCommand('copy');}catch(_){} ta.remove(); done();
      }
    });
  }

  /* ── 모바일 목차 토글 ── */
  function initToc(){
    const toggle = document.getElementById('tocToggle');
    const toc = document.getElementById('toc');
    if(!toggle || !toc) return;
    toggle.addEventListener('click', ()=> toc.classList.toggle('is-open'));
    toc.addEventListener('click', (e)=>{ if(e.target.closest('.toc__link')) toc.classList.remove('is-open'); });
  }

  /* ── 별 생성 ── */
  function fillStars(sky, n){
    let html='';
    for(let i=0;i<n;i++){
      const x = Math.random()*100, y = Math.random()*72;
      const big = Math.random() > .82;
      const d = (Math.random()*4).toFixed(2);
      html += '<span class="star'+(big?' big':'')+'" style="left:'+x.toFixed(2)+'%;top:'+y.toFixed(2)+'%;animation-delay:'+d+'s"></span>';
    }
    sky.innerHTML = html;
  }
  function initStars(){
    const cover = document.getElementById('coverSky'); if(cover) fillStars(cover, 70);
    const foot = document.getElementById('footSky'); if(foot) fillStars(foot, 40);
  }

  /* ── 칩 토글 ── */
  function initChips(){
    document.addEventListener('click', function(e){
      const chip = e.target.closest('.chip');
      if(chip) chip.classList.toggle('is-on');
    });
  }

  /* ── 로고 자산 다운로드 ── */
  function initDownloads(){
    const root = document.querySelector('[data-dl]');
    if(!root) return; // 다운로드 카드가 없으면 종료

    // 브랜드 토큰
    const WHITE='#F8F5EF', CREAM='#ECE4D6', INK='#14112E', GOLD='#E8B583', PURPLE='#4B3B82', INDIGO='#1B1640';
    const GRAD=[['0','#1B1640'],['0.55','#4B3B82'],['1','#C58FA8']];

    let maskN=0;
    // 차오르는 달 심볼(원본 스프라이트와 동일한 형상)을 120 좌표계로 생성
    function symbol(color){
      const id='dfm'+(maskN++);
      return '<defs><mask id="'+id+'"><rect width="120" height="120" fill="#fff"/>'+
             '<circle cx="73" cy="49" r="41" fill="#000"/></mask></defs>'+
             '<circle cx="57" cy="61" r="45" fill="'+color+'" mask="url(#'+id+')"/>'+
             '<circle cx="79" cy="44" r="6.5" fill="'+color+'"/>';
    }
    // 120 좌표계 심볼을 지정 영역(x,y,size)에 중첩 svg로 배치
    function placed(color,x,y,size){
      return '<svg x="'+x+'" y="'+y+'" width="'+size+'" height="'+size+'" viewBox="0 0 120 120">'+symbol(color)+'</svg>';
    }
    function grad(id){
      return '<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1">'+
             GRAD.map(g=>'<stop offset="'+g[0]+'" stop-color="'+g[1]+'"/>').join('')+'</linearGradient>';
    }
    function doc(size,inner){
      return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+inner+'</svg>';
    }
    function box(size,frac){ const s=Math.round(size*frac); return { s:s, o:Math.round((size-s)/2) }; }

    // 워드마크 포함 로고: 폰트를 함께 담아 온라인에서 정확히 렌더되도록 함
    function fontStyle(){
      return '<style><![CDATA['+
        "@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600&family=Cormorant+Garamond:ital,wght@1,500&display=swap');"+
        ".kr{font-family:'Noto Serif KR',serif;font-weight:600}"+
        ".en{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500}"+
        ']]></style>';
    }
    function lockup(kind){
      if(kind==='v'){
        const W=460,H=420, b=box(W,.48);
        return '<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+
          fontStyle()+ placed(PURPLE,(W-b.s)/2,24,b.s)+
          '<text class="kr" x="'+(W/2)+'" y="322" text-anchor="middle" font-size="80" fill="'+INDIGO+'" letter-spacing="-1">디어퓨처</text>'+
          '<text class="en" x="'+(W/2)+'" y="368" text-anchor="middle" font-size="30" fill="'+PURPLE+'" letter-spacing="4">DEAR FUTURE</text></svg>';
      }
      const W=760,H=210;
      return '<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+
        fontStyle()+ placed(PURPLE,18,30,150)+
        '<text class="kr" x="196" y="112" font-size="76" fill="'+INDIGO+'" letter-spacing="-1">디어퓨처</text>'+
        '<text class="en" x="199" y="156" font-size="30" fill="'+PURPLE+'" letter-spacing="3">DEAR FUTURE</text></svg>';
    }

    const ASSETS = {
      'sns-twilight': ()=>{ const S=1000,p=box(S,.62);
        return { size:S, name:'dearfuture-profile-twilight',
          svg: doc(S,'<defs>'+grad('g')+'</defs><circle cx="'+(S/2)+'" cy="'+(S/2)+'" r="'+(S/2)+'" fill="url(#g)"/>'+placed(WHITE,p.o,p.o,p.s)) }; },
      'sns-light': ()=>{ const S=1000,p=box(S,.62);
        return { size:S, name:'dearfuture-profile-light',
          svg: doc(S,'<circle cx="'+(S/2)+'" cy="'+(S/2)+'" r="'+(S/2)+'" fill="'+CREAM+'"/>'+placed(PURPLE,p.o,p.o,p.s)) }; },
      'app-twilight': ()=>{ const S=1024,r=230,p=box(S,.60);
        return { size:S, name:'dearfuture-appicon-twilight',
          svg: doc(S,'<defs>'+grad('g')+'</defs><rect width="'+S+'" height="'+S+'" rx="'+r+'" ry="'+r+'" fill="url(#g)"/>'+placed(WHITE,p.o,p.o,p.s)) }; },
      'app-ink': ()=>{ const S=1024,r=230,p=box(S,.60);
        return { size:S, name:'dearfuture-appicon-ink',
          svg: doc(S,'<rect width="'+S+'" height="'+S+'" rx="'+r+'" ry="'+r+'" fill="'+INK+'"/>'+placed(GOLD,p.o,p.o,p.s)) }; },
      'favicon': ()=>{ const S=256,r=44,p=box(S,.64);
        return { size:S, name:'dearfuture-favicon',
          svg: doc(S,'<rect width="'+S+'" height="'+S+'" rx="'+r+'" ry="'+r+'" fill="'+PURPLE+'"/>'+placed(WHITE,p.o,p.o,p.s)) }; },
      'symbol-mono': ()=>{ const S=512,p=box(S,.86);
        return { size:S, name:'dearfuture-symbol',
          svg: doc(S, placed(PURPLE,p.o,p.o,p.s)) }; },
      'lockup-h': ()=>({ name:'dearfuture-logo-horizontal', svgOnly:true, svg:lockup('h') }),
      'lockup-v': ()=>({ name:'dearfuture-logo-vertical',   svgOnly:true, svg:lockup('v') })
    };

    function save(blob,filename){
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url; a.download=filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
    }
    function flash(btn,label){
      const t=btn.textContent; btn.classList.add('is-done'); btn.textContent=label||'완료 ✓';
      setTimeout(()=>{ btn.classList.remove('is-done'); btn.textContent=t; },1400);
    }
    function fail(btn){ const t=btn.textContent; btn.textContent='재시도'; setTimeout(()=>{ btn.textContent=t; },1400); }

    function downloadSVG(asset,btn){
      save(new Blob([asset.svg],{type:'image/svg+xml;charset=utf-8'}), asset.name+'.svg');
      flash(btn);
    }
    function downloadPNG(asset,btn){
      const img=new Image();
      img.onload=function(){
        const S=asset.size||1024;
        const cv=document.createElement('canvas'); cv.width=S; cv.height=S;
        cv.getContext('2d').drawImage(img,0,0,S,S);
        cv.toBlob(function(blob){ if(blob){ save(blob,asset.name+'.png'); flash(btn);} else fail(btn); },'image/png');
      };
      img.onerror=function(){ fail(btn); };
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(asset.svg);
    }

    document.addEventListener('click', function(e){
      const btn=e.target.closest('.dl-btn'); if(!btn) return;
      const make=ASSETS[btn.getAttribute('data-dl')]; if(!make) return;
      const asset=make();
      if(btn.getAttribute('data-fmt')==='svg') downloadSVG(asset,btn);
      else downloadPNG(asset,btn);
    });
  }

  function init(){ initStars(); initReveal(); initScrollSpy(); initCopy(); initToc(); initChips(); initDownloads(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

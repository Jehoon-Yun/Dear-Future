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

  function init(){ initStars(); initReveal(); initScrollSpy(); initCopy(); initToc(); initChips(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

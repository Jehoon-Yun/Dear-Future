/* 디어퓨처 가이드북 — Tweaks 앱
   정적 HTML 문서에 CSS 변수/속성으로 토글 값을 적용한다. */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#E8B583",
  "displayFont": "본명조",
  "bodyScale": 100,
  "skyDepth": "표준",
  "radius": 18,
  "motif": true
}/*EDITMODE-END*/;

const FONT_MAP = {
  "본명조": '"Noto Serif KR", serif',
  "나눔명조": '"Nanum Myeongjo", serif',
  "코모란트": '"Cormorant Garamond", "Noto Serif KR", serif'
};
const SKY = {
  "깊게":   { ink: "#0E0B22", indigo: "#15102F" },
  "표준":   { ink: "#14112E", indigo: "#1B1640" },
  "은은하게": { ink: "#241F44", indigo: "#2C2657" }
};

function TweaksApp(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(()=>{
    const r = document.documentElement;
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--font-display', FONT_MAP[t.displayFont] || FONT_MAP["본명조"]);
    r.style.setProperty('--radius', t.radius + 'px');
    r.style.setProperty('--radius-sm', Math.max(6, t.radius - 6) + 'px');
    r.style.setProperty('--radius-lg', (t.radius + 10) + 'px');
    document.body.style.fontSize = (t.bodyScale/100) + 'rem';
    const sky = SKY[t.skyDepth] || SKY["표준"];
    r.style.setProperty('--c-ink', sky.ink);
    r.style.setProperty('--c-indigo', sky.indigo);
    document.body.classList.toggle('motif-off', !t.motif);
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="포인트 컬러" />
      <TweakColor label="여명 액센트" value={t.accent}
        options={['#E8B583','#C58FA8','#93A3D6','#5566A6']}
        onChange={(v)=>setTweak('accent', v)} />
      <TweakSection label="타이포그래피" />
      <TweakRadio label="디스플레이 서체" value={t.displayFont}
        options={['본명조','나눔명조','코모란트']}
        onChange={(v)=>setTweak('displayFont', v)} />
      <TweakSlider label="본문 크기" value={t.bodyScale} min={90} max={115} step={1} unit="%"
        onChange={(v)=>setTweak('bodyScale', v)} />
      <TweakSection label="무드 & 형태" />
      <TweakRadio label="새벽 하늘 깊이" value={t.skyDepth}
        options={['깊게','표준','은은하게']}
        onChange={(v)=>setTweak('skyDepth', v)} />
      <TweakSlider label="모서리 둥글기" value={t.radius} min={0} max={28} step={2} unit="px"
        onChange={(v)=>setTweak('radius', v)} />
      <TweakToggle label="달·별 그래픽 모티프" value={t.motif}
        onChange={(v)=>setTweak('motif', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<TweaksApp />);

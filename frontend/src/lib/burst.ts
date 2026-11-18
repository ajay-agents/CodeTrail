import { ic } from './icons.js';

export function burst(x: number, y: number) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const names = ['star', 'bolt', 'ai', 'star'];
  const cols = ['#FFD43B', 'var(--blue)', '#FF7A90', '#FF9F43'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.innerHTML = ic(names[i % 4], 'solid');
    s.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:${16 + Math.random() * 14}px;line-height:1;color:${cols[i % 4]};pointer-events:none;z-index:70`;
    document.body.appendChild(s);
    if (!s.animate) {
      s.remove();
      continue;
    }
    const a = Math.random() * Math.PI * 2;
    const r = 60 + Math.random() * 90;
    s.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(a) * r}px),calc(-50% + ${Math.sin(a) * r - 40}px)) scale(1.1) rotate(${Math.random() * 80 - 40}deg)`,
          opacity: 0,
        },
      ],
      { duration: 800 + Math.random() * 400, easing: 'cubic-bezier(.2,.8,.3,1)' },
    ).onfinish = () => s.remove();
  }
}

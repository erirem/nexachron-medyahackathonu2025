'use client';

import { type JSX, useEffect, useRef, useState } from 'react';

type ProvinceNode = {
  readonly id: string;
  readonly name: string; // Display and value returned on click
  readonly x: number;
  readonly y: number;
};

const PROVINCES: readonly ProvinceNode[] = [
  { id: 'istanbul', name: 'İstanbul', x: 100, y: 140 },
  { id: 'ankara', name: 'Ankara', x: 260, y: 150 },
  { id: 'izmir', name: 'İzmir', x: 90, y: 200 },
  { id: 'bursa', name: 'Bursa', x: 120, y: 170 },
  { id: 'antalya', name: 'Antalya', x: 160, y: 230 },
  { id: 'konya', name: 'Konya', x: 230, y: 210 },
  { id: 'eskisehir', name: 'Eskişehir', x: 210, y: 170 },
  { id: 'samsun', name: 'Samsun', x: 290, y: 110 },
  { id: 'adana', name: 'Adana', x: 280, y: 240 },
  { id: 'gaziantep', name: 'Gaziantep', x: 320, y: 250 },
  { id: 'kayseri', name: 'Kayseri', x: 290, y: 190 },
  { id: 'antalya2', name: 'Antalya', x: 180, y: 235 }, // extra to visually fill
];

export const TURKEY_PROVINCE_NAMES: readonly string[] = Array.from(
  new Set(PROVINCES.map((p) => p.name))
);

type TurkeyMapProps = {
  readonly selected?: string | null;
  readonly correct?: string | null;
  readonly disabled?: boolean;
  readonly onSelect?: (provinceName: string) => void;
};

export function TurkeyMap({ selected, correct, disabled, onSelect }: TurkeyMapProps): JSX.Element {
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<{ name: string; x: number; y: number } | null>(null);

  // Try to fetch full provinces SVG; user-provided turkey-map.svg has priority
  useEffect(() => {
    let active = true;
    const tryFetch = (url: string) => fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(new Error('not found'))));
    tryFetch('/maps/turkey-map.svg')
      .catch(() => tryFetch('/maps/turkey-provinces.svg'))
      .then((txt) => {
        if (!active) return;
        setSvgMarkup(txt);
      })
      .catch(() => {
        // silently fall back
      });
    return () => {
      active = false;
    };
  }, []);

  // Enhance injected SVG with interactivity when loaded
  useEffect(() => {
    if (!svgMarkup || !containerRef.current) return;
    const root = containerRef.current;
    root.innerHTML = svgMarkup;
    const svg = root.querySelector('svg');
    if (!svg) return;
    svg.setAttribute('class', 'w-full h-auto');

    const paths = Array.from(svg.querySelectorAll('path')) as SVGPathElement[];
    const textsAll = Array.from(svg.querySelectorAll('text')) as SVGTextElement[];
    // Filter out watermark or non-province labels
    const texts = textsAll.filter((tx) => {
      const content = (tx.textContent || '').trim();
      if (!content) return false;
      const lower = content.toLowerCase();
      if (lower.includes('paintmaps')) return false;
      if (content.length < 2 || content.length > 20) return false;
      try {
        const b = tx.getBBox();
        // Ignore very bottom watermark area (svg is ~600 height in provided asset)
        if (b.y > 540) return false;
      } catch {}
      return true;
    });
    const getProvinceName = (el: Element): string => {
      const direct = (el.getAttribute('data-name') || el.getAttribute('name') || el.getAttribute('id') || '').trim();
      if (direct) return direct;
      // Try nearest title tag
      let cur: Element | null = el;
      while (cur) {
        const t = cur.querySelector(':scope > title');
        if (t?.textContent) return t.textContent.trim();
        cur = cur.parentElement;
      }
      // Fallback to nearest text label when no attributes/titles
      try {
        const bbox = (el as SVGGraphicsElement).getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        let best = Number.POSITIVE_INFINITY;
        let bestName = '';
        for (const tx of texts) {
          const tb = tx.getBBox();
          const txc = tb.x + tb.width / 2;
          const tyc = tb.y + tb.height / 2;
          const d = (txc - cx) * (txc - cx) + (tyc - cy) * (tyc - cy);
          if (d < best) {
            best = d;
            bestName = (tx.textContent || '').trim();
          }
        }
        return bestName;
      } catch {
        return '';
      }
    };

    const applyVisual = (p: SVGPathElement, provinceName: string) => {
      const isSelected = !!selected && provinceName === selected;
      const isCorrect = !!correct && provinceName === correct;
      const isWrong = isSelected && !!correct && provinceName !== correct;
      p.style.transition = 'fill 150ms ease, transform 150ms ease, opacity 150ms ease';
      p.style.cursor = disabled ? 'not-allowed' : 'pointer';
      p.style.pointerEvents = 'auto';
      if (disabled) {
        p.style.fill = '#ffffff1a';
        p.style.opacity = '1';
        return;
      }
      if (isCorrect) {
        p.style.fill = '#4ade80';
        p.style.opacity = '0.5';
        return;
      }
      if (isWrong) {
        p.style.fill = '#f87171';
        p.style.opacity = '0.5';
        return;
      }
      if (isSelected) {
        p.style.fill = '#60a5fa';
        p.style.opacity = '0.4';
        return;
      }
      p.style.fill = '#ffffff33';
      p.style.opacity = '1';
    };

    paths.forEach((p) => {
      const provinceName = getProvinceName(p);
      applyVisual(p, provinceName);

      p.addEventListener('mousemove', (evt) => {
        if (!provinceName) return;
        const bbox = svg.getBoundingClientRect();
        setHovered({ name: provinceName, x: evt.clientX - bbox.left, y: evt.clientY - bbox.top });
        if (!disabled) {
          const isSel = !!selected && provinceName === selected;
          const isCor = !!correct && provinceName === correct;
          const isWrong = isSel && !!correct && provinceName !== correct;
          if (!isSel && !isCor && !isWrong) {
            p.style.transform = 'scale(1.02)';
            p.style.fill = '#ffffff66';
          }
        }
      });
      p.addEventListener('mouseleave', () => {
        setHovered(null);
        applyVisual(p, provinceName);
        p.style.transform = 'none';
      });
      p.addEventListener('click', (evt) => {
        if (disabled) return;
        evt.stopPropagation();
        if (provinceName) onSelect?.(provinceName);
      });
    });

    // Also allow clicking labels
    texts.forEach((tx) => {
      const name = (tx.textContent || '').trim();
      tx.style.cursor = disabled ? 'not-allowed' : 'pointer';
      tx.addEventListener('click', (evt) => {
        if (disabled) return;
        evt.stopPropagation();
        if (name) onSelect?.(name);
      });
      tx.addEventListener('mousemove', (evt) => {
        const bbox = svg.getBoundingClientRect();
        setHovered({ name, x: evt.clientX - bbox.left, y: evt.clientY - bbox.top });
      });
      tx.addEventListener('mouseleave', () => setHovered(null));
    });

    return () => {
      root.innerHTML = '';
    };
  }, [svgMarkup, disabled, onSelect, selected, correct]);

  // If full SVG exists, render it
  if (svgMarkup) {
    return (
      <div className="relative">
        <div ref={containerRef} />
        {hovered && (
          <div
            className="absolute px-2 py-1 text-xs rounded bg-black/70 text-white pointer-events-none"
            style={{ left: hovered.x + 8, top: hovered.y + 8 }}
          >
            {hovered.name}
          </div>
        )}
      </div>
    );
  }

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const { x, y } = pt.matrixTransform(ctm.inverse());
    // snap to nearest province by Euclidean distance
    let nearest = PROVINCES[0];
    let best = Number.POSITIVE_INFINITY;
    for (const p of PROVINCES) {
      const dx = p.x - x;
      const dy = p.y - y;
      const d = dx * dx + dy * dy;
      if (d < best) {
        best = d;
        nearest = p;
      }
    }
    onSelect?.(nearest.name);
  };

  return (
    <svg viewBox="0 0 400 280" className="w-full h-auto md:h-[380px] lg:h-[480px]" preserveAspectRatio="xMidYMid meet" onClick={handleSvgClick}>
      <rect x="0" y="0" width="400" height="280" rx="16" className="fill-[#0f1624]" />

      {/* simplified outline */}
      <path
        d="M30 160 C80 100, 140 120, 190 130 C240 140, 300 120, 360 150 L360 180 C300 160, 240 180, 190 170 C140 160, 80 180, 30 170 Z"
        className="fill-[#1a2234] stroke-white/20"
      />

      {PROVINCES.map((p) => {
        const isCorrect = correct && p.name === correct;
        const isSelected = selected && p.name === selected;
        const base = 'fill-white/20 hover:fill-white/40 cursor-pointer';
        const selectedCls = isSelected ? 'fill-red-400' : '';
        const correctCls = isCorrect ? 'fill-green-400' : '';
        const final = disabled
          ? 'fill-white/10 cursor-not-allowed'
          : [base, correctCls || selectedCls].join(' ').trim();

        return (
          <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
            <circle
              r="10"
              className={final}
              onClick={(evt) => {
                evt.stopPropagation();
                !disabled && onSelect?.(p.name);
              }}
            />
            <text
              x={0}
              y={-14}
              textAnchor="middle"
              className="fill-white text-[10px] select-none"
            >
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}



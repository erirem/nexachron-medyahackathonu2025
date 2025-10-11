'use client';

import { type JSX, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import turkeyCitiesData from 'turkey-cities-data';

type ProvinceNode = {
    readonly id: string;
    readonly name: string;
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
    { id: 'antalya2', name: 'Antalya', x: 180, y: 235 },
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
    const svgRef = useRef<SVGSVGElement>(null);
    const [topology, setTopology] = useState<any>(null);
    const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 500 });

    // GeoJSON verisini yükle
    useEffect(() => {
        fetch('/maps/turkey-provinces.json')
            .then(response => response.json())
            .then(data => {
                console.log('GeoJSON yüklendi:', data);
                setTopology(data);
            })
            .catch(error => {
                console.error('GeoJSON yüklenirken hata:', error);
                // Fallback: basit SVG harita
                setTopology(null);
            });
    }, []);

    // Responsive boyutlandırma
    useEffect(() => {
        const updateDimensions = () => {
            const container = svgRef.current?.parentElement;
            if (container) {
                setDimensions({
                    width: Math.min(1000, container.clientWidth),
                    height: Math.min(500, container.clientHeight)
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // D3.js ile harita çizimi
    useEffect(() => {
        if (!topology || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Önceki çizimleri temizle

        // Projection ayarları - Türkiye'yi daha iyi ortalayacak şekilde
        const projection = d3.geoMercator()
            .center([35, 39]) // Türkiye merkezi
            .scale(2800) // Daha küçük scale - haritayı sığdırmak için
            .translate([dimensions.width / 2, dimensions.height / 2]);

        const path = d3.geoPath().projection(projection);

        // GeoJSON verisini kullan (TopoJSON değil)
        const geojson = topology;

        // Renk fonksiyonu
        const getFillColor = (provinceName: string) => {
            if (correct === provinceName) return '#22c55e'; // Yeşil - doğru cevap
            if (selected === provinceName) {
                // Seçilen il: Doğru cevap ile aynıysa yeşil, bekleme durumunda sarı, yanlışsa kırmızı
                if (correct === null) return '#eab308'; // Sarı - bekleme durumu
                return correct === provinceName ? '#22c55e' : '#ef4444'; // Yeşil veya kırmızı
            }
            if (hoveredProvince === provinceName) return '#3b82f6'; // Mavi - hover
            return '#374151'; // Gri - varsayılan
        };

        // Harita çizimi
        svg.selectAll('path')
            .data(geojson.features)
            .enter()
            .append('path')
            .attr('d', (d: any) => path(d))
            .attr('fill', (d: any) => {
                // Property isimlerini kontrol et
                console.log('Feature properties:', d.properties);
                const provinceName = d.properties.name || d.properties.NAME || d.properties.il || 'Bilinmeyen';
                return getFillColor(provinceName);
            })
            .attr('stroke', '#1f2937')
            .attr('stroke-width', 0.5)
            .style('cursor', disabled ? 'not-allowed' : 'pointer')
            .style('transition', 'all 0.2s ease-in-out')
            .on('mouseenter', function (event, d: any) {
                if (!disabled) {
                    const provinceName = d.properties.name || d.properties.NAME || d.properties.il || 'Bilinmeyen';
                    setHoveredProvince(provinceName);
                    d3.select(this)
                        .attr('fill', '#60a5fa')
                        .attr('stroke-width', 1);
                }
            })
            .on('mouseleave', function (event, d: any) {
                if (!disabled) {
                    setHoveredProvince(null);
                    const provinceName = d.properties.name || d.properties.NAME || d.properties.il || 'Bilinmeyen';
                    d3.select(this)
                        .attr('fill', getFillColor(provinceName))
                        .attr('stroke-width', 0.5);
                }
            })
            .on('click', function (event, d: any) {
                if (!disabled && onSelect) {
                    const provinceName = d.properties.name || d.properties.NAME || d.properties.il || 'Bilinmeyen';
                    onSelect(provinceName);
                }
            });

        // Tooltip
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'map-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '6px')
            .style('font-size', '14px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', '1000');

        // Tooltip için ayrı event listener'lar
        svg.selectAll('path')
            .on('mouseenter.tooltip', function (event, d: any) {
                if (!disabled) {
                    const provinceName = d.properties.name || d.properties.NAME || d.properties.il || 'Bilinmeyen';
                    tooltip
                        .style('opacity', 1)
                        .html(provinceName)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px');
                }
            })
            .on('mouseleave.tooltip', function () {
                tooltip.style('opacity', 0);
            })
            .on('mousemove.tooltip', function (event) {
                if (!disabled) {
                    tooltip
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px');
                }
            });

        // Şehir isimlerini ekle
        const cityLabels = svg.selectAll('.city-label')
            .data(geojson.features)
            .enter()
            .append('g')
            .attr('class', 'city-label-group')
            .style('pointer-events', 'none') // Tüm grup için pointer events devre dışı
            .each(function (d: any) {
                const g = d3.select(this);
                const centroid = path.centroid(d);
                const provinceName = d.properties.name || d.properties.NAME || d.properties.il || '';

                // Arka plan rengi için rect
                g.append('rect')
                    .attr('x', -provinceName.length * 3)
                    .attr('y', -6)
                    .attr('width', provinceName.length * 6)
                    .attr('height', 12)
                    .attr('rx', 6)
                    .attr('ry', 6)
                    .attr('fill', 'rgba(0, 0, 0, 0.7)')
                    .attr('stroke', 'rgba(255, 255, 255, 0.3)')
                    .attr('stroke-width', '0.5px')
                    .style('pointer-events', 'none');

                // Metin
                g.append('text')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', '#ffffff')
                    .attr('font-size', '8px')
                    .attr('font-weight', 'bold')
                    .attr('stroke', '#000000')
                    .attr('stroke-width', '0.5px')
                    .attr('paint-order', 'stroke fill')
                    .style('pointer-events', 'none')
                    .text(provinceName);
            })
            .attr('transform', (d: any) => {
                const centroid = path.centroid(d);
                return `translate(${centroid[0]}, ${centroid[1]})`;
            });

        // Cleanup
        return () => {
            d3.selectAll('.map-tooltip').remove();
        };
    }, [topology, dimensions, selected, correct, disabled, onSelect, hoveredProvince]);

    // Fallback: GeoJSON yüklenemezse basit SVG harita
    if (!topology) {
        return (
            <div className="relative w-full h-[500px] bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-white/70">
                    <div className="text-4xl mb-2">🗺️</div>
                    <div className="text-lg font-semibold mb-1">Türkiye Haritası</div>
                    <div className="text-sm">Harita yükleniyor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[500px] bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full h-full"
                style={{ background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }}
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid meet"
            />

            {/* Hovered Province Info */}
            {hoveredProvince && !disabled && (
                <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    {hoveredProvince}
                </div>
            )}

        </div>
    );
}

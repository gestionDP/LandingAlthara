'use client';

/**
 * althara.es — capa pública (Capa 0).
 *
 * Estructura fijada por ALT-WEB-2026-01 v1.2 §03: nueve secciones en orden de
 * institución, no de embudo. Un único aforismo (03 · Tesis) y un único botón
 * (09 · Acceso) en todo el site.
 *
 * 05 · Cartera existe en `components/landing/Portfolio.tsx` pero NO se monta
 * todavía: faltan las filas C-01, C-02 y D-02 (pendientes de validación).
 * Para publicarla, completar `src/content/figures.json`, poner
 * `portfolio.published: true` y añadirla entre <Process /> e <Infrastructure />.
 */
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Position from '@/components/landing/Position';
import Thesis from '@/components/landing/Thesis';
import Marquee from '@/components/landing/Marquee';
import Process from '@/components/landing/Process';
import Infrastructure from '@/components/landing/Infrastructure';
import Partnerships from '@/components/landing/Partnerships';
import Research from '@/components/landing/Research';
import Access from '@/components/landing/Access';
import Footer from '@/components/landing/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function Home() {
  return (
    <div className="relative overflow-x-clip bg-[#f4f2ec]">
      <Nav />
      {/* 01 */} <Hero />
      {/* 02 */} <Position />
      {/* 03 */} <Thesis />
      <Marquee />
      {/* 04 */} <Process />
      {/* 05 · Cartera — pendiente de datos */}
      {/* 06 */} <Infrastructure />
      {/* 07 */} <Partnerships />
      {/* 08 */} <Research />
      {/* 09 */} <Access />
      <Footer />
      <ScrollToTop />
    </div>
  );
}

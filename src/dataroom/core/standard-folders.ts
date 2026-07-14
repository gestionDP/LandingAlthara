/**
 * Árbol de carpetas ESTÁNDAR del data room (spec ALT-RM, PDF del jefe).
 * Fuente única para: creación por defecto del proyecto, «Restaurar estándar»,
 * y el indicador de progreso/contenido esperado del panel de administración.
 *
 * `contents` = elementos que se espera tener en cada carpeta (columna
 * «Contenido» del PDF). El progreso se calcula como documentos subidos frente
 * al número de elementos esperados.
 */
export interface StandardFolder {
  name: string;
  level: 1 | 2;
  contents: string[];
}

export const STANDARD_FOLDERS: StandardFolder[] = [
  {
    name: '0 · Bienvenida e índice',
    level: 1,
    contents: ['Nota de acceso', 'Disclaimer de confidencialidad', 'Contacto', 'Índice navegable con semáforo de estado'],
  },
  {
    name: '1 · Resumen de la operación',
    level: 1,
    contents: ['Teaser firmado', 'One-pager de términos', 'NDA reforzado (gate a Nivel 2)'],
  },
  {
    name: '2 · Estructura societaria y legal',
    level: 2,
    contents: ['Organigrama GDP/Adelana/RHC', 'Escrituras', 'Estatutos', 'Cambio de denominación', 'Pacto de socios', 'Poderes', 'Titularidad real'],
  },
  {
    name: '3 · Pasivo a cancelar',
    level: 2,
    contents: ['Contrato marco', 'Disposiciones y ampliaciones', 'Cláusula de retorno', 'Certificado de deuda del acreedor', 'Borrador de carta de cancelación'],
  },
  {
    name: '4 · Colateral — activos',
    level: 2,
    contents: ['Inventario con referencia catastral', 'Subcarpeta por proyecto: Cala Gamba', 'Subcarpeta por proyecto: Manacor', 'Subcarpeta por proyecto: Sa Pobla', 'Subcarpeta por proyecto: Sant Ignasi'],
  },
  {
    name: '5 · Comercialización y ventas',
    level: 2,
    contents: ['Cuadro de ventas comprometidas', 'Contratos de arras/reservas', 'Pipeline por proyecto'],
  },
  {
    name: '6 · Información financiera',
    level: 2,
    contents: ['Modelo financiero (actual vs. refinanciación)', 'Balances 2025 RHC y GDP', 'Provisional 2026', 'Posición fiscal'],
  },
  {
    name: '7 · La operación propuesta',
    level: 2,
    contents: ['Sources & uses', 'Estructura de repago', 'Term sheet', 'Instrumento de financiación'],
  },
  {
    name: '8 · Q&A y administración',
    level: 2,
    contents: ['Registro de preguntas-respuestas', 'Log de versiones/actualizaciones'],
  },
];

/** Lista { name, level } para crear las carpetas (sin el contenido esperado). */
export const DEFAULT_PROJECT_FOLDERS: { name: string; level: number }[] =
  STANDARD_FOLDERS.map((f) => ({ name: f.name, level: f.level }));

/** Mapa nombre de carpeta → elementos esperados. */
export const FOLDER_CONTENTS: Record<string, string[]> =
  Object.fromEntries(STANDARD_FOLDERS.map((f) => [f.name, f.contents]));

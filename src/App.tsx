import { useState, useMemo, useEffect, useRef } from 'react'
import defaultData from './data.json'

export type Journal = {
  id: number | string
  Nombre: string
  Indexación: string
  Link: string
  "Formato que recibe": string
  "ISSN Electrónico": string
  "ISSN Impreso": string
  "Formato necesario para publicar": string
  Acceso: string
  Costo: string
  Idioma: string
  "Cuantas revistas/articulos al año": string
  Ubicación: string
  Correo: string
  "Cuanto demora en publicar?": string
  "Índice H": string
  CiteScore: string
  "Impact Factor": string
  Temas: string[]
}

const STORAGE_KEY = 'revistas_db'
const TOPICS = [
  'Inteligencia Artificial',
  'Aprendizaje Automático',
  'Ciencias de la Computación',
  'Redes y Telecomunicaciones',
  'Internet de las Cosas (IoT)',
  'Ciberseguridad y Privacidad',
  'Big Data y Datos',
  'Computación en la Nube',
  'Sistemas Inteligentes y Control',
  'Electrónica y Microprocesadores',
  'Agronomía y Agricultura',
  'Sostenibilidad y Medio Ambiente',
  'Multimedia y Sistemas Digitales',
  'Sistemas de Información',
  'Comercio Electrónico',
  'Robótica y Automatización',
  'Blockchain y Criptografía',
  'Matemáticas Computacionales',
  'Ingeniería General',
  'Redes de Sensores',
  'Redes Sociales',
]

// Simple CSV parser
function parseLine(line: string) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += c
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Journal[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith(',,,'))
  if (lines.length < 2) return []
  const headers = parseLine(lines.shift() || '').map(h => h.trim())
  
  return lines.map((line, idx) => {
    const values = parseLine(line)
    const obj: any = { id: Date.now() + idx, Temas: [] }
    headers.forEach((h, i) => {
      obj[h] = values[i] ? values[i].trim() : ''
    })
    return obj as Journal
  })
}

const QUARTILE_COLORS: Record<string, string> = {
  Q1: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Q2: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  Q3: 'bg-orange-100 text-orange-800 border-orange-300',
  Q4: 'bg-red-100 text-red-800 border-red-300',
}

function QuartileBadge({ q }: { q: string }) {
  if (!q) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border tracking-wide ${QUARTILE_COLORS[q] ?? 'bg-stone-100 text-stone-600 border-stone-300'}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {q}
    </span>
  )
}

function MetaValue({ label, value }: { label: string; value: string | number | null }) {
  const display = !value ? 'N/A' : String(value)
  return (
    <span className="inline-flex items-baseline gap-1 mr-4 mb-1">
      <span className="text-stone-400 text-[11px] uppercase tracking-wider">{label}:</span>
      <span
        className="text-stone-700 text-[12px] font-medium"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {display}
      </span>
    </span>
  )
}

function JournalCard({ journal, onEdit }: { journal: Journal; onEdit: (j: Journal) => void }) {
  const temas = journal.Temas || []
  return (
    <article className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-3 hover:border-amber-700/40 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-[15px] font-semibold leading-snug text-stone-900 group-hover:text-amber-800 transition-colors"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {journal.Nombre || 'Sin nombre'}
        </h3>
        <QuartileBadge q={journal.Indexación} />
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] text-stone-400 tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          ISSN E: {journal["ISSN Electrónico"] || 'N/A'} · ISSN P: {journal["ISSN Impreso"] || 'N/A'}
        </p>
        <p className="text-[12px] text-stone-500 leading-tight">Formato editor: {journal["Formato necesario para publicar"] || 'N/A'} · País: {journal.Ubicación || 'N/A'}</p>
      </div>

      <div className="flex flex-wrap gap-x-2 gap-y-1 border-t border-stone-100 pt-3">
        <MetaValue label="Costo" value={journal.Costo} />
        <MetaValue label="Tiempo" value={journal["Cuanto demora en publicar?"]} />
        <MetaValue label="Acceso" value={journal.Acceso} />
        <MetaValue label="Idioma" value={journal.Idioma} />
        <MetaValue label="Índice H" value={journal["Índice H"]} />
        <MetaValue label="CiteScore" value={journal.CiteScore} />
        <MetaValue label="Impact Factor" value={journal["Impact Factor"]} />
      </div>

      {temas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {temas.map((t) => (
            <span key={t} className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[11px] border border-stone-200">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 mt-auto border-t border-stone-50">
        {journal.Link && (
          <a
            href={journal.Link}
            target="_blank" rel="noreferrer"
            className="text-[12px] text-amber-700 hover:text-amber-900 underline underline-offset-2 font-medium transition-colors"
          >
            Ver fuente
          </a>
        )}
        <button
          onClick={() => onEdit(journal)}
          className="ml-auto px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-[12px] font-medium hover:bg-stone-50 hover:border-stone-400 active:scale-95 transition-all"
        >
          Editar
        </button>
      </div>
    </article>
  )
}

const EMPTY_FORM: Omit<Journal, 'id'> = {
  Nombre: '', Indexación: '', Link: '', "Formato que recibe": '', "ISSN Electrónico": '', "ISSN Impreso": '',
  "Formato necesario para publicar": '', Acceso: '', Costo: '', Idioma: '', "Cuantas revistas/articulos al año": '',
  Ubicación: '', Correo: '', "Cuanto demora en publicar?": '', "Índice H": '', CiteScore: '', "Impact Factor": '', Temas: []
}

const Field = ({
  label, value, onChange, placeholder, type = 'text', required = false, span2 = false,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean; span2?: boolean
}) => (
  <div className={span2 ? 'col-span-2' : ''}>
    <label className="flex items-center gap-1 text-[11px] text-stone-400 mb-1.5 uppercase tracking-wider"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {label}
      {required && <span className="text-amber-600">*</span>}
    </label>
    <input
      type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-700 bg-stone-50 focus:outline-none focus:bg-white focus:border-amber-500 transition"
    />
  </div>
)

function checkDuplicateISSN(newJournal: Journal | Omit<Journal, 'id'>, allJournals: Journal[], excludeId?: string | number) {
  const isDup = allJournals.some(j => {
    if (j.id === excludeId) return false
    const e1 = newJournal["ISSN Electrónico"]?.trim()
    const p1 = newJournal["ISSN Impreso"]?.trim()
    const e2 = j["ISSN Electrónico"]?.trim()
    const p2 = j["ISSN Impreso"]?.trim()

    if (e1 && e1 === e2) return true
    if (e1 && e1 === p2) return true
    if (p1 && p1 === e2) return true
    if (p1 && p1 === p2) return true
    return false
  })
  return isDup
}

function JournalFormModal({ initialData, allJournals, onClose, onSave }: { initialData?: Journal, allJournals: Journal[], onClose: () => void; onSave: (j: Journal) => void }) {
  const [form, setForm] = useState<Omit<Journal, 'id'>>(initialData ? { ...initialData, Temas: initialData.Temas || [] } : { ...EMPTY_FORM })

  const set = (key: keyof Omit<Journal, 'id'>, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const toggleTopic = (t: string) => {
    setForm((f) => ({
      ...f,
      Temas: f.Temas.includes(t) ? f.Temas.filter((x) => x !== t) : [...f.Temas, t],
    }))
  }

  const handleSave = () => {
    if (!form.Nombre.trim()) {
      alert("El nombre es obligatorio")
      return
    }

    if (checkDuplicateISSN(form, allJournals, initialData?.id)) {
      const confirmAdd = window.confirm("¡Atención! Hemos detectado que ya existe una revista con el mismo ISSN (Electrónico o Impreso). ¿Deseas agregar/guardar esta revista de todos modos?")
      if (!confirmAdd) return
    }

    onSave({
      ...(initialData ? { id: initialData.id } : { id: Date.now() }),
      ...form
    } as Journal)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ backgroundColor: 'rgba(28,25,23,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-t-3xl md:rounded-2xl border border-stone-200 shadow-2xl w-full md:max-w-2xl flex flex-col"
        style={{ maxHeight: '92dvh' }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <p className="text-[11px] text-stone-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {initialData ? 'Editar revista' : 'Nueva revista'}
            </p>
            <h2 className="text-[18px] font-semibold text-stone-900 mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>
              {initialData ? initialData.Nombre : 'Añadir manualmente'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M9.854 3.354a.5.5 0 0 0-.708-.708L6 5.793 2.854 2.646a.5.5 0 0 0-.708.708L5.293 6.5 2.146 9.646a.5.5 0 0 0 .708.708L6 7.207l3.146 3.147a.5.5 0 0 0 .708-.708L6.707 6.5l3.147-3.146z" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre de la revista" value={form.Nombre} onChange={(v) => set('Nombre', v)} required span2 />
            <Field label="Formato necesario para publicar" value={form["Formato necesario para publicar"]} onChange={(v) => set("Formato necesario para publicar", v)} span2 />
            <Field label="Link" value={form.Link} onChange={(v) => set('Link', v)} span2 />
            <Field label="ISSN Electrónico" value={form["ISSN Electrónico"]} onChange={(v) => set("ISSN Electrónico", v)} />
            <Field label="ISSN Impreso" value={form["ISSN Impreso"]} onChange={(v) => set("ISSN Impreso", v)} />
            <Field label="Indexación" value={form.Indexación} onChange={(v) => set('Indexación', v)} placeholder="Q1, Q2, etc." />
            <Field label="Formato que recibe" value={form["Formato que recibe"]} onChange={(v) => set("Formato que recibe", v)} />
            <Field label="Acceso" value={form.Acceso} onChange={(v) => set("Acceso", v)} />
            <Field label="Costo" value={form.Costo} onChange={(v) => set("Costo", v)} />
            <Field label="Idioma" value={form.Idioma} onChange={(v) => set("Idioma", v)} />
            <Field label="Cuantas revistas/articulos al año" value={form["Cuantas revistas/articulos al año"]} onChange={(v) => set("Cuantas revistas/articulos al año", v)} />
            <Field label="Ubicación (País)" value={form.Ubicación} onChange={(v) => set("Ubicación", v)} />
            <Field label="Correo" value={form.Correo} onChange={(v) => set("Correo", v)} />
            <Field label="Cuanto demora en publicar?" value={form["Cuanto demora en publicar?"]} onChange={(v) => set("Cuanto demora en publicar?", v)} />
            <Field label="Índice H" value={form["Índice H"]} onChange={(v) => set("Índice H", v)} />
            <Field label="CiteScore" value={form.CiteScore} onChange={(v) => set("CiteScore", v)} />
            <Field label="Impact Factor" value={form["Impact Factor"]} onChange={(v) => set("Impact Factor", v)} />

            <div className="col-span-2 mt-2">
              <label className="block text-[11px] text-stone-400 mb-2 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Temas (Opcional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    key={t} type="button" onClick={() => toggleTopic(t)}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-all active:scale-95 ${
                      form.Temas.includes(t)
                        ? 'bg-amber-700 text-white border-amber-700'
                        : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-amber-300 hover:text-amber-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 shrink-0 flex gap-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-200 text-[13px] text-stone-500 hover:bg-stone-50 transition">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-amber-700 text-white text-[13px] font-semibold hover:bg-amber-800 active:scale-95 transition-all">
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

function CsvInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(28,25,23,0.55)', backdropFilter: 'blur(4px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <h2 className="text-[16px] font-semibold text-stone-900" style={{ fontFamily: "'Fraunces', serif" }}>Formato ideal para subir CSV</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200 transition">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M9.854 3.354a.5.5 0 0 0-.708-.708L6 5.793 2.854 2.646a.5.5 0 0 0-.708.708L5.293 6.5 2.146 9.646a.5.5 0 0 0 .708.708L6 7.207l3.146 3.147a.5.5 0 0 0 .708-.708L6.707 6.5l3.147-3.146z" />
            </svg>
          </button>
        </div>
        <div className="p-6 text-[13px] text-stone-600 flex flex-col gap-4">
          <p>Para cargar un listado de revistas correctamente, el archivo debe ser un <strong>.CSV</strong> delimitado por comas.</p>
          <div>
            <p className="font-semibold text-stone-800 mb-2">Columnas requeridas exactamente con estos nombres:</p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-500">
              <li>Nombre</li>
              <li>Indexación</li>
              <li>Link</li>
              <li>Formato que recibe</li>
              <li>ISSN Electrónico</li>
              <li>ISSN Impreso</li>
              <li>Formato necesario para publicar</li>
              <li>Acceso</li>
              <li>Costo</li>
              <li>Idioma</li>
              <li>Cuantas revistas/articulos al año</li>
              <li>Ubicación</li>
              <li>Correo</li>
              <li>Cuanto demora en publicar?</li>
              <li>Índice H</li>
              <li>CiteScore</li>
              <li>Impact Factor</li>
            </ul>
          </div>
          <p className="text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 text-[12px]">
            <strong>Nota:</strong> Los valores vacíos están permitidos, pero la fila de encabezado (primera fila) debe contener estrictamente estos nombres para que el sistema reconozca los datos.
          </p>
        </div>
      </div>
    </div>
  )
}

function hasActiveFilters(search: string, formato: string, indexacion: string, ubicacion: string, acceso: string, tiempoPub: string, temas: string[]) {
  return !!(search || formato || indexacion || ubicacion || acceso || tiempoPub || temas.length > 0)
}

function FilterPanel({
  search, setSearch,
  formato, setFormato,
  indexacion, setIndexacion,
  ubicacion, setUbicacion,
  acceso, setAcceso,
  tiempoPub, setTiempoPub,
  temas, toggleTema,
  formatosDisponibles, ubicacionesDisponibles, accesosDisponibles, tiemposDisponibles,
  onClear, resultCount, showing,
}: {
  search: string; setSearch: (v: string) => void
  formato: string; setFormato: (v: string) => void
  indexacion: string; setIndexacion: (v: string) => void
  ubicacion: string; setUbicacion: (v: string) => void
  acceso: string; setAcceso: (v: string) => void
  tiempoPub: string; setTiempoPub: (v: string) => void
  temas: string[]; toggleTema: (t: string) => void
  formatosDisponibles: string[]; ubicacionesDisponibles: string[]; accesosDisponibles: string[]; tiemposDisponibles: string[]
  onClear: () => void; resultCount: number; showing: number
}) {
  const active = hasActiveFilters(search, formato, indexacion, ubicacion, acceso, tiempoPub, temas)
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-stone-600">Buscar</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="text" placeholder="Nombre..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-700 bg-stone-50 focus:outline-none focus:border-amber-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-stone-600">Formato para publicar</label>
        <select value={formato} onChange={(e) => setFormato(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] bg-stone-50 focus:outline-none focus:border-amber-500">
          <option value="">Todos los formatos</option>
          {formatosDisponibles.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-stone-600">País / Ubicación</label>
        <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] bg-stone-50 focus:outline-none focus:border-amber-500">
          <option value="">Cualquier país</option>
          {ubicacionesDisponibles.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-stone-600">Tipo de Acceso</label>
        <select value={acceso} onChange={(e) => setAcceso(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] bg-stone-50 focus:outline-none focus:border-amber-500">
          <option value="">Todos los tipos</option>
          {accesosDisponibles.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-stone-600">Tiempo de Publicación</label>
        <select value={tiempoPub} onChange={(e) => setTiempoPub(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-[13px] bg-stone-50 focus:outline-none focus:border-amber-500">
          <option value="">Cualquier tiempo</option>
          {tiemposDisponibles.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-stone-600">Indexación</label>
        <div className="grid grid-cols-5 gap-1.5">
          {['', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
            <button
              key={q} onClick={() => setIndexacion(q)}
              className={`py-2 rounded-lg text-[12px] font-medium border transition-all ${
                indexacion === q ? 'bg-amber-700 text-white border-amber-700' : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-amber-300'
              }`}
            >
              {q || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-stone-600">Temas</label>
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((t) => (
            <button
              key={t} onClick={() => toggleTema(t)}
              className={`px-2.5 py-1 rounded-full text-[11px] border transition-all active:scale-95 ${
                temas.includes(t)
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50 border border-stone-100">
        <span className="text-[12px] text-stone-400">
          Mostrando <span className="font-semibold text-stone-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{showing}</span> de{' '}
          <span className="font-semibold text-stone-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{resultCount}</span>
        </span>
        {active && (
          <button onClick={onClear} className="text-[12px] text-amber-700 hover:underline font-medium">Limpiar</button>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [journals, setJournals] = useState<Journal[]>([])
  
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setJournals(JSON.parse(saved))
      } catch (e) {
        setJournals(defaultData as unknown as Journal[])
      }
    } else {
      setJournals(defaultData as unknown as Journal[])
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
    }
  }, [])

  const [search, setSearch] = useState('')
  const [formato, setFormato] = useState('')
  const [indexacion, setIndexacion] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [acceso, setAcceso] = useState('')
  const [tiempoPub, setTiempoPub] = useState('')
  const [temas, setTemas] = useState<string[]>([])
  
  const [pageSize, setPageSize] = useState(10)
  const [editing, setEditing] = useState<Journal | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const clearFilters = () => {
    setSearch(''); setFormato(''); setIndexacion(''); setUbicacion(''); setAcceso(''); setTiempoPub(''); setTemas([])
  }

  const toggleTema = (t: string) => {
    setTemas((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const saveJournal = (j: Journal) => {
    const existing = journals.findIndex(x => x.id === j.id)
    let newJournals = [...journals]
    if (existing >= 0) {
      newJournals[existing] = j
    } else {
      newJournals = [j, ...newJournals]
    }
    setJournals(newJournals)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newJournals))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      if (text) {
        const parsed = parseCSV(text)
        if (parsed.length > 0) {
          
          let duplicates = 0;
          const toAdd: Journal[] = [];
          
          for (const newJ of parsed) {
            if (checkDuplicateISSN(newJ, journals)) {
              duplicates++;
            }
            toAdd.push(newJ)
          }

          if (duplicates > 0) {
            const addAnyway = window.confirm(`¡Atención! Hemos detectado ${duplicates} revista(s) en el CSV con ISSN (Electrónico o Impreso) ya existente en la base de datos actual.\n\n¿Deseas agregar todas de todas formas?\n\n(Aceptar = Agregar todo, Cancelar = Cancelar carga completa)`)
            if (!addAnyway) {
              e.target.value = ''
              return;
            }
          }

          const newJournals = [...toAdd, ...journals]
          setJournals(newJournals)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newJournals))
          alert(`Cargadas ${parsed.length} revistas con éxito.`)
        } else {
          alert('No se pudieron leer datos del CSV. Comprueba el formato.')
        }
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const formatosDisponibles = useMemo(() => Array.from(new Set(journals.map(j => j["Formato necesario para publicar"]).filter(Boolean))).sort(), [journals])
  const ubicacionesDisponibles = useMemo(() => Array.from(new Set(journals.map(j => j.Ubicación).filter(Boolean))).sort(), [journals])
  const accesosDisponibles = useMemo(() => Array.from(new Set(journals.map(j => j.Acceso).filter(Boolean))).sort(), [journals])
  const tiemposDisponibles = useMemo(() => Array.from(new Set(journals.map(j => j["Cuanto demora en publicar?"]).filter(Boolean))).sort(), [journals])

  const filtered = useMemo(() => {
    return journals.filter((j) => {
      if (search && !j.Nombre.toLowerCase().includes(search.toLowerCase())) return false
      if (indexacion && j.Indexación !== indexacion) return false
      if (formato && j["Formato necesario para publicar"] !== formato) return false
      if (ubicacion && j.Ubicación !== ubicacion) return false
      if (acceso && j.Acceso !== acceso) return false
      if (tiempoPub && j["Cuanto demora en publicar?"] !== tiempoPub) return false
      if (temas.length > 0) {
        const jt = j.Temas || []
        if (!temas.some(t => jt.includes(t))) return false
      }
      return true
    })
  }, [journals, search, indexacion, formato, ubicacion, acceso, tiempoPub, temas])

  const paginated = filtered.slice(0, pageSize)
  const activeCount = [search, formato, indexacion, ubicacion, acceso, tiempoPub, ...(temas.length ? ['temas'] : [])].filter(Boolean).length

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0e8' }}>
      <header className="border-b border-stone-200 sticky top-0 z-20 px-4 md:px-8 py-3 md:py-4" style={{ backgroundColor: 'rgba(250,246,240,0.92)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-700 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="7" rx="0.5" fill="white" />
                <rect x="8" y="1" width="5" height="4" rx="0.5" fill="white" opacity="0.7" />
                <rect x="8" y="7" width="5" height="6" rx="0.5" fill="white" opacity="0.5" />
                <rect x="1" y="10" width="5" height="3" rx="0.5" fill="white" opacity="0.6" />
              </svg>
            </div>
            <span className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider hidden sm:block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Directorio de Revistas
            </span>
            <span className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider sm:hidden" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Revistas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInfoOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-500 hover:text-amber-700 hover:bg-amber-50 text-[13px] font-medium transition-all"
              title="Ver formato CSV ideal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Formato CSV</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-600 text-[13px] font-semibold cursor-pointer hover:bg-stone-50 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span className="hidden sm:inline">Subir CSV</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>

            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-700 text-white text-[13px] font-semibold hover:bg-amber-800 active:scale-95 transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Añadir</span>
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white text-[13px] text-stone-600 font-medium active:scale-95 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Filtros
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="md:hidden px-4 pt-4 pb-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="text" placeholder="Buscar revista..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-2xl border border-stone-200 bg-white text-[14px] text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-500 transition shadow-sm"
          />
        </div>
        <p className="mt-2 text-[12px] text-stone-400 px-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {filtered.length} resultados · mostrando {Math.min(pageSize, filtered.length)}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 flex gap-8">
        <aside className="hidden md:flex flex-col gap-6 w-64 shrink-0 sticky top-[88px]" style={{ height: 'calc(100vh - 120px)' }}>
          <div>
            <h2 className="text-[16px] font-semibold text-stone-900 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
              Explorar
            </h2>
            <p className="text-[13px] text-stone-500 leading-snug">
              Encuentra la revista ideal para tu publicación.
            </p>
          </div>
          <div className="overflow-y-auto pr-2 pb-8">
            <FilterPanel
              search={search} setSearch={setSearch}
              formato={formato} setFormato={setFormato}
              indexacion={indexacion} setIndexacion={setIndexacion}
              ubicacion={ubicacion} setUbicacion={setUbicacion}
              acceso={acceso} setAcceso={setAcceso}
              tiempoPub={tiempoPub} setTiempoPub={setTiempoPub}
              temas={temas} toggleTema={toggleTema}
              formatosDisponibles={formatosDisponibles}
              ubicacionesDisponibles={ubicacionesDisponibles}
              accesosDisponibles={accesosDisponibles}
              tiemposDisponibles={tiemposDisponibles}
              onClear={clearFilters}
              resultCount={filtered.length}
              showing={Math.min(pageSize, filtered.length)}
            />
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-20">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-4 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="#a8a29e" strokeWidth="1.5" />
                  <path d="M13.5 13.5L17 17" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-stone-400 text-[14px]">Sin resultados</p>
              <button onClick={clearFilters} className="mt-3 text-[12px] text-amber-700 hover:underline">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
              {paginated.map((j) => (
                <JournalCard key={j.id} journal={j} onEdit={setEditing} />
              ))}
            </div>
          )}

          {filtered.length > pageSize && (
            <div className="mt-6 md:mt-8 flex justify-center">
              <button
                onClick={() => setPageSize((p) => p + 10)}
                className="px-6 py-3 rounded-2xl border border-stone-300 text-[13px] text-stone-600 hover:bg-white hover:border-amber-400 hover:text-amber-700 transition-all active:scale-95"
              >
                Cargar más ({filtered.length - pageSize} restantes)
              </button>
            </div>
          )}
        </main>
      </div>

      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ backgroundColor: 'rgba(28,25,23,0.4)', backdropFilter: 'blur(3px)' }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white rounded-t-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-stone-200" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 shrink-0">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-900" style={{ fontFamily: "'Fraunces', serif" }}>
                  Filtros
                </h2>
                {activeCount > 0 && (
                  <p className="text-[11px] text-amber-700">{activeCount} activo{activeCount > 1 ? 's' : ''}</p>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 active:scale-95 transition"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M9.854 3.354a.5.5 0 0 0-.708-.708L6 5.793 2.854 2.646a.5.5 0 0 0-.708.708L5.293 6.5 2.146 9.646a.5.5 0 0 0 .708.708L6 7.207l3.146 3.147a.5.5 0 0 0 .708-.708L6.707 6.5l3.147-3.146z" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5">
              <FilterPanel
                search={search} setSearch={setSearch}
                formato={formato} setFormato={setFormato}
                indexacion={indexacion} setIndexacion={setIndexacion}
                ubicacion={ubicacion} setUbicacion={setUbicacion}
                acceso={acceso} setAcceso={setAcceso}
                tiempoPub={tiempoPub} setTiempoPub={setTiempoPub}
                temas={temas} toggleTema={toggleTema}
                formatosDisponibles={formatosDisponibles}
                ubicacionesDisponibles={ubicacionesDisponibles}
                accesosDisponibles={accesosDisponibles}
                tiemposDisponibles={tiemposDisponibles}
                onClear={clearFilters}
                resultCount={filtered.length}
                showing={Math.min(pageSize, filtered.length)}
              />
            </div>
            <div className="px-5 py-4 border-t border-stone-100 shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-bottom))' }}>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-amber-700 text-white text-[14px] font-semibold active:scale-95 transition-all"
              >
                Ver {filtered.length} resultados
              </button>
            </div>
          </div>
        </>
      )}

      {infoOpen && <CsvInfoModal onClose={() => setInfoOpen(false)} />}
      {addOpen && <JournalFormModal allJournals={journals} onClose={() => setAddOpen(false)} onSave={saveJournal} />}
      {editing && <JournalFormModal allJournals={journals} initialData={editing} onClose={() => setEditing(null)} onSave={saveJournal} />}
    </div>
  )
}

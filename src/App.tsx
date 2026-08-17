import { useState, useMemo, useEffect, useRef } from 'react'

type Journal = {
  id: number
  name: string
  issn: string[]
  publisher: string
  quartile: string
  price: number | null
  time: number | null
  sjr: number | null
  hIndex: number | null
  topics: string[]
  url: string
}

const TOPICS = [
  'Computer Science',
  'Engineering',
  'Biomedical',
  'Control Systems',
  'Electronics',
  'Networks',
  'Mathematics',
  'Physics',
  'Energy',
  'Materials',
]

const JOURNALS: Journal[] = [
  {
    id: 1,
    name: 'Acta Cybernetica',
    issn: ['0324-721X'],
    publisher: 'University of Szeged, Institute of Informatics',
    quartile: 'Q4',
    price: null,
    time: null,
    sjr: null,
    hIndex: null,
    topics: ['Electronics', 'Computer Science', 'Mathematics'],
    url: '#',
  },
  {
    id: 2,
    name: 'Ad-Hoc and Sensor Wireless Networks',
    issn: ['1551-9899', '1552-0633'],
    publisher: 'Old City Publishing',
    quartile: 'Q4',
    price: null,
    time: null,
    sjr: null,
    hIndex: null,
    topics: ['Electronics', 'Computer Science', 'Networks'],
    url: '#',
  },
  {
    id: 3,
    name: 'Advanced Biomedical Engineering',
    issn: ['2187-5219'],
    publisher: 'Japan Soc. of Med. Electronics and Biol. Engineering',
    quartile: 'Q4',
    price: 1200,
    time: 90,
    sjr: 0.41,
    hIndex: 18,
    topics: ['Biomedical', 'Computer Science', 'Engineering'],
    url: '#',
  },
  {
    id: 4,
    name: 'Advanced Control for Applications: Engineering and Industrial Systems',
    issn: ['2578-0727'],
    publisher: 'John Wiley and Sons Inc.',
    quartile: 'Q3',
    price: 0,
    time: 75,
    sjr: 0.68,
    hIndex: 12,
    topics: ['Control Systems', 'Networks', 'Energy'],
    url: '#',
  },
  {
    id: 5,
    name: 'Advances in Complex Systems',
    issn: ['0219-5259', '1793-6802'],
    publisher: 'World Scientific Publishing Co. Pte Ltd',
    quartile: 'Q2',
    price: 0,
    time: 60,
    sjr: 1.12,
    hIndex: 45,
    topics: ['Control Systems', 'Mathematics', 'Physics'],
    url: '#',
  },
  {
    id: 6,
    name: 'Advances in Imaging and Electron Physics',
    issn: ['1076-5670'],
    publisher: 'Academic Press Inc.',
    quartile: 'Q4',
    price: null,
    time: null,
    sjr: null,
    hIndex: null,
    topics: ['Electronics', 'Physics'],
    url: '#',
  },
  {
    id: 7,
    name: 'Advances in Military Technology',
    issn: ['1802-2308', '2533-4123'],
    publisher: 'University of Defence',
    quartile: 'Q4',
    price: 0,
    time: 120,
    sjr: 0.28,
    hIndex: 9,
    topics: ['Control Systems', 'Engineering', 'Materials'],
    url: '#',
  },
  {
    id: 8,
    name: 'Advances in Science and Engineering Technology International Conferences, ASET',
    issn: ['2831-6886', '2831-6878'],
    publisher: 'Institute of Electrical and Electronics Engineers Inc.',
    quartile: 'Q4',
    price: 0,
    time: 45,
    sjr: 0.19,
    hIndex: 6,
    topics: ['Engineering', 'Energy', 'Materials'],
    url: '#',
  },
  {
    id: 9,
    name: 'Advances in Technology Innovation',
    issn: ['2518-2994', '2415-0436'],
    publisher: 'Taiwan Association of Engineering and Technology Innovation',
    quartile: 'Q3',
    price: 0,
    time: 55,
    sjr: 0.52,
    hIndex: 22,
    topics: ['Engineering', 'Computer Science', 'Energy'],
    url: '#',
  },
  {
    id: 10,
    name: 'Advances in Transdisciplinary Engineering',
    issn: ['2352-751X', '2352-7528'],
    publisher: 'IOS Press BV',
    quartile: 'Q1',
    price: 0,
    time: 40,
    sjr: 2.34,
    hIndex: 67,
    topics: ['Engineering', 'Computer Science', 'Mathematics'],
    url: '#',
  },
  {
    id: 11,
    name: 'AEU – International Journal of Electronics and Communications',
    issn: ['1434-8411'],
    publisher: 'Elsevier GmbH',
    quartile: 'Q2',
    price: 2800,
    time: 65,
    sjr: 0.89,
    hIndex: 54,
    topics: ['Electronics', 'Networks', 'Engineering'],
    url: '#',
  },
  {
    id: 12,
    name: 'Aerospace Science and Technology',
    issn: ['1270-9638'],
    publisher: 'Elsevier Masson s.r.l.',
    quartile: 'Q1',
    price: 3200,
    time: 55,
    sjr: 1.98,
    hIndex: 89,
    topics: ['Engineering', 'Materials', 'Control Systems'],
    url: '#',
  },
]

const QUARTILE_COLORS: Record<string, string> = {
  Q1: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Q2: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  Q3: 'bg-orange-100 text-orange-800 border-orange-300',
  Q4: 'bg-red-100 text-red-800 border-red-300',
}

function QuartileBadge({ q }: { q: string }) {
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
  const display = value === null || value === undefined ? 'N/A' : String(value)
  return (
    <span className="inline-flex items-baseline gap-1">
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
  return (
    <article className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-3 hover:border-amber-700/40 hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-[15px] font-semibold leading-snug text-stone-900 group-hover:text-amber-800 transition-colors"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {journal.name}
        </h3>
        <QuartileBadge q={journal.quartile} />
      </div>

      {/* ISSN + Publisher */}
      <div className="flex flex-col gap-0.5">
        <p
          className="text-[11px] text-stone-400 tracking-wide"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          ISSN: {journal.issn.join(' · ')}
        </p>
        <p className="text-[12px] text-stone-500 leading-tight">{journal.publisher}</p>
      </div>

      {/* Metrics row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-100 pt-3">
        <MetaValue
          label="Precio"
          value={journal.price === null ? null : journal.price === 0 ? 'Gratis' : `$${journal.price}`}
        />
        <MetaValue label="Tiempo" value={journal.time === null ? null : `${journal.time} días`} />
        <MetaValue label="SJR" value={journal.sjr} />
        <MetaValue label="H-index" value={journal.hIndex} />
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5">
        {journal.topics.map((t) => (
          <span
            key={t}
            className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[11px] border border-stone-200"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <a
          href={journal.url}
          className="text-[12px] text-amber-700 hover:text-amber-900 underline underline-offset-2 font-medium transition-colors"
        >
          Ver fuente
        </a>
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

const EMPTY_FORM = {
  name: '',
  issn: '',
  publisher: '',
  quartile: 'Q4',
  price: '',
  time: '',
  sjr: '',
  hIndex: '',
  topics: [] as string[],
  url: '',
}

function AddJournalModal({ onClose, onSave }: { onClose: () => void; onSave: (j: Journal) => void }) {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  const toggleTopic = (t: string) =>
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(t) ? f.topics.filter((x) => x !== t) : [...f.topics, t],
    }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'El nombre es obligatorio'
    if (!form.issn.trim()) e.issn = 'Ingresa al menos un ISSN'
    if (!form.publisher.trim()) e.publisher = 'El editor es obligatorio'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({
      id: Date.now(),
      name: form.name.trim(),
      issn: form.issn.split(',').map((s) => s.trim()).filter(Boolean),
      publisher: form.publisher.trim(),
      quartile: form.quartile,
      price: form.price !== '' ? Number(form.price) : null,
      time: form.time !== '' ? Number(form.time) : null,
      sjr: form.sjr !== '' ? Number(form.sjr) : null,
      hIndex: form.hIndex !== '' ? Number(form.hIndex) : null,
      topics: form.topics,
      url: form.url.trim() || '#',
    })
    onClose()
  }

  const Field = ({
    label, fieldKey, placeholder, type = 'text', required = false, span2 = false,
  }: {
    label: string; fieldKey: string; placeholder?: string; type?: string; required?: boolean; span2?: boolean
  }) => (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="flex items-center gap-1 text-[11px] text-stone-400 mb-1.5 uppercase tracking-wider"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
        {required && <span className="text-amber-600">*</span>}
      </label>
      <input
        ref={fieldKey === 'name' ? nameRef : undefined}
        type={type}
        placeholder={placeholder}
        value={(form as Record<string, string | string[]>)[fieldKey] as string}
        onChange={(e) => set(fieldKey, e.target.value)}
        className={`w-full px-3 py-2.5 rounded-xl border text-[13px] text-stone-700 bg-stone-50 focus:outline-none focus:bg-white transition ${
          errors[fieldKey]
            ? 'border-red-300 focus:border-red-400'
            : 'border-stone-200 focus:border-amber-500'
        }`}
      />
      {errors[fieldKey] && (
        <p className="text-[11px] text-red-500 mt-1">{errors[fieldKey]}</p>
      )}
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ backgroundColor: 'rgba(28,25,23,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-t-3xl md:rounded-2xl border border-stone-200 shadow-2xl w-full md:max-w-xl flex flex-col"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <p className="text-[11px] text-stone-400 uppercase tracking-wider"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Nueva revista
            </p>
            <h2 className="text-[18px] font-semibold text-stone-900 mt-0.5"
              style={{ fontFamily: "'Fraunces', serif" }}>
              Añadir manualmente
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M9.854 3.354a.5.5 0 0 0-.708-.708L6 5.793 2.854 2.646a.5.5 0 0 0-.708.708L5.293 6.5 2.146 9.646a.5.5 0 0 0 .708.708L6 7.207l3.146 3.147a.5.5 0 0 0 .708-.708L6.707 6.5l3.147-3.146z" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre de la revista" fieldKey="name" placeholder="Ej. Journal of Engineering" required span2 />
            <Field label="ISSN(s)" fieldKey="issn" placeholder="Ej. 1234-5678, 8765-4321" required span2 />
            <Field label="Editor / Publisher" fieldKey="publisher" placeholder="Ej. Elsevier B.V." required span2 />
            <Field label="URL fuente" fieldKey="url" placeholder="https://..." span2 />

            {/* Quartile selector */}
            <div className="col-span-2">
              <label className="block text-[11px] text-stone-400 mb-1.5 uppercase tracking-wider"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Cuartil
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => set('quartile', q)}
                    className={`py-2.5 rounded-xl text-[13px] font-semibold border transition-all active:scale-95 ${
                      form.quartile === q
                        ? q === 'Q1' ? 'bg-emerald-600 text-white border-emerald-600'
                          : q === 'Q2' ? 'bg-cyan-600 text-white border-cyan-600'
                          : q === 'Q3' ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-red-600 text-white border-red-600'
                        : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Precio (USD)" fieldKey="price" placeholder="0 = Gratis" type="number" />
            <Field label="Tiempo (días)" fieldKey="time" placeholder="—" type="number" />
            <Field label="SJR" fieldKey="sjr" placeholder="—" type="number" />
            <Field label="H-index" fieldKey="hIndex" placeholder="—" type="number" />

            {/* Topics */}
            <div className="col-span-2">
              <label className="block text-[11px] text-stone-400 mb-2 uppercase tracking-wider"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Temas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-all active:scale-95 ${
                      form.topics.includes(t)
                        ? 'bg-amber-700 text-white border-amber-700'
                        : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-amber-300 hover:text-amber-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {form.topics.length === 0 && (
                <p className="text-[11px] text-stone-300 mt-1.5">Selecciona uno o varios temas</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 shrink-0 flex gap-3"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-[13px] text-stone-500 hover:bg-stone-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-amber-700 text-white text-[13px] font-semibold hover:bg-amber-800 active:scale-95 transition-all"
          >
            Añadir revista
          </button>
        </div>
      </div>
    </div>
  )
}

const hasActiveFilters = (
  search: string,
  selectedTopics: string[],
  quartile: string,
  maxPrice: string,
  maxTime: string
) => !!(search || selectedTopics.length || quartile || maxPrice || maxTime)

function FilterPanel({
  search, setSearch,
  selectedTopics, toggleTopic,
  quartile, setQuartile,
  maxPrice, setMaxPrice,
  maxTime, setMaxTime,
  onClear,
  resultCount,
  showing,
}: {
  search: string; setSearch: (v: string) => void
  selectedTopics: string[]; toggleTopic: (t: string) => void
  quartile: string; setQuartile: (v: string) => void
  maxPrice: string; setMaxPrice: (v: string) => void
  maxTime: string; setMaxTime: (v: string) => void
  onClear: () => void
  resultCount: number
  showing: number
}) {
  const active = hasActiveFilters(search, selectedTopics, quartile, maxPrice, maxTime)
  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-stone-600">Buscar</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Nombre, editor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-700 placeholder-stone-300 bg-stone-50 focus:outline-none focus:border-amber-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Topics */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-stone-600">Temas</label>
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTopic(t)}
              className={`px-2.5 py-1 rounded-full text-[11px] border transition-all active:scale-95 ${
                selectedTopics.includes(t)
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Quartile */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-stone-600">Cuartil</label>
        <div className="grid grid-cols-5 gap-1.5">
          {['', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
            <button
              key={q}
              onClick={() => setQuartile(q)}
              className={`py-2 rounded-lg text-[12px] font-medium border transition-all ${
                quartile === q
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-amber-300'
              }`}
            >
              {q || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Price + Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-stone-600">Precio máx (USD)</label>
          <input
            type="number"
            min="0"
            placeholder="∞"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-700 placeholder-stone-300 bg-stone-50 focus:outline-none focus:border-amber-500 focus:bg-white transition"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-stone-600">Tiempo máx (días)</label>
          <input
            type="number"
            min="0"
            placeholder="∞"
            value={maxTime}
            onChange={(e) => setMaxTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-700 placeholder-stone-300 bg-stone-50 focus:outline-none focus:border-amber-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50 border border-stone-100">
        <span className="text-[12px] text-stone-400">
          Mostrando <span className="font-semibold text-stone-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{showing}</span> de{' '}
          <span className="font-semibold text-stone-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{resultCount}</span>
        </span>
        {active && (
          <button onClick={onClear} className="text-[12px] text-amber-700 hover:underline font-medium">
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [journals, setJournals] = useState<Journal[]>(JOURNALS)
  const [search, setSearch] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [quartile, setQuartile] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [maxTime, setMaxTime] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [editing, setEditing] = useState<Journal | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const toggleTopic = (t: string) =>
    setSelectedTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const clearFilters = () => {
    setSearch('')
    setSelectedTopics([])
    setQuartile('')
    setMaxPrice('')
    setMaxTime('')
  }

  const addJournal = (j: Journal) => setJournals((prev) => [j, ...prev])

  const filtered = useMemo(() => {
    return journals.filter((j) => {
      if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.publisher.toLowerCase().includes(search.toLowerCase())) return false
      if (quartile && j.quartile !== quartile) return false
      if (selectedTopics.length && !selectedTopics.some((t) => j.topics.includes(t))) return false
      if (maxPrice !== '' && j.price !== null && j.price > Number(maxPrice)) return false
      if (maxTime !== '' && j.time !== null && j.time > Number(maxTime)) return false
      return true
    })
  }, [search, quartile, selectedTopics, maxPrice, maxTime])

  const paginated = filtered.slice(0, pageSize)
  const active = hasActiveFilters(search, selectedTopics, quartile, maxPrice, maxTime)
  const activeCount = [search, ...selectedTopics, quartile, maxPrice, maxTime].filter(Boolean).length

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0e8' }}>

      {/* ── Top bar ── */}
      <header
        className="border-b border-stone-200 sticky top-0 z-20 px-4 md:px-8 py-3 md:py-4"
        style={{ backgroundColor: 'rgba(250,246,240,0.92)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo + name */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-700 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="7" rx="0.5" fill="white" />
                <rect x="8" y="1" width="5" height="4" rx="0.5" fill="white" opacity="0.7" />
                <rect x="8" y="7" width="5" height="6" rx="0.5" fill="white" opacity="0.5" />
                <rect x="1" y="10" width="5" height="3" rx="0.5" fill="white" opacity="0.6" />
              </svg>
            </div>
            <span
              className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider hidden sm:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Directorio de Revistas
            </span>
            <span
              className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider sm:hidden"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Revistas
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Result count — desktop */}
            <span
              className="text-[12px] text-stone-400 hidden md:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {filtered.length} resultados
            </span>

            {/* Add button */}
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-700 text-white text-[13px] font-semibold hover:bg-amber-800 active:scale-95 transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Añadir</span>
            </button>

            {/* Filter toggle — mobile only */}
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

      {/* ── Mobile search bar ── */}
      <div className="md:hidden px-4 pt-4 pb-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar revista o editor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-2xl border border-stone-200 bg-white text-[14px] text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-500 transition shadow-sm"
          />
        </div>
        {/* Active topic chips */}
        {selectedTopics.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {selectedTopics.map((t) => (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] border border-amber-200"
              >
                {t}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M7.5 3.207 6.793 2.5 5 4.293 3.207 2.5 2.5 3.207 4.293 5 2.5 6.793 3.207 7.5 5 5.707 6.793 7.5 7.5 6.793 5.707 5z" />
                </svg>
              </button>
            ))}
            {quartile && (
              <button
                onClick={() => setQuartile('')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] border border-amber-200"
              >
                {quartile}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M7.5 3.207 6.793 2.5 5 4.293 3.207 2.5 2.5 3.207 4.293 5 2.5 6.793 3.207 7.5 5 5.707 6.793 7.5 7.5 6.793 5.707 5z" />
                </svg>
              </button>
            )}
          </div>
        )}
        <p className="mt-2 text-[12px] text-stone-400 px-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {filtered.length} resultados · mostrando {Math.min(pageSize, filtered.length)}
        </p>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 flex gap-8">

        {/* Desktop sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-20 flex flex-col gap-6">
            <div>
              <h1
                className="text-3xl font-bold leading-tight text-stone-900"
                style={{ fontFamily: "'Fraunces', serif", fontVariationSettings: "'opsz' 40" }}
              >
                Revistas de<br />
                <span className="text-amber-700 italic">Ingeniería</span>
              </h1>
              <p className="mt-1 text-[12px] text-stone-400 tracking-wide">Base de datos académica</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <h2
                className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-semibold mb-5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Filtros
              </h2>
              <FilterPanel
                search={search} setSearch={setSearch}
                selectedTopics={selectedTopics} toggleTopic={toggleTopic}
                quartile={quartile} setQuartile={setQuartile}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                maxTime={maxTime} setMaxTime={setMaxTime}
                onClear={clearFilters}
                resultCount={filtered.length}
                showing={Math.min(pageSize, filtered.length)}
              />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Desktop controls row */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <div className="flex flex-wrap gap-1">
              {selectedTopics.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[11px]">
                  {t}
                </span>
              ))}
              {quartile && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[11px]">
                  {quartile}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-[12px] text-stone-400">Mostrar</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1.5 rounded-lg border border-stone-200 text-[12px] text-stone-600 bg-white focus:outline-none focus:border-amber-500 transition"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
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

      {/* ── Mobile bottom drawer ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ backgroundColor: 'rgba(28,25,23,0.4)', backdropFilter: 'blur(3px)' }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white rounded-t-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-stone-200" />
            </div>
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 shrink-0">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-900" style={{ fontFamily: "'Fraunces', serif" }}>
                  Filtros
                </h2>
                {active && (
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
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-5">
              <FilterPanel
                search={search} setSearch={setSearch}
                selectedTopics={selectedTopics} toggleTopic={toggleTopic}
                quartile={quartile} setQuartile={setQuartile}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                maxTime={maxTime} setMaxTime={setMaxTime}
                onClear={clearFilters}
                resultCount={filtered.length}
                showing={Math.min(pageSize, filtered.length)}
              />
            </div>
            {/* CTA */}
            <div className="px-5 py-4 border-t border-stone-100 shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
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

      {/* ── Add modal ── */}
      {addOpen && <AddJournalModal onClose={() => setAddOpen(false)} onSave={addJournal} />}

      {/* ── Edit modal ── */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          style={{ backgroundColor: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <div className="bg-white rounded-t-3xl md:rounded-2xl border border-stone-200 shadow-2xl w-full md:max-w-lg p-6 flex flex-col gap-5"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  Editar revista
                </p>
                <h2 className="text-[17px] font-semibold text-stone-900 leading-snug" style={{ fontFamily: "'Fraunces', serif" }}>
                  {editing.name}
                </h2>
              </div>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M9.854 3.354a.5.5 0 0 0-.708-.708L6 5.793 2.854 2.646a.5.5 0 0 0-.708.708L5.293 6.5 2.146 9.646a.5.5 0 0 0 .708.708L6 7.207l3.146 3.147a.5.5 0 0 0 .708-.708L6.707 6.5l3.147-3.146z" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[50dvh] overflow-y-auto">
              {[
                { label: 'ISSN', value: editing.issn.join(', ') },
                { label: 'Editor', value: editing.publisher },
                { label: 'Cuartil', value: editing.quartile },
                { label: 'Precio (USD)', value: editing.price ?? '' },
                { label: 'Tiempo (días)', value: editing.time ?? '' },
                { label: 'SJR', value: editing.sjr ?? '' },
                { label: 'H-index', value: editing.hIndex ?? '' },
              ].map(({ label, value }) => (
                <div key={label} className={label === 'Editor' || label === 'ISSN' ? 'col-span-2' : ''}>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {label}
                  </label>
                  <input
                    defaultValue={String(value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-700 bg-stone-50 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1 border-t border-stone-100">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border border-stone-200 text-[13px] text-stone-500 hover:bg-stone-50 transition">
                Cancelar
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl bg-amber-700 text-white text-[13px] font-semibold hover:bg-amber-800 active:scale-95 transition-all">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

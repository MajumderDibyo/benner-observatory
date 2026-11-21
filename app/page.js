'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CYCLES, MARKETS, STANCES, referencesForYear, safeUrl, validFact, validateBackup } from '@/lib/model';
import Timeline from '@/components/Timeline';
import FactDialog from '@/components/FactDialog';

const KEY = 'conatus.benner-observatory.v1';

const stanceColor = (stance) => {
  if (stance === 'Supports') return '#3e7a3c';
  if (stance === 'Challenges') return '#c0623a';
  return '#7a6e5c';
};

const hostname = (url) => {
  try { return new URL(url).hostname; } catch { return url; }
};

export default function Page() {
  const [data, setData] = useState({ version: 1, facts: [], scenarios: {} });
  const [selectedYear, setSelectedYear] = useState(() =>
    Math.min(2059, Math.max(1924, new Date().getFullYear()))
  );
  const [message, setMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [range, setRange] = useState('modern');
  const [marketFilter, setMarketFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [saveStatus, setSaveStatus] = useState('Saved automatically');
  const [loaded, setLoaded] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setData(validateBackup(JSON.parse(saved)));
    } catch {
      setMessage('Saved data could not be loaded.');
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const persist = useCallback((next) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setData(next);
      return true;
    } catch {
      setMessage('Could not save — storage may be full.');
      return false;
    }
  }, []);

  const references = useMemo(() => referencesForYear(selectedYear), [selectedYear]);

  const yearlyFacts = useMemo(
    () => data.facts.filter((f) => Number(f.date.slice(0, 4)) === selectedYear),
    [data.facts, selectedYear]
  );

  const filteredFacts = useMemo(() => {
    const query = search.toLowerCase().trim();
    return data.facts
      .filter(
        (f) =>
          (marketFilter === 'all' || f.market === marketFilter) &&
          (periodFilter === 'all' || Number(f.date.slice(0, 4)) === selectedYear) &&
          `${f.title} ${f.note} ${f.source}`.toLowerCase().includes(query)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.facts, marketFilter, periodFilter, selectedYear, search]);

  const factsByCycle = useMemo(() => {
    const groups = {};
    for (const cycle of CYCLES) groups[cycle.id] = [];
    for (const f of filteredFacts) {
      const year = Number(f.date.slice(0, 4));
      for (const cycle of CYCLES) {
        if (cycle.years.includes(year)) {
          groups[cycle.id].push(f);
        }
      }
    }
    return groups;
  }, [filteredFacts]);

  const openFact = (fact = null) => {
    setEditingFact(fact);
    setDialogOpen(true);
  };

  const handleFactSubmit = (values) => {
    const fact = {
      ...values,
      id: editingFact?.id || crypto.randomUUID(),
      title: values.title.trim(),
      source: values.source.trim(),
      note: values.note.trim(),
    };
    if (!validFact(fact)) return false;
    const facts = editingFact
      ? data.facts.map((f) => (f.id === editingFact.id ? fact : f))
      : [...data.facts, fact];
    if (persist({ ...data, facts })) {
      setDialogOpen(false);
      setMessage('Fact saved.');
      return true;
    }
    return false;
  };

  const deleteFact = (id) => {
    if (confirm('Delete this fact?')) {
      if (persist({ ...data, facts: data.facts.filter((f) => f.id !== id) })) {
        setMessage('Fact deleted.');
      }
    }
  };

  const handleScenarioChange = (value) => {
    const scenarios = { ...data.scenarios, [selectedYear]: value };
    setSaveStatus(persist({ ...data, scenarios }) ? 'Saved' : 'Not saved');
  };

  const handleExport = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `benner-research-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImport = async (file) => {
    if (!file) return;
    try {
      if (file.size > 10_000_000) throw new Error('File too large (max 10 MB).');
      const next = validateBackup(JSON.parse(await file.text()));
      if (
        (data.facts.length || Object.keys(data.scenarios).length) &&
        !confirm('Import replaces all current research. Continue?')
      )
        return;
      if (persist(next)) {
        setMessage(`Imported ${next.facts.length} facts.`);
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleYearInput = (e) => {
    const val = Number(e.target.value);
    if (e.target.checkValidity() && val >= 1924 && val <= 2059) setSelectedYear(val);
  };

  if (!loaded) return null;

  return (
    <div className="shell">
      <header>
        <a className="brand" href="/">
          <span className="brand-icon">◒</span> CONATUS{' '}
          <span className="slash">/</span> <span>Observatory</span>
        </a>
        <span className="local">PERSONAL RESEARCH WORKSPACE</span>
      </header>

      {/* ── LEFT: cycle-grouped facts ── */}
      <div className="left-col">
        {CYCLES.map((cycle) => (
          <section className="cycle-panel" key={cycle.id}>
            <div className="cycle-panel-header" style={{ color: cycle.color }}>
              <span className="cycle-dot" style={{ background: cycle.color }} />
              {cycle.id} · {cycle.label.replace(' reference', '')}
              <span className="cycle-count">{factsByCycle[cycle.id].length}</span>
            </div>
            <div className="cycle-panel-list">
              {factsByCycle[cycle.id].length > 0 ? (
                factsByCycle[cycle.id].map((f) => (
                  <div className="fact-row" key={f.id}>
                    <div className="fact-row-summary">
                      <span className="stance-dot" style={{ background: stanceColor(f.stance) }} />
                      <span className="fact-row-date">{f.date}</span>
                      <span className="fact-row-title">{f.title}</span>
                    </div>
                    <div className="fact-row-detail">
                      <div className="fact-row-detail-inner">
                        <div className="fact-row-meta">
                          <span className={`badge ${f.stance.toLowerCase()}`}>{f.stance}</span>
                          <span className="muted small">{f.market}</span>
                        </div>
                        {f.note && <p className="fact-row-note">{f.note}</p>}
                        <div className="fact-row-actions">
                          <a href={safeUrl(f.source)} target="_blank" rel="noopener noreferrer">
                            {hostname(f.source)}
                          </a>
                          <button onClick={() => openFact(f)}>Edit</button>
                          <button onClick={() => deleteFact(f.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cycle-empty">No facts for these years</div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* ── CENTER: timeline ── */}
      <div className="center-col">
        <div className="timeline-area">
          <Timeline selectedYear={selectedYear} range={range} onSelectYear={setSelectedYear} />
        </div>
        <div className="timeline-legend">
          <span><i className="dot orange" /> A · Panic</span>
          <span><i className="dot purple" /> B · High prices</span>
          <span><i className="dot green" /> C · Low prices</span>
        </div>
      </div>

      {/* ── RIGHT: controls ── */}
      <div className="right-col">
        <div className="control-section">
          <label className="control-label" htmlFor="year-input">Explore year</label>
          <input
            id="year-input"
            type="number"
            min={1924}
            max={2059}
            step={1}
            value={selectedYear}
            onChange={handleYearInput}
          />
        </div>

        <div className="control-section">
          <label className="control-label" htmlFor="range-select">Timeline range</label>
          <select id="range-select" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="modern">1990 – 2045</option>
            <option value="full">1924 – 2059</option>
          </select>
        </div>

        <div className="control-divider" />

        <div className="control-section">
          <p className="eyebrow">SELECTED YEAR</p>
          <h2 className="selected-year">{selectedYear}</h2>
          {references.length > 0 ? (
            references.map((c) => (
              <p key={c.id} className="reference-label" style={{ color: c.color }}>
                {c.id} · {c.label}
              </p>
            ))
          ) : (
            <p className="reference-label muted small">Between reference years</p>
          )}
        </div>

        <div className="stance-counts">
          {STANCES.map((stance, i) => (
            <div key={stance}>
              <strong className={['green-text', 'orange-text', 'muted'][i]}>
                {yearlyFacts.filter((f) => f.stance === stance).length}
              </strong>
              <span>{stance}</span>
            </div>
          ))}
        </div>

        <div className="control-divider" />

        <div className="control-section">
          <label className="control-label" htmlFor="market-filter">Market</label>
          <select id="market-filter" value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)}>
            <option value="all">All markets</option>
            {MARKETS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="control-section">
          <label className="control-label" htmlFor="period-filter">Period</label>
          <select id="period-filter" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
            <option value="all">All years</option>
            <option value="selected">Selected year</option>
          </select>
        </div>

        <div className="control-section">
          <label className="control-label" htmlFor="search-input">Search</label>
          <input
            id="search-input"
            type="search"
            placeholder="Find a fact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="control-divider" />

        <div className="control-section">
          <label className="control-label" htmlFor="scenario">Scenario</label>
          <textarea
            id="scenario"
            rows={3}
            maxLength={8000}
            placeholder="What might happen? What would invalidate your thesis?"
            value={data.scenarios[selectedYear] || ''}
            onChange={(e) => handleScenarioChange(e.target.value)}
          />
          <span className="muted small">{saveStatus}</span>
        </div>

        <div className="control-divider" />

        <div className="control-actions">
          <button className="primary" onClick={() => openFact()}>+ Add fact</button>
          <button onClick={handleExport}>Export</button>
          <button onClick={() => importRef.current?.click()}>Import</button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              handleImport(e.target.files[0]);
              e.target.value = '';
            }}
          />
        </div>

        <p className="muted small" style={{ marginTop: 10 }}>
          {filteredFacts.length} {filteredFacts.length === 1 ? 'fact' : 'facts'} · {data.facts.length} total
        </p>
      </div>

      {/* ── Toast ── */}
      {message && (
        <div className="message-toast" role="status" aria-live="polite">
          {message}
        </div>
      )}

      <FactDialog
        open={dialogOpen}
        fact={editingFact}
        selectedYear={selectedYear}
        onSubmit={handleFactSubmit}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

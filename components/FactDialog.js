'use client';

import { useRef, useState, useEffect } from 'react';
import { MARKETS, STANCES } from '@/lib/model';

export default function FactDialog({ open, fact, selectedYear, onSubmit, onClose }) {
  const ref = useRef(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [market, setMarket] = useState(MARKETS[0]);
  const [source, setSource] = useState('');
  const [stance, setStance] = useState('Neutral');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (fact) {
        setTitle(fact.title);
        setDate(fact.date);
        setMarket(fact.market);
        setSource(fact.source);
        setStance(fact.stance);
        setNote(fact.note);
      } else {
        setTitle('');
        setDate(`${selectedYear}-01-01`);
        setMarket(MARKETS[0]);
        setSource('');
        setStance('Neutral');
        setNote('');
      }
      setError('');
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [open, fact, selectedYear]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit({ title, date, market, source, stance, note })) {
      setError('Enter a title, a valid date in 1924–2059, and an HTTP or HTTPS source URL.');
    }
  };

  return (
    <dialog ref={ref} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="section-top">
          <h2>{fact ? 'Edit sourced fact' : 'Add a sourced fact'}</h2>
          <button type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <label>
          Observed fact
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder="Record the observation, not the prediction"
          />
        </label>

        <div className="form-row">
          <label>
            Event date
            <input
              type="date"
              min="1924-01-01"
              max="2059-12-31"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Market
            <select value={market} onChange={(e) => setMarket(e.target.value)}>
              {MARKETS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Source URL
          <input
            type="url"
            required
            placeholder="https://…"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </label>

        <label>
          Relationship to your cycle thesis
          <select value={stance} onChange={(e) => setStance(e.target.value)}>
            {STANCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label>
          Interpretation / source excerpt
          <textarea
            rows={4}
            maxLength={4000}
            placeholder="Why does this support or challenge your thesis?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        {error && <p role="alert" className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary" type="submit">Save fact</button>
        </div>
      </form>
    </dialog>
  );
}

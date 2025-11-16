import React, { useEffect, useState } from 'react';

export default function TestRunner({ test, loading, defaultParticipant, onSubmit, showSolutions }) {
  const [participant, setParticipant] = useState(defaultParticipant ?? '');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setParticipant(defaultParticipant ?? '');
  }, [defaultParticipant]);

  useEffect(() => {
    setAnswers({});
    setResult(null);
    setError('');
  }, [test?.id]);

  if (loading) {
    return <p>Se incarca testul...</p>;
  }

  if (!test) {
    return null;
  }

  const selectAnswer = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        participantName: participant,
        answers
      };
      const response = await onSubmit(payload);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', fontSize: '14px', color: '#1e3a8a' }}>
        <div><strong>Categorie:</strong> {test.category ?? 'General'}</div>
        <div><strong>Durata recomandata:</strong> {test.durationMinutes ?? 30} minute</div>
        {test.description && <p style={{ marginTop: '8px' }}>{test.description}</p>}
      </div>

      <div>
        <label>Nume participant</label>
        <input
          value={participant}
          onChange={(e) => setParticipant(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5f5' }}
        />
      </div>

      {test.questions.map((question, questionIndex) => (
        <div key={question.id ?? questionIndex} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>
              {questionIndex + 1}. {question.text}
            </h4>
            <span style={{ fontSize: '12px', color: '#475569' }}>{question.points ?? 1} punct(e)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              const correct = showSolutions && option.correct;
              return (
                <label
                  key={option.id}
                  style={{
                    border: '1px solid',
                    borderColor: selected ? '#2563eb' : '#e2e8f0',
                    background: correct ? '#dcfce7' : '#fff',
                    borderRadius: '6px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={selected}
                    onChange={() => selectAnswer(question.id, option.id)}
                  />
                  <span>{option.text}</span>
                  {correct && <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#15803d' }}>Corect</span>}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {error && <div style={{ background: '#fee2e2', padding: '8px 12px', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}

      {result && (
        <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', color: '#166534' }}>
          <strong>Rezultat: </strong>
          {result.totalScore}/{result.maxScore} ( {result.percentage}% ) - trimis la{' '}
          {new Date(result.submittedAt).toLocaleTimeString()}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          background: '#2563eb',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 16px',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        {submitting ? 'Se trimit raspunsurile...' : `Trimite (${answeredCount}/${test.questions.length})`}
      </button>
    </form>
  );
}

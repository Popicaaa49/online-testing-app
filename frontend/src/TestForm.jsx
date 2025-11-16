import React, { useEffect, useState } from 'react';

const defaultQuestion = () => ({
  text: '',
  points: 1,
  options: [
    { text: '', correct: true },
    { text: '', correct: false }
  ]
});

const clone = (value) => JSON.parse(JSON.stringify(value));

function buildDraft(initialData) {
  if (!initialData) {
    return {
      title: '',
      category: '',
      description: '',
      durationMinutes: 30,
      questions: [defaultQuestion()]
    };
  }
  return {
    id: initialData.id,
    title: initialData.title ?? '',
    category: initialData.category ?? '',
    description: initialData.description ?? '',
    durationMinutes: initialData.durationMinutes ?? 30,
    questions:
      initialData.questions?.map((question) => ({
        text: question.text ?? '',
        points: question.points ?? 1,
        options:
          question.options?.map((option, idx) => ({
            text: option.text ?? '',
            correct: Boolean(option.correct) || idx === 0
          })) ?? defaultQuestion().options
      })) ?? [defaultQuestion()]
  };
}

export default function TestForm({ mode, initialData, onCancel, onSave, saving, error }) {
  const [form, setForm] = useState(() => buildDraft(initialData));

  useEffect(() => {
    setForm(buildDraft(initialData));
  }, [initialData]);

  const updateQuestion = (index, updater) => {
    setForm((prev) => {
      const next = clone(prev);
      next.questions[index] = updater(next.questions[index]);
      return next;
    });
  };

  const handleAddQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, defaultQuestion()]
    }));
  };

  const handleRemoveQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddOption = (questionIndex) => {
    updateQuestion(questionIndex, (question) => ({
      ...question,
      options: [...question.options, { text: '', correct: false }]
    }));
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    updateQuestion(questionIndex, (question) => {
      if (question.options.length <= 2) return question;
      const newOptions = question.options.filter((_, idx) => idx !== optionIndex);
      if (!newOptions.some((opt) => opt.correct)) {
        newOptions[0].correct = true;
      }
      return { ...question, options: newOptions };
    });
  };

  const markCorrectOption = (questionIndex, optionIndex) => {
    updateQuestion(questionIndex, (question) => ({
      ...question,
      options: question.options.map((option, idx) => ({
        ...option,
        correct: idx === optionIndex
      }))
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      category: form.category?.trim(),
      description: form.description?.trim(),
      durationMinutes: Number(form.durationMinutes) || 30,
      questions: form.questions.map((question, index) => ({
        text: question.text.trim(),
        points: Number(question.points) || 1,
        orderIndex: index + 1,
        options: question.options.map((option) => ({
          text: option.text.trim(),
          correct: option.correct
        }))
      }))
    };
    await onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 2 }}>
          <label>Titlu</label>
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5f5' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Categorie</label>
          <input
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5f5' }}
          />
        </div>
        <div style={{ width: '140px' }}>
          <label>Durata (min)</label>
          <input
            type="number"
            min="5"
            max="180"
            value={form.durationMinutes}
            onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5f5' }}
          />
        </div>
      </div>

      <div>
        <label>Descriere</label>
        <textarea
          rows="3"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5f5' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>Intrebari ({form.questions.length})</h4>
        <button type="button" onClick={handleAddQuestion} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px' }}>
          + Intrebare
        </button>
      </div>

      {form.questions.map((question, questionIndex) => (
        <div key={questionIndex} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label>Enunt intrebare #{questionIndex + 1}</label>
              <input
                value={question.text}
                onChange={(e) =>
                  updateQuestion(questionIndex, (q) => ({
                    ...q,
                    text: e.target.value
                  }))
                }
                required
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5f5' }}
              />
            </div>
            <div style={{ width: '100px' }}>
              <label>Puncte</label>
              <input
                type="number"
                min="1"
                value={question.points}
                onChange={(e) =>
                  updateQuestion(questionIndex, (q) => ({
                    ...q,
                    points: e.target.value
                  }))
                }
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5f5' }}
              />
            </div>
          </div>

          <div>
            <label>Optiuni de raspuns</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    checked={option.correct}
                    onChange={() => markCorrectOption(questionIndex, optionIndex)}
                  />
                  <input
                    value={option.text}
                    onChange={(e) =>
                      updateQuestion(questionIndex, (q) => {
                        const options = q.options.map((opt, idx) =>
                          idx === optionIndex ? { ...opt, text: e.target.value } : opt
                        );
                        return { ...q, options };
                      })
                    }
                    required
                    style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #cbd5f5' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                    disabled={question.options.length <= 2}
                    style={{ border: 'none', background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px' }}
                  >
                    X
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => handleAddOption(questionIndex)} style={{ alignSelf: 'flex-start', border: 'none', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px' }}>
                + Optiune
              </button>
            </div>
          </div>

          {form.questions.length > 1 && (
            <button type="button" onClick={() => handleRemoveQuestion(questionIndex)} style={{ alignSelf: 'flex-end', border: 'none', background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px' }}>
              Sterge intrebare
            </button>
          )}
        </div>
      ))}

      {error && <div style={{ background: '#fee2e2', padding: '8px 12px', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ border: '1px solid #94a3b8', borderRadius: '6px', padding: '8px 14px', background: '#fff' }}>
          Renunta
        </button>
        <button type="submit" disabled={saving} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 14px' }}>
          {saving ? 'Se salveaza...' : mode === 'edit' ? 'Actualizeaza testul' : 'Creeaza testul'}
        </button>
      </div>
    </form>
  );
}

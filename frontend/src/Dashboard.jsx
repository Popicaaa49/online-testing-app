import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  connectLiveUpdates,
  createTest,
  deleteTest,
  deleteSubmission,
  fetchTest,
  fetchTests,
  fetchSubmissions,
  submitTest,
  updateTest
} from './api';
import TestForm from './TestForm';
import TestRunner from './TestRunner';
import ActivityFeed from './ActivityFeed';

const layoutStyles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr 280px',
    gap: '16px',
    padding: '24px',
    alignItems: 'flex-start'
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.15)'
  },
  header: {
    padding: '16px 24px',
    background: '#0f172a',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    background: '#2563eb',
    border: 'none',
    color: '#fff',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  dangerButton: {
    background: '#dc2626',
    border: 'none',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default function Dashboard({ user, onLogout }) {
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [editorState, setEditorState] = useState(null); // { mode: 'create' | 'edit', data }
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [activity, setActivity] = useState([]);
  const selectedIdRef = useRef(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const isAdmin = useMemo(
    () => user?.roles?.some((role) => role === 'ROLE_ADMIN'),
    [user]
  );

  const loadTests = useCallback(async () => {
    setTestsLoading(true);
    try {
      const data = await fetchTests();
      setTests(data ?? []);
    } catch (err) {
      console.error(err);
      setStatus(err.message);
    } finally {
      setTestsLoading(false);
    }
  }, []);

  const loadSubmissions = useCallback(
    async (testId) => {
      if (!isAdmin || !testId) {
        setSubmissions([]);
        return;
      }
      setSubmissionsLoading(true);
      try {
        const data = await fetchSubmissions(testId);
        setSubmissions(data ?? []);
      } catch (err) {
        console.error(err);
        setStatus(err.message);
      } finally {
        setSubmissionsLoading(false);
      }
    },
    [isAdmin]
  );

  const loadTest = useCallback(
    async (id) => {
      if (!id) return;
      setSelectedLoading(true);
      selectedIdRef.current = id;
      try {
        const data = await fetchTest(id);
        setSelectedTest(data);
        await loadSubmissions(id);
      } catch (err) {
        console.error(err);
        setSelectedTest(null);
        setStatus(err.message);
      } finally {
        setSelectedLoading(false);
      }
    },
    [loadSubmissions]
  );

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(''), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    const disconnect = connectLiveUpdates({
      onTestEvent: (event) => {
        const message =
          event.type === 'CREATED'
            ? `Test nou: ${event.payload.title}`
            : event.type === 'UPDATED'
            ? `Test actualizat: ${event.payload.title}`
            : `Test sters: ${event.payload.title}`;
        setActivity((prev) => [
          { id: `${event.type}-${event.payload.id}-${Date.now()}`, message, timestamp: new Date().toISOString() },
          ...prev
        ].slice(0, 15));

        loadTests();

        if (selectedIdRef.current === event.payload.id) {
          if (event.type === 'DELETED') {
            setSelectedTest(null);
            selectedIdRef.current = null;
          } else {
            loadTest(event.payload.id);
          }
        }
      },
      onSubmission: (event) => {
        const message = `${event.participantName} a obtinut ${event.totalScore}/${event.maxScore} la ${event.testTitle}`;
        setActivity((prev) => [
          { id: `submission-${event.submissionId}`, message, timestamp: event.submittedAt },
          ...prev
        ].slice(0, 15));
        if (isAdmin && selectedIdRef.current === event.testId) {
          loadSubmissions(event.testId);
        }
      }
    });
    return disconnect;
  }, [isAdmin, loadSubmissions, loadTest, loadTests]);

  const handleSelect = (testId) => {
    setEditorState(null);
    setFormError('');
    loadTest(testId);
  };

  const handleNewTest = () => {
    setFormError('');
    setEditorState({ mode: 'create', data: null });
  };

  const handleEditTest = () => {
    if (!selectedTest) return;
    setFormError('');
    setEditorState({ mode: 'edit', data: selectedTest });
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Esti sigur ca vrei sa stergi testul?')) return;
    try {
      await deleteTest(id);
      setStatus('Test sters cu succes');
      setSelectedTest(null);
      selectedIdRef.current = null;
      loadTests();
      setSubmissions([]);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleSubmitAnswers = async (payload) => {
    if (!selectedTest) return null;
    try {
      const result = await submitTest(selectedTest.id, payload);
      setStatus(`Rezultat trimis pentru ${payload.participantName}`);
      await loadSubmissions(selectedTest.id);
      return result;
    } catch (err) {
      setStatus(err.message);
      throw err;
    }
  };

  const handleSaveTest = async (payload) => {
    setFormSaving(true);
    setFormError('');
    try {
      let saved;
      if (editorState?.mode === 'edit' && editorState.data?.id) {
        saved = await updateTest(editorState.data.id, payload);
      } else {
        saved = await createTest(payload);
      }
      setEditorState(null);
      setSelectedTest(saved);
      selectedIdRef.current = saved.id;
      setStatus('Test salvat cu succes');
      loadTests();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!selectedTest) return;
    if (!window.confirm('Stergi aceasta trimitere?')) return;
    try {
      await deleteSubmission(submissionId);
      setStatus('Submisie stearsa');
      await loadSubmissions(selectedTest.id);
    } catch (err) {
      setStatus(err.message);
    }
  };

  const currentSelectionTitle = selectedTest ? selectedTest.title : 'Selecteaza un test';

  return (
    <div style={{ background: '#f6f8fb', minHeight: '100vh' }}>
      <header style={layoutStyles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Online Testing Room</h2>
          <p style={{ margin: 0, color: '#94a3b8' }}>
            Autentificat ca {user.username} ({isAdmin ? 'Administrator' : 'Participant'})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ ...layoutStyles.button, background: '#475569' }} onClick={onLogout}>
            Logout
          </button>
          {isAdmin && (
            <button style={layoutStyles.button} onClick={handleNewTest}>
              + Test nou
            </button>
          )}
        </div>
      </header>

      {status && (
        <div style={{ background: '#ecfccb', color: '#3f6212', margin: '12px 24px', padding: '12px', borderRadius: '8px' }}>
          {status}
        </div>
      )}

      <div style={layoutStyles.container}>
        <aside style={layoutStyles.card}>
          <h3>Teste disponibile</h3>
          {testsLoading && <p>Se incarca...</p>}
          {!testsLoading && tests.length === 0 && <p>Nu exista teste inca.</p>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tests.map((test) => (
              <li key={test.id}>
                <button
                  onClick={() => handleSelect(test.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: selectedIdRef.current === test.id ? '#dbeafe' : '#fff',
                    padding: '10px'
                  }}
                >
                  <strong>{test.title}</strong>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {test.questionCount} intrebari • {test.category ?? 'General'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section style={layoutStyles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{currentSelectionTitle}</h3>
            {isAdmin && selectedTest && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={layoutStyles.button} onClick={handleEditTest}>
                  Editeaza
                </button>
                <button style={layoutStyles.dangerButton} onClick={() => handleDeleteTest(selectedTest.id)}>
                  Sterge
                </button>
              </div>
            )}
          </div>

          {!selectedTest && !editorState && (
            <p>Alege un test din lista din stanga sau creeaza un test nou.</p>
          )}

          {editorState && (
            <TestForm
              mode={editorState.mode}
              initialData={editorState.data}
              onCancel={() => setEditorState(null)}
              onSave={handleSaveTest}
              saving={formSaving}
              error={formError}
            />
          )}

          {!editorState && selectedTest && (
            <TestRunner
              test={selectedTest}
              loading={selectedLoading}
              defaultParticipant={user.username}
              onSubmit={handleSubmitAnswers}
              showSolutions={isAdmin}
            />
          )}
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isAdmin && (
            <div style={layoutStyles.card}>
              <h3>Rezultate primite</h3>
              {selectedTest ? (
                <>
                  {submissionsLoading && <p>Se incarca rezultatele...</p>}
                  {!submissionsLoading && submissions.length === 0 && <p>Nu exista trimiteri pentru acest test.</p>}
                  {!submissionsLoading && submissions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {submissions.map((s) => {
                        const pct = s.maxScore ? Math.round((s.totalScore * 10000) / s.maxScore) / 100 : 0;
                        return (
                          <div
                            key={s.submissionId}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong>{s.participantName}</strong>
                              <button
                                onClick={() => handleDeleteSubmission(s.submissionId)}
                                style={{ ...layoutStyles.dangerButton, padding: '4px 8px', fontSize: '12px' }}
                              >
                                Sterge
                              </button>
                            </div>
                            <div style={{ fontSize: '13px', color: '#475569' }}>
                              Scor: {s.totalScore}/{s.maxScore} ({pct}%)
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              Trimisa la {new Date(s.submittedAt).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p>Selecteaza un test pentru a vedea rezultatele.</p>
              )}
            </div>
          )}
          <div style={layoutStyles.card}>
            <ActivityFeed items={activity} />
          </div>
        </aside>
      </div>
    </div>
  );
}

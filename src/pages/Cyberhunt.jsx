import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { connectCyberhuntSocket, cyberhuntRequest, CYBERHUNT_ADMIN_TOKEN, CYBERHUNT_TEAM_TOKEN, formatCyberhuntTime } from '../lib/cyberhunt';
import { usePageTitle } from '../lib/hooks';
import './Cyberhunt.css';

const archiveIds = ['001', '004', '007', '014', '019', '021', '024', '031'];
const deadPageIds = archiveIds.slice(1);
const stageNames = [
  ['001', 'FIRST DISAPPEARANCE'],
  ['graveyard', 'THE DEAD INTERNET'],
  ['null17', 'NULL_17'],
  ['echo-file01', 'PROJECT ECHO / FILE_01'],
  ['echo-file02', 'PROJECT ECHO / FILE_02'],
  ['recovery', 'RECOVERY'],
  ['final', 'FINAL INVESTIGATION'],
];
const questions = [
  'WHO WAS SUBJECT 001?',
  'WHAT WAS PROJECT ECHO?',
  'WHY WERE THE WEBSITES DELETED?',
  'WHAT WAS SIGNIFICANT ABOUT 03:17?',
  'WHAT WERE THEY TRYING TO ERASE?',
];
const nextStage = {
  '001': 'graveyard',
  graveyard: 'null17',
  null17: 'echo',
  'echo-file01': 'echo',
  'echo-file02': 'recovery',
};

function getRoute() {
  return window.location.pathname.replace(/\/+$/, '').split('/').slice(3).join('/');
}

function CyberHeader({ event, token, onLogout }) {
  return (
    <header className="cyber-header">
      <Link className="cyber-brand" to="/events/cyberhunt" aria-label="Cyberhunt home">
        <span className="cyber-brand__mark">CH</span>
        <span>CTSoc<span className="cyber-slash">/</span>CYBERHUNT</span>
      </Link>
      <div className="cyber-header__status">
        {token && event ? (
          <span className={`cyber-event-state cyber-event-state--${event.status}`}>
            <i aria-hidden="true" /> EVENT {event.status.toUpperCase()}
          </span>
        ) : null}
        {token && event ? <span className="cyber-event-clock">{formatCyberhuntTime(event.remainingMs)}</span> : null}
        {token ? <button className="cyber-logout" type="button" onClick={onLogout}>SIGN OUT</button> : null}
        <Link to="/events" className="cyber-exit">EXIT ARCHIVE</Link>
      </div>
    </header>
  );
}

function TerminalLine({ children, tone = '' }) {
  return <p className={`cyber-terminal-line ${tone ? `cyber-terminal-line--${tone}` : ''}`}>{children}</p>;
}

function PurgeOverlay({ purge, onDismiss }) {
  const percent = purge.percent ?? (purge.step ? [8, 19, 37, 54, 71, 89, 100][purge.step - 1] : 8);
  return (
    <div className="cyber-purge" role="alertdialog" aria-modal="true" aria-labelledby="cyber-purge-title">
      <div className="cyber-purge__panel">
        <p className="cyber-kicker">SYSTEM ALERT / {String(percent).padStart(2, '0')}%</p>
        <h2 id="cyber-purge-title">{purge.done ? 'ARCHIVE DELETED' : 'UNAUTHORIZED ACCESS DETECTED.'}</h2>
        <TerminalLine tone="error">{purge.done ? 'ERROR 410 — THE TRUTH IS GONE.' : 'PURGING ARCHIVE...'}</TerminalLine>
        <div className="cyber-progress" aria-label={`Archive purge ${percent}% complete`}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="cyber-purge__percent">{String(percent).padStart(2, '0')}%</p>
        {purge.done ? (
          <>
            <TerminalLine>ONE FILE SURVIVED.</TerminalLine>
            <Link className="cyber-button" to="/events/cyberhunt/recovery" onClick={onDismiss}>RECOVER FILE <span>→</span></Link>
          </>
        ) : (
          <p className="cyber-muted">Keep this page open. The archive is changing for every connected investigator.</p>
        )}
      </div>
    </div>
  );
}

function TeamGate({ onLogin, busy, error }) {
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  return (
    <form className="cyber-panel cyber-team-form" onSubmit={(event) => {
      event.preventDefault();
      onLogin({ teamName, teamCode });
    }}>
      <p className="cyber-kicker">TEAM RESTORE / PROGRESS SAVED SERVER-SIDE</p>
      <label>TEAM NAME<input required minLength="2" maxLength="50" value={teamName} onChange={(event) => setTeamName(event.target.value)} autoComplete="organization" /></label>
      <label>TEAM CODE<input required minLength="6" maxLength="32" pattern="(?:[A-Za-z0-9_]|-){6,32}" value={teamCode} onChange={(event) => setTeamCode(event.target.value)} autoComplete="off" aria-describedby="cyber-team-code-help" /></label>
      <small id="cyber-team-code-help" className="cyber-muted">Use the same team name and code to restore your saved progress on another visit.</small>
      {error ? <p className="cyber-error" role="alert">{error}</p> : null}
      <button className="cyber-button" disabled={busy}>{busy ? 'RESTORING...' : 'START HUNT'} <span>→</span></button>
    </form>
  );
}

function AnswerForm({ stage, hints, onAnswer, onHint, busy, answerNotice }) {
  const [answer, setAnswer] = useState('');
  const [hintBusy, setHintBusy] = useState(false);
  const [hintError, setHintError] = useState('');
  const stageHints = hints.filter((hint) => hint.stage === stage);
  async function requestHint() {
    setHintBusy(true);
    setHintError('');
    try {
      await onHint(stage);
    } catch (error) {
      setHintError(error.message);
    } finally {
      setHintBusy(false);
    }
  }
  return (
    <div className="cyber-answer-wrap">
      <form className="cyber-answer" onSubmit={(event) => {
        event.preventDefault();
        onAnswer({ stage, answer });
      }}>
        <label htmlFor={`answer-${stage}`}>ENTER TRACE</label>
        <input id={`answer-${stage}`} value={answer} onChange={(event) => setAnswer(event.target.value)} autoComplete="off" spellCheck="false" maxLength={160} />
        <button className="cyber-button" disabled={busy || !answer.trim()}>{busy ? 'CHECKING...' : 'SUBMIT'} <span>↵</span></button>
      </form>
      {answerNotice ? <p className={`cyber-notice cyber-notice--${answerNotice.correct ? 'success' : 'error'}`} role="status">{answerNotice.message}</p> : null}
      <button className="cyber-hint-button" type="button" disabled={hintBusy} onClick={requestHint}>{hintBusy ? 'RETRIEVING...' : 'REQUEST A HINT'} <span>−{(stageHints.length + 1) * 5} PTS</span></button>
      {hintError ? <p className="cyber-error" role="alert">{hintError}</p> : null}
      {stageHints.length ? (
        <ol className="cyber-hints" aria-label="Recovered hints">
          {stageHints.map((hint) => <li key={`${hint.stage}-${hint.hintNumber}`}><span>HINT {hint.hintNumber}</span>{hint.message}</li>)}
        </ol>
      ) : null}
    </div>
  );
}

function Landing() {
  return (
    <section className="cyber-landing">
      <p className="cyber-kicker">IEEE CTSoc | CUSB · SIMULATED INVESTIGATION</p>
      <h1><span>CYBERHUNT</span><strong>DEAD INTERNET</strong></h1>
      <div className="cyber-landing__story">
        <TerminalLine tone="error">&gt; THE INTERNET IS DYING.</TerminalLine>
        <TerminalLine>&gt; Someone is deleting the evidence.</TerminalLine>
        <TerminalLine>&gt; Find it before it disappears.</TerminalLine>
      </div>
      <Link className="cyber-button cyber-button--large" to="/events/cyberhunt/start">ENTER THE HUNT <span>→</span></Link>
      <div className="cyber-system-readout">
        <span>CONNECTION: <b>UNSTABLE</b></span>
        <span>ARCHIVE: <b>CORRUPTED</b></span>
        <span>STATUS: <b className="cyber-ok">ONLINE</b></span>
      </div>
      <p className="cyber-simulation-note">A fictional, in-app puzzle investigation. No real systems are accessed.</p>
    </section>
  );
}

function StartBriefing({ onLogin, busy, error }) {
  return (
    <section className="cyber-content">
      <p className="cyber-kicker">ARCHIVE ENTRY / 00</p>
      <h1>BEFORE YOU BEGIN</h1>
      <div className="cyber-panel cyber-briefing">
        <TerminalLine>&gt; You have entered a disappearing archive.</TerminalLine>
        <TerminalLine>&gt; Every clue leads somewhere.</TerminalLine>
        <TerminalLine>&gt; Every answer unlocks something.</TerminalLine>
        <TerminalLine>&gt; Some pages may disappear.</TerminalLine>
        <TerminalLine tone="warning">&gt; Do not trust everything you see.</TerminalLine>
      </div>
      <TeamGate onLogin={onLogin} busy={busy} error={error} />
    </section>
  );
}

function FirstDisappearance({ data, onAnswer, onHint, busy, hints, answerNotice }) {
  const [seconds, setSeconds] = useState(Math.max(0, 47 - Math.floor((data.elapsedMs ?? 0) / 1000)));
  useEffect(() => {
    const origin = Date.now() - (data.elapsedMs ?? 0);
    const tick = () => setSeconds(Math.max(0, 47 - Math.floor((Date.now() - origin) / 1000)));
    tick();
    const timer = setInterval(tick, 150);
    return () => clearInterval(timer);
  }, [data.elapsedMs]);
  return (
    <section className="cyber-content">
      <p className="cyber-kicker">ARCHIVE NODE / 001</p>
      <h1>FIRST DISAPPEARANCE</h1>
      <div className="cyber-panel cyber-connection">
        {seconds > 0 && !data.gone ? (
          <>
            <TerminalLine tone="success">CONNECTION ESTABLISHED.</TerminalLine>
            <div className="cyber-timeout" role="timer" aria-label={`${seconds} seconds until this page disappears`}>{String(seconds).padStart(2, '0')}</div>
            <p className="cyber-muted">ARCHIVE RESPONSE WINDOW</p>
          </>
        ) : (
          <>
            <p className="cyber-error-title">ERROR 410</p>
            <h2>THIS PAGE IS GONE.</h2>
            <TerminalLine>&gt; You were 00:47 seconds too late.</TerminalLine>
            <TerminalLine>&gt; Nothing disappears without leaving a trace.</TerminalLine>
            <div className="cyber-trace">
              <span>TRACE:</span>
              <code>4F 50 45 4E</code>
            </div>
          </>
        )}
      </div>
      {seconds === 0 || data.gone ? (
        <AnswerForm stage="001" hints={hints} onAnswer={onAnswer} onHint={onHint} busy={busy} answerNotice={answerNotice} />
      ) : null}
    </section>
  );
}

function DeadInternet({ data, onAnswer, onHint, busy, hints, answerNotice }) {
  return (
    <section className="cyber-content">
      <p className="cyber-kicker">ARCHIVE INDEX / CORRUPTION 17%</p>
      <h1>THE DEAD INTERNET</h1>
      <div className="cyber-panel">
        <TerminalLine>&gt; Some pages are dead.</TerminalLine>
        <TerminalLine>&gt; Some pages were never meant to be found.</TerminalLine>
        <p className="cyber-corruption">ARCHIVE STATUS: 17% CORRUPTED</p>
        <div className="cyber-archive-grid">
          {archiveIds.map((id) => (
            <Link className="cyber-archive-link" to={`/events/cyberhunt/${id}`} key={id}>
              <span>{id}</span><b>410 GONE</b><span>OPEN RECORD →</span>
            </Link>
          ))}
        </div>
        {data.event?.purgeCompletedAt ? (
          <div className="cyber-reassembled">
            <p className="cyber-kicker">RECOVERED FRAGMENTS</p>
            <p>SUBJECT 001 SAW THE EVENT BEFORE IT HAPPENED.</p>
            <small>{data.discoveryComplete ? 'ALL EIGHT RECORDS REVISITED · INVESTIGATION UNSEALED' : 'Revisit every archive record to complete recovery.'}</small>
          </div>
        ) : null}
      </div>
      {data.event?.purgeCompletedAt ? (
        data.discoveryComplete
          ? <Link className="cyber-button" to="/events/cyberhunt/final">CONTINUE TO FINAL INVESTIGATION →</Link>
          : <p className="cyber-muted">Open every recovered page above to record all fragments.</p>
      ) : (
        <div className="cyber-discovery">
          <AnswerForm stage="graveyard" hints={hints} onAnswer={onAnswer} onHint={onHint} busy={busy} answerNotice={answerNotice} />
        </div>
      )}
    </section>
  );
}

function DeadPage({ id, data }) {
  const fragment = data.fragment;
  const hasFragment = Boolean(fragment);
  return (
    <section className="cyber-content cyber-dead-page">
      <p className="cyber-kicker">ARCHIVE RECORD / {id}</p>
      <p className="cyber-error-title">ERROR 410 — ARCHIVE GONE</p>
      <h1>THIS PAGE NO LONGER EXISTS.</h1>
      <div className="cyber-panel">
        <p className="cyber-dead-stamp">410 <span>GONE</span></p>
        {hasFragment ? (
          <>
            <p className="cyber-kicker">{data.purged ? 'RECOVERED FRAGMENT' : 'FRAGMENT RECOVERED'}</p>
            <strong className="cyber-fragment">{fragment}</strong>
          </>
        ) : <TerminalLine>NO TRACE FOUND.</TerminalLine>}
        <TerminalLine tone="error">CONNECTION INTERRUPTED.</TerminalLine>
      </div>
      <Link className="cyber-text-link" to="/events/cyberhunt/graveyard">← RETURN TO THE DEAD INTERNET</Link>
    </section>
  );
}

function NullProfile({ data, onAnswer, onHint, busy, hints, answerNotice }) {
  return (
    <section className="cyber-content">
      <p className="cyber-kicker">RECOVERED USER PROFILE / 17</p>
      <h1>USER FOUND</h1>
      <div className="cyber-panel cyber-profile">
        <div className="cyber-profile__heading"><strong>{data.profile?.handle ?? '@NULL_17'}</strong><span>STATUS: DELETED</span></div>
        <div className="cyber-profile__facts"><span>LAST ACTIVE: 03:17</span><span>POSTS: 05</span></div>
        <ol className="cyber-posts">
          {(data.posts ?? []).map((post, index) => (
            <li key={`${post.date ?? 'post'}-${index}`}>
              <small>{post.date ?? `ARCHIVED POST / 0${index + 1}`}</small>
              <p>{post.text}</p>
              {post.file ? <div className="cyber-archive-image" role="img" aria-label="Recovered image named IMG_0317.jpg showing a clock at 03:17"><span>◷</span><b>03:17</b><small>{post.file}</small></div> : null}
            </li>
          ))}
        </ol>
        <div className="cyber-source-clue" dangerouslySetInnerHTML={{ __html: '<!-- ECHO -->' }} />
      </div>
      <AnswerForm stage="null17" hints={hints} onAnswer={onAnswer} onHint={onHint} busy={busy} answerNotice={answerNotice} />
    </section>
  );
}

function EchoProject({ file, onAnswer, onHint, busy, hints, answerNotice }) {
  const stage = file === '01' ? 'echo-file01' : 'echo-file02';
  return (
    <section className="cyber-content">
      <p className="cyber-kicker">PROJECT RECOVERY / {file}</p>
      <h1>PROJECT ECHO</h1>
      <div className="cyber-panel">
        <div className="cyber-file-tabs"><span className={file === '01' ? 'is-active' : ''}>FILE_01</span><span className={file === '02' ? 'is-active' : ''}>FILE_02</span></div>
        <p className="cyber-file-status">ARCHIVE STATUS: PARTIALLY RECOVERED</p>
        <pre className="cyber-file-content">{(file === '01' ? [
          'PROJECT ECHO',
          'CLASSIFICATION: REDACTED',
          '',
          'PROJECT START: 2019',
          'PROJECT END: 2026',
          'PERSONNEL: 04',
          'SUBJECT: 001',
          'STATUS: REDACTED',
          '',
          'WARNING: DO NOT RESTORE SUBJECT 001.',
          '',
          'RECOVERY KEY: Rk9VUg==',
        ] : [
          'FOUR FILES EXISTED.',
          '',
          'FILE A — 03:14',
          'FILE B — 03:17',
          'FILE C — 03:21',
          'FILE D — 03:31',
          '',
          'Only one survived.',
        ]).join('\n')}</pre>
        {file === '02' && data.witnessConfirmed ? (
          <div className="cyber-witness-reveal">
            <TerminalLine>&gt; SUBJECT 001 WAS NOT THE CREATOR.</TerminalLine>
            <TerminalLine>&gt; SUBJECT 001 WAS THE WITNESS.</TerminalLine>
            {data.event?.purgeCompletedAt
              ? <Link className="cyber-button" to="/events/cyberhunt/recovery">RECOVER FILE →</Link>
              : <p className="cyber-muted">Awaiting archive purge. Keep this record open.</p>}
          </div>
        ) : null}
      </div>
      <AnswerForm stage={stage} hints={hints} onAnswer={onAnswer} onHint={onHint} busy={busy} answerNotice={answerNotice} />
    </section>
  );
}

function Recovery({ onDataLoaded }) {
  return (
    <section className="cyber-content">
      <p className="cyber-kicker">RECOVERY COMPLETE / FILE FOUND</p>
      <h1>ECHO_RECOVERY.txt</h1>
      <div className="cyber-panel cyber-recovery">
        <TerminalLine>&gt; THEY DID NOT DELETE THE PROJECT.</TerminalLine>
        <TerminalLine>&gt; THEY DELETED THE WITNESS.</TerminalLine>
        <p>SUBJECT 001: <strong>████████████</strong></p>
        <p>LAST MESSAGE:</p>
        <blockquote>“If the archive disappears,<br />look for the places that disappeared first.”</blockquote>
        <p className="cyber-kicker">REVISIT THE DEAD PAGES.</p>
      </div>
      <Link className="cyber-button" to="/events/cyberhunt/graveyard" onClick={onDataLoaded}>REVISIT ARCHIVE →</Link>
    </section>
  );
}

function FinalInvestigation({ data, onSubmit, busy, error, result, onHint, hints }) {
  const [answers, setAnswers] = useState(Array(5).fill(''));
  const fragmentsMissing = (data.fragmentsRequired ?? []).filter((id) => !(data.fragmentsSeen ?? []).includes(id));
  if (data.submitted || result) {
    const final = data.finalSubmission;
    const correctness = result?.correctness ?? final?.correctness ?? [];
    return (
      <section className="cyber-content">
        <p className="cyber-kicker">CASE FILE / SEALED</p>
        <h1>INVESTIGATION RECEIVED</h1>
        <div className="cyber-panel">
          <TerminalLine tone="success">SUBMISSION ARCHIVED.</TerminalLine>
          <p>{correctness.filter(Boolean).length} / 5 findings supported.</p>
          <p>FINAL SCORE: {result?.totalScore ?? final?.score ?? '—'}</p>
          <p className="cyber-muted">The investigation is complete. Your evidence has been recorded.</p>
        </div>
      </section>
    );
  }
  if (fragmentsMissing.length) {
    return (
      <section className="cyber-content">
        <p className="cyber-kicker">INVESTIGATION LOCKED</p>
        <h1>REASSEMBLE THE ARCHIVE.</h1>
        <div className="cyber-panel"><TerminalLine tone="warning">Every recovered dead page must be revisited before final submission.</TerminalLine><p>{fragmentsMissing.length} archive record(s) remain unopened.</p><Link className="cyber-button" to="/events/cyberhunt/graveyard">RETURN TO ARCHIVE →</Link></div>
      </section>
    );
  }
  return (
    <section className="cyber-content">
      <p className="cyber-kicker">CASE FILE / LAST ENTRY</p>
      <h1>FINAL INVESTIGATION</h1>
      <div className="cyber-panel">
        <TerminalLine>&gt; You recovered the witness.</TerminalLine>
        <TerminalLine>&gt; You found the archive.</TerminalLine>
        <TerminalLine>&gt; You discovered what they were trying to hide.</TerminalLine>
        <TerminalLine>&gt; Now reconstruct the truth.</TerminalLine>
      </div>
      <form className="cyber-final-form" onSubmit={(event) => { event.preventDefault(); onSubmit(answers); }}>
        {questions.map((question, index) => (
          <label key={question}><span>{String(index + 1).padStart(2, '0')} / {question}</span><textarea required rows="2" maxLength="1000" value={answers[index]} onChange={(event) => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))} /></label>
        ))}
        {error ? <p className="cyber-error" role="alert">{error}</p> : null}
        <button className="cyber-button" disabled={busy || answers.some((answer) => !answer.trim())}>{busy ? 'ARCHIVING...' : 'SUBMIT FINAL INVESTIGATION'} <span>→</span></button>
      </form>
      <div className="cyber-final-hint"><AnswerForm stage="final" hints={hints} onAnswer={() => {}} onHint={onHint} busy={busy} /></div>
    </section>
  );
}

function AdminLogin({ onLogin, busy, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form className="cyber-panel cyber-admin-login" onSubmit={(event) => { event.preventDefault(); onLogin({ username, password }); }}>
      <p className="cyber-kicker">RESTRICTED CONSOLE / ORGANIZERS</p>
      <label>ORGANIZER ID<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label>
      <label>ACCESS KEY<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
      {import.meta.env.DEV ? <small className="cyber-muted">Local demo: admin / cyberhunt2026</small> : null}
      {error ? <p className="cyber-error" role="alert">{error}</p> : null}
      <button className="cyber-button" disabled={busy}>{busy ? 'AUTHENTICATING...' : 'AUTHENTICATE'} <span>→</span></button>
    </form>
  );
}

function AdminDashboard({ data, refresh, onLogout, onAction, busy, error, notice }) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedStage, setSelectedStage] = useState('001');
  const [duration, setDuration] = useState(data.event?.durationSeconds ?? 10800);
  const [purgeAt, setPurgeAt] = useState('');
  const [tab, setTab] = useState('teams');
  const selected = data.teams.find((team) => team.teamId === selectedTeam);
  const exportResults = () => {
    const content = JSON.stringify({ teams: data.teams, submissions: data.finalSubmissions, scoreEvents: data.scoreEvents }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'cyberhunt-results.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="cyber-admin">
      <div className="cyber-admin__heading">
        <div><p className="cyber-kicker">RESTRICTED ORGANIZER CONSOLE</p><h1>CYBERHUNT ADMIN</h1></div>
        <button className="cyber-logout" onClick={onLogout}>SIGN OUT</button>
      </div>
      <div className="cyber-panel cyber-admin__event">
        <div><span className="cyber-kicker">EVENT STATUS</span><strong className={`cyber-admin__status cyber-admin__status--${data.event?.status}`}>{data.event?.status?.toUpperCase()}</strong></div>
        <div className="cyber-admin__actions">
          <button onClick={() => onAction('/admin/event', { action: 'start' })} disabled={busy}>START EVENT</button>
          <button onClick={() => onAction('/admin/event', { action: 'end' })} disabled={busy}>END EVENT</button>
          <button className="cyber-admin__danger" onClick={() => onAction('/admin/purge', { active: true })} disabled={busy || data.event?.purgeActive}>START PURGE</button>
          <button onClick={() => onAction('/admin/purge', { active: false })} disabled={busy}>END / RESET PURGE</button>
          <button onClick={() => onAction('/admin/event', { action: 'reset' })} disabled={busy}>RESET EVENT</button>
        </div>
        <form className="cyber-admin__config" onSubmit={(event) => { event.preventDefault(); onAction('/admin/event', { action: 'configure', durationSeconds: Number(duration), purgeAt: purgeAt ? new Date(purgeAt).toISOString() : null }); }}>
          <label>EVENT DURATION (SECONDS)<input type="number" min="60" max="86400" value={duration} onChange={(event) => setDuration(event.target.value)} /></label>
          <label>PURGE TIME (OPTIONAL)<input type="datetime-local" value={purgeAt} onChange={(event) => setPurgeAt(event.target.value)} /></label>
          <button disabled={busy}>SAVE TIMER</button>
        </form>
      </div>
      <div className="cyber-panel cyber-admin__controls">
        <label>STAGE<select value={selectedStage} onChange={(event) => setSelectedStage(event.target.value)}>{stageNames.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></label>
        <button onClick={() => onAction('/admin/stage-lock', { stage: selectedStage, locked: true })} disabled={busy}>LOCK STAGE</button>
        <button onClick={() => onAction('/admin/stage-lock', { stage: selectedStage, locked: false })} disabled={busy}>UNLOCK STAGE</button>
        <label>TEAM<select value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)}><option value="">Select a team</option>{data.teams.map((team) => <option value={team.teamId} key={team.teamId}>{team.name}</option>)}</select></label>
        <button onClick={() => selectedTeam && onAction('/admin/team/reset', { teamId: selectedTeam })} disabled={busy || !selectedTeam}>RESET TEAM</button>
        <button onClick={() => selectedTeam && onAction('/admin/team/skip', { teamId: selectedTeam })} disabled={busy || !selectedTeam}>SKIP STAGE</button>
        <button onClick={() => selectedTeam && onAction('/admin/team/test-answer', { teamId: selectedTeam }, 'DEMO ANSWER ACCEPTED.')} disabled={busy || !selectedTeam}>TEST NEXT ANSWER</button>
        <button onClick={() => selectedTeam && onAction('/admin/hint', { teamId: selectedTeam, stage: selected?.currentStage })} disabled={busy || !selectedTeam}>TEST HINT</button>
      </div>
      <div className="cyber-admin__tabs" role="tablist">
        {['teams', 'scores', 'submissions'].map((name) => <button role="tab" aria-selected={tab === name} className={tab === name ? 'is-active' : ''} onClick={() => { setTab(name); refresh(); }} key={name}>{name === 'teams' ? 'TEAMS' : name === 'scores' ? 'SCORES' : 'FINAL SUBMISSIONS'}</button>)}
        <button onClick={exportResults}>EXPORT RESULTS ↓</button>
      </div>
      {tab === 'teams' ? (
        <div className="cyber-panel cyber-admin__table-wrap"><table><thead><tr><th>TEAM</th><th>STAGE</th><th>SCORE</th><th>HINTS</th><th>TIME</th><th>STATUS</th></tr></thead><tbody>
          {data.teams.map((team) => <tr key={team.teamId}><td>{team.name}</td><td>{team.currentStage}</td><td>{team.score}</td><td>{team.hintsUsedCount}</td><td>{formatCyberhuntTime(team.elapsedMs)}</td><td>{team.status}</td></tr>)}
          {!data.teams.length ? <tr><td colSpan="6">NO TEAMS HAVE ENTERED THE ARCHIVE.</td></tr> : null}
        </tbody></table></div>
      ) : tab === 'scores' ? (
        <div className="cyber-panel cyber-admin__table-wrap"><table><thead><tr><th>TEAM</th><th>STAGE</th><th>SCORE</th></tr></thead><tbody>{data.scores.map((team) => <tr key={team.teamId}><td>{team.name}</td><td>{team.currentStage}</td><td>{team.score}</td></tr>)}</tbody></table></div>
      ) : (
        <div className="cyber-panel cyber-submissions">{data.finalSubmissions.length ? data.finalSubmissions.map((submission) => <article key={submission.submissionId}><h2>{submission.teamName} · {submission.totalScore} PTS</h2><time>{new Date(submission.submittedAt).toLocaleString()}</time><ol>{submission.answers.map((answer, index) => <li key={index}><b>{questions[index]}</b><p>{answer}</p><span>{submission.correctness[index] ? 'SUPPORTED' : 'NOT SUPPORTED'}</span></li>)}</ol></article>) : <p>NO FINAL INVESTIGATIONS SUBMITTED.</p>}</div>
      )}
      {error ? <p className="cyber-error" role="alert">{error}</p> : null}
      {notice ? <p className="cyber-notice cyber-notice--success" role="status">{notice}</p> : null}
      <p className="cyber-muted">Demo controls are organizer-only. Progress and scores are stored server-side; browser storage contains session tokens only.</p>
    </section>
  );
}

export default function Cyberhunt() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = useMemo(getRoute, [location.pathname]);
  const isAdmin = route === 'admin';
  const teamRoute = route !== '' && route !== 'start' && !isAdmin;
  const [teamToken, setTeamToken] = useState(() => window.localStorage.getItem(CYBERHUNT_TEAM_TOKEN) ?? '');
  const [adminToken, setAdminToken] = useState(() => window.localStorage.getItem(CYBERHUNT_ADMIN_TOKEN) ?? '');
  const token = isAdmin ? adminToken : teamToken;
  const [team, setTeam] = useState(null);
  const [event, setEvent] = useState(null);
  const [data, setData] = useState(null);
  const [stageData, setStageData] = useState(null);
  const [hints, setHints] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [answerNotice, setAnswerNotice] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [purge, setPurge] = useState(null);

  usePageTitle(isAdmin ? 'Cyberhunt Admin' : 'Cyberhunt: Dead Internet');

  const loadSession = useCallback(async () => {
    if (!token) return;
    try {
      const session = await cyberhuntRequest('/me', { token });
      let stageError = '';
      setTeam(session.team?.team ?? null);
      setEvent(session.admin?.event ?? session.team?.event ?? null);
      setData(session.admin ?? null);
      setHints(session.team?.hints ?? []);
      if (!isAdmin && teamRoute) {
        try {
          const stage = await cyberhuntRequest(`/stage/${route}`, { token });
          setStageData(stage);
          if (stage.event) setEvent(stage.event);
        } catch (error) {
          stageError = error.message;
        }
      } else {
        setStageData(null);
      }
      setError(stageError);
    } catch (sessionError) {
      window.localStorage.removeItem(isAdmin ? CYBERHUNT_ADMIN_TOKEN : CYBERHUNT_TEAM_TOKEN);
      if (isAdmin) setAdminToken('');
      else setTeamToken('');
      setError(sessionError.message);
    }
  }, [isAdmin, route, teamRoute, token]);

  useEffect(() => {
    setStageData(null);
    setAnswerNotice(null);
    setError('');
    setNotice('');
    if (token) loadSession();
  }, [location.pathname, token, loadSession]);

  useEffect(() => {
    if (!token) return undefined;
    const socket = connectCyberhuntSocket(token);
    socket.on('cyberhunt:state', (next) => {
      setEvent(next);
      if (next.purgeActive) {
        const percent = [8, 19, 37, 54, 71, 89, 100][Math.max(0, next.purgeStep - 1)];
        setPurge({ step: next.purgeStep, percent: percent ?? 8, done: false });
      }
    });
    socket.on('cyberhunt:purge-progress', (next) => {
      setPurge({ ...next, done: false });
    });
    socket.on('cyberhunt:purge-complete', (next) => {
      setEvent((current) => current ? { ...current, purgeActive: false, purgeCompletedAt: next.completedAt } : current);
      setPurge({ percent: 100, done: true });
    });
    socket.on('cyberhunt:team-update', (next) => {
      setTeam(next?.team ?? null);
      setHints(next?.hints ?? []);
      setEvent(next?.event ?? null);
    });
    socket.on('cyberhunt:admin-update', (next) => {
      setData(next);
      setEvent(next?.event ?? null);
    });
    socket.on('connect_error', () => setError('CONNECTION INTERRUPTED. Real-time archive sync could not connect.'));
    return () => socket.disconnect();
  }, [token]);

  const participantLogin = async ({ teamName, teamCode }) => {
    setBusy(true);
    setError('');
    try {
      const result = await cyberhuntRequest('/team/start', { method: 'POST', body: { teamName, teamCode } });
      window.localStorage.setItem(CYBERHUNT_TEAM_TOKEN, result.token);
      setTeamToken(result.token);
      setTeam(result.team.team);
      setEvent(result.team.event);
      navigate('/events/cyberhunt/001');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  };

  const adminLogin = async ({ username, password }) => {
    setBusy(true);
    setError('');
    try {
      const result = await cyberhuntRequest('/admin/login', { method: 'POST', body: { username, password } });
      window.localStorage.setItem(CYBERHUNT_ADMIN_TOKEN, result.token);
      setAdminToken(result.token);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  };

  const answer = async ({ stage, answer: submitted }) => {
    setBusy(true);
    setAnswerNotice(null);
    setError('');
    try {
      const result = await cyberhuntRequest('/answer', { token: teamToken, method: 'POST', body: { stage, answer: submitted } });
      setTeam(result.team.team);
      setEvent(result.team.event);
      setHints(result.team.hints);
      setAnswerNotice({ correct: true, message: `${result.message} +${result.pointsAwarded} POINTS` });
      if (stage === 'echo-file02') {
        setStageData((current) => ({ ...current, witnessConfirmed: true }));
        navigate('/events/cyberhunt/echo');
      } else if (stage === 'graveyard') {
        navigate('/events/cyberhunt/null17');
      } else {
        navigate(`/events/cyberhunt/${nextStage[stage]}`);
      }
    } catch (answerError) {
      setAnswerNotice({ correct: false, message: answerError.message });
    } finally {
      setBusy(false);
    }
  };

  const requestHint = async (stage) => {
    const result = await cyberhuntRequest('/hint', { token: teamToken, method: 'POST', body: { stage } });
    setTeam(result.team.team);
    setHints(result.team.hints);
    setNotice(`HINT ${result.hint.hintNumber} RECOVERED · −${result.hint.cost} POINTS`);
  };

  const adminAction = async (path, body, successMessage = 'ORGANIZER ACTION RECORDED.') => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await cyberhuntRequest(path, { token: adminToken, method: 'POST', body });
      if (result.teams) setData(result);
      if (result.event) setEvent(result.event);
      if (path === '/admin/hint' && result.hint) setNotice(`${result.hint.message} · −${result.hint.cost} POINTS`);
      else setNotice(successMessage);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem(isAdmin ? CYBERHUNT_ADMIN_TOKEN : CYBERHUNT_TEAM_TOKEN);
    if (isAdmin) setAdminToken('');
    else setTeamToken('');
    setTeam(null);
    setData(null);
    setStageData(null);
  };

  const renderTeamRoute = () => {
    if (route === 'start') return <StartBriefing onLogin={participantLogin} busy={busy} error={error} />;
    if (!team) return <div className="cyber-content"><p className="cyber-kicker">RESTORE YOUR INVESTIGATION</p><h1>TEAM ACCESS REQUIRED</h1><TeamGate onLogin={participantLogin} busy={busy} error={error} /></div>;
    if (error && !stageData) return <div className="cyber-content"><p className="cyber-error-title">ARCHIVE UNAVAILABLE</p><TerminalLine tone="error">{error}</TerminalLine><Link to="/events/cyberhunt/graveyard" className="cyber-text-link">RETURN TO INDEX →</Link></div>;
    if (!stageData && !['echo', 'recovery'].includes(route)) return <p className="cyber-loading">RECONNECTING TO ARCHIVE...</p>;
    if (route === '001') return <FirstDisappearance data={stageData ?? {}} onAnswer={answer} onHint={requestHint} busy={busy} hints={hints} answerNotice={answerNotice} />;
    if (route === 'graveyard') return <DeadInternet data={stageData ?? {}} onAnswer={answer} onHint={requestHint} busy={busy} hints={hints} answerNotice={answerNotice} />;
    if (deadPageIds.includes(route)) return <DeadPage id={route} data={stageData ?? {}} />;
    if (route === 'null17') return <NullProfile data={stageData ?? {}} onAnswer={answer} onHint={requestHint} busy={busy} hints={hints} answerNotice={answerNotice} />;
    if (route === 'echo') return stageData?.stage === 'echo-file02'
      ? <EchoProject file="02" data={stageData} onAnswer={answer} onHint={requestHint} busy={busy} hints={hints} answerNotice={answerNotice} />
      : <EchoProject file="01" data={stageData ?? {}} onAnswer={answer} onHint={requestHint} busy={busy} hints={hints} answerNotice={answerNotice} />;
    if (route === 'recovery') {
      if (error && !stageData) return <section className="cyber-content"><p className="cyber-kicker">PURGE PENDING</p><h1>ONE FILE SURVIVED.</h1><div className="cyber-panel"><TerminalLine tone="warning">The recovery file will open when the organizer-triggered archive purge completes.</TerminalLine><p className="cyber-muted">{error}</p></div></section>;
      return <Recovery onDataLoaded={() => loadSession()} />;
    }
    if (route === 'final') return <FinalInvestigation data={stageData ?? {}} onSubmit={async (answers) => {
      setBusy(true); setError('');
      try {
        const result = await cyberhuntRequest('/final/submit', { token: teamToken, method: 'POST', body: { answers } });
        setFinalResult(result);
        await loadSession();
      } catch (submitError) { setError(submitError.message); } finally { setBusy(false); }
    }} busy={busy} error={error} result={finalResult} onHint={requestHint} hints={hints} />;
    return <div className="cyber-content"><p className="cyber-error-title">ERROR 410 — ARCHIVE GONE</p><Link className="cyber-text-link" to="/events/cyberhunt">RETURN TO ENTRY</Link></div>;
  };

  if (isAdmin) {
    return (
      <main className="cyberhunt">
        <CyberHeader event={event} token={adminToken} onLogout={logout} />
        {!adminToken ? <AdminLogin onLogin={adminLogin} busy={busy} error={error} /> : data
          ? <AdminDashboard data={data} refresh={loadSession} onLogout={logout} onAction={adminAction} busy={busy} error={error} notice={notice} />
          : <p className="cyber-loading">AUTHENTICATING ORGANIZER...</p>}
      </main>
    );
  }

  return (
    <main className="cyberhunt">
      <CyberHeader event={event} token={teamToken} onLogout={logout} />
      {purge ? <PurgeOverlay purge={purge} onDismiss={() => setPurge(null)} /> : null}
      {route === '' ? <Landing /> : (
        <>
          {team ? <div className="cyber-team-strip"><span>TEAM / {team.name}</span><span>SCORE / {team.score}</span><span>RECORD / {team.currentStage}</span></div> : null}
          {renderTeamRoute()}
          {notice ? <p className="cyber-notice cyber-notice--success" role="status">{notice}</p> : null}
          {team ? <nav className="cyber-footer-nav" aria-label="Game navigation"><Link to="/events/cyberhunt/graveyard">ARCHIVE INDEX</Link><Link to="/events/cyberhunt/admin">ORGANIZER</Link></nav> : null}
        </>
      )}
    </main>
  );
}

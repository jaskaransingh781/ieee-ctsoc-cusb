import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import mongoose from 'mongoose';
import { CyberhuntState } from './models.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultFile = path.resolve(here, '../data/cyberhunt.json');
const PURGE_STEPS = [8, 19, 37, 54, 71, 89, 100];
const HINT_COSTS = [5, 10, 15];
const SCORE_BY_STAGE = {
  '001': 10,
  graveyard: 25,
  null17: 50,
  'echo-file01': 10,
  'echo-file02': 25,
};
const STAGES = {
  '001': {
    title: 'FIRST DISAPPEARANCE',
    answer: 'OPEN',
    hints: [
      'SYSTEM LOG: Four hexadecimal pairs were recovered.',
      'ARCHIVED NOTE: Read the bytes as ASCII.',
      'RECOVERY SYSTEM: The trace spells a four-letter action.',
    ],
  },
  graveyard: {
    title: 'THE DEAD INTERNET',
    answer: 'NULL_17',
    hints: [
      'SYSTEM LOG: Eight fragments are hidden among the dead pages.',
      'ARCHIVED NOTE: Read the fragments in numbered order.',
      'RECOVERY SYSTEM: The phrase ends with a deleted user identifier.',
    ],
  },
  null17: {
    title: 'NULL_17',
    answer: 'ECHO',
    hints: [
      'SYSTEM LOG: There are five recovered posts.',
      'ARCHIVED NOTE: The words are a distraction; inspect the page source.',
      'RECOVERY SYSTEM: Look for a short archive project name in a comment.',
    ],
  },
  'echo-file01': {
    title: 'PROJECT ECHO / FILE_01',
    answer: 'FOUR',
    hints: [
      'SYSTEM LOG: The recovery key contains encoded text.',
      'ARCHIVED NOTE: The key is encoded, not encrypted.',
      'RECOVERY SYSTEM: BASE64 protocol detected.',
    ],
  },
  'echo-file02': {
    title: 'PROJECT ECHO / FILE_02',
    answer: '03:17',
    hints: [
      'SYSTEM LOG: Four timestamps are listed; only one survived.',
      'ARCHIVED NOTE: Compare the surviving time with the recovered profile.',
      'RECOVERY SYSTEM: The repeated time is the answer.',
    ],
  },
};
const EARLY_FRAGMENTS = {
  '004': 'THEY',
  '007': 'WANTED',
  '014': 'US',
  '019': 'TO',
  '021': 'FORGET',
  '024': 'NULL',
  '031': '17',
};
const PURGED_FRAGMENTS = {
  '004': 'SUBJECT',
  '007': '001',
  '014': 'SAW',
  '019': 'THE',
  '021': 'EVENT',
  '024': 'BEFORE',
  '031': 'IT HAPPENED',
};
const FINAL_ANSWERS = [
  /subject\s*001|the witness/i,
  /archive.*evidence|preserv.*evidence|preserve.*evidence/i,
  /erase.*evidence|delete.*evidence|hide.*evidence/i,
  /recurr|connect|timestamp|time.*clue/i,
  /proof.*predict|predicted.*incident|incident.*predicted/i,
];

const digest = (value) => createHash('sha256').update(String(value)).digest();
const codeDigest = (value, secret) => createHmac('sha256', secret).update(String(value).trim().toUpperCase()).digest('hex');
const safeDoc = (doc) => {
  if (!doc) return null;
  const { _id, __v, ...plain } = doc;
  return plain;
};
const dateNow = () => new Date().toISOString();
const normalizeAnswer = (value) => String(value ?? '').trim().toUpperCase().replace(/\s+/g, ' ');
const safeTeam = (team) => ({
  teamId: team.teamId,
  name: team.name,
  currentStage: team.currentStage,
  score: team.score,
  hintsUsed: team.hintsUsed,
  startedAt: team.startedAt,
  completionTime: team.completionTime,
  discoveries: team.discoveries,
  finalSubmission: team.finalSubmission ? {
    submittedAt: team.finalSubmission.submittedAt,
    score: team.finalSubmission.score,
  } : null,
});

function makeToken(payload, secret) {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function readToken(token, secret) {
  if (typeof token !== 'string') return null;
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;
  const expected = createHmac('sha256', secret).update(data).digest();
  let supplied;
  try {
    supplied = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

function freshState(durationSeconds, demoMode) {
  const startedAt = demoMode ? dateNow() : null;
  return {
    event: {
      status: demoMode ? 'running' : 'ready',
      durationSeconds,
      startedAt,
      purgeAt: null,
      purgeActive: false,
      purgeStartedAt: null,
      purgeStep: 0,
      purgeCompletedAt: null,
      lockedStages: [],
    },
    teams: [],
    hints: [],
    answers: [],
    scoreEvents: [],
    submissions: [],
  };
}

function persistFile(state, filename) {
  mkdirSync(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(state, null, 2), { mode: 0o600 });
  renameSync(temporary, filename);
}

async function loadState({ filename, durationSeconds, demoMode }) {
  if (mongoose.connection.readyState === 1) {
    const stored = await CyberhuntState.findById('cyberhunt').lean();
    if (stored?.payload) return safeDoc(stored.payload);
    const initial = freshState(durationSeconds, demoMode);
    await CyberhuntState.create({ _id: 'cyberhunt', payload: initial });
    return initial;
  }
  if (existsSync(filename)) {
    try {
      const parsed = JSON.parse(readFileSync(filename, 'utf8'));
      if (parsed?.event && Array.isArray(parsed.teams)) return parsed;
      throw new Error('Cyberhunt state file has an invalid structure.');
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Could not load Cyberhunt state: ${error.message}`);
    }
  }
  const initial = freshState(durationSeconds, demoMode);
  persistFile(initial, filename);
  return initial;
}

export async function createCyberhunt(io, options = {}) {
  const durationSeconds = Math.max(60, Number(options.durationSeconds ?? process.env.CYBERHUNT_DURATION_SECONDS) || 10_800);
  const firstPageDelayMs = Math.max(0, Number(options.firstPageDelayMs ?? 47_000));
  const purgeStepMs = Math.max(1, Number(options.purgeStepMs ?? 1_000));
  const timerTickMs = Math.max(10, Number(options.timerTickMs ?? 500));
  const demoMode = options.demoMode ?? process.env.NODE_ENV !== 'production';
  const filename = path.resolve(options.databaseFile ?? process.env.CYBERHUNT_DB_FILE ?? defaultFile);
  const adminUsername = options.adminUsername ?? process.env.CYBERHUNT_ADMIN_USER ?? (demoMode ? 'admin' : '');
  const adminPassword = options.adminPassword ?? process.env.CYBERHUNT_ADMIN_PASSWORD ?? (demoMode ? 'cyberhunt2026' : '');
  const authSecret = options.authSecret ?? process.env.CYBERHUNT_AUTH_SECRET ?? (demoMode ? 'local-cyberhunt-demo-secret-change-before-production' : '');

  if (!adminUsername || !adminPassword || !authSecret) {
    throw new Error('Configure CYBERHUNT_ADMIN_USER, CYBERHUNT_ADMIN_PASSWORD and CYBERHUNT_AUTH_SECRET.');
  }
  if (process.env.NODE_ENV === 'production' && (!process.env.CYBERHUNT_ADMIN_USER || !process.env.CYBERHUNT_ADMIN_PASSWORD || !process.env.CYBERHUNT_AUTH_SECRET)) {
    throw new Error('Production Cyberhunt requires CYBERHUNT_ADMIN_USER, CYBERHUNT_ADMIN_PASSWORD and CYBERHUNT_AUTH_SECRET.');
  }

  if (!options.databaseFile && process.env.MONGODB_URI && mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  const state = await loadState({ filename, durationSeconds, demoMode });
  const namespace = io.of('/cyberhunt');
  let writes = Promise.resolve();
  let closed = false;
  const router = express.Router();

  async function persist() {
    if (mongoose.connection.readyState === 1) {
      await CyberhuntState.replaceOne(
        { _id: 'cyberhunt' },
        { _id: 'cyberhunt', payload: state },
        { upsert: true },
      );
    } else {
      persistFile(state, filename);
    }
  }

  function eventView() {
    const event = state.event;
    const elapsed = event.startedAt ? Math.max(0, Date.now() - Date.parse(event.startedAt)) : 0;
    const remainingMs = event.status === 'running'
      ? Math.max(0, event.durationSeconds * 1000 - elapsed)
      : event.status === 'ended' ? 0 : event.durationSeconds * 1000;
    return {
      status: event.status,
      durationSeconds: event.durationSeconds,
      startedAt: event.startedAt,
      purgeAt: event.purgeAt,
      remainingMs,
      serverTime: Date.now(),
      purgeActive: event.purgeActive,
      purgeStep: event.purgeStep,
      purgeCompletedAt: event.purgeCompletedAt,
    };
  }

  function teamView(team) {
    if (!team) return null;
    const hintsUsed = team.hintsUsed ?? {};
    return {
      team: safeTeam(team),
      event: eventView(),
      answers: state.answers.filter((answer) => answer.teamId === team.teamId)
        .slice(-30)
        .reverse()
        .map(({ stage, correct, createdAt, pointsAwarded }) => ({ stage, correct, createdAt, pointsAwarded })),
      hints: state.hints.filter((hint) => hint.teamId === team.teamId)
        .map(({ stage, hintNumber, message, createdAt }) => ({ stage, hintNumber, message, createdAt })),
      hintsUsed,
    };
  }

  function adminView() {
    return {
      event: eventView(),
      teams: [...state.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).map((team) => ({
        ...safeTeam(team),
        hintsUsedCount: Object.values(team.hintsUsed ?? {}).reduce((sum, count) => sum + count, 0),
        status: team.finalSubmission ? 'Complete' : team.startedAt ? 'In progress' : 'Ready',
        elapsedMs: team.startedAt ? Math.max(0, Date.now() - Date.parse(team.startedAt)) : 0,
      })),
      finalSubmissions: state.submissions.map((submission) => ({
        ...submission,
        teamName: state.teams.find((team) => team.teamId === submission.teamId)?.name ?? 'Unknown team',
      })),
      scores: [...state.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .map(({ teamId, name, score, currentStage }) => ({ teamId, name, score, currentStage })),
      scoreEvents: state.scoreEvents.slice(-200).reverse(),
      hints: state.hints.slice(-200).reverse(),
    };
  }

  function publish() {
    const snapshot = adminView();
    namespace.emit('cyberhunt:state', eventView());
    namespace.to('cyberhunt:admin').emit('cyberhunt:admin-update', snapshot);
    for (const team of state.teams) {
      namespace.to(`cyberhunt:team:${team.teamId}`).emit('cyberhunt:team-update', teamView(team));
    }
  }

  function mutate(operation) {
    const next = writes.then(async () => {
      const value = await operation();
      await persist();
      publish();
      return value;
    });
    writes = next.catch(() => {});
    return next;
  }

  function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const identity = readToken(token, authSecret);
    if (!identity) return res.status(401).json({ error: 'Session expired. Sign in to continue.' });
    if (identity.role === 'team' && !state.teams.some((team) => team.teamId === identity.teamId)) {
      return res.status(401).json({ error: 'Team session is no longer valid.' });
    }
    req.cyberhuntUser = identity;
    next();
  }

  const participant = (req, res, next) => req.cyberhuntUser?.role === 'team'
    ? next()
    : res.status(403).json({ error: 'Team access required.' });
  const adminOnly = (req, res, next) => req.cyberhuntUser?.role === 'admin'
    ? next()
    : res.status(403).json({ error: 'Organizer access required.' });
  const teamFromRequest = (req) => state.teams.find((team) => team.teamId === req.cyberhuntUser?.teamId);

  function stageUnlocked(team, stage) {
    const order = ['001', 'graveyard', 'null17', 'echo-file01', 'echo-file02', 'recovery', 'final'];
    const stageIndex = order.indexOf(stage);
    return stageIndex !== -1
      && order.indexOf(team.currentStage) >= stageIndex
      && !state.event.lockedStages.includes(stage);
  }

  function addScore(team, amount, action, description) {
    const before = team.score;
    team.score = Math.max(0, before + amount);
    const applied = team.score - before;
    state.scoreEvents.push({
      eventId: randomUUID(),
      teamId: team.teamId,
      teamName: team.name,
      stage: team.currentStage,
      action,
      amount: applied,
      description,
      createdAt: dateNow(),
    });
    return applied;
  }

  function revealHint(team, stage) {
    const definition = STAGES[stage];
    if (!definition) return { status: 400, payload: { error: 'Hints are not available for that stage.' } };
    if (!stageUnlocked(team, stage)) return { status: 403, payload: { error: 'That stage is not unlocked.' } };
    const used = team.hintsUsed[stage] ?? 0;
    if (used >= definition.hints.length) return { status: 409, payload: { error: 'No hints remain for this stage.' } };
    const hintNumber = used + 1;
    const cost = HINT_COSTS[hintNumber - 1];
    team.hintsUsed[stage] = hintNumber;
    const applied = addScore(team, -cost, 'Hint used', `Hint ${hintNumber} used for ${definition.title}.`);
    const record = {
      hintId: randomUUID(),
      teamId: team.teamId,
      teamName: team.name,
      stage,
      hintNumber,
      cost: applied,
      message: definition.hints[hintNumber - 1],
      createdAt: dateNow(),
    };
    state.hints.push(record);
    return { status: 200, payload: { hint: { stage, hintNumber, cost: applied, message: record.message, createdAt: record.createdAt }, team: teamView(team) } };
  }

  function adminSnapshotResponse(res) {
    return res.json(adminView());
  }

  router.get('/state', (_req, res) => res.json({ event: eventView() }));

  router.post('/team/start', async (req, res, next) => {
    try {
      const name = String(req.body?.teamName ?? '').trim().replace(/\s+/g, ' ');
      const teamCode = String(req.body?.teamCode ?? '').trim();
      if (name.length < 2 || name.length > 50) return res.status(400).json({ error: 'Team name must be 2 to 50 characters.' });
      if (!/^[A-Za-z0-9_-]{6,32}$/.test(teamCode)) return res.status(400).json({ error: 'Team code must be 6 to 32 letters, numbers, hyphens or underscores.' });
      const fingerprint = codeDigest(teamCode, authSecret);
      let team = state.teams.find((entry) => entry.teamCodeHash === fingerprint);
      if (team && team.name.toLowerCase() !== name.toLowerCase()) {
        return res.status(409).json({ error: 'That team code belongs to a different team name.' });
      }
      await mutate(async () => {
        if (!team) {
          team = {
            teamId: randomUUID(),
            name,
            teamCodeHash: fingerprint,
            currentStage: '001',
            score: 0,
            hintsUsed: {},
            startedAt: dateNow(),
            stageStartedAt: dateNow(),
            completionTime: null,
            discoveries: { fragmentsSeen: [], witnessConfirmed: false },
            finalSubmission: null,
          };
          state.teams.push(team);
          state.scoreEvents.push({
            eventId: randomUUID(), teamId: team.teamId, teamName: team.name, stage: '001',
            action: 'Hunt started', amount: 0, description: 'Team entered the disappearing archive.',
            createdAt: dateNow(),
          });
        }
      });
      return res.json({
        token: makeToken({ role: 'team', teamId: team.teamId }, authSecret),
        team: teamView(team),
        resumed: state.answers.some((answer) => answer.teamId === team.teamId),
      });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/admin/login', (req, res) => {
    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');
    const userMatches = timingSafeEqual(digest(username), digest(adminUsername));
    const passwordMatches = timingSafeEqual(digest(password), digest(adminPassword));
    if (!userMatches || !passwordMatches) return res.status(401).json({ error: 'Organizer credentials were not accepted.' });
    return res.json({
      token: makeToken({ role: 'admin', username: adminUsername }, authSecret),
      user: { role: 'admin', username: adminUsername },
    });
  });

  router.get('/me', authenticate, (req, res) => {
    if (req.cyberhuntUser.role === 'admin') return res.json({ user: { role: 'admin', username: adminUsername }, admin: adminView() });
    return res.json({ user: { role: 'team', teamId: req.cyberhuntUser.teamId }, team: teamView(teamFromRequest(req)) });
  });

  router.get('/stage/:stage', authenticate, participant, (req, res) => {
    const team = teamFromRequest(req);
    const { stage } = req.params;
    const requestedGate = stage === 'echo'
      ? (team.currentStage === 'echo-file02' || team.currentStage === 'recovery' || team.currentStage === 'final' ? 'echo-file02' : 'echo-file01')
      : stage;
    if (!STAGES[stage] && !['004', '007', '014', '019', '021', '024', '031'].includes(stage)) {
      if (stage !== 'echo') return res.status(404).json({ error: 'ERROR 410 — ARCHIVE GONE.' });
    }
    if (!stageUnlocked(team, ['004', '007', '014', '019', '021', '024', '031'].includes(stage) ? 'graveyard' : requestedGate)) {
      return res.status(403).json({ error: 'ACCESS DENIED. That archive is still locked.' });
    }
    if (stage === '001') {
      const elapsed = Math.max(0, Date.now() - Date.parse(team.stageStartedAt ?? team.startedAt));
      return res.json({ stage, title: STAGES[stage].title, elapsedMs: elapsed, gone: elapsed >= firstPageDelayMs, event: eventView(), team: teamView(team) });
    }
    if (stage === 'recovery' && !state.event.purgeCompletedAt) return res.status(403).json({ error: 'The recovered file is not available yet.' });
    if (stage === 'final' && !state.event.purgeCompletedAt) return res.status(403).json({ error: 'FINAL INVESTIGATION remains sealed until recovery.' });
    if (Object.hasOwn(EARLY_FRAGMENTS, stage)) {
      if (state.event.purgeCompletedAt && !team.discoveries.fragmentsSeen.includes(stage)) {
        team.discoveries.fragmentsSeen.push(stage);
        if (Object.keys(PURGED_FRAGMENTS).every((key) => team.discoveries.fragmentsSeen.includes(key))) {
          team.currentStage = 'final';
        }
        mutate(async () => undefined).catch((error) => console.error('[cyberhunt] failed to save fragment discovery', error));
      }
      return res.json({
        stage,
        title: 'ERROR 410 — ARCHIVE GONE',
        fragment: state.event.purgeCompletedAt ? PURGED_FRAGMENTS[stage] : EARLY_FRAGMENTS[stage],
        purged: Boolean(state.event.purgeCompletedAt),
        event: eventView(),
      });
    }
    if (stage === 'graveyard') {
      const fragments = state.event.purgeCompletedAt ? PURGED_FRAGMENTS : EARLY_FRAGMENTS;
      return res.json({
        stage, title: STAGES.graveyard.title, fragments: Object.keys(fragments),
        discoveryComplete: Boolean(state.event.purgeCompletedAt) && Object.keys(PURGED_FRAGMENTS).every((key) => team.discoveries.fragmentsSeen.includes(key)),
        event: eventView(), team: teamView(team),
      });
    }
    if (stage === 'null17') {
      return res.json({
        stage, title: STAGES[stage].title, profile: { handle: '@NULL_17', status: 'DELETED', lastActive: '03:17', posts: 5 },
        posts: [
          { date: '17/04/2019', text: 'The beginning isn’t always the beginning.', file: 'IMG_0317.jpg' },
          { text: 'You keep looking at the words.' },
          { text: 'Look at what the words leave behind.' },
          { text: 'ARCHIVE RECORD: 03:17' },
          { text: 'CONNECTION LOST.' },
        ],
        hintsUsed: team.hintsUsed[stage] ?? 0, event: eventView(),
      });
    }
    if (stage === 'echo' || stage === 'echo-file01' || stage === 'echo-file02') {
      const echoStage = stage === 'echo' ? requestedGate : stage;
      return res.json({
        stage: echoStage, routeStage: stage, title: STAGES[echoStage].title,
        file: echoStage === 'echo-file01'
          ? ['PROJECT ECHO', 'CLASSIFICATION: REDACTED', 'PROJECT START: 2019', 'PROJECT END: 2026', 'PERSONNEL: 04', 'SUBJECT: 001', 'STATUS: REDACTED', 'WARNING: DO NOT RESTORE SUBJECT 001.', 'RECOVERY KEY: Rk9VUg==']
          : ['FOUR FILES EXISTED.', 'FILE A — 03:14', 'FILE B — 03:17', 'FILE C — 03:21', 'FILE D — 03:31', 'Only one survived.'],
        witnessConfirmed: Boolean(team.discoveries.witnessConfirmed), team: teamView(team),
        hintsUsed: team.hintsUsed[echoStage] ?? 0, event: eventView(),
      });
    }
    if (stage === 'recovery') return res.json({ stage, title: 'ECHO_RECOVERY.txt', team: teamView(team), event: eventView() });
    if (stage === 'final') {
      return res.json({
        stage, title: 'FINAL INVESTIGATION',
        fragmentsSeen: team.discoveries.fragmentsSeen,
        fragmentsRequired: Object.keys(PURGED_FRAGMENTS),
        hintsUsed: team.hintsUsed.final ?? 0,
        submitted: Boolean(team.finalSubmission),
        event: eventView(),
      });
    }
    return res.json({ stage, title: STAGES[stage].title, hintsUsed: team.hintsUsed[stage] ?? 0, event: eventView() });
  });

  router.post('/answer', authenticate, participant, async (req, res, next) => {
    try {
      const team = teamFromRequest(req);
      const stage = String(req.body?.stage ?? '');
      const answer = String(req.body?.answer ?? '').trim().slice(0, 4000);
      if (state.event.status === 'ended') return res.status(409).json({ error: 'The investigation is locked because the event ended.' });
      if (state.event.lockedStages.includes(stage)) return res.status(423).json({ error: 'ACCESS DENIED. This stage is locked by the organizer.' });
      if (!STAGES[stage] || !stageUnlocked(team, stage)) return res.status(403).json({ error: 'ACCESS DENIED. That puzzle is not unlocked.' });
      if (stage === '001' && Date.now() - Date.parse(team.stageStartedAt ?? team.startedAt) < firstPageDelayMs) {
        return res.status(425).json({ error: 'CONNECTION ESTABLISHED. The archive has not disappeared yet.' });
      }
      const isCorrect = normalizeAnswer(answer) === normalizeAnswer(STAGES[stage].answer);
      let awarded = 0;
      await mutate(async () => {
        state.answers.push({
          answerId: randomUUID(), teamId: team.teamId, teamName: team.name, stage,
          answer, correct: isCorrect, createdAt: dateNow(), pointsAwarded: 0,
        });
        if (!isCorrect) return;
        if (stage === '001') team.currentStage = 'graveyard';
        if (stage === 'graveyard') team.currentStage = 'null17';
        if (stage === 'null17') team.currentStage = 'echo-file01';
        if (stage === 'echo-file01') team.currentStage = 'echo-file02';
        if (stage === 'echo-file02') {
          team.currentStage = 'recovery';
          team.discoveries.witnessConfirmed = true;
        }
        team.stageStartedAt = dateNow();
        awarded = addScore(team, SCORE_BY_STAGE[stage], 'Puzzle solved', `${STAGES[stage].title} solved.`);
        state.answers.at(-1).pointsAwarded = awarded;
      });
      if (!isCorrect) return res.status(400).json({ correct: false, message: 'ACCESS DENIED. The archive does not recognise this answer.', team: teamView(team) });
      return res.json({ correct: true, message: 'TRACE ACCEPTED. ACCESS GRANTED.', pointsAwarded: awarded, team: teamView(team) });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/hint', authenticate, participant, async (req, res, next) => {
    try {
      const team = teamFromRequest(req);
      const result = await mutate(async () => revealHint(team, String(req.body?.stage ?? '')));
      return res.status(result.status).json(result.payload);
    } catch (error) {
      return next(error);
    }
  });

  router.post('/final/submit', authenticate, participant, async (req, res, next) => {
    try {
      const team = teamFromRequest(req);
      if (!team || !['recovery', 'final'].includes(team.currentStage) || !state.event.purgeCompletedAt) return res.status(403).json({ error: 'The final investigation is still locked.' });
      if (!Object.keys(PURGED_FRAGMENTS).every((key) => team.discoveries.fragmentsSeen.includes(key))) return res.status(409).json({ error: 'Revisit every recovered dead page before submitting your investigation.' });
      const answers = Array.isArray(req.body?.answers) ? req.body.answers.slice(0, 5).map((value) => String(value ?? '').trim().slice(0, 1000)) : [];
      if (answers.length !== 5 || answers.some((answer) => !answer)) return res.status(400).json({ error: 'Complete all five investigation findings before submitting.' });
      if (team.finalSubmission) return res.status(409).json({ error: 'A final investigation has already been submitted.' });
      let finalScore = 0;
      const correctness = answers.map((answer, index) => FINAL_ANSWERS[index].test(answer));
      await mutate(async () => {
        finalScore = correctness.filter(Boolean).length * 20;
        addScore(team, finalScore, 'Final investigation', `Final investigation submitted with ${correctness.filter(Boolean).length} of 5 findings supported.`);
        if (correctness.every(Boolean)) {
          addScore(team, 25, 'Hidden discovery', 'The team reconstructed the recovered message.');
        }
        team.currentStage = 'final';
        team.completionTime = dateNow();
        team.finalSubmission = {
          submittedAt: team.completionTime,
          answers,
          correctness,
          score: finalScore,
          totalScore: team.score,
        };
        state.submissions.push({
          submissionId: randomUUID(),
          teamId: team.teamId,
          teamName: team.name,
          submittedAt: team.completionTime,
          answers,
          correctness,
          finalScore,
          totalScore: team.score,
        });
      });
      return res.json({ submitted: true, correctness, finalScore, totalScore: team.score, submittedAt: team.completionTime });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/admin/state', authenticate, adminOnly, (_req, res) => adminSnapshotResponse(res));

  router.post('/admin/event', authenticate, adminOnly, async (req, res, next) => {
    try {
      const action = String(req.body?.action ?? '');
      await mutate(async () => {
        if (action === 'start') {
          state.event.status = 'running';
          state.event.startedAt = dateNow();
        } else if (action === 'end') {
          state.event.status = 'ended';
        } else if (action === 'configure') {
          const duration = Number(req.body?.durationSeconds);
          if (!Number.isFinite(duration) || duration < 60 || duration > 86_400) throw Object.assign(new Error('Event duration must be between 60 seconds and 24 hours.'), { status: 400 });
          const purgeAt = req.body?.purgeAt == null || req.body.purgeAt === '' ? null : new Date(req.body.purgeAt);
          if (purgeAt && Number.isNaN(purgeAt.getTime())) throw Object.assign(new Error('Purge time is invalid.'), { status: 400 });
          state.event.durationSeconds = Math.floor(duration);
          state.event.purgeAt = purgeAt?.toISOString() ?? null;
        } else if (action === 'reset') {
          state.event.status = demoMode ? 'running' : 'ready';
          state.event.startedAt = demoMode ? dateNow() : null;
          state.event.purgeActive = false;
          state.event.purgeStartedAt = null;
          state.event.purgeStep = 0;
          state.event.purgeCompletedAt = null;
          state.event.lockedStages = [];
        } else {
          throw Object.assign(new Error('Choose start, end, configure, or reset.'), { status: 400 });
        }
      });
      return res.json(adminView());
    } catch (error) {
      return next(error);
    }
  });

  router.post('/admin/purge', authenticate, adminOnly, async (req, res, next) => {
    try {
      const active = Boolean(req.body?.active);
      await mutate(async () => {
        if (active) {
          if (state.event.purgeCompletedAt) throw Object.assign(new Error('Purge is already complete; reset event state before replaying it.'), { status: 409 });
          state.event.purgeActive = true;
          state.event.purgeStartedAt = dateNow();
          state.event.purgeStep = 0;
        } else {
          state.event.purgeActive = false;
          state.event.purgeStartedAt = null;
          state.event.purgeStep = 0;
        }
      });
      return res.json(adminView());
    } catch (error) {
      return next(error);
    }
  });

  router.post('/admin/stage-lock', authenticate, adminOnly, async (req, res, next) => {
    try {
      const stage = String(req.body?.stage ?? '');
      if (!['001', 'graveyard', 'null17', 'echo-file01', 'echo-file02', 'recovery', 'final'].includes(stage)) {
        return res.status(400).json({ error: 'Unknown stage.' });
      }
      await mutate(async () => {
        const locked = state.event.lockedStages.includes(stage);
        if (Boolean(req.body?.locked) && !locked) state.event.lockedStages.push(stage);
        if (!req.body?.locked && locked) state.event.lockedStages = state.event.lockedStages.filter((entry) => entry !== stage);
      });
      return res.json(adminView());
    } catch (error) {
      return next(error);
    }
  });

  router.post('/admin/hint', authenticate, adminOnly, async (req, res, next) => {
    try {
      const team = state.teams.find((entry) => entry.teamId === req.body?.teamId);
      if (!team) return res.status(404).json({ error: 'Team not found.' });
      const result = await mutate(async () => revealHint(team, String(req.body?.stage ?? '')));
      return res.status(result.status).json(result.payload);
    } catch (error) {
      return next(error);
    }
  });

  router.post('/admin/team/reset', authenticate, adminOnly, async (req, res, next) => {
    try {
      const team = state.teams.find((entry) => entry.teamId === req.body?.teamId);
      if (!team) return res.status(404).json({ error: 'Team not found.' });
      await mutate(async () => {
        team.currentStage = '001';
        team.score = 0;
        team.hintsUsed = {};
        team.startedAt = dateNow();
        team.stageStartedAt = dateNow();
        team.completionTime = null;
        team.discoveries = { fragmentsSeen: [], witnessConfirmed: false };
        team.finalSubmission = null;
        state.answers = state.answers.filter((answer) => answer.teamId !== team.teamId);
        state.hints = state.hints.filter((hint) => hint.teamId !== team.teamId);
        state.submissions = state.submissions.filter((submission) => submission.teamId !== team.teamId);
        state.scoreEvents = state.scoreEvents.filter((event) => event.teamId !== team.teamId);
        state.scoreEvents.push({ eventId: randomUUID(), teamId: team.teamId, teamName: team.name, stage: '001', action: 'Demo reset', amount: 0, description: 'Organizer reset this team for testing.', createdAt: dateNow() });
      });
      return res.json(adminView());
    } catch (error) {
      return next(error);
    }
  });

  router.post('/admin/team/skip', authenticate, adminOnly, async (req, res, next) => {
    try {
      const team = state.teams.find((entry) => entry.teamId === req.body?.teamId);
      const stages = ['001', 'graveyard', 'null17', 'echo-file01', 'echo-file02', 'recovery', 'final'];
      const current = stages.indexOf(team?.currentStage);
      if (!team || current < 0 || current >= stages.length - 1) return res.status(400).json({ error: 'This team cannot skip another stage.' });
      await mutate(async () => {
        team.currentStage = stages[current + 1];
        team.stageStartedAt = dateNow();
        if (team.currentStage === 'recovery') state.event.purgeCompletedAt ??= dateNow();
        if (team.currentStage === 'final') team.discoveries.fragmentsSeen = Object.keys(PURGED_FRAGMENTS);
        state.scoreEvents.push({ eventId: randomUUID(), teamId: team.teamId, teamName: team.name, stage: team.currentStage, action: 'Demo stage skip', amount: 0, description: 'Organizer skipped a stage for testing.', createdAt: dateNow() });
      });
      return res.json(adminView());
    } catch (error) {
      return next(error);
    }
  });

  router.post('/admin/team/test-answer', authenticate, adminOnly, async (req, res, next) => {
    try {
      if (!demoMode) return res.status(403).json({ error: 'Answer simulation is disabled outside demo mode.' });
      const team = state.teams.find((entry) => entry.teamId === req.body?.teamId);
      const stage = team?.currentStage;
      if (!team || !STAGES[stage]) return res.status(400).json({ error: 'This team has no testable puzzle at its current stage.' });
      await mutate(async () => {
        state.answers.push({
          answerId: randomUUID(), teamId: team.teamId, teamName: team.name, stage,
          answer: STAGES[stage].answer, correct: true, createdAt: dateNow(), pointsAwarded: 0, demo: true,
        });
        if (stage === '001') team.currentStage = 'graveyard';
        if (stage === 'graveyard') team.currentStage = 'null17';
        if (stage === 'null17') team.currentStage = 'echo-file01';
        if (stage === 'echo-file01') team.currentStage = 'echo-file02';
        if (stage === 'echo-file02') {
          team.currentStage = 'recovery';
          team.discoveries.witnessConfirmed = true;
        }
        team.stageStartedAt = dateNow();
        const awarded = addScore(team, SCORE_BY_STAGE[stage], 'Demo test answer', `Organizer simulated a correct answer for ${STAGES[stage].title}.`);
        state.answers.at(-1).pointsAwarded = awarded;
      });
      return res.json(adminView());
    } catch (error) {
      return next(error);
    }
  });

  namespace.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const identity = readToken(token, authSecret);
    if (!identity) return next(new Error('Unauthorized'));
    if (identity.role === 'team' && !state.teams.some((team) => team.teamId === identity.teamId)) return next(new Error('Unauthorized'));
    socket.cyberhuntUser = identity;
    next();
  });
  namespace.on('connection', (socket) => {
    if (socket.cyberhuntUser.role === 'admin') {
      socket.join('cyberhunt:admin');
      socket.emit('cyberhunt:admin-update', adminView());
    } else {
      socket.join(`cyberhunt:team:${socket.cyberhuntUser.teamId}`);
      const team = state.teams.find((entry) => entry.teamId === socket.cyberhuntUser.teamId);
      socket.emit('cyberhunt:team-update', teamView(team));
    }
    socket.emit('cyberhunt:state', eventView());
  });

  const ticker = setInterval(() => {
    if (closed) return;
    const event = state.event;
    if (event.status === 'running' && event.startedAt
      && Date.now() - Date.parse(event.startedAt) >= event.durationSeconds * 1000) {
      event.status = 'ended';
      mutate(async () => undefined).catch((error) => console.error('[cyberhunt] failed to save event timer expiry', error));
    }
    if (event.purgeAt && Date.now() >= Date.parse(event.purgeAt)
      && !event.purgeActive && !event.purgeCompletedAt) {
      event.purgeActive = true;
      event.purgeStartedAt = dateNow();
      event.purgeStep = 0;
      mutate(async () => undefined).catch((error) => console.error('[cyberhunt] failed to save scheduled purge', error));
    }
    if (event.purgeActive && event.purgeStartedAt) {
      const elapsed = Date.now() - Date.parse(event.purgeStartedAt);
      const step = Math.min(PURGE_STEPS.length, Math.floor(elapsed / purgeStepMs) + 1);
      if (step !== event.purgeStep) {
        event.purgeStep = step;
        namespace.emit('cyberhunt:purge-progress', { step, percent: PURGE_STEPS[step - 1], serverTime: Date.now() });
        if (step === PURGE_STEPS.length) {
          event.purgeActive = false;
          event.purgeCompletedAt = dateNow();
          namespace.emit('cyberhunt:purge-complete', { completedAt: event.purgeCompletedAt });
          mutate(async () => undefined).catch((error) => console.error('[cyberhunt] failed to save purge completion', error));
        }
      }
    }
    namespace.emit('cyberhunt:state', eventView());
  }, timerTickMs);
  ticker.unref?.();

  if (mongoose.connection.readyState !== 1) persistFile(state, filename);
  return {
    router,
    close() {
      closed = true;
      clearInterval(ticker);
    },
  };
}

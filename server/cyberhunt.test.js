import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { unlinkSync } from 'node:fs';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import express from 'express';
import { Server as SocketServer } from 'socket.io';
import { io as connectSocket } from 'socket.io-client';
import { createCyberhunt } from './cyberhunt/index.js';

async function startHarness(options = {}) {
  const filename = path.join(os.tmpdir(), `cyberhunt-test-${randomUUID()}.json`);
  const app = express();
  const server = createServer(app);
  const socketServer = new SocketServer(server, { cors: { origin: true } });
  const { realSocket = false, ...cyberhuntOptions } = options;
  const cyberhunt = await createCyberhunt(realSocket ? socketServer : {
    of: () => ({
      use() {},
      on() {},
      emit() {},
      to() { return { emit() {} }; },
    }),
  }, {
    databaseFile: filename,
    demoMode: true,
    adminUsername: 'organizer',
    adminPassword: 'organizer-secret',
    authSecret: 'cyberhunt-test-secret',
    durationSeconds: 600,
    firstPageDelayMs: 500,
    purgeStepMs: 20,
    timerTickMs: 10,
    ...cyberhuntOptions,
  });
  app.use(express.json());
  app.use('/api/cyberhunt', cyberhunt.router);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const base = `http://127.0.0.1:${server.address().port}/api/cyberhunt`;
  return {
    filename,
    origin,
    base,
    socketServer,
    async close() {
      cyberhunt.close();
      await new Promise((resolve) => socketServer.close(resolve));
      try { unlinkSync(filename); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    },
  };
}

async function request(base, route, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, payload: await response.json() };
}

test('Cyberhunt team progress, answers, hints, purge, fragments, submissions and admin auth are server-backed', async () => {
  const harness = await startHarness({ realSocket: true });
  let teamSocket;
  try {
    const badAdmin = await request(harness.base, '/admin/login', {
      method: 'POST',
      body: { username: 'organizer', password: 'wrong' },
    });
    assert.equal(badAdmin.status, 401);

    const adminLogin = await request(harness.base, '/admin/login', {
      method: 'POST',
      body: { username: 'organizer', password: 'organizer-secret' },
    });
    assert.equal(adminLogin.status, 200);
    const adminToken = adminLogin.payload.token;

    const created = await request(harness.base, '/team/start', {
      method: 'POST',
      body: { teamName: 'Archive Team', teamCode: 'ARCHIVE-17' },
    });
    assert.equal(created.status, 200);
    const teamToken = created.payload.token;
    const teamId = created.payload.team.team.teamId;
    assert.equal(created.payload.team.team.currentStage, '001');

    teamSocket = connectSocket(`${harness.origin}/cyberhunt`, {
      auth: { token: teamToken },
      transports: ['websocket'],
    });
    const socketEvents = [];
    teamSocket.onAny((event) => socketEvents.push(event));
    const socketState = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket.IO did not deliver the initial state.')), 3_000);
      teamSocket.once('cyberhunt:state', resolve);
      teamSocket.once('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      teamSocket.once('cyberhunt:state', () => clearTimeout(timeout));
    });
    teamSocket.connect();
    await socketState;
    assert.ok(socketEvents.includes('cyberhunt:team-update'));

    const invalidTeam = await request(harness.base, '/team/start', {
      method: 'POST',
      body: { teamName: 'Another Team', teamCode: 'ARCHIVE-17' },
    });
    assert.equal(invalidTeam.status, 409);

    const tooEarly = await request(harness.base, '/answer', {
      token: teamToken,
      method: 'POST',
      body: { stage: '001', answer: 'OPEN' },
    });
    assert.equal(tooEarly.status, 425);

    await new Promise((resolve) => setTimeout(resolve, 510));
    const firstSolve = await request(harness.base, '/answer', {
      token: teamToken,
      method: 'POST',
      body: { stage: '001', answer: 'OPEN' },
    });
    assert.equal(firstSolve.status, 200);
    assert.equal(firstSolve.payload.pointsAwarded, 10);
    assert.equal(firstSolve.payload.team.team.currentStage, 'graveyard');

    const hint = await request(harness.base, '/hint', {
      token: teamToken,
      method: 'POST',
      body: { stage: 'graveyard' },
    });
    assert.equal(hint.status, 200);
    assert.equal(hint.payload.hint.cost, -5);
    assert.equal(hint.payload.team.team.score, 5);
    const wrong = await request(harness.base, '/answer', {
      token: teamToken,
      method: 'POST',
      body: { stage: 'graveyard', answer: 'NOT THE ANSWER' },
    });
    assert.equal(wrong.status, 400);
    assert.equal(wrong.payload.correct, false);

    for (const [stage, answer] of [
      ['graveyard', 'NULL_17'],
      ['null17', 'ECHO'],
      ['echo-file01', 'FOUR'],
      ['echo-file02', '03:17'],
    ]) {
      const result = await request(harness.base, '/answer', {
        token: teamToken,
        method: 'POST',
        body: { stage, answer },
      });
      assert.equal(result.status, 200, `${stage} should accept the expected answer`);
    }

    const echoFile = await request(harness.base, '/stage/echo', { token: teamToken });
    assert.equal(echoFile.status, 200);
    assert.equal(echoFile.payload.stage, 'echo-file02');
    assert.equal(echoFile.payload.witnessConfirmed, true);

    const teamCannotOpenAdmin = await request(harness.base, '/admin/state', { token: teamToken });
    assert.equal(teamCannotOpenAdmin.status, 403);

    const purge = await request(harness.base, '/admin/purge', {
      token: adminToken,
      method: 'POST',
      body: { active: true },
    });
    assert.equal(purge.status, 200);
    assert.equal(purge.payload.event.purgeActive, true);

    let completedState;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 15));
      const snapshot = await request(harness.base, '/state');
      if (snapshot.payload.event.purgeCompletedAt) {
        completedState = snapshot.payload.event;
        break;
      }
    }
    assert.ok(completedState?.purgeCompletedAt, 'the server should complete and publish the purge');
    assert.ok(socketEvents.includes('cyberhunt:purge-progress'));
    assert.ok(socketEvents.includes('cyberhunt:purge-complete'));

    for (const page of ['004', '007', '014', '019', '021', '024', '031']) {
      const fragment = await request(harness.base, `/stage/${page}`, { token: teamToken });
      assert.equal(fragment.status, 200);
      assert.equal(fragment.payload.purged, true);
    }
    const fragmentIndex = await request(harness.base, '/stage/graveyard', { token: teamToken });
    assert.equal(fragmentIndex.payload.discoveryComplete, true);

    const finalAnswers = [
      'Subject 001 was the witness.',
      'Project Echo was an archive that preserved evidence.',
      'The websites were deleted to erase evidence.',
      '03:17 is the recurring timestamp connecting the clues.',
      'They wanted to erase proof the incident was predicted.',
    ];
    const submission = await request(harness.base, '/final/submit', {
      token: teamToken,
      method: 'POST',
      body: { answers: finalAnswers },
    });
    assert.equal(submission.status, 200);
    assert.equal(submission.payload.finalScore, 100);
    assert.equal(submission.payload.totalScore, 240);

    const adminView = await request(harness.base, '/admin/state', { token: adminToken });
    assert.equal(adminView.status, 200);
    assert.equal(adminView.payload.teams[0].teamId, teamId);
    assert.equal(adminView.payload.finalSubmissions.length, 1);
    assert.equal(adminView.payload.teams[0].score, 240);
  } finally {
    teamSocket?.disconnect();
    await harness.close();
  }
}, { timeout: 20_000 });

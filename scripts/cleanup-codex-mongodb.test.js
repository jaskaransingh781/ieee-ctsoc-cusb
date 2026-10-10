import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { codexCollections, parseArguments, parseMongoUri, runCleanup } from './cleanup-codex-mongodb.js';

test('cleanup targets exactly the six historical CODEX collections', () => {
  assert.deepEqual(codexCollections.map(({ collection }) => collection), [
    'codexteams',
    'codexchallenges',
    'codexsubmissions',
    'codexscoreevents',
    'codexeventstates',
    'codexusers',
  ]);
  assert.equal(codexCollections.some(({ collection }) => collection === 'cyberhuntstates'), false);
  for (const entry of codexCollections) {
    const model = mongoose.models[entry.model]
      || mongoose.model(entry.model, new mongoose.Schema({}, { strict: false }));
    assert.equal(model.collection.name, entry.collection);
  }
});

test('dry-run is the default and requires an explicit expected database', () => {
  assert.equal(parseArguments(['--expected-database', 'chapter'], {}).delete, false);
  assert.throws(() => parseArguments([], {}), /--expected-database/);
});

test('deletion requires a confirmation token and backup acknowledgement', () => {
  assert.throws(
    () => parseArguments(['--expected-database', 'chapter', '--delete']),
    /--confirm-delete CODEX/,
  );
  assert.throws(
    () => parseArguments(['--expected-database', 'chapter', '--delete', '--confirm-delete', 'CODEX']),
    /--backup-confirmed/,
  );
  const options = parseArguments([
    '--expected-database', 'chapter',
    '--delete',
    '--confirm-delete', 'CODEX',
    '--backup-confirmed',
  ]);
  assert.equal(options.delete, true);
});

test('URI parsing identifies its database and treats remote hosts as guarded', () => {
  assert.deepEqual(parseMongoUri('mongodb://user:secret@localhost:27017/chapter'), {
    databaseFromUri: 'chapter',
    isRemote: false,
  });
  assert.deepEqual(parseMongoUri('mongodb+srv://user:secret@cluster.example/chapter'), {
    databaseFromUri: 'chapter',
    isRemote: true,
  });
  assert.deepEqual(parseMongoUri('mongodb://127.0.0.1:27017/'), {
    databaseFromUri: '',
    isRemote: false,
  });
});

test('an unknown command-line argument is rejected', () => {
  assert.throws(() => parseArguments(['--expected-database', 'chapter', '--force'], {}), /Unknown option/);
});

test('database preflight refuses missing, mismatched, and unapproved remote targets before connecting', async () => {
  await assert.rejects(
    runCleanup(['--expected-database', 'chapter'], {}),
    /MONGODB_URI is not configured; no database connection was attempted/,
  );
  await assert.rejects(
    runCleanup(
      ['--expected-database', 'chapter'],
      { MONGODB_URI: 'mongodb://localhost:27017/other' },
    ),
    /not the expected database "chapter". No connection was attempted/,
  );
  await assert.rejects(
    runCleanup(
      ['--expected-database', 'chapter'],
      { MONGODB_URI: 'mongodb://localhost:27017' },
    ),
    /does not specify a database name. No connection was attempted/,
  );
  await assert.rejects(
    runCleanup(
      ['--expected-database', 'chapter'],
      { MONGODB_URI: 'mongodb://cluster.example/chapter' },
    ),
    /appears remote/,
  );
});

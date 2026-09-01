import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = await Promise.all([
  readFile(new URL('./index.html', import.meta.url), 'utf8'),
  readFile(new URL('./admin.html', import.meta.url), 'utf8')
]);

test('新しい予定は参加者ゼロ件で始まる', () => {
  for (const source of files) {
    assert.doesNotMatch(source, /participantEntries:\s*\[\s*\{\s*name:\s*''/u);
    assert.match(source, /participantEntries:\s*\[\]/u);
  }
});

test('保存済みの空白参加者を読み込み時に除外する', () => {
  for (const source of files) {
    assert.match(source, /name: String\(person\.name \|\| ''\)\.trim\(\)/u);
    assert.match(source, /\.filter\(\(person\) => person\.name\)/u);
  }
});

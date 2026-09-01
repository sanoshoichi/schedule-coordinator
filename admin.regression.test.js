import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./admin.html', import.meta.url), 'utf8');

test('予定全体を保存するsaveStateが重複定義されていない', () => {
  assert.equal((source.match(/async function saveState\s*\(/g) || []).length, 1);
  assert.equal((source.match(/function saveState\s*\(/g) || []).length, 1);
});

test('登録日の解除後に候補日・表・カレンダーを再描画する', () => {
  const removeFunction = source.match(/function removeCandidateDate[\s\S]*?\n    \}/u)?.[0] || '';
  assert.match(removeFunction, /renderCandidateDates\(\)/);
  assert.match(removeFunction, /renderTable\(\)/);
  assert.match(removeFunction, /renderCalendar\(\)/);
});

test('旧データ同期の完了を待ってから予定一覧を描画する', () => {
  assert.match(source, /await syncStateFromServer\(\);\s*renderScheduleSelector\(\)/u);
});

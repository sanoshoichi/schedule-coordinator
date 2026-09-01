import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/u)?.[1] || '';

test('参加リンクがない場合は回答画面を表示しない', () => {
  assert.match(script, /if \(!applyScheduleFromUrl\(\)\)\s*\{\s*showLinkError\(\)/u);
});

test('参加者の読込・保存・記号表示はURL指定の予定IDへ固定する', () => {
  assert.match(script, /const activeId = FORCED_SCHEDULE_ID/u);
  assert.match(script, /find\(s => s\.id === FORCED_SCHEDULE_ID\)/u);
});

test('参加者画面に予定タイトルを表示する', () => {
  assert.match(source, /id="scheduleTitle"/u);
  assert.match(script, /scheduleTitle'\)\.textContent = schedule\.title/u);
});

test('インラインJavaScriptに構文エラーがない', () => {
  assert.doesNotThrow(() => new Function(script));
});

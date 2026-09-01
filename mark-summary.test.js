import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [participant, admin, css] = await Promise.all([
  readFile(new URL('./index.html', import.meta.url), 'utf8'),
  readFile(new URL('./admin.html', import.meta.url), 'utf8'),
  readFile(new URL('./styles.css', import.meta.url), 'utf8')
]);

test('参加者画面と管理者画面に時刻別の三種類の集計を表示する', () => {
  for (const source of [participant, admin]) {
    assert.match(source, /summaryLabelCell\.textContent = '集計'/u);
    assert.match(source, /const counts = \{ circle: 0, triangle: 0, cross: 0 \}/u);
    assert.match(source, /createMarkSummaryCell\(state, slot\.id\)/u);
    assert.match(source, /○\$\{counts\.circle\}人、△\$\{counts\.triangle\}人、×\$\{counts\.cross\}人/u);
  }
});

test('旧形式の回答も丸として集計する', () => {
  for (const source of [participant, admin]) {
    assert.match(source, /typeof response === 'string' \? 'circle' : \(response\.mark \|\| 'circle'\)/u);
  }
});

test('○△×に異なる配色を設定する', () => {
  assert.match(css, /\.slot\.selected\.mark-circle[\s\S]*rgba\(43, 180, 105/u);
  assert.match(css, /\.slot\.selected\.mark-triangle[\s\S]*rgba\(245, 190, 63/u);
  assert.match(css, /\.slot\.selected\.mark-cross[\s\S]*rgba\(235, 86, 104/u);
  assert.match(css, /\.mark-count-circle[\s\S]*\.mark-count-triangle[\s\S]*\.mark-count-cross/u);
});

test('両画面のインラインJavaScriptに構文エラーがない', () => {
  for (const source of [participant, admin]) {
    const script = source.match(/<script>([\s\S]*?)<\/script>/u)?.[1] || '';
    assert.doesNotThrow(() => new Function(script));
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8');
const admin = await readFile(new URL('./admin.html', import.meta.url), 'utf8');
const participant = await readFile(new URL('./index.html', import.meta.url), 'utf8');

test('iPhone幅のレイアウト規則を持つ', () => {
  assert.match(css, /@media \(max-width: 568px\)/u);
  assert.match(css, /env\(safe-area-inset-bottom\)/u);
  assert.match(css, /-webkit-overflow-scrolling: touch/u);
  assert.match(admin, /viewport-fit=cover/u);
  assert.match(participant, /viewport-fit=cover/u);
});

test('Safariの入力時ズームを避ける', () => {
  assert.match(css, /input,[\s\S]*select,[\s\S]*textarea[\s\S]*font-size: 16px/u);
});

test('カレンダーと操作部品に十分なタップ領域を確保する', () => {
  assert.match(css, /\.calendar-day[\s\S]*min-height: 44px/u);
  assert.match(css, /\.schedule-controls select,[\s\S]*\.schedule-controls button[\s\S]*width: 100%/u);
  assert.match(admin, /class="schedule-controls"/u);
});

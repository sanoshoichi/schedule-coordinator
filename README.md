# 日程調整サイト

GitHub Pagesの画面とSupabaseの共有DBを組み合わせた日程調整アプリです。参加者は共有URLから○・△・×を回答し、全員の回答を同じ表で確認できます。

## 構造

- `index.html` / `participant.js`: 参加者画面
- `admin.html` / `admin.js`: 管理画面
- `api.js`: Supabase RPC通信
- `model.js`: 日付・時間枠・回答のドメインロジック
- `supabase.sql`: テーブル、RLS、検証付きRPC
- `model.test.js`: ドメインロジックの自動テスト

## 初回セットアップ

1. SupabaseのSQL Editorで `supabase.sql` を開く。
2. 末尾の `CHANGE_ME` を十分長い管理パスワードへ変更して実行する。
3. 別プロジェクトを使う場合は `config.js` のProject URLとpublishable anon keyを変更する。
4. GitHub Pagesを `main` ブランチのルートから公開する。

参加者URLは `https://sanoshoichi.github.io/sample_site/?schedule=default`、管理画面は `https://sanoshoichi.github.io/sample_site/admin.html` です。

管理パスワードはブラウザへ保存せず、DBにはbcryptハッシュだけを保持します。テーブルへの直接アクセスはRLSで拒否し、入力検証付きRPCだけを公開します。

## テスト

`npm test`

手動テスト: PC・スマートフォン表示、同名回答の更新、別端末での共有、不正な日程ID・名前・時間枠の拒否、誤った管理パスワードの拒否、名前欄のXSS耐性。

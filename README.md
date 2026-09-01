# Schedule Coordinator

## 日程調整アプリ

管理者が候補日時を作成し、予定ごとの専用リンクから参加者が出欠を回答できる日程調整サイトです。共有データは Supabase に保存されます。

### 公開サイト

- 参加者: https://sanoshoichi.github.io/schedule-coordinator/
- 管理者: https://sanoshoichi.github.io/schedule-coordinator/admin.html

### 起動方法

```bash
cd schedule-coordinator
python3 server.py
```

ブラウザで以下を開いて使います。

- 管理者: http://localhost:8000/admin.html
- 参加者: http://localhost:8000/index.html

回答対象は予定ごとのリンクで指定され、参加者には他の予定を表示しません。

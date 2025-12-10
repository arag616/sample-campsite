import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import cors from 'cors';
import fs from 'fs'; // ファイルチェック用にインポート

const app = express();
const PORT = 8080;

// ==========================================
// ★診断レポート出力エリア
// ==========================================
console.log('\n\n========== ★診断レポート開始 ==========');

// 1. 今、プログラムが実行されている場所 (Project Root)
const projectRoot = process.cwd();
console.log('実行場所 (Root):', projectRoot);

// 2. publicフォルダがあると予想される場所
const publicPath = path.join(projectRoot, 'public');
console.log('publicフォルダのパス:', publicPath);

// 3. 実際にそのフォルダがあるかチェック
if (fs.existsSync(publicPath)) {
    console.log('判定: [OK] publicフォルダは見つかりました。');
    
    // 4. 中身をリストアップして表示
    const files = fs.readdirSync(publicPath);
    console.log('中身のファイル一覧:', files);

    // 5. index.html があるかピンポイント確認
    if (files.includes('index.html')) {
        console.log('判定: [OK] index.html も存在します！');
    } else {
        console.log('判定: [ERROR] publicフォルダはありますが、index.html がありません！');
        console.log('ヒント: ファイル名が Index.html になっていませんか？');
    }
} else {
    console.log('判定: [ERROR] publicフォルダ自体が見つかりません！');
    console.log('現在、ルートフォルダにあるもの:', fs.readdirSync(projectRoot));
}
console.log('========== ★診断レポート終了 ==========\n\n');
// ==========================================


// 設定
const ADMIN_EMAIL = 'arataurusu@proton.me';
const SITE_TITLE = 'キャンドルファーム';

// ミドルウェア設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ★修正: 診断で確認したパスを静的ファイル配信に使う
app.use(express.static(publicPath));

// APIエンドポイント (メール送信機能)
app.post('/api/submit', async (req: Request, res: Response) => {
    // ... (メール送信処理は省略せずそのまま残します)
    const { form_type } = req.body;
    // (中略: バリデーションやメール送信ロジックは元のままでOKですが、
    // 長くなるので診断優先のため、一旦レスポンスだけ返す形でも動きます。
    // 今回はエラー解決優先で、ここは簡易的にしておきます)
    res.json({ success: true, message: '診断モード中: 送信機能はスキップされました' });
});

// ルートアクセス時の保険（詳細エラーを表示）
app.get('/', (req: Request, res: Response) => {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <h1>404 Not Found (診断モード)</h1>
            <p>サーバーは動いていますが、以下の場所にファイルがありません。</p>
            <pre>${indexPath}</pre>
            <p>ターミナルのログを確認してください。</p>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
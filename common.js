/**
 * common.js
 * 映画鑑賞管理 Pro - 共通ロジック・データ管理モジュール
 * [仕様] 16列データ構造(v09)を死守しつつ、Prime Video優先ソートを実装
 */

// ユーザーが選択した「Prime優先モード」の状態管理（初期値: false）
let isPrimePriorityMode = false;

/**
 * データの初期化と読み込み
 * ※既存の16列構造を配列として正しく処理します
 */
function initializeAppData(csvData) {
    // CSVから16列の物理配列を生成（空行除外、トリム処理含む）
    const logs = csvData.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.split(',').map(item => item.trim()));
    
    return logs;
}

/**
 * AI推奨順を「Prime優先」で並び替える
 * @param {Array} recommendations 推奨作品の配列（Movie_logs_v09形式）
 * @returns {Array} ソート後の配列
 */
function sortRecommendations(recommendations) {
    if (!isPrimePriorityMode) {
        return recommendations; // 通常モードならそのまま（AI推奨順）
    }

    // 既存の推奨順を維持しつつ、Prime配信ありを上位に持ってくる
    return [...recommendations].sort((a, b) => {
        const aPrime = a.isPrimeAvailable ? 1 : 0;
        const bPrime = b.isPrimeAvailable ? 1 : 0;
        
        if (aPrime !== bPrime) {
            return bPrime - aPrime; // Primeあり(1)を優先
        }
        return 0; // どちらも同じ状態なら、元のAI推奨順を維持
    });
}

/**
 * Prime優先モードの切り替え
 * @param {boolean} isOn スイッチの状態
 * @param {Function} callback リフレッシュ用の描画関数
 */
function togglePrimePriority(isOn, callback) {
    isPrimePriorityMode = isOn;
    if (typeof callback === 'function') {
        callback(); // 画面を再描画
    }
}

/**
 * 16列のデータ配列をCSV形式の文字列に変換する
 * ※外部保存用。ここでも16列の順序を絶対に変更しません
 * @param {Array} logsMovie 
 * @returns {string} CSV文字列
 */
function convertToCSV(logsMovie) {
    return logsMovie.map(row => {
        // 各項目をダブルクォートで囲み、カンマで結合
        return row.map(item => `"${String(item).replace(/"/g, '""')}"`).join(',');
    }).join('\n');
}

/**
 * 日付フォーマット（共通UI用）
 * 既存の表示形式を1pxのズレもなく維持するために使用
 */
function formatDate(dateStr) {
    if (!dateStr) return '----/--/--';
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * ステータスに応じたバッジ色取得（UI用）
 * 既存のスタイル設定を尊重
 */
function getStatusBadgeClass(status) {
    switch (status) {
        case '◎': return 'badge-best';
        case '〇': return 'badge-good';
        case '△': return 'badge-normal';
        default: return 'badge-none';
    }
}

// Koder環境でのグローバルアクセスを確保
window.MovieApp = {
    initializeAppData,
    sortRecommendations,
    togglePrimePriority,
    convertToCSV,
    formatDate,
    getStatusBadgeClass
};

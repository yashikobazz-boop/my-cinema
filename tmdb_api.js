/* --- tmdb_api.js: 外部通信層 (TMDb連携専用) --- */
/* 基準コードから APIキー、ジャンルマップ、画像取得ロジックを完全抽出 */

window.TMDB_API_KEY = 'c1ec50cbe501cef7373933777d802276';

window.GENRE_MAP = {
    'アクション': 28, 'SF': 878, 'ドラマ': 18, 'アニメ': 16, 
    'サスペンス': 53, 'コメディ': 35, 'ファンタジー': 14, 'ホラー': 27
};

/**
 * TMDbから画像URLを取得し、キャッシュに保存する
 */
window.getCachedImageUrl = async function(type, keyword) {
    const cacheKey = `img_cache_${type}_${keyword}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    let url = "";
    try {
        if (type === 'genre') {
            const gid = window.GENRE_MAP[keyword] || 28;
            const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${window.TMDB_API_KEY}&with_genres=${gid}&sort_by=popularity.desc&vote_count.gte=1000&language=ja-JP`);
            const data = await res.json();
            if (data.results?.[0]) url = `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
        } else if (type === 'director' || type === 'actor') {
            const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${window.TMDB_API_KEY}&query=${encodeURIComponent(keyword)}&language=ja-JP`);
            const data = await res.json();
            if (data.results?.[0]) {
                const person = data.results[0];
                if (person.profile_path) {
                    url = `https://image.tmdb.org/t/p/w500${person.profile_path}`;
                } else if (person.known_for?.[0]?.poster_path) {
                    url = `https://image.tmdb.org/t/p/w500${person.known_for[0].poster_path}`;
                }
            }
        }
    } catch (e) { console.error("Fetch Image Error", e); }

    const finalUrl = url || "https://via.placeholder.com/135x202?text=No+Image";
    localStorage.setItem(cacheKey, finalUrl);
    return finalUrl;
};

/**
 * TMDbからシリーズ（コレクション）の詳細情報を取得し、キャッシュに保存する
 */
window.fetchSeriesDetails = async function(seriesId) {
    if (!seriesId || seriesId === "---") return null;

    const cacheKey = `series_cache_${seriesId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    try {
        const url = `https://api.themoviedb.org/3/collection/${seriesId}?api_key=${window.TMDB_API_KEY}&language=ja-JP`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        
        if (data && data.id) {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        }
    } catch (e) {
        console.error("fetchSeriesDetails Error:", seriesId, e);
        return null;
    }
    return null;
};

/**
 * 【新規追加】スイッチON時のみ呼び出される配信状況確認関数
 */
window.fetchWatchProviders = async function(tmdbId) {
    try {
        const url = `https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${window.TMDB_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const providers = data.results?.JP?.flatrate || [];
        // Prime Videoが含まれるかチェック
        return providers.some(p => p.provider_name.includes('Amazon Prime Video'));
    } catch (e) {
        return false;
    }
};

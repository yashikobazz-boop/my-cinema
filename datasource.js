/**
 * ver09 物理配列・単一出演者規律 準拠版 datasource.js
 * 【絶対規律：16列の配列インデックス】
 * 0:tmdbId, 1:seriesId, 2:title, 3:director, 4:genre, 5:year, 6:rating, 7:comment, 
 * 8:imageUrl, 9:productionCountry, 10:productionCompany, 11:recommendedWorks, 
 * 12:status, 13:leadActor(単一文字列), 14:subActor(単一文字列), 15:watchDate
 */

const STORAGE_KEY_V09 = 'Movie_logs_v09';

const initialMovies = [
    [
        218,                                    // 0: tmdbId
        528,                                    // 1: seriesId
        "ターミネーター",                        // 2: title
        "ジェームズ・キャメロン",                // 3: director
        "SF",                                   // 4: genre
        "1984",                                 // 5: year
        "5",                                    // 6: rating
        "ここからすべてが始まった。TMDb IDによる管理のテストケースです。", // 7: comment
        "https://image.tmdb.org/t/p/w500/v99uX67987Gf5vOatvO96U8mdfp.jpg", // 8: imageUrl
        "アメリカ合衆国",                       // 9: productionCountry
        "Orion Pictures",                       // 10: productionCompany
        "ターミネーター2, エイリアン2",          // 11: recommendedWorks
        "◎",                                    // 12: status
        "アーノルド・シュワルツェネッガー",      // 13: leadActor (主演)
        "マイケル・ビーン",                      // 14: subActor (助演：単一)
        "1984-10-26"                            // 15: watchDate
    ]
];

function loadMovies() {
    const storedMovies = localStorage.getItem(STORAGE_KEY_V09);
    if (storedMovies) {
        try {
            const parsed = JSON.parse(storedMovies);
            return parsed.map(m => convertToStrictArray(m));
        } catch (e) {
            console.error("データの読み込みに失敗しました:", e);
            return initialMovies;
        }
    } else {
        saveMovies(initialMovies);
        return initialMovies;
    }
}

// データを規律通りの16列配列へ物理変換し、「|」を排除する
function convertToStrictArray(m) {
    let res = new Array(16).fill("");
    if (Array.isArray(m)) {
        for (let i = 0; i < Math.min(m.length, 16); i++) res[i] = m[i];
    } else {
        res[0]=m.tmdbId; res[1]=m.seriesId; res[2]=m.title; res[3]=m.director;
        res[4]=m.genre; res[5]=m.year; res[6]=m.rating; res[7]=m.comment;
        res[8]=m.imageUrl; res[9]=m.productionCountry; res[10]=m.productionCompany;
        res[11]=m.recommendedWorks; res[12]=m.status; res[13]=m.leadActor;
        res[14]=m.subActor || m.subActors; res[15]=m.watchDate;
    }

    // 「|」が含まれる場合は最初の1名のみを抽出（主演・助演共）
    if (typeof res[13] === 'string' && res[13].includes('|')) res[13] = res[13].split('|')[0].trim();
    if (Array.isArray(res[14])) res[14] = res[14][0] || "";
    if (typeof res[14] === 'string' && res[14].includes('|')) res[14] = res[14].split('|')[0].trim();
    
    return res;
}

function saveMovies(movies) {
    try {
        localStorage.setItem(STORAGE_KEY_V09, JSON.stringify(movies));
    } catch (e) {
        console.error("保存失敗:", e);
    }
}

function addMovie(movieArray) {
    const movies = loadMovies();
    movies.unshift(convertToStrictArray(movieArray)); 
    saveMovies(movies);
}

function deleteMovie(index) {
    const movies = loadMovies();
    if (index >= 0 && index < movies.length) {
        movies.splice(index, 1);
        saveMovies(movies);
        return true;
    }
    return false;
}

function updateMovie(index, updatedMovieArray) {
    const movies = loadMovies();
    if (index >= 0 && index < movies.length) {
        movies[index] = convertToStrictArray(updatedMovieArray);
        saveMovies(movies);
        return true;
    }
    return false;
}

function getGenreStats() {
    const movies = loadMovies();
    const stats = {};
    movies.forEach(m => { if (m[4]) stats[m[4]] = (stats[m[4]] || 0) + 1; });
    return stats;
}

function getDirectorStats() {
    const movies = loadMovies();
    const stats = {};
    movies.forEach(m => { if (m[3]) stats[m[3]] = (stats[m[3]] || 0) + 1; });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
}

function isDuplicate(title) {
    return loadMovies().some(m => m[2] === title);
}

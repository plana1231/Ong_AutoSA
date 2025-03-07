(async function() {
    if (window.location.href !== "https://ongeki-net.com/ongeki-mobile/record/playlog/") {
        alert("このブックマークレットはオンゲキNETのプレイ履歴ページでのみ使用できます。");
        return;
    }

    try {
        let res = await fetch(window.location.href, { credentials: "include" });
        let html = await res.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");

        processData(doc);
    } catch (err) {
        alert("元データの取得に失敗しました。ページのリロードを試してください。");
        console.error(err);
    }
})();

async function processData(doc) {
    function generateAuthCode() {
        return [...Array(12)].map(() => Math.random().toString(36)[2]).join("").toUpperCase();
    }
    const authCode = generateAuthCode();

    let d = {
        "diff_basic.png": "BASIC",
        "diff_advanced.png": "ADVANCED",
        "diff_expert.png": "EXPERT",
        "diff_master.png": "MASTER",
        "diff_lunatic.png": "LUNATIC"
    };

    let times = [], titlesWithDiff = [], scores = [];

    doc.querySelectorAll('.m_10').forEach(e => {
        let t = e.querySelector('.f_r.f_12.h_10')?.textContent.trim() || "UNKNOWN_TIME";
        let n = e.querySelector('.m_5.l_h_10.break')?.textContent.trim() || "UNKNOWN_TITLE";
        let i = e.querySelector('img[src*="diff_"]')?.getAttribute("src")?.split("/").pop();
        let l = d[i] || "UNKNOWN_DIFFICULTY";
        let s = e.querySelector('.technical_score_block .f_20')?.textContent.trim() || 
                e.querySelector('.technical_score_block_new .f_20')?.textContent.trim() || 
                "UNKNOWN_SCORE";

        let formattedTitle = `${n.trim()} [${l.trim()}]`.replace(/\s+\[/, " [");

        times.push(t);
        titlesWithDiff.push(formattedTitle);
        scores.push(s);
    });

    let cleanedTitles = titlesWithDiff.map(title => title.trim()).join("\\");
    let cleanedTimes = times.map(time => time.trim()).join("\\");
    let cleanedScores = scores.map(score => score.trim()).join("\\");

    const formUrl1 = "https://docs.google.com/forms/d/e/1FAIpQLSf9f8JF2wCGCCiRhVzFtrYrFQtKM4WnguaAbJjVjqa_5z3xRQ/formResponse";
    const entryAuthCode = "entry.789034398";
    const entryTimes = "entry.1093799627";
    const entryTitlesWithDiff = "entry.1198088861";
    const entryScores = "entry.1246665799";

    const formData = new URLSearchParams();
    formData.append(entryAuthCode, authCode);
    formData.append(entryTimes, cleanedTimes);
    formData.append(entryTitlesWithDiff, cleanedTitles);
    formData.append(entryScores, cleanedScores);

    await fetch(formUrl1, {
        method: "POST",
        body: formData,
        mode: "no-cors"
    }).then(() => {
        console.log("スコアデータ送信成功！");
    }).catch(e => {
        console.error("スコアデータ送信失敗", e);
    });

    alert("スコアを取得しました。\n送信フォームに移動します。");

    const formUrl2 = `https://docs.google.com/forms/d/e/1FAIpQLSfRfDw5S1_1svQ8TkpGO0Ot6GR4agnZ2gncwFaMDzmMBwZS_w/viewform?usp=pp_url&entry.1659678167=${authCode}`;
    setTimeout(() => window.open(formUrl2, "_blank"), 2000);
}

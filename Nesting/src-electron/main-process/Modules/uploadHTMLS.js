import scrap from './scraper';
import { getDBInstance, updateDB } from './database';

async function uploadHTMLS(htmls, dbDir, event) {
    let stats = {
        completed: false,
        totalHTMLs: htmls.length,
        succeded: 0,
        failed: 0
    },
        individualHTMLStats = [],
        db = await getDBInstance(dbDir);

    for (let i = 0; i < stats.totalHTMLs; i++) {
        const { path: filePath, name: fileName } = htmls[i];
        try {
            let htmlContent = scrap(filePath);
            await updateDB(db, htmlContent);
            individualHTMLStats.push({
                name: fileName,
                path: filePath,
                success: true,
                errorMessage: null
            });
            stats.succeded++;
        }
        catch (err) {
            individualHTMLStats.push({
                name: fileName,
                path: filePath,
                success: false,
                errorMessage: err
            });
            stats.failed++;
        }
        event.reply("update-uploading-status", stats);
    }
    stats.completed = true;
    stats.individualHTMLStats = individualHTMLStats;
    db.close();
    return stats;
}

export default uploadHTMLS;
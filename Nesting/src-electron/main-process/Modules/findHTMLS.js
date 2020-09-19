import HTML from './HTMLClass'
import { getDBInstance } from './database'

async function findHTMLs(drawingNumbers, occurences, dbDir) {
    try {
        let db = await getDBInstance(dbDir);
        let html = new HTML(drawingNumbers, occurences, db);
        const allResults = await html.getAllResults();

        const data = renderOutput(drawingNumbers, occurences, allResults["Best Matches (Part occurence wise)"])
        const notFound = allResults["Drawings not found in HTMLs"];
        db.close();
        return {
            data,
            notFound
        }
    } catch (err) {
        console.log(`Error occured in findHTMLs\n${err}`);
    }
}


function renderOutput(drawingNumbers, occurences, available) {
    let output = [];

    available.forEach(({ name, drawings }) => {
        let html, satisfy = [], drawingNumber = [], foundCount = [], requiredCount = [];
        html = name;
        drawings.forEach(({ drawingNumber: dn, occur }) => {
            const requiredOccur = occurences[drawingNumbers.indexOf(dn)]
            drawingNumber.push(dn)
            foundCount.push(occur)
            requiredCount.push(requiredOccur)
            satisfy.push(requiredOccur == occur ? true : false)
        })
        output.push({
            html,
            satisfy,
            drawingNumber,
            foundCount,
            requiredCount
        })
    })
    return output;
}

export default findHTMLs;
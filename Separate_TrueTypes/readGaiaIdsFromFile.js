const fileSystem = require('fs');
const readline = require('readline');
const pushGaiaIdsToFile = require('./pushGaiaIdsToFile');

let lineNum = 0;
let gaiaIds = '';

// read GaiaDestinations from temporary file, line by line, and identify the 'trueType' and 'gaiaType' of each from Gearbox.
// for each unique trueType, create a matrix file begginnig with 'destId', and followed by the list of vendorids for that trueType.
const readGaiaIdsFromFile = () => {
    return new Promise((resolve, reject) => {

        // read temporary file, line by line
        let readLine = readline.createInterface({
            input: fileSystem.createReadStream('Separate_TrueTypes/gaiaDestinationIds.txt')
        });

        // push data to file at each 100000 lines read
        readLine.on('line', async (line) => {
            lineNum++;
            gaiaIds += line;

            if (0 == lineNum % 100000) {
                // sample current gaiaIds string for processing
                readLine.pause();
            };

        }).on('pause', async () => {
            // process gaiaIds string
            let usedIds = await pushGaiaIdsToFile(gaiaIds);
            // remove used ids from gaiaids string to avoid duplication
            gaiaIds = gaiaIds.replace(usedIds, '');
            // resume line reading
            readLine.resume();
        }).on('close', async () => {
            // push any remaining gaiaid's to file
            await pushGaiaIdsToFile(gaiaIds);

            console.log('Finished constructing matrix files');

            readLine.close();
            resolve();
        });
    });
};

module.exports = readGaiaIdsFromFile;

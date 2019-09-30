const fileSystem = require('fs');
const {
    sequelizeQuery
} = require('../helpers/sequelizeFunctions');

const pushGaiaIdsToFile = (gaiaIds) => {
    return new Promise(async (resolve, reject) => {

        let collection = gaiaIds.trim().split(' ').join(',');

        // construct query string
        let queryString = `
            SELECT
                t1.expedia_ref,
                t2.name AS tt_name
            FROM
                traces t1
                JOIN tracetruetypes t2 ON t1.truetype_id = t2.id
            WHERE
                t1.expedia_ref IN (${collection});
        `;

        // query db
        let [results, metadata] = await sequelizeQuery(queryString);

        for (result in results) {
            // append each vendorId to the end of the appropriate matrix file
            fileSystem.appendFileSync(`Separate_TrueTypes/true_types/trueType_${results[result].tt_name}.csv`, `${results[result].expedia_ref} \r\n`);
        };

        resolve(gaiaIds);

    });

};

module.exports = pushGaiaIdsToFile;
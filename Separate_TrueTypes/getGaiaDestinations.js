const driver = require('../helpers/neo4j-driver');
const fileSystem = require('fs');

const getGaiaDestinations = () => {
    return new Promise(async (resolve, reject) => {

        //define query - retrieve vendorIds from all GaiaDestinations in graph
        const queryString = `
        MATCH
            (d:GaiaDestination)
        WHERE
            exists(d.vendorId)
        RETURN
            d.vendorId
    `;

        //connect to neo4j db & start session
        const session = driver.session();

        try {
            //submit query
            result = await session.run(queryString);

            //save query results to temporary file as line separated values
            result.records.forEach(record => {
                fileSystem.appendFileSync('Separate_TrueTypes/gaiaDestinationIds.txt', `${record.get('d.vendorId')} \r\n`);
            });

            //disconnect from database
            session.close();
            driver.close();
            resolve();

        } catch (err) {
            //handle errors
            console.error(err);
        };
    });
};

module.exports = getGaiaDestinations;
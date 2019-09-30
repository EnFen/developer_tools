// Adds the templateId for a build to the factors table in the enigma2dev DB
// Note: This is an interim script that will be used while enigmatasks do not update the template id to factors

// Operation: node addTemplateIdToFactors.js <template_id> <array of build ids> [<limit>]

// E.g. run 'node addTemplateIdToFactors.js 123 4567,8910,1112 10000'
// to update builds 4567, 8910, and 1112 with the template_id 123, 10000 rows at a time
// if the final argument (limit) is omitted, it will default to 20000

const {
    sequelizeConnect,
    sequelizeQuery,
    sequelizeClose
} = require('../helpers/sequelizeFunctions');

const template_id = parseInt(process.argv[2]);
const build_ids = process.argv[3].split(',');
const limit = parseInt(process.argv[4]) || 20000;

const updateFactors = async () => {
    try {
        // connect to db
        await sequelizeConnect('ENIGMA');

        // loop through supplied build ids
        for (build_id of build_ids) {

            let totalRows = 0;
            let affectedRows = limit;

            // crete query string
            let queryString = `
                    UPDATE
                        factors
                    SET
                        template_id = ${template_id}
                    WHERE
                        build_id = ${build_id}
                    AND
                        template_id = 0
                    LIMIT
                        ${limit};
                `;
            // paginate queries based on supplied limit
            while (limit === affectedRows) {
                let [results, metadata] = await sequelizeQuery(queryString);
                totalRows += metadata.changedRows;
                console.log(`Current rows for build ${build_id} updated =`, totalRows);
                affectedRows = metadata.affectedRows;
            };
            // signal the end of processing for a single build
            console.log('Batch finished');
        };

        // disconnect from db
        await sequelizeClose();

    } catch (err) {
        console.error('Unable to connect to database', err);
    };
};

updateFactors();
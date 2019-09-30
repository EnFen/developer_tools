// Updates the 'valid', 'invalid', and 'error' status of builds on the enigma builds interface
// for build_ids passed in the second argument

// Operation: node updateBuildInterface.js <comma separated build ids>

// E.g. run 'node updateBuildInterface.js 1234,5678,9101,2131' to update the interface for build ids 1234, 5678, 9101, and 2131.

const {
    sequelizeConnect,
    sequelizeQuery,
    sequelizeClose
} = require('../helpers/sequelizeFunctions');

const build_ids = process.argv[2].split(',');

const updateBuildInterface = async () => {
    try {

        await sequelizeConnect('GB');

        for (build_id of build_ids) {

            let queryString = `
                UPDATE
                enigmabuilds
                SET
                    success_rate = (
                        SELECT COUNT(*) FROM enigmatasks WHERE build_id = ${build_id} AND status_id IN (1, 101)
                    )/initial_candidate_count * 100,
                    failure_rate = (
                        SELECT COUNT(*) FROM enigmatasks WHERE build_id = ${build_id} AND status_id IN (2, 102)
                    )/initial_candidate_count * 100,
                    error_rate = (
                        SELECT COUNT(*) FROM enigmatasks WHERE build_id = ${build_id} AND status_id IN (3, 103)
                    )/initial_candidate_count * 100,
                    completion_rate = (
                        SELECT COUNT(*) FROM enigmatasks WHERE build_id = ${build_id}
                    ) / initial_candidate_count * 100,
                    processed_candidate_count = (
                        SELECT COUNT(*) FROM enigmatasks WHERE build_id = ${build_id}
                    )
                WHERE
                    id = ${build_id};
            `;

            const [results, metadata] = await sequelizeQuery(queryString);

            console.log(`${build_id} status:: `, metadata.info);
            if (0 < metadata.changedRows) {
                console.log(`Interface for build ${build_id} updated`);
            } else {
                console.log('No changes to interface');
            };
        };

        await sequelizeClose();

    } catch (err) {
        console.error('Unable to connect to database', err);
    }
};

updateBuildInterface();
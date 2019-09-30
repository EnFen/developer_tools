const fileSystem = require('fs');
const getGaiaDestinations = require('./getGaiaDestinations');
const dir = 'Separate_TrueTypes/true_types';
const createMatrixFiles = require('./readGaiaIdsFromFile');
const {
    sequelizeConnect,
    sequelizeClose
} = require('../helpers/sequelizeFunctions');

const createMatrices = async () => {
    // clear gaiaDestinationIds, if existing
    if (fileSystem.existsSync('Separate_TrueTypes/gaiaDestinationIds.txt')) {
        fileSystem.unlinkSync('Separate_TrueTypes/gaiaDestinationIds.txt');
    };

    // reset contents of true_types folder
    let files = fileSystem.readdirSync(dir);

    files.forEach(file => {
        fileSystem.unlinkSync(`${dir}/${file}`);
    });

    // get GaiaDestinations (vendorIds) from Graph and save to temporary file
    await getGaiaDestinations();

    // read GaiaDestinations from temporary file, line by line, and identify the 'trueType' and 'gaiaType' of each from Gearbox.
    // connect to Gearbox db and start session
    await sequelizeConnect('GB');

    // for each unique trueType, create a matrix file begginnig with 'destId', and followed by the list of vendorids for that trueType.
    await createMatrixFiles();

    // close connection to db
    await sequelizeClose();

    //TODO: create copies of files with correct POS and template information included (suggest querying enigmatemplates table which has both of these data)

    // delete temporary file
    fileSystem.unlinkSync('Separate_TrueTypes/gaiaDestinationIds.txt');
};

createMatrices();
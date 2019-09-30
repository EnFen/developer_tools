require('dotenv').config();
const Sequelize = require('sequelize');
let sequelize;

const sequelizeConnect = async (database) => {
    let database_name;
    let database_host;
    switch (database) {
        case 'GB':
            database_name = process.env.GB_NAME;
            database_host = process.env.GB_HOST;
            break;
        case 'ENIGMA':
            database_name = process.env.ENIGMA_NAME;
            database_host = process.env.ENIGMA_HOST;
            break;
        default:
            database_name = 'Not specified';
            database_host = 'Not specified';
    };

    sequelize = new Sequelize(database_name, process.env.DB_USER, process.env.DB_PASS, {
        host: database_host,
        dialect: 'mysql',
        logging() { /* Custom logging */ }
    });

    try {
        await sequelize.authenticate();
        console.log('Connection to database successful.');
    } catch (err) {
        console.error(err)
    };
    return;
};

const sequelizeQuery = async (query) => {
    return sequelize.query(query);
};

const sequelizeClose = async () => {
    return sequelize.close();
};

module.exports = {
    sequelizeConnect,
    sequelizeQuery,
    sequelizeClose
};
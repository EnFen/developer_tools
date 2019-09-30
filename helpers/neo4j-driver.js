require('dotenv').config();

const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver(
    `bolt://${process.env.NEO_HOST}:7687`,
    neo4j.auth.basic(process.env.NEO_USER, process.env.NEO_PASS)
);


// const session = driver.session();

// session.run('MATCH (d:GaiaDestination) RETURN d LIMIT 5')
//     .then(result => {
//         result.records.forEach(record => {
//             console.log(record.get('d').properties.vendorId)
//         })
//     })
//     .catch(err => {
//         console.error(err)
//     })
//     .then(() => {
//         session.close();
//         driver.close();
//     });



module.exports = driver;
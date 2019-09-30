const fileSystem = require('fs');
const path = require('path');
const ReadDir = 'Separate_TrueTypes/true_types';
const WriteDir = 'Create_Matrix_Templates/matrix_template_files';
const {
	sequelizeConnect,
	sequelizeQuery,
	sequelizeClose
} = require('../helpers/sequelizeFunctions');


const createMatrixTemplates = async () => {

	// reset contents of matrix_template_files folder
	let writeFiles = fileSystem.readdirSync(WriteDir);

	writeFiles.forEach(file => {
		fileSystem.unlinkSync(`${WriteDir}/${file}`);
	});

	// Query gearbox DB to find POS, templateId, and compatible trueType labels within the CarRentals brand

	//  connect to db
	await sequelizeConnect('GB');
	//  construct query string
	let queryString = `
		SELECT
			t1.script_id as pos_name,
			t4.id as template_id,
			t4.compatible_labels as true_types
		FROM
			pointofsales t1
		JOIN
			sites t2 on t1.site_id = t2.id
		JOIN
			brands t3 on t2.brand_id = t3.id
		JOIN
			enigmatemplates t4 on t1.id = t4.pos_id
		WHERE
			t3.name = 'CarRentals';
	`;


	//  submit query
	let [results, metadata] = await sequelizeQuery(queryString);
	for (result in results) {
		//  assign results to variables: pos_name (string), true_types (array), template_id (string)
		let pos_name = results[result].pos_name
		let template_id = results[result].template_id
		let true_types = results[result].true_types
		//  create a new varable: concatTrueType -> this will handle [Country, State, Area], [Island, IslandCity], and other compound matrices
		let concatTrueType = true_types.join('_');
		// outfile defines the file path and name where the matrix file will be written
		let outfile = path.join(WriteDir, `${pos_name}_${concatTrueType}_T${template_id}.csv`);


		// for each truetype returned from gearbox DB, collect the corresponding file from the 'ReadDir' and assign them to 'matchingFiles' array
		let matchingFiles = [];
		// for each trueType in trueTypes:
		for (true_type of true_types) {
			// get the appropriate file from ReadDir
			//	for each trueType file in Separate_TrueTypes/true_types:
			let readFiles = fileSystem.readdirSync(ReadDir);
			readFiles.forEach(file => {
				//  for each file name, extract the trueType
				// if (file.indexOf(true_type.toLowerCase()) > -1) {
				if (true_type.toLowerCase() === /trueType_([\w\s]*)/g.exec(file)[1].split(/[\s_]/).join('')) {
					// add file to list
					matchingFiles.push(file);
				};
			});
		};


		// if the outfile doesn't already exist, create it, and print 'destId' on the first line (with a line break)
		if (!fileSystem.existsSync(outfile)) {
			fileSystem.appendFileSync(outfile, 'destId \r\n');
		};
		// 	append the contents of all matchingFiles to the outfile. (NOTE: 'a' flag sets the writeStream to append mode)
		let outStream = fileSystem.createWriteStream(outfile, { flags: 'a' });
		for (file of matchingFiles) {
			fileSystem.createReadStream(path.join(ReadDir, file)).pipe(outStream);
		};

	};

	//  close connection to DB
	await sequelizeClose();

};

createMatrixTemplates();
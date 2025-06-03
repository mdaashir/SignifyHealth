const connection = require('../db');
const router = require( 'express' ).Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - p_name
 *         - p_age
 *         - p_dob
 *         - p_gender
 *         - p_address
 *         - p_mobileNumber
 *         - p_BloodGroup
 *         - p_height
 *         - p_weight
 *         - p_maritalStatus
 *         - p_medications
 *       properties:
 *         p_name:
 *           type: string
 *           description: Full name of the patient
 *         p_age:
 *           type: integer
 *           description: Age of the patient
 *         p_dob:
 *           type: string
 *           format: date
 *           description: Date of birth (YYYY-MM-DD)
 *         p_gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *           description: Gender of the patient
 *         p_address:
 *           type: string
 *           description: Address of the patient
 *         p_mobileNumber:
 *           type: string
 *           pattern: '^[0-9]{10}$'
 *           description: 10-digit mobile number
 *         p_BloodGroup:
 *           type: string
 *           description: Blood group of the patient
 *         p_height:
 *           type: number
 *           description: Height of the patient in cm
 *         p_weight:
 *           type: number
 *           description: Weight of the patient in kg
 *         p_maritalStatus:
 *           type: string
 *           enum: [Single, Married, Divorced, Widowed]
 *           description: Marital status of the patient
 *         p_medications:
 *           type: string
 *           description: Current medications the patient is taking
 */

// Endpoint to add a new patient
/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Add a new patient
 *     description: Creates a new patient entry in the database.
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient inserted successfully
 *       500:
 *         description: Internal server error
 */

router.post('/', (req, res) => {
	const {
		p_name,
		p_age,
		p_dob,
		p_gender,
		p_address,
		p_mobileNumber,
		p_BloodGroup,
		p_height,
		p_weight,
		p_maritalStatus,
		p_medications,
	} = req.body;

	connection.query(
		'CALL InsertPatient(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
		[
			p_name,
			p_age,
			p_dob,
			p_gender,
			p_address,
			p_mobileNumber,
			p_BloodGroup,
			p_height,
			p_weight,
			p_maritalStatus,
			p_medications,
		],
		(err, results) => {
			if (err) {
				console.error('Error inserting patient details:', err);
				return res.status(500).json({ error: 'Internal server error' });
			}
			console.log('Inserted new patient:', results);
			res.status(201).json({ message: 'Patient inserted successfully' });
		}
	);
});

// Endpoint to fetch patient details by ID
/**
 * @swagger
 * /api/patients/{patientId}:
 *   get:
 *     summary: Get a patient by ID
 *     description: Retrieve details of a patient by their ID.
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the patient
 *     responses:
 *       200:
 *         description: Successfully retrieved patient data
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */

router.get('/:patientId', (req, res) => {
	const patientId = req.params.patientId;
	console.log(`Fetching details for patient ID: ${patientId}`);

	connection.query('CALL GetPatient(?)', [patientId], (err, results) => {
		if (err) {
			console.error('Error fetching patient details:', err);
			return res.status(500).json({ error: 'Internal server error' });
		}
		console.log('Fetched data:', results[0]);
		//console.log(results);
		//console.log('%d',results.length)
		//console.log('%d',results[0].length)

		if (!results[0].length) {
			console.log(`Patient with ID ${patientId} not found`);
			return res
				.status(404)
				.json({ error: `Patient with ID ${patientId} not found` });
		}

		res.status(200).json(results[0]);
	});
});

// Endpoint to fetch all patients
/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     description: Fetches a list of all patients.
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: Successfully retrieved all patients
 *       404:
 *         description: No patients found
 *       500:
 *         description: Internal server error
 */

router.get('/', (_, res) => {
	connection.query('CALL GetAllPatients()', (err, results) => {
		if (err) {
			console.error('Error fetching all patients:', err);
			return res.status(500).json({ error: 'Internal server error' });
		}

		try {
			const rowDataPacket = results[0][0].patients;
			//console.log('patient_details: ', rowDataPacket);
			const patients_data = rowDataPacket;
			console.log('Fetched all patients:', patients_data);
			//console.log(results);
			//console.log('%d',results.length)
			//console.log('%d',results[0].length)

			if (!patients_data.length) {
				console.log('No patients found');
				return res.status(404).json({ error: 'No patients found' });
			}

			res.status(200).json(patients_data);
			console.log('done');
		} catch (error) {
			console.error('Error parsing patient data:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
});

// Endpoint to modify patient details
/**
 * @swagger
 * /api/patients:
 *   put:
 *     summary: Modify patient details
 *     description: Update a specific field for a patient.
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - detailColumn
 *               - newValue
 *             properties:
 *               patientId:
 *                 type: integer
 *                 description: ID of the patient to update
 *               detailColumn:
 *                 type: string
 *                 description: Column name to update
 *               newValue:
 *                 type: string
 *                 description: New value for the column
 *     responses:
 *       200:
 *         description: Patient modified successfully
 *       500:
 *         description: Internal server error
 */

router.put('/', (req, res) => {
    const { patientId, detailColumn, newValue } = req.body;

	connection.query(
		'CALL ModifyPatient(?, ?, ?)',
		[patientId, detailColumn, newValue],
		(err) => {
			if (err) {
				console.error('Error modifying patient:', err);
				return res.status(500).json({ error: 'Internal server error' });
			}
			console.log(`Patient ID ${patientId} modified successfully`);
			res.status(200).json({ message: 'Patient modified successfully' });
		}
	);
});

module.exports = router;

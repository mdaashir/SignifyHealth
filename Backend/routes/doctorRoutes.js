const connection = require('../db');
const router = require('express').Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Doctor:
 *       type: object
 *       required:
 *         - doctorName
 *         - specialization
 *         - qualification
 *         - contact
 *       properties:
 *         doctorName:
 *           type: string
 *           description: Full name of the doctor
 *         specialization:
 *           type: string
 *           description: Specialization field of the doctor
 *         qualification:
 *           type: string
 *           description: Qualifications of the doctor
 *         contact:
 *           type: string
 *           pattern: '^[0-9]{10}$'
 *           description: 10-digit contact number of the doctor
 */

// Endpoint to add a new doctor
/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Add a new doctor
 *     description: Creates a new doctor entry in the database.
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doctor'
 *     responses:
 *       201:
 *         description: Doctor added successfully
 *       500:
 *         description: Internal server error
 */

router.post('/', (req, res) => {
	const { doctorName, specialization, qualification, contact } = req.body; // Destructure properties from req.body

	// Call the stored procedure to insert doctor details
	const query = 'CALL InsertDoctor(?, ?, ?, ?)';
	connection.query(
		query,
		[doctorName, specialization, qualification, contact],
		(err) => {
			if (err) {
				console.error('Error adding doctor:', err);
				return res.status(500).json({ error: 'Error adding doctor' });
			}
			console.log('Doctor added successfully');
			res.status(201).json({ message: 'Doctor added successfully' });
		}
	);
});

// Endpoint to fetch all doctors
/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors
 *     description: Fetches a list of all doctors.
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Successfully retrieved all doctors
 *       404:
 *         description: No doctors found
 *       500:
 *         description: Internal server error
 */

router.get('/', (_, res) => {
	connection.query('CALL GetAllDoctors()', (err, results) => {
		try {
			if (err) {
				console.error('Error fetching doctors details:', err);
				throw err; // Re-throw the error for handling by error-handling middleware
			}

			const rowDataPacket = results[0][0].doctors;
			//console.log('patient_details: ', rowDataPacket);
			const doctors_data = rowDataPacket;
			console.log('Fetched data: ', doctors_data);
			//console.log(results);
			//console.log('%d',results.length)
			//console.log('%d',results[0].length)

			if (doctors_data.length === 0) {
				console.log('Doctors not found!');
				return res.status(404).json({ error: 'Doctors not found' });
			}
			res.status(200).json(doctors_data);
			console.log('done');
		} catch (error) {
			console.error('Error in Doctor data retrieval:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});
});

// Endpoint to fetch a doctor by ID
/**
 * @swagger
 * /api/doctors/{doctorId}:
 *   get:
 *     summary: Get a doctor by ID
 *     description: Retrieve details of a doctor by their ID.
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the doctor
 *     responses:
 *       200:
 *         description: Successfully retrieved doctor data
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Internal server error
 */

router.get('/:doctorId', (req, res) => {
	//console.log(req);
	const doctorId = req.params.doctorId;
	console.log(doctorId);
	console.log(typeof doctorId);
	connection.query('CALL Getdoctorsid(?)', [doctorId], (err, results) => {
		try {
			if (err) {
				console.error('Error fetching doctor details:', err);
				throw err; // Re-throw the error for handling by error-handling middleware
			}

			const rowDataPacket = results[0][0].doctor_details;
			const doctors_data = rowDataPacket;
			console.log('Fetched data: ', doctors_data);
			//console.log(results);
			//console.log('%d',results.length)
			//console.log('%d',results[0].length)

			if (doctors_data.length === 0) {
				console.log('Doctors not found!');
				return res.status(404).json({ error: 'Doctor not found' });
			}
			res.status(200).json(doctors_data);
			console.log('done');
		} catch (error) {
			console.error('Error in Doctor data retrieval');
			res.status(500).json({ error: 'Internal server error' });
		}
	});
});

// Endpoint to fetch doctors by department
/**
 * @swagger
 * /api/doctors/department/{departmentName}:
 *   get:
 *     summary: Get doctors by department
 *     description: Fetches a list of doctors based on department specialization.
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: departmentName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the department (e.g., Cardiology, Neurology)
 *     responses:
 *       200:
 *         description: Successfully retrieved doctor data
 *       404:
 *         description: No doctors found in the given department
 *       500:
 *         description: Internal server error
 */

router.get('/department/:departmentName', (req, res) => {
	//console.log(req);
	const departmentName = req.params.departmentName;
	console.log(departmentName);
	console.log(typeof departmentName);
	connection.query(
		'CALL Get_dept_Doctors(?)',
		[departmentName],
		(err, results) => {
			if (err) {
				console.error('Error fetching doctors details:', err);
				return res.status(500).json({ error: 'Internal server error' });
			}

			const rowDataPacket = results[0][0].doctors_spec;
			const doctors_data = rowDataPacket;
			console.log('Fetched data: ', doctors_data);
			//console.log(results);
			//console.log('%d',results.length)
			//console.log('%d',results[0].length)

			if (doctors_data.length === 0) {
				console.log('Doctors not found!');
				return res
					.status(404)
					.json({ error: 'Doctors not found in this department' });
			}
			res.status(200).json(doctors_data);
			console.log('done');
		}
	);
});

// Endpoint to modify doctor details
/**
 * @swagger
 * /api/doctors:
 *   put:
 *     summary: Modify doctor details
 *     description: Update a specific field for a doctor.
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - detailColumn
 *               - newValue
 *             properties:
 *               doctorId:
 *                 type: integer
 *                 description: ID of the doctor to update
 *               detailColumn:
 *                 type: string
 *                 description: Column name to update
 *               newValue:
 *                 type: string
 *                 description: New value for the column
 *     responses:
 *       200:
 *         description: Doctor modified successfully
 *       500:
 *         description: Internal server error
 */

router.put('/', (req, res) => {
	const { doctorId, detailColumn, newValue } = req.body;

	connection.query(
		'CALL ModifyDoctor(?, ?, ?)',
		[doctorId, detailColumn, newValue],
		(err) => {
			if (err) {
				console.error('Error modifying doctor:', err);
				return res.status(500).json({ error: 'Error modifying doctor' });
			}
			console.log(`Doctor ID ${doctorId} modified successfully`);
			res.status(200).json({ message: 'Doctor modified successfully' });
		}
	);
});

// Endpoint to remove a doctor
/**
 * @swagger
 * /api/doctors:
 *   delete:
 *     summary: Remove a doctor
 *     description: Remove a doctor from the system.
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - reason
 *             properties:
 *               doctorId:
 *                 type: integer
 *                 description: ID of the doctor to remove
 *               reason:
 *                 type: string
 *                 description: Reason for removal
 *     responses:
 *       200:
 *         description: Doctor removed successfully
 *       500:
 *         description: Internal server error
 */

router.delete('/', (req, res) => {
	const { doctorId, reason } = req.body;

	connection.query('CALL RemoveDoctor (?, ?)', [doctorId, reason], (err) => {
		if (err) {
			console.error('Error removing doctor:', err);
			return res.status(500).json({ error: 'Error removing doctor' });
		}
		console.log('Doctor Removed successfully');
		res.status(200).json({ message: 'Doctor removed successfully' });
	});
});

module.exports = router;

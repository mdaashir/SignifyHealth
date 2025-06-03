const connection = require('../db');
const router = require('express').Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *         - appointmentDate
 *         - appointmentTime
 *         - appointmentType
 *         - appointmentReason
 *       properties:
 *         patientId:
 *           type: integer
 *           description: ID of the patient
 *         doctorId:
 *           type: integer
 *           description: ID of the doctor
 *         appointmentDate:
 *           type: string
 *           format: date
 *           description: Date of the appointment (YYYY-MM-DD)
 *         appointmentTime:
 *           type: string
 *           format: time
 *           description: Time of the appointment
 *         appointmentType:
 *           type: string
 *           description: Type of appointment (e.g., Consultation, Checkup)
 *         appointmentReason:
 *           type: string
 *           description: Reason for the appointment
 */

// Endpoint to book an appointment
/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book an appointment
 *     description: Creates a new appointment entry.
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       500:
 *         description: Internal server error
 */

router.post('/', (req, res) => {
	const {
		patientId,
		doctorId,
		appointmentDate,
		appointmentTime,
		appointmentType,
		appointmentReason,
	} = req.body;

	// Here you can perform any necessary validations on the input data

	connection.query(
		'CALL InsertAppointment(?, ?, ?, ?, ?, ?)',
		[
			patientId,
			doctorId,
			appointmentDate,
			appointmentTime,
			appointmentType,
			appointmentReason,
		],
		(err, results) => {
			if (err) {
				console.error('Error booking appointment:', err);
				return res.status(500).json({ error: 'Internal server error' });
			}
			console.log('Appointment booked successfully:', results);
			res.status(201).json({ message: 'Appointment booked successfully' });
		}
	);
});

// Endpoint to fetch appointments by doctor and date
/**
 * @swagger
 * /api/appointments/doctor/{doctorId}/date/{appointmentDate}:
 *   get:
 *     summary: Fetch appointments by doctor and date
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: appointmentDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: List of appointments
 *       404:
 *         description: No appointments found
 *       500:
 *         description: Internal server error
 */

router.get('/doctor/:doctorId/date/:appointmentDate', (req, res) => {
	const doctorId = req.params.doctorId;
	const appointmentDate = req.params.appointmentDate;

	connection.query(
		'CALL Get_AppointmentDetails_docId(?, ?)',
		[doctorId, appointmentDate],
		(err, results) => {
			if (err) {
				console.error('Error fetching appointments:', err);
				return res.status(500).json({ error: 'Internal server error' });
			}
			const rowDataPacket = results[0][0]?.appointment_details;
			const appointments = rowDataPacket ? rowDataPacket : [];
			console.log('Fetched data: ', appointments);

			if (!appointments.length) {
				console.log('Appointments not found!');
				return res.status(404).json({ error: 'Appointments not found' });
			}
			res.status(200).json(appointments);
			console.log('done');
		}
	);
});

// Endpoint to fetch all appointments for a patient
/**
 * @swagger
 * /api/appointments/patient/{patientId}:
 *   get:
 *     summary: Fetch all appointments of a patient
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of patient appointments
 *       404:
 *         description: No appointments found
 *       500:
 *         description: Internal server error
 */

router.get('/patient/:patientId', (req, res) => {
	const patientId = req.params.patientId;

	connection.query(
		'CALL Get_patient_all_AppointmentDetails(?)',
		[patientId],
		(err, results) => {
			if (err) {
				console.error('Error fetching appointments:', err);
				return res.status(500).json({ error: 'Internal server error' });
			}
			const rowDataPacket = results[0][0]?.appointment_details;
			const appointments = rowDataPacket ? rowDataPacket : [];
			console.log('Fetched data: ', appointments);

			if (!appointments.length) {
				console.log('Appointments not found!');
				return res.status(404).json({ error: 'Appointments not found' });
			}

			res.status(200).json(appointments);
			console.log('done');
		}
	);
});

// Endpoint to fetch all appointments for a given date
/**
 * @swagger
 * /api/appointments/date/{appointmentDate}:
 *   get:
 *     summary: Fetch all appointments for a given date
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: appointmentDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: List of appointments
 *       404:
 *         description: No appointments found
 *       500:
 *         description: Internal server error
 */

router.get('/date/:appointmentDate', (req, res) => {
	const appointmentDate = req.params.appointmentDate;

	connection.query(
		'CALL GetAll_Appointments_date(?)',
		[appointmentDate],
		(err, results) => {
			if (err) {
				console.error('Error fetching appointments:', err);
				return res.status(500).json({ error: 'Internal server error' });
			}
			const rowDataPacket = results[0][0]?.appointment_details;
			const appointments = rowDataPacket ? rowDataPacket : [];
			console.log('Fetched data: ', appointments);

			if (!appointments.length) {
				console.log('Appointments not found!');
				return res.status(404).json({ error: 'Appointments not found' });
			}
			res.status(200).json(appointments);
			console.log('done');
		}
	);
});

module.exports = router;

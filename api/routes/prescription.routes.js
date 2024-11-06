import express from 'express';
import { createPrescription } from '../controllers/prescription.controller';
import fileUpload from 'express-fileupload';

const router = express.Router();

router.use(fileUpload());

router.post('/prescriptions', createPrescription);

export default router;

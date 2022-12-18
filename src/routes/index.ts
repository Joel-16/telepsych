import { Router } from 'express';
import Container from 'typedi';
import { v2 as cloudinary } from 'cloudinary';
import multer, { memoryStorage } from 'multer';
import { CloudinaryStorage, Options } from 'multer-storage-cloudinary';
import { AccountController, AdminController } from '../controllers';
import { checkJwt } from '../middleware/checkJwt';
import { validatorComplaint, validatorLogin, validatorProfile, validatorRegister } from '../middleware/validation';

declare interface cloudinaryOptions extends Options {
  params: {
    folder: string;
  };
}
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const multerOpts1: cloudinaryOptions = {
  cloudinary: cloudinary,
  params: {
    folder: 'image',
  },
};
const multerOpts2: cloudinaryOptions = {
  cloudinary: cloudinary,
  params: {
    folder: 'credentials',
  },
};

const storage = new CloudinaryStorage(multerOpts1)
const storage2 = new CloudinaryStorage(multerOpts2);
const upload2 = multer({ storage: storage2 });
const upload1 = multer({ storage: storage });
const router = Router();
const accountController = Container.get(AccountController);
const adminController = Container.get(AdminController);

router.post('/register', [validatorRegister], accountController.register);
router.post('/login', [validatorLogin], accountController.login);

router.post('/profile', [checkJwt, upload1.single("image"), validatorProfile], accountController.profile);
router.post('/certs', [checkJwt, upload2.fields([{name : "uniCert", maxCount : 1}, {name : "doctorCert", maxCount: 1}])], accountController.uploadCerts)
router.get('/profile', [checkJwt], accountController.getProfile);
router.get("/doctors", [checkJwt], accountController.findPsychiatrists)

router.post('/complaint', [checkJwt, validatorComplaint], accountController.createComplaint);
router.get('/complaints', [checkJwt], accountController.getComplaints);

//Admin
router.post('/admin/register', adminController.register);
router.post('/admin/login', [validatorLogin], adminController.login);
router.get('/admin/complaints', [checkJwt], adminController.getComplaints);
router.get('/admin/suspend/:id', [checkJwt], adminController.suspendDoctor);

router.get('/all', accountController.all)
export default router;

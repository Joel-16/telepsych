import { Router } from 'express';
import Container from 'typedi';

import { AccountController, AdminController } from '../controllers';
import { checkJwt } from '../middleware/checkJwt';
import {validatorComplaint, validatorLogin, validatorProfile, validatorRegister } from '../middleware/validation';

const router = Router();
const accountController = Container.get(AccountController);
const adminController = Container.get(AdminController)


router.post('/register', [validatorRegister],accountController.register);
router.post('/login', [validatorLogin], accountController.login)
router.post('/profile', [checkJwt, validatorProfile], accountController.profile)
router.get('/profile', [checkJwt], accountController.getProfile)

router.post('/complaint', [checkJwt, validatorComplaint ], accountController.createComplaint)
router.get('/complaints', [checkJwt], accountController.getComplaints)

router.post('/admin/register',adminController.register )
router.post('/admin/login', adminController.login)
router.get('/admin/complaints', [checkJwt], adminController.getComplaints)


export default router;

import { Router } from 'express';
import Container from 'typedi';

import { AccountController } from '../controllers';
import { checkJwt } from '../middleware/checkJwt';
import {validatorLogin, validatorProfile, validatorRegister } from '../middleware/validation';

const router = Router();
const accountController = Container.get(AccountController);


router.post('/register', [validatorRegister],accountController.register);
router.post('/login', [validatorLogin], accountController.login)
router.post('/profile', [checkJwt, validatorProfile], accountController.profile)
router.get('/profile', [checkJwt], accountController.getProfile)


export default router;

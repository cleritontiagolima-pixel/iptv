import { Router } from 'express';
import { ClientController } from '../controllers/clientController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post('/', ClientController.create);
router.get('/', ClientController.getAll);
router.get('/stats', ClientController.getStats);
router.get('/:id', ClientController.getById);
router.put('/:id', ClientController.update);
router.delete('/:id', ClientController.delete);
router.post('/:id/suspend', ClientController.suspend);
router.post('/:id/activate', ClientController.activate);
router.post('/:id/block-device', ClientController.blockDevice);
router.put('/:id/mac-address', ClientController.updateMacAddress);

export default router;

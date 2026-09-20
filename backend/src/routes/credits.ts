import { Router } from 'express';
import { CreditController } from '../controllers/creditController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/balance', CreditController.getBalance);
router.get('/transactions', CreditController.getTransactions);
router.post('/add', CreditController.addCredit);
router.post('/deduct', CreditController.deductCredit);

// Apenas admin pode ver todas as transações
router.get('/all', authorize(['admin']), CreditController.getAllTransactions);

export default router;

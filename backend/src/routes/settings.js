import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { getAllSettings, setSetting } from '../services/settingsService.js';
import { settingsUpdateSchema } from '../validators/schemas.js';
import { runFaultScan } from '../services/faultService.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (_req, res, next) => {
  try {
    const settings = await getAllSettings();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

router.patch('/:key', async (req, res, next) => {
  try {
    const { value } = settingsUpdateSchema.parse(req.body);
    const setting = await setSetting(req.params.key, value);
    res.json({ setting });
  } catch (err) {
    next(err);
  }
});

router.post('/run-fault-scan', async (_req, res, next) => {
  try {
    const result = await runFaultScan();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

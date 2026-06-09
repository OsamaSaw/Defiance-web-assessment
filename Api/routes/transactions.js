const express = require('express');

const { get, getById, create, update, delete: remove } = require('../controllers/transactions');
const { isAuth } = require('../middlewares/isAuth');

const router = express.Router();

// All transaction routes require an authenticated user
router.use(isAuth);

router.get('/', get);
router.post('/', create);
router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;

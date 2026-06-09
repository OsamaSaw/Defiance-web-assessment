const { Transaction } = require('../db/mockDatabase');
const { SendData, ServerError, NotFound, CustomError, Unauthorized } = require('../helpers/response');

// 400 with a human-readable validation message
const BadRequest = message => CustomError(message, 400, {}, 400);

// Returns an error message string, or null if the body is valid.
const validateBody = (body, { partial = false } = {}) => {
  const { amount, category } = body;

  if (!partial || amount !== undefined) {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) return 'amount must be a positive number';
  }
  if (!partial || category !== undefined) {
    if (typeof category !== 'string' || !category.trim()) return 'category is required';
  }

  return null;
};

// Keep only the fields we allow clients to set. in case it was a separate api call
const pickFields = body => {
  const { type, amount, category, date, note } = body;
  const data = {};
  if (type !== undefined) data.type = type;
  if (amount !== undefined) data.amount = amount;
  if (category !== undefined) data.category = category.trim();
  if (date !== undefined) data.date = new Date(date);
  if (note !== undefined) data.note = note;
  return data;
};

// GET /transactions - list the logged-in user's entries (newest first)
module.exports.get = async (req, res, next) => {
  try {
    const data = await Transaction.find({ userId: req.user.id });
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    return next(SendData(data));
  } catch (err) {
    return next(ServerError(err));
  }
};

// Find an entry and ensure it belongs to the user.
// Returns { entry } on success, or { error } (a response to pass to next()).
const findOwned = async (id, userId) => {
  const entry = await Transaction.findById(id);
  if (!entry) return { error: NotFound() };
  if (entry.userId !== userId) return { error: Unauthorized() };
  return { entry };
};

// GET /transactions/:id - single entry
module.exports.getById = async (req, res, next) => {
  try {
    const { entry, error } = await findOwned(req.params.id, req.user.id);
    if (error) return next(error);

    return next(SendData(entry));
  } catch (err) {
    return next(ServerError(err));
  }
};

// POST /transactions - create an entry
module.exports.create = async (req, res, next) => {
  try {
    const error = validateBody(req.body);
    if (error) return next(BadRequest(error));

    const entry = await Transaction.create({ userId: req.user.id, ...pickFields(req.body) });

    return next(SendData(entry, 201));
  } catch (err) {
    return next(ServerError(err));
  }
};

// PATCH /transactions/:id - update an entry
module.exports.update = async (req, res, next) => {
  try {
    const { error } = await findOwned(req.params.id, req.user.id);
    if (error) return next(error);

    const invalid = validateBody(req.body, { partial: true });
    if (invalid) return next(BadRequest(invalid));

    const updated = await Transaction.findByIdAndUpdate(req.params.id, pickFields(req.body));

    return next(SendData(updated));
  } catch (err) {
    return next(ServerError(err));
  }
};

// DELETE /transactions/:id - remove an entry
module.exports.delete = async (req, res, next) => {
  try {
    const { error } = await findOwned(req.params.id, req.user.id);
    if (error) return next(error);

    await Transaction.findByIdAndDelete(req.params.id);

    return next(SendData({ message: 'Transaction deleted successfully' }));
  } catch (err) {
    return next(ServerError(err));
  }
};

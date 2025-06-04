const { Category } = require('../models');
const { validationResult } = require('express-validator');

const createCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { name, color, icon, parent_category_id } = req.body;
    const category = await Category.create({
      user_id: req.user.id,
      name,
      color,
      icon,
      parent_category_id,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return res.status(201).json({ message: 'Utworzono kategorię.', category: category });
  } catch (err) {
    const error = new Error('Błąd tworzenia kategorii');
    error.details = err.message;
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'ASC']],
    });
    return res.status(200).json({ categories: categories });
  } catch (err) {
    const error = new Error('Błąd pobierania kategorii');
    error.details = err.message;
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { user_id: req.user.id, id: req.params.id },
    });
    return res.status(200).json({ message: 'Znaleziono kategorię', category });
  } catch (err) {
    const error = new Error('Błąd pobierania kategorii');
    error.details = err.message;
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const category = await Category.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!category) {
      return res.status(404).json({ message: 'Nie znaleziono kategorii.' });
    }
    const { name, color, icon, parent_category_id } = req.body;
    category.name = name ?? category.name;
    category.color = color ?? category.color;
    category.icon = icon ?? category.icon;
    category.parent_category_id = parent_category_id ?? category.parent_category_id;
    category.updated_at = new Date();
    await category.save();
    return res.status(200).json({ message: 'Zaktualizowano pomyślnie.', category });
  } catch (err) {
    const error = new Error('Błąd aktualizacji kategorii');
    error.details = err.message;
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!category) {
      return res.status(404).json({ message: 'Nie znaleziono kategorii.' });
    }
    await category.destroy();
    return res.status(200).json({ message: 'Kategoria usunięta.' });
  } catch (err) {
    const error = new Error('Błąd usuwania kategorii');
    error.details = err.message;
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

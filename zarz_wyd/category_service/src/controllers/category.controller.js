const { Category } = require('../models');
const { validationResult } = require('express-validator');
const { sequelize } = require('../config/db');

const createCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { id, name, color, icon, parent_category_id } = req.body;

    const existing = await Category.findOne({
      where: {
        user_id: req.user.id,
        name,
      },
    });

    if (existing) {
      const error = new Error('Użytkownik ma już kategorię o tej nazwie');
      error.status = 409;
      return next(error);
    }
    const category = await Category.create({
      id,
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
    return next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: {
        user_id: req.user.id,
        parent_category_id: null,
      },
      include: [
        {
          model: Category,
          as: 'subcategories',
          required: false,
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return res.status(200).json({ categories: categories });
  } catch (err) {
    const error = new Error('Błąd pobierania kategorii');
    error.details = err.message;
    return next(error);
  }
};

const getCategoriesByIds = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: 'Brak poprawnej listy ID' });
  }

  const categories = await Category.findAll({
    where: { id: ids },
  });

  res.status(200).json({ categories });
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    return res.status(200).json({ categories: categories });
  } catch (err) {
    const error = new Error('Błąd pobierania kategorii');
    error.details = err.message;
    return next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
      include: {
        model: Category,
        as: 'subcategories',
      },
    });
    return res.status(200).json({ message: 'Znaleziono kategorię', category });
  } catch (err) {
    const error = new Error('Błąd pobierania kategorii');
    error.details = err.message;
    return next(error);
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
      const error = new Error('Nie znaleziono kategorii');
      error.details = err.message;
      return next(error);
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
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const category = await Category.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      transaction: t,
    });
    if (!category) {
      const error = new Error('Nie znaleziono kategorii');
      error.details = err.message;
      return next(error);
    }

    await Category.destroy({
      where: {
        parent_category_id: category.id,
        user_id: req.user.id,
      },
      transaction: t,
    });

    await category.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({ message: 'Kategoria i jej podkategorie usunięte.' });
  } catch (err) {
    await t.rollback();
    const error = new Error('Błąd usuwania kategorii');
    error.details = err.message;
    return next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoriesByIds,
  getAllCategories,
  updateCategory,
  deleteCategory,
};

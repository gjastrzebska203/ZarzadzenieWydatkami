const { Category } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
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
  } catch (error) {
    console.error('Błąd tworzenia kategorii: ' + error);
    return res.status(500).json({ message: 'Błąd tworzenia kategorii.' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'ASC']],
    });
    return res.status(200).json({ categories: categories });
  } catch (error) {
    console.error('Błąd pobierania kategorii: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania kategorii.' });
  }
};

const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
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
  } catch (error) {
    console.error('Błąd aktualizacji kategorii: ' + error);
    return res.status(500).json({ message: 'Błąd aktualizacji kategorii.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!category) {
      return res.status(404).json({ message: 'Nie znaleziono kategorii.' });
    }
    await category.destroy();
    return res.status(200).json({ message: 'Kategoria usunięta.' });
  } catch (error) {
    console.error('Błąd usuwania kategorii: ' + error);
    return res.status(500).json({ message: 'Błąd usuwania kategorii.' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};

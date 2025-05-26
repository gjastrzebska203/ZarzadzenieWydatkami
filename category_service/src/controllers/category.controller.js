const { Category } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, color, icon, parentcategoryid } = req.body;
    const category = await Category.create({
      userid: req.user.id,
      name,
      color,
      icon,
      parentcategoryid,
      createdat: new Date(),
      updatedat: new Date(),
    });

    res.status(201).json({ message: 'Utworzono kategorię.', category: category });
  } catch (err) {
    console.error('createCategory:', err.message);
    res.status(500).json({ message: 'Błąd tworzenia kategorii.' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userid: req.user.id },
      order: [['createdat', 'ASC']],
    });

    res.json({ categories: categories });
  } catch (err) {
    console.error('getCategories:', err.message);
    res.status(500).json({ message: 'Błąd pobierania kategorii.' });
  }
};

const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const category = await Category.findOne({
      where: { id: req.params.id, iuserId: req.user.id },
    });

    if (!category) {
      return res.status(404).json({ message: 'Nie znaleziono kategorii.' });
    }

    const { name, color, icon } = req.body;

    category.name = name ?? category.name;
    category.color = color ?? category.color;
    category.icon = icon ?? category.icon;
    category.updatedat = new Date();
    await category.save();

    res.json(category);
  } catch (err) {
    console.error('updateCategory:', err.message);
    res.status(500).json({ message: 'Błąd aktualizacji kategorii.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, userid: req.user.id },
    });

    if (!category) {
      return res.status(404).json({ message: 'Nie znaleziono kategorii.' });
    }

    await category.destroy();
    res.json({ message: 'Kategoria usunięta.' });
  } catch (err) {
    console.error('deleteCategory:', err.message);
    res.status(500).json({ message: 'Błąd usuwania kategorii' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};

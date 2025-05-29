const { validationResult } = require('express-validator');
const Report = require('../models/report.model');
const { generateReport } = require('../services/report.service');

const createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { from, to } = req.body;

    const report_data = await generateReport({
      userId: req.user.id,
      from,
      to,
    });

    if (!report_data) {
      return res.status(400).json({ message: 'Pusty raport. Brak wydatków z podanego okresu.' });
    }

    const report = await Report.create(report_data);

    res.status(201).json({ message: 'Utworzono raport', report });
  } catch (error) {
    console.error('Błąd tworzenia raportu: ' + error);
    return res.status(500).json({ message: 'Błąd tworzenia raportu.' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Znaleziono raporty', reports });
  } catch (error) {
    console.error('Błąd pobierania raportów: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania raportów.' });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: 'Nie znaleziono raportu' });
    return res.status(200).json({ message: 'Znaleziono', report });
  } catch (error) {
    console.error('Błąd pobierania raportu: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania raportu.' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const result = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ message: 'Nie znaleziono raportu' });
    return res.status(200).json({ message: 'Raport usunięty' });
  } catch (error) {
    console.error('Błąd usuwania raportu: ' + error);
    return res.status(500).json({ message: 'Błąd usuwania raportu.' });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  deleteReport,
};

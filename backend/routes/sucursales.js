const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET - Obtener todas las sucursales activas
router.get('/', async (req, res) => {
  try {
    const sucursales = await executeQuery(
      'SELECT * FROM SUCURSAL WHERE activo = 1 ORDER BY nombre'
    );
    res.json(sucursales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener sucursal por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sucursales = await executeQuery(
      'SELECT * FROM SUCURSAL WHERE id = ? AND activo = 1',
      [id]
    );

    if (sucursales.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }

    res.json(sucursales[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

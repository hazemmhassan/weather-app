const express     = require('express');
const { Parser }  = require('json2csv');
const PDFDocument = require('pdfkit');
const { create }  = require('xmlbuilder2');
const db          = require('../db/connection');

const router = express.Router();

// ── GET /api/export?format=json|csv|pdf ──────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const format = (req.query.format || 'json').toLowerCase();
    const [rows] = await db.execute(
      'SELECT id, location, latitude, longitude, date_from, date_to, created_at FROM weather_searches ORDER BY created_at DESC'
    );

    // ── JSON ────────────────────────────────────────────────────────────────
    if (format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename="weather_data.json"');
      res.setHeader('Content-Type', 'application/json');
      return res.json(rows);
    }

    // ── CSV ─────────────────────────────────────────────────────────────────
    if (format === 'csv') {
      const fields = [
        { label: 'ID',        value: 'id' },
        { label: 'Location',  value: 'location' },
        { label: 'Latitude',  value: 'latitude' },
        { label: 'Longitude', value: 'longitude' },
        { label: 'Date From', value: 'date_from' },
        { label: 'Date To',   value: 'date_to' },
        { label: 'Created',   value: 'created_at' },
      ];
      const parser = new Parser({ fields });
      const csv    = parser.parse(rows);

      res.setHeader('Content-Disposition', 'attachment; filename="weather_data.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csv);
    }

    // ── PDF ─────────────────────────────────────────────────────────────────
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      res.setHeader('Content-Disposition', 'attachment; filename="weather_data.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      // Title block
      doc.fontSize(22).fillColor('#1a73e8').text('Weather Searches Report', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#666')
        .text(`Generated on ${new Date().toLocaleString()}  |  Built by Hazem Hassan`, { align: 'center' });
      doc.moveDown(1);

      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#1a73e8').lineWidth(1.5).stroke();
      doc.moveDown(0.8);

      if (rows.length === 0) {
        doc.fontSize(12).fillColor('#333').text('No records found.', { align: 'center' });
      }

      rows.forEach((row, idx) => {
        // Card-like block
        doc.fontSize(13).fillColor('#1a73e8').text(`#${row.id}  ${row.location}`);
        doc.moveDown(0.2);
        doc.fontSize(10).fillColor('#333')
          .text(`Coordinates : ${parseFloat(row.latitude).toFixed(6)}, ${parseFloat(row.longitude).toFixed(6)}`)
          .text(`Date Range  : ${row.date_from}  →  ${row.date_to}`)
          .text(`Saved on    : ${row.created_at}`);

        if (idx < rows.length - 1) {
          doc.moveDown(0.6);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').lineWidth(0.5).stroke();
          doc.moveDown(0.6);
        }
      });

      doc.end();
      return;
    }

    // ── XML ─────────────────────────────────────────────────────────────────
    if (format === 'xml') {
      const root = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('weather_app')
        .ele('exported_at').txt(new Date().toISOString()).up()
        .ele('total_records').txt(rows.length).up()
        .ele('searches');

      rows.forEach(row => {
        root.ele('search')
          .ele('id').txt(row.id).up()
          .ele('location').txt(row.location).up()
          .ele('latitude').txt(row.latitude).up()
          .ele('longitude').txt(row.longitude).up()
          .ele('date_from').txt(row.date_from).up()
          .ele('date_to').txt(row.date_to).up()
          .ele('created_at').txt(row.created_at).up()
          .up();
      });

      const xml = root.end({ prettyPrint: true });
      res.setHeader('Content-Disposition', 'attachment; filename="weather_data.xml"');
      res.setHeader('Content-Type', 'application/xml');
      return res.send(xml);
    }

    // ── MARKDOWN ────────────────────────────────────────────────────────────
    if (format === 'markdown') {
      let md = '# Weather Searches\n\n';
      md += `**Exported:** ${new Date().toLocaleString()} | **Built by:** Hazem Hassan\n\n`;
      md += '| ID | Location | From | To | Created |\n';
      md += '|----|----------|------|----|---------|\n';

      rows.forEach(row => {
        md += `| ${row.id} | ${row.location} | ${row.date_from} | ${row.date_to} | ${new Date(row.created_at).toLocaleDateString()} |\n`;
      });

      res.setHeader('Content-Disposition', 'attachment; filename="weather_data.md"');
      res.setHeader('Content-Type', 'text/markdown');
      return res.send(md);
    }

    res.status(400).json({ error: 'Invalid format. Use json, csv, pdf, xml, or markdown.' });
  } catch (err) {
    console.error('GET /api/export:', err.message);
    res.status(500).json({ error: 'Unable to export data. Please try again.' });
  }
});

module.exports = router;

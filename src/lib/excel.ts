import ExcelJS from 'exceljs';
import type { CoinData } from '../types';

export const exportToExcel = async (coins: CoinData[]) => {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Meme Coins Analysis');

  // Define columns
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Symbol', key: 'symbol', width: 10 },
    { header: 'Price (USD)', key: 'price', width: 15 },
    { header: '24h Change (%)', key: 'change24h', width: 15 },
    { header: 'Market Cap (USD)', key: 'marketCap', width: 20 },
    { header: 'Social Score', key: 'socialScore', width: 15 },
    { header: 'Risk Level', key: 'riskLevel', width: 12 },
    { header: 'Recommendation', key: 'recommendation', width: 15 },
    { header: 'Strategy Confidence (%)', key: 'strategyConfidence', width: 20 }
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8EAED' }
  };

  // Add data
  coins.forEach(coin => {
    worksheet.addRow({
      name: coin.name,
      symbol: coin.symbol,
      price: coin.price,
      change24h: coin.change24h,
      marketCap: coin.marketCap,
      socialScore: coin.socialScore,
      riskLevel: coin.riskLevel,
      recommendation: coin.recommendation,
      strategyConfidence: coin.strategyConfidence
    });
  });

  // Format numbers
  worksheet.getColumn('price').numFmt = '$#,##0.00';
  worksheet.getColumn('change24h').numFmt = '#,##0.00%';
  worksheet.getColumn('marketCap').numFmt = '$#,##0';
  worksheet.getColumn('socialScore').numFmt = '0';
  worksheet.getColumn('strategyConfidence').numFmt = '0%';

  // Apply conditional formatting for risk levels
  worksheet.getColumn('riskLevel').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      switch (cell.value) {
        case 'Low':
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } };
          break;
        case 'Medium':
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
          break;
        case 'High':
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFADBD8' } };
          break;
      }
    }
  });

  // Apply conditional formatting for recommendations
  worksheet.getColumn('recommendation').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      switch (cell.value) {
        case 'Buy':
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } };
          break;
        case 'Hold':
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F6F3' } };
          break;
        case 'Sell':
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFADBD8' } };
          break;
      }
    }
  });

  // Generate filename with current date
  const date = new Date().toISOString().split('T')[0];
  const filename = `meme-coins-analysis-${date}.xlsx`;

  // Generate the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Create a Blob from the buffer
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Create download link and trigger download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || '',
  },
});

export interface EmailConfig {
  reportType: 'attendance' | 'consejo_tecnico' | 'reporte_trimestral';
  recipients: string[];
  files: Array<{ path: string; name: string }>;
  subject: string;
  body: string;
}

export async function sendEmail(config: EmailConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const excelPath = await createConsolidatedExcel(config.files, config.reportType);
    
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: config.recipients.join(', '),
      subject: config.subject,
      html: config.body,
      attachments: [
        {
          filename: `Consolidado_${config.reportType}_${new Date().toISOString().split('T')[0]}.xlsx`,
          path: excelPath,
        },
      ],
    });

    fs.unlinkSync(excelPath);

    return { success: true };
  } catch (error: any) {
    console.error('Error enviando correo:', error);
    return { success: false, error: error.message };
  }
}

async function createConsolidatedExcel(
  files: Array<{ path: string; name: string }>,
  reportType: string
): Promise<string> {
  const workbook = XLSX.utils.book_new();

  for (const file of files) {
    if (fs.existsSync(file.path)) {
      const fileBuffer = fs.readFileSync(file.path);
      const fileExtension = path.extname(file.path).toLowerCase();
      
      let data: any;
      if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        data = XLSX.read(fileBuffer, { type: 'buffer' });
        data.SheetNames.forEach((sheetName: string) => {
          const worksheet = data.Sheets[sheetName];
          XLSX.utils.book_append_sheet(workbook, worksheet, `${file.name}_${sheetName}`);
        });
      } else {
        const worksheet = XLSX.utils.aoa_to_sheet([[`Archivo: ${file.name}`]]);
        XLSX.utils.book_append_sheet(workbook, worksheet, file.name.substring(0, 31));
      }
    }
  }

  if (workbook.SheetNames.length === 0) {
    const worksheet = XLSX.utils.aoa_to_sheet([['No hay archivos para consolidar']]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sin datos');
  }

  const outputPath = path.join(process.cwd(), 'data', `temp_${Date.now()}.xlsx`);
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  XLSX.writeFile(workbook, outputPath);
  return outputPath;
}

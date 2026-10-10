import puppeteer from 'puppeteer'
import QRCode from 'qrcode'

type CertParams = {
  nomeAluno: string
  tituloCurso: string
  cargaHoraria: number
  dataConclusao: string
  codigoValidacao: string
  baseUrl: string
}

export async function gerarCertificadoPDF(params: CertParams): Promise<Buffer> {
  const qrUrl = `${params.baseUrl}/certificado/${params.codigoValidacao}`
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 160, margin: 1 })

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1122px; height: 794px; overflow: hidden;
    font-family: Georgia, 'Times New Roman', serif;
    background: #f8fafc;
    display: flex; align-items: stretch;
  }
  .side {
    width: 18px; background: linear-gradient(180deg, #1a56db, #1e429f);
  }
  .content {
    flex: 1; padding: 60px 70px 50px;
    display: flex; flex-direction: column; justify-content: space-between;
    border: 2px solid #1a56db; border-left: none;
  }
  .header { text-align: center; }
  .logo { display: block; margin: 0 auto 12px; width: 44px; height: 44px; }
  .brand { font-family: 'Inter', sans-serif; font-size: 13px; letter-spacing: 4px; color: #1a56db; font-weight: 700; margin-bottom: 12px; }
  .title { font-size: 36px; color: #0f172a; font-weight: normal; margin-bottom: 6px; }
  .subtitle { font-size: 14px; color: #64748b; letter-spacing: 2px; }
  .body { text-align: center; }
  .certifica { font-size: 16px; color: #475569; margin-bottom: 14px; }
  .name { font-size: 48px; color: #1a56db; font-style: italic; border-bottom: 2px solid #1a56db; display: inline-block; padding-bottom: 6px; margin-bottom: 20px; }
  .course-label { font-size: 14px; color: #64748b; margin-bottom: 10px; }
  .course { font-size: 26px; font-weight: bold; color: #0f172a; margin-bottom: 14px; }
  .hours { font-size: 15px; color: #475569; }
  .footer { display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-left { font-size: 12px; color: #94a3b8; line-height: 1.8; }
  .footer-left strong { color: #475569; }
  .qr { text-align: center; }
  .qr img { width: 80px; height: 80px; }
  .qr p { font-size: 9px; color: #94a3b8; margin-top: 4px; }
  .signature { text-align: center; width: 180px; }
  .sig-line { border-top: 1px solid #475569; width: 180px; margin: 0 auto 6px; }
  .sig-name { font-size: 12px; color: #475569; font-weight: bold; }
  .sig-title { font-size: 10px; color: #94a3b8; margin-top: 2px; }
</style>
</head>
<body>
  <div class="side"></div>
  <div class="content">
    <div class="header">
      <svg class="logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="header-logo-grad" x1="70" y1="10" x2="26" y2="92" gradientUnits="userSpaceOnUse">
            <stop stop-color="#4f7cff" />
            <stop offset="1" stop-color="#7c3aed" />
          </linearGradient>
        </defs>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M50 6 L6 94 L94 94 Z M50 30 L41 52 L59 52 Z M50 58 L31 94 L69 94 Z"
          fill="url(#header-logo-grad)"
        />
      </svg>
      <div class="brand">ATIVASYS EAD</div>
      <div class="title">Certificado de Conclusão</div>
      <div class="subtitle">QUALIFICAÇÃO PROFISSIONAL</div>
    </div>
    <div class="body">
      <p class="certifica">Certificamos que</p>
      <div class="name">${params.nomeAluno}</div>
      <p class="course-label">concluiu com êxito o curso</p>
      <div class="course">${params.tituloCurso}</div>
      <p class="hours">Carga horária: ${params.cargaHoraria} horas &nbsp;|&nbsp; Concluído em: ${params.dataConclusao}</p>
    </div>
    <div class="footer">
      <div class="footer-left">
        <strong>Código de validação</strong><br/>
        ${params.codigoValidacao}<br/>
        <span style="color:#1a56db">${qrUrl}</span>
      </div>
      <div class="qr">
        <img src="${qrDataUrl}" />
        <p>Validar certificado</p>
      </div>
      <div class="signature">
        <div style="height: 40px;"></div>
        <div class="sig-line"></div>
        <div class="sig-name">${params.nomeAluno}</div>
        <div class="sig-title">Participante</div>
      </div>
    </div>
  </div>
</body>
</html>`

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1122, height: 794 })
    await page.setContent(html, { waitUntil: 'load' })
    const pdf = await page.pdf({ width: '297mm', height: '210mm', printBackground: true })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

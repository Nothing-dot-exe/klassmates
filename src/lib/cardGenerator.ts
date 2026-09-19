import { Classroom } from '@/types';

export async function generateInviteCardPng(classroom: Classroom, joinUrl: string, qrDataUrl: string): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  const width = 1000;
  const height = 1250;
  canvas.width = width;
  canvas.height = height;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#020617');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#312e81';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 140, 70, 280, 44, 22);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎓 OFFICIAL CLASSROOM INVITE', width / 2, 98);

  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`${classroom.institution.toUpperCase()} • ${classroom.section}`, width / 2, 170);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(classroom.name, width / 2, 230);

  const qrBoxSize = 360;
  const qrY = 280;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(width / 2 - qrBoxSize / 2, qrY, qrBoxSize, qrBoxSize, 28);
  ctx.fill();

  if (qrDataUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, width / 2 - qrBoxSize / 2 + 20, qrY + 20, qrBoxSize - 40, qrBoxSize - 40);
        resolve(true);
      };
      img.src = qrDataUrl;
    });
  }

  const codeY = qrY + qrBoxSize + 40;
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 220, codeY, 440, 85, 20);
  ctx.fill();

  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('ENTER THIS CLASS CODE:', width / 2, codeY + 28);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 40px monospace';
  ctx.fillText(classroom.code, width / 2, codeY + 70);

  const footerY = codeY + 130;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'normal 18px sans-serif';
  ctx.fillText('Scan with phone camera or visit the link below:', width / 2, footerY);

  ctx.fillStyle = '#818cf8';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(joinUrl, width / 2, footerY + 32);

  return canvas.toDataURL('image/png');
}

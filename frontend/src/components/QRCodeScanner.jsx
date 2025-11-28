import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRCodeScanner({ onScan, onError, isActive }) {
  const scannerRef = useRef(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (isActive && !scanner) {
      // Inicializar scanner
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: ['QR_CODE']
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          // Sucesso ao scanear
          if (onScan) {
            onScan(decodedText);
          }
          // Parar scanner após sucesso
          html5QrcodeScanner.clear();
        },
        (error) => {
          // Erro - não faz nada (muito verboso)
        }
      );

      setScanner(html5QrcodeScanner);
    }

    // Cleanup
    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.log('Erro ao limpar scanner:', err));
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div>
      <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
    </div>
  );
}
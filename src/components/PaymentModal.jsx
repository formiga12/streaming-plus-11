import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { QrCode, Copy, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Label } from "@/components/ui/label";

export default function PaymentModal({ open, onClose, onSuccess, amount, email, pixKey }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [verificationEnabled, setVerificationEnabled] = useState(false);
  
  useEffect(() => {
    let timer = null;
    
    if (open && timeLeft > 0 && !verificationEnabled) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setVerificationEnabled(true);
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [open, timeLeft, verificationEnabled]);

  useEffect(() => {
    if (open) {
      // Reset timer when modal opens
      setTimeLeft(60);
      setVerificationEnabled(false);
    }
  }, [open]);

  // Simulação de verificação de pagamento
  const verifyPayment = () => {
    onSuccess();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <div className="text-sm text-gray-500 mb-4">
            Email: {email}
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <QrCode className="w-48 h-48" />
          </div>
          
          <p className="text-2xl font-bold text-green-600 mb-4">
            R$ {amount.toFixed(2)}
          </p>
          
          {pixKey && (
            <div className="w-full max-w-sm mb-4">
              <Label className="text-sm text-gray-600 block mb-1">Chave PIX para pagamento:</Label>
              <div className="flex items-center gap-2 w-full bg-gray-50 p-2 rounded-lg border">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <code className="flex-1 text-sm break-all font-medium">{pixKey}</code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(pixKey);
                    alert('Chave PIX copiada!');
                  }}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="w-full max-w-sm mt-6">
            <Button
              onClick={verifyPayment}
              disabled={!verificationEnabled}
              className={`w-full ${verificationEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {!verificationEnabled ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-pulse" />
                  Verificar em {formatTime(timeLeft)}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verificar Pagamento
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
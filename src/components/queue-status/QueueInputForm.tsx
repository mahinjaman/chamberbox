import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Hash, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { QueueStatusTranslations } from './types';

interface QueueInputFormProps {
  onSubmit: (serialNumber: number, patientName?: string) => void;
  isLoading: boolean;
  t: QueueStatusTranslations;
}

export const QueueInputForm: React.FC<QueueInputFormProps> = ({ onSubmit, isLoading, t }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [validationError, setValidationError] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedSerial = localStorage.getItem('queue_serial');
    const savedName = localStorage.getItem('queue_patient_name');
    if (savedSerial) setSerialNumber(savedSerial);
    if (savedName) setPatientName(savedName);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const serial = parseInt(serialNumber, 10);
    if (isNaN(serial) || serial <= 0) {
      setValidationError(t.invalidSerial);
      return;
    }

    onSubmit(serial, patientName || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative p-6 space-y-5">
          {/* Serial Number Input */}
          <div className="space-y-2">
            <Label htmlFor="serial" className="text-sm font-medium text-foreground/80">
              {t.serialNumber}
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="serial"
                type="number"
                placeholder="37"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="pl-10 h-12 text-lg font-semibold bg-background/50 border-border/50 focus:border-sky-500 focus:ring-sky-500/20 transition-all"
                min="1"
                max="999"
              />
            </div>
          </div>

          {/* Patient Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground/80">
              {t.patientName}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/50 focus:border-sky-500 focus:ring-sky-500/20 transition-all"
              />
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive font-medium"
            >
              {validationError}
            </motion.p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !serialNumber}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/25 transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t.checking}
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                {t.checkStatus}
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

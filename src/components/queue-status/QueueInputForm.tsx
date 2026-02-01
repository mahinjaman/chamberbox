import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Hash, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { QueueStatusTranslations } from './types';

interface QueueInputFormProps {
  onSubmit: (phoneNumber: string, serialNumber?: number) => void;
  isLoading: boolean;
  t: QueueStatusTranslations;
}

export const QueueInputForm: React.FC<QueueInputFormProps> = ({ onSubmit, isLoading, t }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [validationError, setValidationError] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('queue_phone');
    const savedSerial = localStorage.getItem('queue_serial');
    if (savedPhone) setPhoneNumber(savedPhone);
    if (savedSerial) setSerialNumber(savedSerial);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate phone number - basic validation for Bangladesh numbers
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setValidationError(t.invalidPhone);
      return;
    }

    // Parse serial number if provided
    const serial = serialNumber ? parseInt(serialNumber, 10) : undefined;
    if (serialNumber && (isNaN(serial!) || serial! <= 0)) {
      setValidationError(t.invalidSerial);
      return;
    }

    onSubmit(phoneNumber, serial);
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
          {/* Phone Number Input - Primary */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground/80">
              {t.phoneNumber} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10 h-12 text-lg font-semibold bg-background/50 border-border/50 focus:border-sky-500 focus:ring-sky-500/20 transition-all"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t.phoneNumber === 'মোবাইল নম্বর' 
                ? 'যে নম্বর দিয়ে অ্যাপয়েন্টমেন্ট নেওয়া হয়েছে' 
                : 'Enter the phone number used for booking'
              }
            </p>
          </div>

          {/* Serial Number Input - Optional */}
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
                className="pl-10 h-12 bg-background/50 border-border/50 focus:border-sky-500 focus:ring-sky-500/20 transition-all"
                min="1"
                max="999"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t.serialNumber === 'সিরিয়াল নম্বর (ঐচ্ছিক)' 
                ? 'সিরিয়াল নম্বর জানা থাকলে দিন (দ্রুত খুঁজে পেতে সাহায্য করে)' 
                : 'Enter if known (helps find faster)'
              }
            </p>
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
            disabled={isLoading || !phoneNumber}
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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Hash, Loader2, Calendar, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { QueueStatusTranslations } from './types';

interface QueueInputFormProps {
  onSubmit: (phoneNumber: string, serialNumber?: number) => void;
  onSerialSearch: (serialNumber: string) => void;
  onPhoneDateSearch: (phoneNumber: string, date: Date) => void;
  isLoading: boolean;
  t: QueueStatusTranslations;
}

export const QueueInputForm: React.FC<QueueInputFormProps> = ({ 
  onSubmit, 
  onSerialSearch, 
  onPhoneDateSearch, 
  isLoading, 
  t 
}) => {
  const [searchMode, setSearchMode] = useState<'serial' | 'phone'>('serial');
  
  // Serial search state
  const [serialInput, setSerialInput] = useState('');
  
  // Phone + Date search state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const [validationError, setValidationError] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('queue_phone');
    const savedSerial = localStorage.getItem('queue_serial_ref');
    if (savedPhone) setPhoneNumber(savedPhone);
    if (savedSerial) setSerialInput(savedSerial);
  }, []);

  const handleSerialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanSerial = serialInput.trim().toUpperCase();
    if (!cleanSerial) {
      setValidationError(t.invalidSerial || 'Please enter a valid booking reference');
      return;
    }

    localStorage.setItem('queue_serial_ref', cleanSerial);
    onSerialSearch(cleanSerial);
  };

  const handlePhoneDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setValidationError(t.invalidPhone);
      return;
    }

    localStorage.setItem('queue_phone', phoneNumber);
    onPhoneDateSearch(phoneNumber, selectedDate);
  };

  const isBangla = t.phoneNumber === 'মোবাইল নম্বর';

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

        <div className="relative p-6">
          <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'serial' | 'phone')} className="space-y-5">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="serial" className="gap-2">
                <FileText className="h-4 w-4" />
                {isBangla ? 'বুকিং রেফারেন্স' : 'Booking Ref'}
              </TabsTrigger>
              <TabsTrigger value="phone" className="gap-2">
                <Phone className="h-4 w-4" />
                {isBangla ? 'ফোন + তারিখ' : 'Phone + Date'}
              </TabsTrigger>
            </TabsList>

            {/* Serial Number Search */}
            <TabsContent value="serial" className="space-y-5 mt-4">
              <form onSubmit={handleSerialSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="serial-ref" className="text-sm font-medium text-foreground/80">
                    {isBangla ? 'বুকিং রেফারেন্স নম্বর' : 'Booking Reference Number'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="serial-ref"
                      type="text"
                      placeholder="260203-1234-0001"
                      value={serialInput}
                      onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                      className="pl-10 h-12 text-lg font-mono bg-background/50 border-border/50 focus:border-sky-500 focus:ring-sky-500/20 transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isBangla 
                      ? 'বুকিং সাকসেস কার্ডে দেওয়া ইউনিক রেফারেন্স নম্বর দিন' 
                      : 'Enter the unique reference from your booking confirmation'
                    }
                  </p>
                </div>

                {/* Validation Error */}
                {validationError && searchMode === 'serial' && (
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
                  disabled={isLoading || !serialInput.trim()}
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
            </TabsContent>

            {/* Phone + Date Search */}
            <TabsContent value="phone" className="space-y-5 mt-4">
              <form onSubmit={handlePhoneDateSubmit} className="space-y-5">
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
                    {isBangla 
                      ? 'যে নম্বর দিয়ে অ্যাপয়েন্টমেন্ট নেওয়া হয়েছে' 
                      : 'Enter the phone number used for booking'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground/80">
                    {isBangla ? 'অ্যাপয়েন্টমেন্টের তারিখ' : 'Appointment Date'}
                  </Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal bg-background/50",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                        {selectedDate ? format(selectedDate, "PPP") : (isBangla ? "তারিখ নির্বাচন করুন" : "Pick a date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setIsCalendarOpen(false);
                          }
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Validation Error */}
                {validationError && searchMode === 'phone' && (
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
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300"
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
};

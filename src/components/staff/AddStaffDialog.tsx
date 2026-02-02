import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useStaff, StaffRole } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { permissionDescriptions } from "@/lib/staff-permissions";
import { Building2, Info, Copy, Check, ExternalLink, Mail } from "lucide-react";
import { toast } from "sonner";

interface Chamber {
  id: string;
  name: string;
  address: string;
}

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chambers: Chamber[];
}

export function AddStaffDialog({ open, onOpenChange, chambers }: AddStaffDialogProps) {
  const { language } = useLanguage();
  const { addStaff, isAddingStaff } = useStaff();
  
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    role: "receptionist" as StaffRole,
    chamber_ids: [] as string[],
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [addedEmail, setAddedEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addStaff({
      email: formData.email,
      full_name: formData.full_name,
      phone: formData.phone || undefined,
      role: formData.role,
      chamber_ids: formData.chamber_ids,
    }, {
      onSuccess: () => {
        setAddedEmail(formData.email);
        setShowSuccess(true);
      },
    });
  };

  const toggleChamber = (chamberId: string) => {
    setFormData(prev => ({
      ...prev,
      chamber_ids: prev.chamber_ids.includes(chamberId)
        ? prev.chamber_ids.filter(id => id !== chamberId)
        : [...prev.chamber_ids, chamberId],
    }));
  };

  const signupUrl = `${window.location.origin}/staff/signup?email=${encodeURIComponent(addedEmail)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(signupUrl);
    setCopied(true);
    toast.success(language === "bn" ? "লিংক কপি হয়েছে!" : "Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setShowSuccess(false);
    setAddedEmail("");
    setCopied(false);
    setFormData({
      email: "",
      full_name: "",
      phone: "",
      role: "receptionist",
      chamber_ids: [],
    });
  };

  // Success screen after adding staff
  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              {language === "bn" ? "স্টাফ যোগ হয়েছে!" : "Staff Added!"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === "bn" 
                ? "স্টাফকে নিচের লিংক পাঠান যাতে তারা তাদের অ্যাকাউন্ট সেটআপ করতে পারে:"
                : "Send the staff member this link to set up their account:"}
            </p>

            <div className="flex gap-2">
              <Input 
                value={signupUrl} 
                readOnly 
                className="text-xs font-mono"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {language === "bn" ? "বিকল্প উপায়:" : "Alternative:"}
              </p>
              <p className="text-muted-foreground">
                {language === "bn" 
                  ? `স্টাফ সরাসরি /staff/login এ গিয়ে "${addedEmail}" দিয়ে সাইন আপ করতে পারবে।`
                  : `Staff can go directly to /staff/login and sign up with "${addedEmail}".`}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handleClose}
              >
                {language === "bn" ? "বন্ধ করুন" : "Close"}
              </Button>
              <Button 
                type="button" 
                className="flex-1"
                onClick={() => window.open(signupUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {language === "bn" ? "লিংক খুলুন" : "Open Link"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === "bn" ? "নতুন স্টাফ যোগ করুন" : "Add New Staff"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Two column grid for desktop */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-sm">
                {language === "bn" ? "পুরো নাম" : "Full Name"} *
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder={language === "bn" ? "স্টাফের নাম" : "Staff name"}
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">
                {language === "bn" ? "ইমেইল" : "Email"} *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@example.com"
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">
                {language === "bn" ? "ফোন" : "Phone"}
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-sm">
                {language === "bn" ? "ভূমিকা" : "Role"} *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: StaffRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">
                    {language === "bn" ? "রিসেপশনিস্ট" : "Receptionist"}
                  </SelectItem>
                  <SelectItem value="assistant">
                    {language === "bn" ? "সহকারী" : "Assistant"}
                  </SelectItem>
                  <SelectItem value="manager">
                    {language === "bn" ? "ম্যানেজার" : "Manager"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permissions inline */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span>{permissionDescriptions[language][formData.role].join(" • ")}</span>
          </div>

          {/* Chamber access */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              {language === "bn" ? "চেম্বার অ্যাক্সেস" : "Chamber Access"} *
            </Label>
            {chambers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {language === "bn" 
                  ? "প্রথমে একটি চেম্বার যোগ করুন"
                  : "Please add a chamber first"}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 max-h-28 overflow-y-auto border rounded-md p-2">
                {chambers.map((chamber) => (
                  <label
                    key={chamber.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={formData.chamber_ids.includes(chamber.id)}
                      onCheckedChange={() => toggleChamber(chamber.id)}
                    />
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate">{chamber.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              {language === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={isAddingStaff || !formData.email || !formData.full_name || formData.chamber_ids.length === 0}
            >
              {isAddingStaff 
                ? (language === "bn" ? "যোগ হচ্ছে..." : "Adding...")
                : (language === "bn" ? "স্টাফ যোগ করুন" : "Add Staff")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

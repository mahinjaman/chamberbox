import { useState } from "react";
import { Send, Loader2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";

const SUPPORT_WHATSAPP = "+8801601025502";

const CATEGORIES = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Subscription" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug Report" },
];

export const SupportMenuItem = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createTicket, isCreating } = useSupportTickets();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "general",
    user_name: "",
    user_email: "",
    user_phone: "",
  });

  const handleOpenDialog = () => {
    setFormData({
      subject: "",
      message: "",
      category: "general",
      user_name: profile?.full_name || "",
      user_email: profile?.email || "",
      user_phone: profile?.phone || "",
    });
    setIsDialogOpen(true);
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent("Hi, I need help with ChamberBox.");
    window.open(`https://wa.me/${SUPPORT_WHATSAPP.replace(/\+/g, "")}?text=${message}`, "_blank");
  };

  const handleSubmitTicket = () => {
    createTicket(formData);
    setIsDialogOpen(false);
    setFormData({
      subject: "",
      message: "",
      category: "general",
      user_name: "",
      user_email: "",
      user_phone: "",
    });
  };

  return (
    <>
      <SidebarMenuButton
        onClick={handleOpenDialog}
        tooltip="Support"
        className="flex-1"
      >
        <Headphones className="w-5 h-5" />
        <span>Support</span>
      </SidebarMenuButton>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!user && (
              <>
                <div className="space-y-2">
                  <Label>Your Name *</Label>
                  <Input
                    value={formData.user_name}
                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <Input
                    value={formData.user_phone}
                    onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                    placeholder="Enter your phone"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your issue"
              />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={4}
              />
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleWhatsAppSupport}
            >
              <svg 
                className="w-4 h-4 mr-2" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Support
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitTicket}
              disabled={
                isCreating || 
                !formData.subject.trim() || 
                !formData.message.trim() ||
                (!user && (!formData.user_name.trim() || !formData.user_email.trim()))
              }
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Send className="w-4 h-4 mr-2" />
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

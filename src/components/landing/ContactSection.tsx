import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Mail, Phone, MapPin, Loader2 } from "lucide-react";

const contactText = {
  en: {
    title: "Contact Us",
    subtitle: "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    name: "Full Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "your@email.com",
    phone: "Phone (optional)",
    phonePlaceholder: "01XXXXXXXXX",
    subject: "Subject",
    subjectPlaceholder: "How can we help?",
    message: "Message",
    messagePlaceholder: "Write your message here...",
    send: "Send Message",
    sending: "Sending...",
    success: "Message sent successfully! We'll get back to you soon.",
    error: "Failed to send message. Please try again.",
    address: "Dhaka, Bangladesh",
    emailContact: "support@chamberbox.com",
    phoneContact: "+880 1XXX-XXXXXX",
  },
  bn: {
    title: "যোগাযোগ করুন",
    subtitle: "কোনো প্রশ্ন আছে? আমরা আপনার কথা শুনতে চাই। আমাদের একটি মেসেজ পাঠান, যত তাড়াতাড়ি সম্ভব উত্তর দেবো।",
    name: "পূর্ণ নাম",
    namePlaceholder: "আপনার নাম",
    email: "ইমেইল",
    emailPlaceholder: "your@email.com",
    phone: "ফোন (ঐচ্ছিক)",
    phonePlaceholder: "01XXXXXXXXX",
    subject: "বিষয়",
    subjectPlaceholder: "আমরা কিভাবে সাহায্য করতে পারি?",
    message: "বার্তা",
    messagePlaceholder: "আপনার বার্তা এখানে লিখুন...",
    send: "মেসেজ পাঠান",
    sending: "পাঠানো হচ্ছে...",
    success: "মেসেজ সফলভাবে পাঠানো হয়েছে! শীঘ্রই উত্তর দেবো।",
    error: "মেসেজ পাঠাতে ব্যর্থ। আবার চেষ্টা করুন।",
    address: "ঢাকা, বাংলাদেশ",
    emailContact: "support@chamberbox.com",
    phoneContact: "+৮৮০ ১XXX-XXXXXX",
  },
};

const ContactSection = () => {
  const { language } = useLanguage();
  const t = contactText[language];
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim().slice(0, 200),
        email: form.email.trim().slice(0, 255),
        phone: form.phone.trim().slice(0, 20) || null,
        subject: form.subject.trim().slice(0, 300),
        message: form.message.trim().slice(0, 2000),
      });

      if (error) throw error;
      toast.success(t.success);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t.title}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm">{language === "bn" ? "ইমেইল" : "Email"}</h4>
                <p className="text-sm text-muted-foreground">{t.emailContact}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm">{language === "bn" ? "ফোন" : "Phone"}</h4>
                <p className="text-sm text-muted-foreground">{t.phoneContact}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm">{language === "bn" ? "ঠিকানা" : "Address"}</h4>
                <p className="text-sm text-muted-foreground">{t.address}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4 bg-background rounded-xl border p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">{t.name}</Label>
                <Input
                  id="contact-name"
                  required
                  maxLength={200}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t.namePlaceholder}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">{t.email}</Label>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t.emailPlaceholder}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone">{t.phone}</Label>
                <Input
                  id="contact-phone"
                  maxLength={20}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={t.phonePlaceholder}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">{t.subject}</Label>
                <Input
                  id="contact-subject"
                  required
                  maxLength={300}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={t.subjectPlaceholder}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-message">{t.message}</Label>
              <Textarea
                id="contact-message"
                required
                maxLength={2000}
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={t.messagePlaceholder}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {loading ? t.sending : t.send}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

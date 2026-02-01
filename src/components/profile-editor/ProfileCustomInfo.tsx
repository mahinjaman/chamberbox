import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DoctorProfile, CustomInfoItem } from "@/hooks/useDoctorProfile";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { Plus, Trash2, Loader2, Info, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ProfileCustomInfoProps {
  profile: DoctorProfile | null | undefined;
}

export const ProfileCustomInfo = ({ profile }: ProfileCustomInfoProps) => {
  const { updateProfile } = useDoctorProfile();
  
  // Parse existing custom info from profile
  const existingInfo = (profile?.custom_info as CustomInfoItem[] | null) || [];
  
  const [items, setItems] = useState<CustomInfoItem[]>(
    existingInfo.length > 0 
      ? existingInfo 
      : []
  );
  
  const [newItem, setNewItem] = useState({ label: "", value: "" });

  const addItem = () => {
    if (!newItem.label.trim() || !newItem.value.trim()) {
      toast.error("Both label and value are required");
      return;
    }
    
    const item: CustomInfoItem = {
      id: crypto.randomUUID(),
      label: newItem.label.trim(),
      value: newItem.value.trim(),
    };
    
    setItems([...items, item]);
    setNewItem({ label: "", value: "" });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: "label" | "value", val: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: val } : item
    ));
  };

  const handleSave = () => {
    updateProfile.mutate({ custom_info: items });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Custom Information
          </CardTitle>
          <CardDescription>
            Add custom fields to display on your public profile (e.g., Registration No, Hospital Affiliation, Awards)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Items */}
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex-shrink-0 pt-2 text-muted-foreground cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Label</Label>
                    <Input
                      value={item.label}
                      onChange={(e) => updateItem(item.id, "label", e.target.value)}
                      placeholder="e.g., Registration No"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Value</Label>
                    <Input
                      value={item.value}
                      onChange={(e) => updateItem(item.id, "value", e.target.value)}
                      placeholder="e.g., BMDC-A12345"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Info className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No custom information added yet</p>
              <p className="text-sm">Add fields like Registration Number, Hospital Affiliations, etc.</p>
            </div>
          )}

          {/* Add New Item */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Add New Field</h4>
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="flex-1">
                <Input
                  value={newItem.label}
                  onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Label (e.g., Hospital)"
                />
              </div>
              <div className="flex-1">
                <Input
                  value={newItem.value}
                  onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Value (e.g., Dhaka Medical College)"
                />
              </div>
              <Button 
                onClick={addItem}
                disabled={!newItem.label.trim() || !newItem.value.trim()}
                className="flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Save Button */}
          {items.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Custom Info"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview on Public Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};


 import { useState, useEffect } from "react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { StickyNote } from "lucide-react";
 
 interface NoteDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   currentNote: string | null;
   patientName: string;
   onSave: (note: string) => void;
 }
 
 export const NoteDialog = ({
   open,
   onOpenChange,
   currentNote,
   patientName,
   onSave,
 }: NoteDialogProps) => {
   const [note, setNote] = useState(currentNote || "");
 
   useEffect(() => {
     setNote(currentNote || "");
   }, [currentNote, open]);
 
   const handleSave = () => {
     onSave(note);
     onOpenChange(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <StickyNote className="w-5 h-5 text-amber-500" />
             Internal Note
           </DialogTitle>
         </DialogHeader>
         
         <div className="py-4 space-y-3">
           <p className="text-sm text-muted-foreground">
             Add internal note for <span className="font-medium text-foreground">{patientName}</span>
           </p>
           <Textarea
             placeholder="Write internal note here... (only visible to staff)"
             value={note}
             onChange={(e) => setNote(e.target.value)}
             rows={4}
             className="resize-none"
           />
           <p className="text-xs text-muted-foreground">
             This note is only visible to you and your staff members.
           </p>
         </div>
 
         <DialogFooter>
           <Button variant="outline" onClick={() => onOpenChange(false)}>
             Cancel
           </Button>
           <Button onClick={handleSave}>
             Save Note
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 };
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDoctorProfile, DoctorProfile } from "@/hooks/useDoctorProfile";
import { GraduationCap, Plus, Trash2, Loader2, Calendar, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileEducationProps {
  profile: DoctorProfile | null | undefined;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  country?: string;
}

export const ProfileEducation = ({ profile }: ProfileEducationProps) => {
  const { updateProfile } = useDoctorProfile();
  
  const [educationList, setEducationList] = useState<Education[]>(() => {
    const edu = profile?.education;
    if (Array.isArray(edu)) {
      return edu as Education[];
    }
    return [];
  });

  const [newEducation, setNewEducation] = useState<Omit<Education, 'id'>>({
    degree: "",
    institution: "",
    year: "",
    country: "",
  });

  useEffect(() => {
    const edu = profile?.education;
    if (Array.isArray(edu)) {
      setEducationList(edu as Education[]);
    }
  }, [profile]);

  const addEducation = () => {
    if (!newEducation.degree.trim() || !newEducation.institution.trim()) {
      return;
    }

    const education: Education = {
      id: Date.now().toString(),
      ...newEducation,
    };

    setEducationList(prev => [...prev, education]);
    setNewEducation({ degree: "", institution: "", year: "", country: "" });
  };

  const removeEducation = (id: string) => {
    setEducationList(prev => prev.filter(edu => edu.id !== id));
  };

  const handleSave = () => {
    updateProfile.mutate({
      education: educationList,
    });
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
            <GraduationCap className="w-5 h-5" />
            Education & Training
          </CardTitle>
          <CardDescription>
            Add your educational background and training history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Education Form */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
            <h4 className="font-medium text-sm">Add New Education</h4>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree / Certificate *</Label>
                <Input
                  id="degree"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="e.g., MBBS, FCPS, MD"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  id="institution"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="e.g., Dhaka Medical College"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={newEducation.year}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="e.g., 2015"
                  maxLength={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={newEducation.country}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g., Bangladesh"
                />
              </div>
            </div>
            
            <Button 
              type="button" 
              onClick={addEducation}
              disabled={!newEducation.degree.trim() || !newEducation.institution.trim()}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>

          {/* Education List */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Added Education ({educationList.length})</Label>
            
            <AnimatePresence mode="popLayout">
              {educationList.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No education added yet</p>
                </motion.div>
              ) : (
                educationList.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{edu.institution}</span>
                      </div>
                      {(edu.year || edu.country) && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {edu.year && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {edu.year}
                            </span>
                          )}
                          {edu.country && (
                            <span>{edu.country}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEducation(edu.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateProfile.isPending} size="lg">
          {updateProfile.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </motion.div>
  );
};

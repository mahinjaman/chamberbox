import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Building2, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface Education {
  id: string;
  degree: string;
  institution: string;
  year?: string;
  country?: string;
}

interface ProfileEducationSectionProps {
  education: Education[] | null;
}

export const ProfileEducationSection = ({ education }: ProfileEducationSectionProps) => {
  if (!education || education.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Education & Training
          </h3>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
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
                      {edu.country && <span>{edu.country}</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

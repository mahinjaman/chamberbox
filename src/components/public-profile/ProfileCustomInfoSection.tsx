import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

interface CustomInfoItem {
  id: string;
  label: string;
  value: string;
}

interface ProfileCustomInfoSectionProps {
  customInfo: CustomInfoItem[] | null;
}

export const ProfileCustomInfoSection = ({ customInfo }: ProfileCustomInfoSectionProps) => {
  if (!customInfo || customInfo.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Additional Information
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {customInfo.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex flex-col p-3 rounded-lg bg-muted/50"
              >
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

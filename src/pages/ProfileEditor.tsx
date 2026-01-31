import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { ProfileBasicInfo } from "@/components/profile-editor/ProfileBasicInfo";
import { ProfileChambers } from "@/components/profile-editor/ProfileChambers";
import { ProfilePublicSettings } from "@/components/profile-editor/ProfilePublicSettings";
import { ProfilePreview } from "@/components/profile-editor/ProfilePreview";
import { Loader2, User, Building2, Globe, Eye, Plug, ArrowRight } from "lucide-react";

const ProfileEditor = () => {
  const { profile, chambers, availabilitySlots, isLoading } = useDoctorProfile();
  const [activeTab, setActiveTab] = useState("basic");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Public Profile</h1>
            <p className="text-muted-foreground">
              Manage your public presence and appointment booking page
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard/integrations">
              <Plug className="w-4 h-4 mr-2" />
              Integrations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="basic" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="chambers" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chambers</span>
            </TabsTrigger>
            <TabsTrigger value="public" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Public URL</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <ProfileBasicInfo profile={profile} />
          </TabsContent>

          <TabsContent value="chambers">
            <ProfileChambers 
              profile={profile} 
              chambers={chambers || []} 
              availabilitySlots={availabilitySlots || []} 
            />
          </TabsContent>

          <TabsContent value="public">
            <ProfilePublicSettings profile={profile} />
          </TabsContent>

          <TabsContent value="preview">
            <ProfilePreview 
              profile={profile} 
              chambers={chambers || []} 
              availabilitySlots={availabilitySlots || []} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfileEditor;

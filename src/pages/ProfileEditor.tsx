import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { ProfileBasicInfo } from "@/components/profile-editor/ProfileBasicInfo";
import { ProfileChambers } from "@/components/profile-editor/ProfileChambers";
import { ProfilePublicSettings } from "@/components/profile-editor/ProfilePublicSettings";
import { ProfileSocialLinks } from "@/components/profile-editor/ProfileSocialLinks";
import { ProfileEducation } from "@/components/profile-editor/ProfileEducation";
import { ProfileVideos } from "@/components/profile-editor/ProfileVideos";
import { ProfileCustomInfo } from "@/components/profile-editor/ProfileCustomInfo";
import { Loader2, User, Building2, Globe, Plug, ArrowRight, Share2, GraduationCap, Video, Info } from "lucide-react";

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
    <DashboardLayout
      title="Public Profile"
      description="Manage your public presence and appointment booking page"
      actions={
        <Button variant="outline" asChild>
          <Link to="/dashboard/integrations">
            <Plug className="w-4 h-4 mr-2" />
            Integrations
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 lg:w-auto lg:inline-flex">
            <TabsTrigger value="basic" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Education</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Custom</span>
            </TabsTrigger>
            <TabsTrigger value="chambers" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chambers</span>
            </TabsTrigger>
            <TabsTrigger value="public" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Public URL</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <ProfileBasicInfo profile={profile} />
          </TabsContent>

          <TabsContent value="education">
            <ProfileEducation profile={profile} />
          </TabsContent>

          <TabsContent value="social">
            <ProfileSocialLinks profile={profile} />
          </TabsContent>

          <TabsContent value="videos">
            <ProfileVideos profile={profile} />
          </TabsContent>

          <TabsContent value="custom">
            <ProfileCustomInfo profile={profile} />
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfileEditor;

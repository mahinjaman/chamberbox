import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useVideoTutorials, VideoTutorial } from "@/hooks/useVideoTutorials";
import { Loader2, Plus, Edit, Trash2, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Available topics for tutorials
const TOPIC_OPTIONS = [
  "Getting Started",
  "Patient Management",
  "Queue Management",
  "Prescriptions",
  "Finances",
  "Analytics",
  "Settings",
  "Public Profile",
  "Integrations",
  "Booking System",
  "SMS & Notifications",
  "Staff Management",
];

export default function TutorialManagement() {
  const { 
    tutorials, 
    tutorialsLoading, 
    saveTutorial,
    deleteTutorial,
    isSaving,
    isDeleting 
  } = useVideoTutorials();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<VideoTutorial | null>(null);
  const [useCustomTopic, setUseCustomTopic] = useState(false);
  const [formData, setFormData] = useState({
    page_path: "",
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    is_active: true,
  });

  const handleOpenDialog = (tutorial?: VideoTutorial) => {
    if (tutorial) {
      setEditingTutorial(tutorial);
      const isCustom = !TOPIC_OPTIONS.includes(tutorial.page_path);
      setUseCustomTopic(isCustom);
      setFormData({
        page_path: tutorial.page_path,
        title: tutorial.title,
        description: tutorial.description || "",
        video_url: tutorial.video_url,
        thumbnail_url: tutorial.thumbnail_url || "",
        is_active: tutorial.is_active,
      });
    } else {
      setEditingTutorial(null);
      setUseCustomTopic(false);
      setFormData({
        page_path: "",
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveTutorial(formData);
    setIsDialogOpen(false);
  };

  const handleDelete = (tutorialId: string) => {
    if (confirm("Are you sure you want to delete this tutorial?")) {
      deleteTutorial(tutorialId);
    }
  };

  const getTopicLabel = (path: string) => {
    return path;
  };

  return (
    <AdminLayout
      title="Video Tutorials"
      description="Manage help videos for each page"
      actions={
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tutorial
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>All Tutorials</CardTitle>
        </CardHeader>
        <CardContent>
          {tutorialsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tutorials && tutorials.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>Topic</TableHead>
                   <TableHead>Title</TableHead>
                  <TableHead>Video URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutorials.map((tutorial) => (
                  <TableRow key={tutorial.id}>
                    <TableCell className="font-medium">
                      {getTopicLabel(tutorial.page_path)}
                    </TableCell>
                    <TableCell>{tutorial.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a 
                        href={tutorial.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {tutorial.video_url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tutorial.is_active ? "default" : "secondary"}>
                        {tutorial.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(tutorial)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tutorial.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tutorials added yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                Add First Tutorial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Tutorial Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTutorial ? "Edit Tutorial" : "Add New Tutorial"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Topic</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-1"
                  onClick={() => {
                    setUseCustomTopic(!useCustomTopic);
                    setFormData({ ...formData, page_path: "" });
                  }}
                >
                  {useCustomTopic ? "Choose from list" : "Custom topic"}
                </Button>
              </div>
              {useCustomTopic ? (
                <Input
                  value={formData.page_path}
                  onChange={(e) => setFormData({ ...formData, page_path: e.target.value })}
                  placeholder="Enter custom topic name"
                />
              ) : (
                <Select 
                  value={formData.page_path} 
                  onValueChange={(value) => setFormData({ ...formData, page_path: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPIC_OPTIONS.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Getting Started with Dashboard"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what this tutorial covers"
              />
            </div>

            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="YouTube or video embed URL"
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail URL (optional)</Label>
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="Thumbnail image URL"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !formData.page_path || !formData.title || !formData.video_url}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTutorial ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

-- Create app role enum for admin system
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin');

-- Create user_roles table for admin management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin')
  )
$$;

-- RLS policies for user_roles - only admins can manage
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Add approval status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- Expand subscription tier enum
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'trial';
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'enterprise';

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support ticket replies table
CREATE TABLE public.support_ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video tutorials table
CREATE TABLE public.video_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_tutorials ENABLE ROW LEVEL SECURITY;

-- Support tickets policies
CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can create tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update tickets"
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Support ticket replies policies
CREATE POLICY "Users can view replies on their tickets"
  ON public.support_ticket_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t 
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can reply to their tickets"
  ON public.support_ticket_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets t 
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

-- Video tutorials policies - public read, admin write
CREATE POLICY "Anyone can view active tutorials"
  ON public.video_tutorials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tutorials"
  ON public.video_tutorials FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Admin can view all profiles for management
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR user_id = auth.uid());

-- Admin can update profiles for approval
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()) OR user_id = auth.uid());

-- Update triggers for new tables
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_tutorials_updated_at
  BEFORE UPDATE ON public.video_tutorials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
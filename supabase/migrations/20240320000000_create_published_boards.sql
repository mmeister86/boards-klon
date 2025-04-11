-- Create published_boards table
CREATE TABLE IF NOT EXISTS public.published_boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    user_id UUID NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES public.projects(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_published_boards_project_id ON public.published_boards(project_id);
CREATE INDEX IF NOT EXISTS idx_published_boards_user_id ON public.published_boards(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.published_boards ENABLE ROW LEVEL SECURITY;

-- Policy for viewing published boards (anyone can view if is_published is true)
CREATE POLICY "View published boards"
    ON public.published_boards
    FOR SELECT
    USING (is_published = true);

-- Policy for managing own boards (authenticated users can manage their own boards)
CREATE POLICY "Manage own boards"
    ON public.published_boards
    FOR ALL
    USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT ON public.published_boards TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.published_boards TO authenticated;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- 2. WORKFLOWS TABLE
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_workflows_organization_id ON workflows(organization_id);
CREATE INDEX idx_workflows_created_by ON workflows(created_by);
CREATE INDEX idx_workflows_updated_at ON workflows(updated_at DESC);

-- 3. WORKFLOW NODES TABLE
CREATE TABLE IF NOT EXISTS workflow_nodes (
  id TEXT PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  position JSONB NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);

-- 4. WORKFLOW EDGES TABLE
CREATE TABLE IF NOT EXISTS workflow_edges (
  id TEXT PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_workflow_edges_workflow_id ON workflow_edges(workflow_id);

-- 5. WORKFLOW VERSIONS TABLE
CREATE TABLE IF NOT EXISTS workflow_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, version_number)
);

-- Add indexes
CREATE INDEX idx_workflow_versions_workflow_id ON workflow_versions(workflow_id);
CREATE INDEX idx_workflow_versions_version_number ON workflow_versions(workflow_id, version_number DESC);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
-- Users can view users in their organization
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can update their own record
CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- WORKFLOWS POLICIES
-- Users can view workflows in their organization
CREATE POLICY "Users can view workflows in their organization"
  ON workflows FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can create workflows in their organization
CREATE POLICY "Users can create workflows in their organization"
  ON workflows FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can update workflows in their organization
CREATE POLICY "Users can update workflows in their organization"
  ON workflows FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can delete workflows in their organization
CREATE POLICY "Users can delete workflows in their organization"
  ON workflows FOR DELETE
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- WORKFLOW NODES POLICIES
-- Users can view nodes of workflows in their organization
CREATE POLICY "Users can view nodes of workflows in their organization"
  ON workflow_nodes FOR SELECT
  USING (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can insert nodes for workflows in their organization
CREATE POLICY "Users can insert nodes for workflows in their organization"
  ON workflow_nodes FOR INSERT
  WITH CHECK (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can update nodes of workflows in their organization
CREATE POLICY "Users can update nodes of workflows in their organization"
  ON workflow_nodes FOR UPDATE
  USING (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can delete nodes of workflows in their organization
CREATE POLICY "Users can delete nodes of workflows in their organization"
  ON workflow_nodes FOR DELETE
  USING (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- WORKFLOW EDGES POLICIES
-- Users can view edges of workflows in their organization
CREATE POLICY "Users can view edges of workflows in their organization"
  ON workflow_edges FOR SELECT
  USING (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can insert edges for workflows in their organization
CREATE POLICY "Users can insert edges for workflows in their organization"
  ON workflow_edges FOR INSERT
  WITH CHECK (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can update edges of workflows in their organization
CREATE POLICY "Users can update edges of workflows in their organization"
  ON workflow_edges FOR UPDATE
  USING (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can delete edges of workflows in their organization
CREATE POLICY "Users can delete edges of workflows in their organization"
  ON workflow_edges FOR DELETE
  USING (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- WORKFLOW VERSIONS POLICIES
-- Users can view versions of workflows in their organization
CREATE POLICY "Users can view versions of workflows in their organization"
  ON workflow_versions FOR SELECT
  USING (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can create versions for workflows in their organization
CREATE POLICY "Users can create versions for workflows in their organization"
  ON workflow_versions FOR INSERT
  WITH CHECK (
    workflow_id IN (
      SELECT id FROM workflows 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 7. TRIGGERS FOR UPDATED_AT
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workflows table
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

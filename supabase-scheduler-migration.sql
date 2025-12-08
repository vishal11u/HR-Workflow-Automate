-- 1. SCHEDULED JOBS TABLE
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  schedule_expression TEXT NOT NULL, -- e.g. "0 9 * * *" or "Every Monday"
  next_run_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused'
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_status TEXT -- 'success', 'failed', 'pending', null
);

-- Indexes
CREATE INDEX idx_scheduled_jobs_org_id ON scheduled_jobs(organization_id);
CREATE INDEX idx_scheduled_jobs_workflow_id ON scheduled_jobs(workflow_id);

-- 2. WORKFLOW RUNS TABLE (For Analytics)
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  job_id UUID REFERENCES scheduled_jobs(id) ON DELETE SET NULL,
  status TEXT NOT NULL, -- 'pending', 'running', 'success', 'failed'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  trigger_type TEXT DEFAULT 'manual', -- 'manual', 'scheduled', 'api'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workflow_runs_org_id ON workflow_runs(organization_id);
CREATE INDEX idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);
CREATE INDEX idx_workflow_runs_created_at ON workflow_runs(created_at DESC);

-- 3. RLS POLICIES

-- Enable RLS
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

-- scheduled_jobs Policies
CREATE POLICY "Users can view scheduled_jobs in their organization"
  ON scheduled_jobs FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scheduled_jobs in their organization"
  ON scheduled_jobs FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update scheduled_jobs in their organization"
  ON scheduled_jobs FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scheduled_jobs in their organization"
  ON scheduled_jobs FOR DELETE
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- workflow_runs Policies
CREATE POLICY "Users can view workflow_runs in their organization"
  ON workflow_runs FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workflow_runs in their organization"
  ON workflow_runs FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- 4. Triggers
-- Trigger for scheduled_jobs updated_at
CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON scheduled_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Database schema for Task Manager app
-- Tier 1 of 3: PostgreSQL data layer

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Keep updated_at fresh on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Sample seed data
INSERT INTO tasks (title, description, status, priority) VALUES
    ('Set up project repo', 'Initialize git and push skeleton', 'completed', 'high'),
    ('Design database schema', 'Define tasks table and constraints', 'completed', 'high'),
    ('Build Flask API', 'CRUD endpoints for tasks', 'in_progress', 'medium'),
    ('Build React UI', 'Connect frontend to API', 'pending', 'medium')
ON CONFLICT DO NOTHING;

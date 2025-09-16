CREATE TABLE IF NOT EXISTS tourists (
    did VARCHAR(255) PRIMARY KEY,
    government_id VARCHAR(255) UNIQUE NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    family_contacts JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Profile table (single row, id=1)
CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    about_text TEXT,
    projects_completed INTEGER,
    technologies_learned INTEGER,
    learning_mindset INTEGER
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    tech_tags TEXT[],
    modal_content TEXT,
    github_link TEXT
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    details TEXT,
    grade TEXT
);

-- Social links table
CREATE TABLE IF NOT EXISTS social_links (
    id SERIAL PRIMARY KEY,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial profile row if not exists
INSERT INTO profile (id, name, role, about_text, projects_completed, technologies_learned, learning_mindset)
SELECT 1, 'Shreehari Ballakkuraya', 'Developer & Data Analyst', '', 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM profile WHERE id=1);

-- CSE 340 Service Network
-- Organizations table setup
 
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
); 


-- Seed data for the organizations table

INSERT INTO organizations (name, description, contact_email, logo_filename)
VALUES
    ('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
    ('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
    ('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');



    -- Service projects table setup
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);



-- Seed data for the projects table (5 projects per organization)
INSERT INTO projects (organization_id, title, description, location, date)
VALUES
    -- Organization 1: BrightFuture Builders (Sustainable Construction & Infrastructure)
    (1, 'Community Center Ramp Construction', 'Build accessibility ramps and repair exterior handrails at the Eastside Community Center.', '102 Eastside Ave, Springfield', '2026-10-05'),
    (1, 'Playground Safety Upgrade', 'Assemble new eco-friendly playground equipment and spread protective mulch.', 'Oakwood Park, 450 Oak St', '2026-10-12'),
    (1, 'Senior Home Weatherization', 'Install window insulation, weather stripping, and door sweeps for elderly neighborhood residents.', '782 Maple Ridge Rd', '2026-10-19'),
    (1, 'Community Tool Shed Build', 'Frame, roof, and paint a shared neighborhood tool-lending library shed.', '23 Elmwood Square', '2026-10-26'),
    (1, 'Youth Center Interior Painting', 'Prep and paint classrooms and multipurpose rooms at the Downtown Youth Center.', '510 Main Street, Suite B', '2026-11-02'),

    -- Organization 2: GreenHarvest Growers (Urban Farming & Food Sustainability)
    (2, 'Fall Raised-Bed Planting', 'Plant cool-weather vegetables including kale, spinach, and garlic across 20 raised garden beds.', '742 Garden Lane', '2026-10-08'),
    (2, 'Community Orchard Pruning & Mulching', 'Prune fruit trees and apply organic compost and mulch to protect root systems before winter.', 'Riverside Orchard, North Lot', '2026-10-15'),
    (2, 'Urban Greenhouse Glazing & Prep', 'Clean, inspect, and seal greenhouse panels ahead of the late autumn seedling season.', '300 Sunrise Blvd', '2026-10-22'),
    (2, 'Harvest Box Packing & Distribution', 'Weigh, sort, and box fresh organic produce for local family food pantry delivery.', '120 Harvest Way', '2026-10-29'),
    (2, 'Pollinator Garden Expansion', 'Establish native perennial flower beds to attract and support local honeybees and butterflies.', 'Meadowview Park Edge', '2026-11-05'),

    -- Organization 3: UnityServe Volunteers (Volunteer Coordination & Charity Support)
    (3, 'City Park Trail Cleanup', 'Collect litter and clear overgrowth along three miles of popular walking and biking trails.', 'Pinewood Trailhead, Mile 0', '2026-10-07'),
    (3, 'Homeless Shelter Meal Service', 'Assist with prepping, serving, and dining area clean-up for dinner service.', 'Downtown Hope Shelter, 614 Pine St', '2026-10-14'),
    (3, 'After-School Math & Reading Tutoring', 'Provide 1-on-1 homework help and reading practice for elementary school students.', 'Lincoln Elementary Library', '2026-10-21'),
    (3, 'Warm Clothes & Coat Drive Sorting', 'Sort, size, and organize donated winter coats, gloves, and blankets for distribution.', 'Civic Auditorium Room 104', '2026-10-28'),
    (3, 'Community Food Bank Shelf Restocking', 'Unload inventory pallets, check expiration dates, and restock non-perishable pantry shelves.', 'Metro Food Bank, Bay 3', '2026-11-04');



    -- Categories table setup
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Seed data for the categories table
INSERT INTO categories (name)
VALUES
    ('Environmental'),
    ('Educational'),
    ('Community Service'),
    ('Health and Wellness');

-- Project-Categories relationship table
CREATE TABLE project_categories (
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);


-- Seed data for project_categories
INSERT INTO project_categories (project_id, category_id)
VALUES
    (1, 3),           -- Community Center Ramp Construction: Community Service
    (2, 3), (2, 4),   -- Playground Safety Upgrade: Community Service, Health and Wellness
    (3, 3), (3, 4),   -- Senior Home Weatherization: Community Service, Health and Wellness
    (4, 3),           -- Community Tool Shed Build: Community Service
    (5, 3), (5, 2),   -- Youth Center Interior Painting: Community Service, Educational
    (6, 1),           -- Fall Raised-Bed Planting: Environmental
    (7, 1),           -- Community Orchard Pruning & Mulching: Environmental
    (8, 1),           -- Urban Greenhouse Glazing & Prep: Environmental
    (9, 1), (9, 3),   -- Harvest Box Packing & Distribution: Environmental, Community Service
    (10, 1),          -- Pollinator Garden Expansion: Environmental
    (11, 1), (11, 3), -- City Park Trail Cleanup: Environmental, Community Service
    (12, 3), (12, 4), -- Homeless Shelter Meal Service: Community Service, Health and Wellness
    (13, 2),          -- After-School Math & Reading Tutoring: Educational
    (14, 3),          -- Warm Clothes & Coat Drive Sorting: Community Service
    (15, 3), (15, 4); -- Community Food Bank Shelf Restocking: Community Service, Health and Wellness
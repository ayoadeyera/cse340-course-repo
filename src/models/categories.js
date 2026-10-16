import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT category_id, name
        FROM categories;
    `;

    const result = await db.query(query);

    return result.rows;
};

// Get one category by its ID (same pattern as getOrganizationDetails)
const getCategoryDetails = async (categoryId) => {
    const query = `
        SELECT category_id, name
        FROM categories
        WHERE category_id = $1;
    `;

    const queryParams = [categoryId];
    const result = await db.query(query, queryParams);

    // Return the first row, or null if no category has this ID
    return result.rows.length > 0 ? result.rows[0] : null;
};

// Get all categories that belong to one project
const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name
        FROM categories c
        JOIN project_categories pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;

    const queryParams = [projectId];
    const result = await db.query(query, queryParams);

    return result.rows;
};

export { getAllCategories, getCategoryDetails, getCategoriesByProjectId };
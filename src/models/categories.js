
import db, { pool } from './db.js';


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


const assignCategoryToProject = async (client, categoryId, projectId) => {
    const query = `
        INSERT INTO project_categories (category_id, project_id)
        VALUES ($1, $2);
    `;

    await client.query(query, [categoryId, projectId]);
};

const updateCategoryAssignments = async (projectId, categoryIds) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            'DELETE FROM project_categories WHERE project_id = $1',
            [projectId]
        );

        for (const categoryId of categoryIds) {
            await assignCategoryToProject(client, categoryId, projectId);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};


export {
    getAllCategories,
    getCategoryDetails,
    getCategoriesByProjectId,
    updateCategoryAssignments
};

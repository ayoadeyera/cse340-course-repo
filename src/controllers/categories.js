// Import any needed model functions
import { getAllCategories, getCategoryDetails } from '../models/categories.js';
import { getProjectsByCategoryId } from '../models/projects.js';

// Define any controller functions
const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();
    const title = 'Service Categories';

    res.render('categories', { title, categories, pageClass: 'page-categories' });
};

const showCategoryDetailsPage = async (req, res, next) => {
    const categoryId = Number(req.params.id);

    if (
        !Number.isInteger(categoryId) ||
        categoryId <= 0 ||
        categoryId > 2147483647
    ) {
        const err = new Error('Category Not Found');
        err.status = 404;
        return next(err);
    }

const category = await getCategoryDetails(categoryId);

    // If no category has this ID, send a 404 to the error handler
    if (!category) {
        const err = new Error('Category Not Found');
        err.status = 404;
        return next(err);
    }

    const projects = await getProjectsByCategoryId(categoryId);
    const title = category.name;

    res.render('category', { title, category, projects, pageClass: 'page-projects' });
};

// Export any controller functions
export { showCategoriesPage, showCategoryDetailsPage };
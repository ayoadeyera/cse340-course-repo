// Import any needed model functions

import { getAllCategories, getCategoryDetails, getCategoriesByProjectId, updateCategoryAssignments} from '../models/categories.js';

import { getProjectsByCategoryId, getProjectDetails} from '../models/projects.js';


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


const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = Number(req.params.projectId);

        if (!Number.isInteger(projectId) || projectId <= 0) {
            return next(Object.assign(new Error('Project Not Found'), { status: 404 }));
        }

        const projectDetails = await getProjectDetails(projectId);

        if (!projectDetails) {
            return next(Object.assign(new Error('Project Not Found'), { status: 404 }));
        }

        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesByProjectId(projectId);

        res.render('assign-categories', {
            title: 'Assign Categories to Project',
            projectId,
            projectDetails,
            categories,
            assignedCategories
        });
    } catch (error) {
        next(error);
    }
};

const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = Number(req.params.projectId);

        if (!Number.isInteger(projectId) || projectId <= 0) {
            return next(Object.assign(new Error('Project Not Found'), { status: 404 }));
        }

        const project = await getProjectDetails(projectId);

        if (!project) {
            return next(Object.assign(new Error('Project Not Found'), { status: 404 }));
        }

        const selected = req.body.categoryIds || [];
        const categoryIds = Array.isArray(selected) ? selected : [selected];
        const allCategories = await getAllCategories();
        const validIds = new Set(allCategories.map(c => Number(c.category_id)));

        if (categoryIds.some(id => !/^\d+$/.test(String(id)) || !validIds.has(Number(id)))) {
            req.flash('error', 'Invalid category selection.');
            return res.redirect(`/assign-categories/${projectId}`);
        }

        await updateCategoryAssignments(
            projectId,
            [...new Set(categoryIds.map(Number))]
        );

        req.flash('success', 'Categories updated successfully!');
        return res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

// Export any controller functions

export { showCategoriesPage, showCategoryDetailsPage, showAssignCategoriesForm, processAssignCategoriesForm };

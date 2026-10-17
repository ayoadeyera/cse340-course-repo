// Import any needed model functions

import { body, validationResult } from 'express-validator';
import { getAllCategories, getCategoryDetails, getCategoriesByProjectId, updateCategoryAssignments, createCategory, updateCategory } from '../models/categories.js';
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


const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .bail()
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
];

const showNewCategoryForm = (req, res) => {
    res.render('new-category', {
        title: 'Add New Category'
    });
};

const processNewCategoryForm = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        return res.redirect('/new-category');
    }

    try {
        const categoryId = await createCategory(req.body.name);

        req.flash('success', 'Category created successfully!');
        return res.redirect(`/category/${categoryId}`);
    } catch (error) {
        next(error);
    }
};

const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = Number(req.params.id);

        if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
            const error = new Error('Category Not Found');
            error.status = 404;
            return next(error);
        }

        const category = await getCategoryDetails(categoryId);

        if (!category) {
            const error = new Error('Category Not Found');
            error.status = 404;
            return next(error);
        }

        res.render('edit-category', {
            title: 'Edit Category',
            category
        });
    } catch (error) {
        next(error);
    }
};

const processEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = Number(req.params.id);

        if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
            const error = new Error('Category Not Found');
            error.status = 404;
            return next(error);
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.array().forEach(error => {
                req.flash('error', error.msg);
            });

            return res.redirect(`/edit-category/${categoryId}`);
        }

        await updateCategory(categoryId, req.body.name);

        req.flash('success', 'Category updated successfully!');
        return res.redirect(`/category/${categoryId}`);
    } catch (error) {
        if (error.message === 'Category not found') {
            error.status = 404;
        }
        next(error);
    }
};


// Export any controller functions

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    categoryValidation
};


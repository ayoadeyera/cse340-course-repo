// Import any needed model functions
import { getCategoriesByProjectId } from '../models/categories.js';
import { createProject, getUpcomingProjects, getProjectDetails, updateProject } from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';
import { body, validationResult } from 'express-validator';


// How many projects to show on the main projects page
const NUMBER_OF_UPCOMING_PROJECTS = 5;

// Define any controller functions
const showProjectsPage = async (req, res) => {
    const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
    const title = 'Upcoming Service Projects';

    res.render('projects', { title, projects, pageClass: 'page-projects' });
};

const showProjectDetailsPage = async (req, res, next) => {
    const projectId = Number(req.params.id);

    // Reject anything that isn't a valid database integer ID
    if (
        !Number.isInteger(projectId) ||
        projectId <= 0 ||
        projectId > 2147483647
    ) {
        const err = new Error('Project Not Found');
        err.status = 404;
        return next(err);
    }

    const project = await getProjectDetails(projectId);

    // If no project has this id, send a 404 to the error handler
    if (!project) {
        const err = new Error('Project Not Found');
        err.status = 404;
        return next(err);
    }

    const categories = await getCategoriesByProjectId(projectId);
    const title = project.title;

    res.render('project', { title, project, categories, pageClass: 'page-project' });
};

const projectValidation = [
    body('title').trim().notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),

    body('description').trim().notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),

    body('location').trim().notEmpty()
        .withMessage('Location is required')
        .isLength({ max: 200 })
        .withMessage('Location must be less than 200 characters'),

    body('date').notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Date must be valid'),

    body('organizationId').notEmpty()
        .withMessage('Organization is required')
        .isInt({ min: 1 })
        .withMessage('Select a valid organization')
];

const showNewProjectForm = async (req, res) => {
    const organizations = await getAllOrganizations();

    res.render('new-project', {
        title: 'Add New Service Project',
        organizations
    });
};

const processNewProjectForm = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        return res.redirect('/new-project');
    }

    const { title, description, location, date, organizationId } = req.body;

    try {
        await createProject(
            title,
            description,
            location,
            date,
            Number(organizationId)
        );

        req.flash('success', 'New service project created successfully!');
        return res.redirect('/projects');

    } catch (error) {
        console.error('Error creating project:', error);
        req.flash('error', 'There was an error creating the service project.');
        return res.redirect('/new-project');
    }
};


const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = Number(req.params.id);

        if (!Number.isInteger(projectId) || projectId <= 0) {
            const error = new Error('Project Not Found');
            error.status = 404;
            return next(error);
        }

        const project = await getProjectDetails(projectId);

        if (!project) {
            const error = new Error('Project Not Found');
            error.status = 404;
            return next(error);
        }

        const organizations = await getAllOrganizations();

        res.render('edit-project', {
            title: 'Edit Service Project',
            project,
            organizations
        });
    } catch (error) {
        next(error);
    }
};

const processEditProjectForm = async (req, res, next) => {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
        const error = new Error('Project Not Found');
        error.status = 404;
        return next(error);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        return res.redirect(`/edit-project/${projectId}`);
    }

    try {
        const {
            title,
            description,
            location,
            date,
            organizationId
        } = req.body;

        const organizations = await getAllOrganizations();
        const organizationExists = organizations.some(
            org => Number(org.organization_id) === Number(organizationId)
        );

        if (!organizationExists) {
            req.flash('error', 'Please select a valid organization.');
            return res.redirect(`/edit-project/${projectId}`);
        }

        await updateProject(
            projectId,
            title,
            description,
            location,
            date,
            Number(organizationId)
        );

        req.flash('success', 'Service project updated successfully!');
        return res.redirect(`/project/${projectId}`);
    } catch (error) {
        if (error.message === 'Project not found') {
            error.status = 404;
        }
        next(error);
    }
};


// Export any controller functions

export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation
};


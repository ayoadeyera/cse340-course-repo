// Import any needed model functions
import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { createOrganization } from '../models/organizations.js';
import { body, validationResult } from 'express-validator';

// Define validation and sanitization rules for organization form
// Define validation rules for organization form
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .trim()
        .notEmpty()
        .withMessage('Contact email is required')
        .bail()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .bail()
        .normalizeEmail()
];

// Define any controller functions
const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';

    res.render('organizations', { title, organizations, pageClass: 'page-organizations' });
};

const showOrganizationDetailsPage = async (req, res, next) => {
    const organizationId = Number(req.params.id);

    // Reject anything that isn't a valid database integer ID
    if (
        !Number.isInteger(organizationId) ||
        organizationId <= 0 ||
        organizationId > 2147483647
    ) {
        const err = new Error('Organization Not Found');
        err.status = 404;
        return next(err);
    }

    const organizationDetails = await getOrganizationDetails(organizationId);

    // If no organization has this ID, send a 404 to the error handler
    if (!organizationDetails) {
        const err = new Error('Organization Not Found');
        err.status = 404;
        return next(err);
    }

    const projects = await getProjectsByOrganizationId(organizationId);
    const title = 'Organization Details';

    res.render('organization', { title, organizationDetails, projects, pageClass: 'page-projects' });
};

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';

    res.render('new-organization', { title });
}

const processNewOrganizationForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new organization form
        return res.redirect('/new-organization');
    }

    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png'; // Use the placeholder logo for all new organizations    

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
    req.flash('success', 'Organization added successfully!');
    res.redirect(`/organization/${organizationId}`);
};

const showEditOrganizationForm = async (req, res, next) => {
    const organizationId = Number(req.params.id);

    // Reject anything that isn't a valid database integer ID
    if (
        !Number.isInteger(organizationId) ||
        organizationId <= 0 ||
        organizationId > 2147483647
    ) {
        const err = new Error('Organization Not Found');
        err.status = 404;
        return next(err);
    }

    const organizationDetails = await getOrganizationDetails(organizationId);

    // If no organization has this ID, send a 404 to the error handler
    if (!organizationDetails) {
        const err = new Error('Organization Not Found');
        err.status = 404;
        return next(err);
    }

    const title = 'Edit Organization';

    res.render('edit-organization', { title, organizationDetails });
};

// Export any controller functions
export { showOrganizationsPage, showOrganizationDetailsPage, showNewOrganizationForm, processNewOrganizationForm, organizationValidation, showEditOrganizationForm };
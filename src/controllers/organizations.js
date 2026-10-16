// Import any needed model functions
import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

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

// Export any controller functions
export { showOrganizationsPage, showOrganizationDetailsPage };
// Import any needed model functions
import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';

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
// Export any controller functions
export { showProjectsPage, showProjectDetailsPage };
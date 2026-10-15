// Import any needed model functions
import { getAllProjects, getProjectDetails } from '../models/projects.js';

// Define any controller functions
const showProjectsPage = async (req, res) => {
    const projects = await getAllProjects();
    const title = 'Service Projects';

    res.render('projects', { title, projects });
};

const showProjectDetailsPage = async (req, res, next) => {
    const projectId = req.params.id;
    const project = await getProjectDetails(projectId);

    // If no project has this id, send a 404 to the error handler
    if (!project) {
        const err = new Error('Project Not Found');
        err.status = 404;
        return next(err);
    }

    const title = project.title;
    res.render('project', { title, project });
};

// Export any controller functions
export { showProjectsPage, showProjectDetailsPage };
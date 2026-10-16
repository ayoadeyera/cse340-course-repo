// Define any controller functions
const showHomePage = async (req, res) => {
    const title = 'Home';

    res.render('home', { title, pageClass: 'page-home' });
};

// Export any controller functions
export { showHomePage };
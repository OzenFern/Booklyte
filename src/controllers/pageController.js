/**
 * Controller for handling page-related requests.
 * @module pageController
 */

export const getHomePage = (req, res) => {
  res.render("pages/index", { title: "Home" });
};

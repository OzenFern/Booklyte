/**
 * Controller for handling page-related requests.
 * @module pageController
 */

export const getHomePage = (req, res) => {
  res.render("pages/home", { title: "Home" });
};

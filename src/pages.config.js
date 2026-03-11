import About from "./pages/About";
import Books from "./pages/Books";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import BookDetails from "./pages/BookDetails";
import __Layout from "./Layout.jsx";

export const PAGES = {
  home: Home,
  about: About,
  books: Books,
  contact: Contact,
  admin: Admin,
  "sign-in": SignIn,
  "sign-up": SignUp,
  "book-details": BookDetails,
};

export const pagesConfig = {
  mainPage: "home",
  Pages: PAGES,
  Layout: __Layout,
};

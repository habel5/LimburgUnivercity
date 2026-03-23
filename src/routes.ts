import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/Home";
import Challenges from "./components/Challenges";
import AddListing from "./components/AddListing";
import ListingDetail from "./components/ListingDetail";
import About from "./components/About";
import SubmitProposal from "./components/SubmitProposal";
import AdminPanel from "./components/AdminPanel";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "cases", Component: Challenges },
      { path: "add", Component: AddListing },
      { path: "listing/:id", Component: ListingDetail },
      { path: "listing/:id/submit-proposal", Component: SubmitProposal },
      { path: "about", Component: About },
      { path: "admin", Component: AdminPanel },
    ],
  },
]);

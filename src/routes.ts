import { createBrowserRouter } from "react-router";
import Root from "./components/Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import("./components/Home");
          return { Component: module.default };
        },
      },
      {
        path: "cases",
        lazy: async () => {
          const module = await import("./components/Challenges");
          return { Component: module.default };
        },
      },
      {
        path: "add",
        lazy: async () => {
          const module = await import("./components/AddListing");
          return { Component: module.default };
        },
      },
      {
        path: "listing/:id",
        lazy: async () => {
          const module = await import("./components/ListingDetail");
          return { Component: module.default };
        },
      },
      {
        path: "listing/:id/submit-proposal",
        lazy: async () => {
          const module = await import("./components/SubmitProposal");
          return { Component: module.default };
        },
      },
      {
        path: "about",
        lazy: async () => {
          const module = await import("./components/About");
          return { Component: module.default };
        },
      },
      {
        path: "admin",
        lazy: async () => {
          const module = await import("./components/AdminPanel");
          return { Component: module.default };
        },
      },
    ],
  },
]);

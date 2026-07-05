export const routes = {
  publicRoutes: {
    home: "/",
    menu: "/menu",
    about: "/about",
    gallery: "/gallery",
    stories: "/stories",
    storyDetails: (slug: string) => `/stories/${slug}`,
    galleryByCategory: (slug: string) => `/gallery?category=${slug}`,
    blogsDetails: "/blog-details",
    reserveTable: "/reserve-table",
    ourStory: "/our-story",
    adminLogin: "/admin/login",
    connect: "/lets-connect",
    terms: "/terms",
  },
  privateRoutes: {
    admin: {
      dashboard: "/admin/dashboard",
      settings: `/admin/dashboard/settings`,
      subscription: `/admin/dashboard/subscription`,
      analytics: `/admin/dashboard/analytics`,
      categories: `/admin/dashboard/categories`,
      news: `/admin/dashboard/news`,
      promotionMethods: `/admin/dashboard/promotion-methods`,
    },
  },
};

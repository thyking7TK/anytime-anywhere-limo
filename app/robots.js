export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: "https://anytime-anywhere-limo.vercel.app/sitemap.xml",
  };
}

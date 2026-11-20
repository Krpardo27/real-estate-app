import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { siteImages } from "../data/siteImages.js";
import { resolveImage } from "../utils/images.js";

export default function Seo({ title, description, noindex = true, image }) {
  const { pathname } = useLocation();
  const configuredOrigin = import.meta.env.VITE_SITE_URL;
  let origin;
  try {
    const url = new URL(configuredOrigin);
    if (url.protocol === "https:" && !url.username && !url.password) origin = url.origin;
  } catch { /* Sin dominio verificado no se inventa un canonical. */ }
  const fullTitle = title ? `${title} | HomeEstate` : "HomeEstate | Propiedades en Chile";
  const canonical = origin ? new URL(pathname, origin).href : undefined;
  const resolvedImage = resolveImage(image || siteImages.social, 1200);
  const socialImage = resolvedImage.startsWith("https://") ? resolvedImage : origin ? new URL(resolvedImage, origin).href : undefined;
  useEffect(() => {
    document.title = fullTitle;
    const setMeta = (attribute, key, value) => {
      let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.append(tag);
      }
      tag.content = value;
    };
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex || !origin ? "noindex, follow" : "index, follow");
    for (const [key, value] of Object.entries({ title: fullTitle, description, type: "website", locale: "es_CL" })) setMeta("property", `og:${key}`, value);
    for (const [key, value] of Object.entries({ card: socialImage ? "summary_large_image" : "summary", title: fullTitle, description })) setMeta("name", `twitter:${key}`, value);
    if (socialImage) {
      setMeta("property", "og:image", socialImage);
      setMeta("name", "twitter:image", socialImage);
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }
    document.head.querySelector('link[rel="canonical"]')?.remove();
    document.head.querySelector('meta[property="og:url"]')?.remove();
    if (canonical) {
      const tag = document.createElement("link");
      tag.rel = "canonical";
      tag.href = canonical;
      document.head.append(tag);
      setMeta("property", "og:url", canonical);
    }
  }, [fullTitle, description, noindex, origin, canonical, socialImage]);
  return null;
}
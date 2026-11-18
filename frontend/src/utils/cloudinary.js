const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const cld = (src, width = 800) => {
  if (!src || src.startsWith("http")) {
    return src;
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,dpr_auto,w_${width}/${src}`;
};
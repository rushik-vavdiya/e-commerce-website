import slugify from "slugify";

export const createSlug = (value) => {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
};

export const createUniqueSlug = async (value, findBySlug) => {
  const baseSlug = createSlug(value);

  let slug = baseSlug;
  let count = 1;

  while (await findBySlug(slug)) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};

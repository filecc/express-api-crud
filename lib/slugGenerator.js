const fs = require("fs");
const path = require("path");
const CustomError = require("./CustomError");

module.exports = function slugGenerator(title) {
    if (!title || typeof title !== "string") {
        throw new CustomError("Title is not a string", 400);
    }
  const posts = JSON.parse(fs.readFileSync(
    path.resolve("./db/posts.json"), "utf-8"));
    if(!posts || posts.length === 0){
        throw new CustomError("Posts array not found", 777);
    }
  const slugList = posts.map((post) => post.slug);

  let slug = title.toLowerCase().split(" ").join("-");

  slug = slug.replace(/[^\w-]+/g, "");

  for (let i = 0; i < slug.length; i++) {
    if (slug[i] === "-" && slug[i + 1] === "-") {
      slug = slug.slice(0, i);
    }
  }
  if(slugList.includes(slug)){
    slug = slug + "-1";
  }
  return slug;
};

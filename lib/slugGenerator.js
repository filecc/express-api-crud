const CustomError = require("./CustomError");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { kebabCase } = require("lodash");


module.exports = async function slugGenerator(title) {
  const posts = await prisma.post.findMany()
  
    const slugs = posts.map((post) => post.slug)
    const slug = kebabCase(title)
    if(slugs.includes(slug)) {
      return slug + "-" + Math.floor(Math.random() * 1000)
    }
    return slug;
 
};

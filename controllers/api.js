const express = require("express");
const fs = require("fs");
const path = require("path");
const env = require("dotenv").config();
const Post = require("../lib/Post");
const generateJWT = require("../lib/generateJWT");
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient()
const CustomError= require("../lib/CustomError");
const slugGenerator = require("../lib/slugGenerator");



const port = process.env.PORT ?? "";
const host = process.env.HOST.includes("localhost")
  ? "localhost"
  : "https://" + process.env.HOST + "/";

const posts = prisma.post.findMany()

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */

async function index(req, res) {
  const posts = await prisma.post.findMany()
  
  if (posts.lenght === 0) {
    res.json({
      error: 404,
      message: `No posts found`,
    });
    return
  }
  res.json(posts);
}

async function show(req, res) {
  const post = await prisma.post.findUnique({
    where: {
      slug: req.params.slug
    }
  })
  
  if (!post) {
    res.json({
      error: 404,
      message: `Post with id ${req.params.id} not found`,
    });
    return
  }
  const imgPath = `http://${host}:${port}/images${post.image}`;
  const downloadLink = `http://localhost:3000/posts/${post.slug}/download`;
  res.json({
    ...post,
    image_url: `${imgPath}`,
    download_link: `${downloadLink}`,
  });

}

async function store (req, res) {
  const data = req.body
  if(!data.title || !data.content || !data.published){
    res.json({
      error: 'Missing required parameters',
      code: 407
    })
    return
  }
 
  
  let imageSlug;

  const slug = await slugGenerator(data.title)

  const newPost = new Post(
    data.title, 
    slug,
    data.content,
    published = data.published ? true : false,
    imageSlug ?? '/placeholder.webp',
    )
    try {
      prisma.post.create({
        data: {
          title: newPost.title,
          content: newPost.content,
          published: newPost.published,
          image: newPost.image,
          slug: newPost.slug
        }
      })
      .then((post) => {
        res.json(post)
      })
    } catch (error) {
      throw new CustomError(400, error.message)
    }

    

  

    
  
}

function destroy(req, res) {
  const id = req.body.id
  const postIndex = posts.findIndex((post) => post.id == id)
  if(!postIndex){
    res.status(404).json({error: 404, message: `Post with id ${id} not found`})
    return
  }
  if(posts[postIndex].image !== '/placeholder.webp')
  {
    fs.unlinkSync(path.resolve(`./public/images/${posts[postIndex].image}`))
  }
  
  posts.splice(postIndex, 1)
  fs.writeFileSync(path.resolve("./db/posts.json"), JSON.stringify(posts, null, 2))
  

  res.status(200).redirect('/admin')
}

function edit(req, res){

  const id = req.body.id
  const postIndex = posts.findIndex((post) => post.id.toString() == id)


  if(postIndex === -1 | null | undefined){
    res.status(404).json({error: 404, message: `Post with id ${id} not found`})
    return
  }
  const data = req.body
  const tags = data.tags.split(",").map((tag) => tag.trim())

  let imageSlug;

  if(req.file){
    fs.unlinkSync(path.resolve(`./public/images/${posts[postIndex].image}`))
    imageSlug = '/'+ req.file.filename + '.jpg'
    fs.renameSync(req.file.path, path.resolve(`./public/images${imageSlug}`))
  }

  posts[postIndex].title = data.title
  posts[postIndex].body = data.content
  posts[postIndex].tags = tags
  posts[postIndex].image = imageSlug ?? posts[postIndex].image

  fs.writeFileSync(path.resolve("./db/posts.json"), JSON.stringify(posts, null, 2))

  res.status(300).redirect(`/posts/${posts[postIndex].id}`)
}

module.exports = {
  index,
  show,
  store,
  destroy,
  edit
};

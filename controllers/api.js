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

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */

async function index(req, res, next) {
  const query = req.query
  
  if(query){
    const { maxResult, startIndex } = query
    if(maxResult < 1 || startIndex < 0 || !startIndex){
      next(new CustomError(400, "startIndex and maxResults are required"))
      return
    }

    await prisma.post.findMany()
    .then((posts) => {
      const parsedStart = parseInt(startIndex)
      const parsedMax = parseInt(maxResult)
      const totalResults = posts.length
      
      const possibleLimit = (parsedStart + parsedMax) <= totalResults ? (parsedStart + parsedMax) : totalResults
      

      const newIndex = (possibleLimit + parsedMax) <= (totalResults) 
      ? (parsedStart + parsedMax) 
      : (parsedStart + 1 < totalResults ? totalResults - 1 : null)
      

      const nextPage = newIndex 
      ? `http://${host}:${port}/api/posts?maxResult=${parsedMax}&startIndex=${newIndex}` 
      : null
      
      res.json({
        totalResults: posts.length,
        nextPage: nextPage,
        posts: posts.slice(startIndex, possibleLimit)
      })
      return
    })
    .catch((error) => {
      next(new CustomError(404, error.message))
      return
    })
  }

  await prisma.post.findMany()
  .then((posts) => {
    if (posts.lenght === 0) {
      next(new CustomError(404, `No posts found`))
      return
    }
    res.json(posts);
    return
  })
  .catch((error) => {
    next(new CustomError(404, error.message))
    return
  })
  
  
  
}

async function show(req, res, next) {
  await prisma.post.findUnique({
    where: {
      slug: req.params.slug
    }
  })
  .then((post) => {
    if (!post) {
      next(new CustomError(404, `Post with slug ${req.params.slug} not found`))
      return
    }
    const imgPath = `http://${host}:${port}/images${post.image}`;
    const downloadLink = `http://localhost:3000/posts/${post.slug}/download`;
    res.json({
      ...post,
      image_url: `${imgPath}`,
      download_link: `${downloadLink}`,
    });
  })
  .catch((error) => {
    next(new CustomError(404, error.message))
    return
  })
  
  

}

async function store (req, res, next) {
  const data = req.body
  if(!data.title || !data.content || !data.published){
    next(new CustomError(400, "Missing required fields"))
    return
  }
 
  
  let imageSlug;

  const slug = await slugGenerator(data.title)

  const newPost = new Post(
    data.title, 
    slug,
    data.content,
    published = data.published === "true" ? true : false,
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
      .catch((error) => {
        next(new CustomError(404, error.message))
        return
      })
    } catch (error) {
      next(new CustomError(400, error.message))
    }
}

async function destroy(req, res, next) {
  const slug = req.body.slug
  await prisma.post.delete({
    where: {
      slug: slug
    }
  })
  .then((post) => {
    res.json(post)
  })
  .catch((error) => {
    next(new CustomError(404, error.message))
    return
  })
}

async function edit(req, res, next){
  const slug = req.body.slug
  const data = req.body

  if(!slug){
    next(new CustomError(400, "Missing slug"))
    return
  }

  if(!data.title || !data.content || !data.published){
    next(new CustomError(400, "Missing required fields: title, content, published."))
    return
  }

  const newSlug = await slugGenerator(data.title)

  await prisma.post.update({
    where: {
      slug: slug
    },
    data: {
      title: data.title,
      content: data.content,
      published: data.published === "true" ? true : false,
      slug: newSlug
    }
  
  })
  .then((post) => {
    res.json(post)
  })
  .catch((error) => {
    next(new CustomError(404, error.message))
    return
  })
}

module.exports = {
  index,
  show,
  store,
  destroy,
  edit
};

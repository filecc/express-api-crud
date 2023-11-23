const slugGenerator = require('./slugGenerator');

class Post {
    title;
    content;
    slug;
    published;
    image;

    constructor(title, slug, content, published, image){
        this.title = title;
        this.slug = slug;
        this.content = content;
        this.published = published;
        this.image = image;
      
    }
}

module.exports = Post;
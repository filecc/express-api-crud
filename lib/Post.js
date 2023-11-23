const slugGenerator = require('./slugGenerator');
class Post {
    id;
    title;
    slug;
    body;
    tags;
    image;

    constructor(id, title, body, tags, image){
        this.id = id;
        this.slug = slugGenerator(title);
        this.title = title;
        this.body = body;
        this.image = image;
        this.tags = tags;
    }
}

module.exports = Post;
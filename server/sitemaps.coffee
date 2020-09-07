sitemaps.add '/sitemap.xml', ()->
    maps = []
    posts = Posts.find({}, {limit: 50000}).fetch()

    _.each posts, (post)->
        maps.unshift {
            page: 'http://www.tiegushi.com/posts/' + post._id
            lastmod: post.createdAt
        }
        return

    return maps

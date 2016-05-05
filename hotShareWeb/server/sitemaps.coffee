sitemaps.add '/sitemap.xml', ()->
    maps = []
    posts = Posts.find({}, {sort: {createAt:-1}, limit: 50000}).fetch()

    _.each posts, (post)->
        maps.push {
            page: 'http://www.tiegushi.com/posts/' + post._id
            lastmod: post.createAt
        }
        return

    return maps

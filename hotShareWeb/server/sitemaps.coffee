sitemaps.add '/sitemap.xml', ()->
    maps = []
    posts = Posts.find().fetch()

    _.each posts, (post)->
        maps.push {
            page: '/posts/' + post._id
            lastmod: post.createAt
        }
        return

    return maps

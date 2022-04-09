const graphql = require('graphql')
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLFloat,


} = graphql;

let user = require('../schemas/user')
let post = require('../schemas/post')
let tags = require('../schemas/tags')
let Order = require('../schemas/order')
let notification = require('../schemas/notifications')

const personalInfoType = new GraphQLObjectType({
    name: "PersonalInfo",
    fields: () => ({

        name: { type: GraphQLString },
        profileImageURL: { type: GraphQLString },
        coverPhotoURL: { type: GraphQLString }
    })
})

const LocationInfoJSON = new GraphQLObjectType({
    name: "LocationInfoJSON",
    fields: () => ({
        "city": { type: GraphQLString },
        "country": { type: GraphQLString },
        "district": { type: GraphQLString },
        "isoCountryCode": { type: GraphQLString },
        "name": { type: GraphQLString },
        "postalCode": { type: GraphQLString },
        "region": { type: GraphQLString },
        "street": { type: GraphQLString },
        "subregion": { type: GraphQLString },
        "timezone": { type: GraphQLString },
    })
})

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        facebookToken: { type: GraphQLString },
        personalInfo: {
            type: personalInfoType,
            resolve(parent, args) {
                return JSON.parse(parent.facebookToken)
            }
        },
        name: { type: GraphQLString },
        expoPushToken: { type: GraphQLString },
        region: { type: GraphQLString },
        phone: { type: GraphQLString },
        currentLatitude: { type: GraphQLFloat },
        currentLongitude: { type: GraphQLFloat },
        isRider: { type: GraphQLInt },
        rating: { type: GraphQLFloat },
        currentCity: { type: GraphQLString },
        id: { type: GraphQLID },
        lastPost: {
            type: PostType,
            async resolve(parent, args) {
                let data = await post.find({ postedBy: parent.id }).sort({ postedOn: -1 }).limit(1)
                return data[0]
            }
        },
        locationInfo: { type: GraphQLString },
        locationInfoJson: {
            type: LocationInfoJSON,
            resolve(parent, args) {
                return JSON.parse(parent.locationInfo)
            }
        }
    })
})


const RootQueryType = new GraphQLObjectType({
    name: "rootQuery",
    fields: {
        searchUser: {
            type: new GraphQLList(UserType),
            args: {
                name: { type: GraphQLString },
                phone: { type: GraphQLString },
            },
            resolve(parent, args) {
                return user.find({
                    $and: [
                        { name: { $regex: new RegExp(args.name) } },
                        { phone: { $regex: new RegExp(args.phone) } }
                    ]
                })
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQueryType,
    mutation: null
});
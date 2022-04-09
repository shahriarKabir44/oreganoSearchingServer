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
                query: { type: GraphQLString },
            },
            resolve(parent, args) {
                return user.find({
                    $or: [
                        { name: { $regex: new RegExp(args.query) } },
                        { phone: { $regex: new RegExp(args.query) } }
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
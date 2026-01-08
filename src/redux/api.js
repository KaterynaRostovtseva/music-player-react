import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'


export const api = createApi({
  reducerPath: 'api',
  baseQuery: graphqlRequestBaseQuery({
    url: 'http://player.node.ed.asmer.org.ua/graphql',
    prepareHeaders: (headers, { getState }) => {
      const authState = getState().persistedReducer.auth;
      if (authState && authState.token) {
        headers.set('Authorization', `Bearer ${authState.token}`);
      }
      return headers;
    } 
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ login, password }) => ({
        document: 
                `query login($login: String!, $password: String!) {
                    login(login: $login, password: $password) 
                }`,
        variables: { login, password },
      })
    }),
    registration: builder.mutation({
      query: ({ login, password }) => ({
        document: 
                `mutation reg ($login:String! ,$password:String!){
                    createUser(login:$login ,password:$password) { 
                      _id login}
                }`,
       
        variables: { login, password }, 
      })
    }),
    getUserById: builder.query({
      query: ({ _id }) => ({
        document:
          `query oneUser($query: String){
                UserFindOne(query: $query){
                    _id login nick avatar{ url }
                }
            }`,
        variables: { query: JSON.stringify([{ _id }]) }
      }),
      providesTags: (result, error, { _id }) => {
        return ([{ type: 'User', id: _id }])
      }
    }),
    passwordChange: builder.mutation({
     query: ({ login, password, newPassword }) => ({
        document: `
                mutation passwordChange ($login: String!, $password: String!, $newPassword: String!) {
                    changePassword(login:$login, password:$password, newPassword: $newPassword){
                    _id
                    login
                    } 
                }
            `,
        variables: { login, password, newPassword }
      })
    }),
    setUserNick: builder.mutation({
      query: ({ _id, nick }) => ({
        document: `
                mutation setNick($_id:String, $nick:String) {
                    UserUpsert(user: {_id: $_id, nick: $nick}){
                        _id nick
                    }
                }
                `,
        variables: { _id, nick }
      }),
      invalidatesTags: (result, error, arg) => ([{ type: 'User', id: arg._id }])
    }),
    setAvatar: builder.mutation({
      query: ({ idUser, idImg }) => ({
        document: `
                mutation setAvatar ($idUser: String!, $idImg: ID!) {
                    UserUpsert(user:{_id: $idUser, avatar: {_id: $idImg}}){
                        _id, avatar{
                            _id
                            url
                        }
                    }
                }
                `,
        variables: { idUser, idImg }
      })
    }),
    getTracks: builder.query({
      query: () => ({
        document: `
                query trackFull {
                    TrackFind (query:"[{}]"){
                    _id url 
                    id3 {
                        title
                        artist
                        album
                        }
                    }
                }`
      })
    }),
    getTrackId: builder.query({
      query: ({ _id }) => ({
        document: `
            query trackOneId ($idTrack: String) {
                TrackFindOne (query: $idTrack){
                  _id url 
                  id3 {
                    title
                    artist
                    album
                    }
                }
              }
            `,
        variables: { idTrack: JSON.stringify([{ _id }]) }
      })
    }),
    getPlaylistsMy: builder.query({
      query: ({ idUser }) => ({
        document: `
            query MyPlaylists ($idUser: String){
                PlaylistFind(query: $idUser) {
                      _id
                      name
                      description
                      tracks {
                        _id
                        url
                        id3 {
                          title
                          artist
                          album
                        }
                      }
                    }
                  }
                `,
        variables: { idUser: JSON.stringify([{ "___owner": `${idUser}` }]) }
      })
    }),
    getTracksMy: builder.query({
      query: ({ idUser }) => ({
        document: `
                    query trackFind($idUser: String)  {
                        TrackFind (query: $idUser){
                        _id url 
                        id3{
                        title
                        artist
                        album
                        }
                        }
                    }
                `,
        variables: { idUser: JSON.stringify([{ "___owner": `${idUser}` }]) }
      })
    }),
    getPlaylist: builder.query({
      query: () => ({
        document: `
                    query plsFull {
                        PlaylistFind (query: "[{}]") {
                        _id name description tracks {
                                _id
                            url
                            id3 {title artist album}
                        }
                        }
                    }
                `
      })
    }),
    getPlaylistId: builder.query({
      query: ({ _id }) => ({
        document: `
                query plsOne ($_id: String) {
                    PlaylistFindOne (query: $_id){
                    _id name description tracks {
                        _id
                        url
                        id3 {title artist album}
                    }
                    }
                }
                `,
        variables: { _id: JSON.stringify([{ _id }]) }
      })
    }),
    deletePlaylist: builder.mutation({
      query: ({ playlistId }) => ({
        document: `
                    mutation DeletePlaylist($playlistId: ID) {
                        PlaylistDelete(playlist:{_id: $playlistId}) {
                        _id
                        }
                    }
                `,
        variables: { playlistId }
      })
    }),
    upsertPlaylist: builder.mutation({
      query: ({ playlistId, namePls, descriptionPls, tracksId }) => ({
        document: `
                        mutation UpsertPlaylist(
                            $playlistId: ID
                            $namePls: String!
                            $descriptionPls: String!
                            $tracksId: [TrackInput]
                        ) {
                            PlaylistUpsert(playlist: {
                            _id: $playlistId
                            name: $namePls
                            description: $descriptionPls
                            tracks: $tracksId
                            }) {
                                _id name description tracks {
                                _id
                                url
                                id3 {title artist album}
                            }
                            }
                        }
                    `,
        variables: { playlistId, namePls, descriptionPls, tracksId }
      })
    }),
    searchTrack: builder.query({
      query: ({ title }) => ({
        document: `
                    query trackFind ($title: String) {
                        TrackFind (query: $title){
                        _id url 
                        id3{
                        title
                        artist
                        album
                        }
                        }
                    }
                    `,
        variables: { title: JSON.stringify([{ "id3.title": `/${title}/` }]) }
      })
    }),

  })
});

export const {
  useLoginMutation,
  useRegistrationMutation,
  useGetUserByIdQuery,
  usePasswordChangeMutation,
  useSetUserNickMutation,
  useSetAvatarMutation,
  useGetTracksQuery,
  useGetTrackIdQuery,
  useGetPlaylistsMyQuery,
  useGetTracksMyQuery,
  useGetPlaylistQuery,
  useGetPlaylistIdQuery,
  useDeletePlaylistMutation,
  useUpsertPlaylistMutation,
  useSearchTrackQuery} = api;
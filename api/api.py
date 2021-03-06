from flask import Flask, jsonify, request, send_from_directory
import pprint
from .configure import DEVELOPER_TOKEN
import requests
import os

BASE_API_URL = "https://api.music.apple.com"

def transform_songs_to_artist_dict(song_data_list, artist_to_songs):
    # parsing the json format
    for song_data in song_data_list:
        if 'playParams' in song_data['attributes']:
            if 'catalogId' in song_data['attributes']['playParams']:
                song_data_for_playlist_post = {
                    "id": song_data['attributes']['playParams']['catalogId'],
                    "type": "songs"
                }
                # if another artist is featured on the song, it adds it to that artist's playlist
                if 'feat.' in song_data['attributes']['name']:
                    artistSection = song_data['attributes']['name'].split('feat. ')[1]
                    artists = artistSection.replace('(','').replace(')','').replace(', ','-').replace(' & ','-').split('-')
                    # adds the song to each artist's playlists
                    for artist in artists:
                        if artist in artist_to_songs:
                            artist_to_songs[artist]["relationships"]["tracks"]["data"].append(song_data_for_playlist_post)
                        else:
                            artist_to_songs[artist] = {
                                "attributes": {
                                    "name": artist,
                                    "description": artist + " Songs"
                                },
                                "relationships": {
                                    "tracks": {
                                        "data": [song_data_for_playlist_post]
                                    }
                                }
                            }
                # adds the song to the artist's playlist
                elif 'artistName' in song_data['attributes']:
                    artist = song_data['attributes']['artistName']
                    if artist in artist_to_songs:
                        artist_to_songs[artist]["relationships"]["tracks"]["data"].append(song_data_for_playlist_post)
                    else:
                        artist_to_songs[artist] = {
                            "attributes": {
                                "name": artist,
                                "description": artist + " Songs"
                            },
                            "relationships": {
                                "tracks": {
                                    "data": [song_data_for_playlist_post]
                                }
                            }
                        }
    return artist_to_songs

def transform_songs_to_release_dict(song_data_list, release_to_songs):
    for song_data in song_data_list:
        if 'playParams' in song_data['attributes']:
            if 'catalogId' in song_data['attributes']['playParams']:
                song_data_for_playlist_post = {
                    "id": song_data['attributes']['playParams']['catalogId'],
                    "type": "songs"
                }
                if 'releaseDate' in song_data['attributes']:
                    releaseyear = song_data['attributes']['releaseDate'].split('-')[0]
                    if releaseyear in release_to_songs:
                        release_to_songs[releaseyear]["relationships"]["tracks"]["data"].append(song_data_for_playlist_post)
                    else:
                        release_to_songs[releaseyear] = {
                            "attributes": {
                                "name": releaseyear,
                                "description": releaseyear + " Songs"
                            },
                            "relationships": {
                                "tracks": {
                                    "data": [song_data_for_playlist_post]
                                }
                            }
                        }
    return release_to_songs

def transform_songs_to_genre_dict(song_data_list, genre_to_songs):
    # parsing the json format
    for song_data in song_data_list:
        if 'playParams' in song_data['attributes']:
            if 'catalogId' in song_data['attributes']['playParams']:
                song_data_for_playlist_post = {
                    "id": song_data['attributes']['playParams']['catalogId'],
                    "type": "songs"
                }
                for genre in song_data['attributes']['genreNames']:
                    if genre in genre_to_songs:
                        genre_to_songs[genre]["relationships"]["tracks"]["data"].append(song_data_for_playlist_post)
                    elif genre != '':
                        genre_to_songs[genre] = {
                            "attributes": {
                                "name": genre,
                                "description": genre + " Songs"
                            },
                            "relationships": {
                                "tracks": {
                                    "data": [song_data_for_playlist_post]
                                }
                            }
                        }
    return genre_to_songs

app = Flask(__name__, static_folder='../build', static_url_path='/')

@app.route('/')
def index():
    print(app.static_folder)
    return app.send_static_file('index.html')

@app.route('/api/create_playlist_by_genre', methods=['POST','GET'])
def create_playlist_by_genre():
    # gets the user token from the front end
    data = request.json
    USER_TOKEN = data['userToken']
    HEADERS = {'Authorization': 'Bearer ' + DEVELOPER_TOKEN, 'Music-User-Token': USER_TOKEN}

    genre_to_songs = {}             # keeps track of genre playlists

    # gets the user's library songs (only a maximum of 100 songs is allowed per the Apple Music API)
    song_request_data = requests.get(
        BASE_API_URL + "/v1/me/library/songs?limit=100",
        headers = HEADERS)
    song_request_data_json = song_request_data.json()

    if song_request_data.status_code != 200 and song_request_data.status_code != 201:
        return jsonify({"success": False}), song_request_data.status_code
    
    while 'next' in song_request_data_json:
        genre_to_songs = transform_songs_to_genre_dict(
            song_request_data_json['data'],
            genre_to_songs)

        song_request_data = requests.get(
            BASE_API_URL + song_request_data_json['next'],
            headers = HEADERS)

        song_request_data_json = song_request_data.json()
        if song_request_data.status_code != 200 and song_request_data.status_code != 201:
            return jsonify({"success": False}), song_request_data.status_code
    
    genre_to_songs = transform_songs_to_genre_dict(
        song_request_data_json['data'],
        genre_to_songs)

    return genre_to_songs

@app.route('/api/create_playlist_by_release_date', methods=['POST','GET'])
def create_playlist_by_release_date():
    # gets the user token from the front end
    data = request.json
    USER_TOKEN = data['userToken']
    HEADERS = {'Authorization': 'Bearer ' + DEVELOPER_TOKEN, 'Music-User-Token': USER_TOKEN}

    release_date_to_songs = {}              # keeps track of release date playlists

    # gets the user's library songs (only a maximum of 100 songs is allowed per the Apple Music API)
    song_request_data = requests.get(
        BASE_API_URL + "/v1/me/library/songs?limit=100",
        headers = HEADERS)
    song_request_data_json = song_request_data.json()

    if song_request_data.status_code != 200 and song_request_data.status_code != 201:
        return jsonify({"success": False}), song_request_data.status_code
    
    while 'next' in song_request_data_json:
        release_date_to_songs = transform_songs_to_release_dict(
            song_request_data_json['data'],
            release_date_to_songs)

        song_request_data = requests.get(
            BASE_API_URL + song_request_data_json['next'],
            headers = HEADERS)

        song_request_data_json = song_request_data.json()
        if song_request_data.status_code != 200 and song_request_data.status_code != 201:
            return jsonify({"success": False}), song_request_data.status_code
    
    release_date_to_songs = transform_songs_to_release_dict(
        song_request_data_json['data'],
        release_date_to_songs)

    return release_date_to_songs

@app.route('/api/create_playlist_by_artist', methods=['POST','GET'])
def create_playlist_by_artist():
    data = request.json
    USER_TOKEN = data['userToken']
    HEADERS = {'Authorization': 'Bearer ' + DEVELOPER_TOKEN, 'Music-User-Token': USER_TOKEN}

    artist_to_songs = {}

    song_request_data = requests.get(
        BASE_API_URL + "/v1/me/library/songs?limit=100",
        headers = HEADERS)
    song_request_data_json = song_request_data.json()

    if song_request_data.status_code != 200 and song_request_data.status_code != 201:
        return jsonify({"success": False}), song_request_data.status_code
    
    while 'next' in song_request_data_json:
        artist_to_songs = transform_songs_to_artist_dict(
            song_request_data_json['data'],
            artist_to_songs)

        song_request_data = requests.get(
            BASE_API_URL + song_request_data_json['next'],
            headers = HEADERS)

        song_request_data_json = song_request_data.json()
        if song_request_data.status_code != 200 and song_request_data.status_code != 201:
            return jsonify({"success": False}), song_request_data.status_code
    
    artist_to_songs = transform_songs_to_artist_dict(
        song_request_data_json['data'],
        artist_to_songs)

    return artist_to_songs

@app.route('/api/post_playlists', methods=['POST'])
def post_playlists():
    # gets user token and selected playlists from the front end
    data = request.json
    USER_TOKEN = data['token']
    HEADERS = {'Authorization': 'Bearer ' + DEVELOPER_TOKEN, 'Music-User-Token': USER_TOKEN}

    # creates the selected playlists in the user's Apple Music library
    for playlistInfo in data['playlists'].values():
        create_playlist_request = requests.post(
            BASE_API_URL + '/v1/me/library/playlists',
            headers = HEADERS,
            json = playlistInfo)
        if 201 < create_playlist_request.status_code < 500:
            return jsonify({"success": False}), create_playlist_request.status_code
    
    return jsonify({"success": True}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False, port=os.environ.get('PORT', 80))
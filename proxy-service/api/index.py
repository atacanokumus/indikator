from flask import Flask, jsonify, request
from youtube_transcript_api import YouTubeTranscriptApi
from flask_cors import CORS

app = Flask(__name__)
# Allow CORS for ecotube admin panel
CORS(app)

@app.route('/api/transcript', methods=['GET'])
def get_transcript():
    try:
        video_id = request.args.get('videoId')
        if not video_id:
            return jsonify({"success": False, "error": "Missing videoId parameter"}), 400
            
        import requests
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        })
        session.cookies.set("CONSENT", "YES+cb.20231221-17-p0.tr+FX+559", domain=".youtube.com")
        session.cookies.set("SOCS", "CAI", domain=".youtube.com")
        
        api = YouTubeTranscriptApi
        transcript_list = api.list_transcripts(video_id, proxies=None) # type: ignore
        transcript = transcript_list.find_transcript(['tr', 'en'])
        
        if transcript:
            text_data = transcript.fetch()
            text = " ".join([t.text for t in text_data])
            return jsonify({"success": True, "videoId": video_id, "text": text})
        else:
            return jsonify({"success": False, "error": "No tr or en transcript found"}), 404
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Vercel requires the app object to be named 'app'

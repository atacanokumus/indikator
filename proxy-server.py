from flask import Flask, jsonify, request
from youtube_transcript_api import YouTubeTranscriptApi
import os

app = Flask(__name__)

@app.route('/transcript/<video_id>')
def get_transcript(video_id):
    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)
        transcript = transcript_list.find_transcript(['tr', 'en'])
        
        if transcript:
            text_data = transcript.fetch()
            text = " ".join([t.text for t in text_data])
            return jsonify({"success": True, "videoId": video_id, "text": text})
        else:
            return jsonify({"success": False, "error": "No tr or en transcript found"}), 404
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)

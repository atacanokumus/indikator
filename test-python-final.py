from youtube_transcript_api import YouTubeTranscriptApi
import sys

try:
    video_id = "mewcyP10rDo"
    print(f"Testing Python API on {video_id}...")
    
    # Initialize the class and fetch transcripts
    api = YouTubeTranscriptApi()
    transcript_list = api.list(video_id)
    
    # Try finding Turkish
    transcript = transcript_list.find_transcript(['tr', 'en'])
    
    if transcript:
        text_data = transcript.fetch()
        text = " ".join([t.text for t in text_data])
        print(f"SUCCESS! Char length: {len(text)}")
        print(f"Sample: {text[:500]}")
        sys.exit(0)
    else:
        print("No transcript found.")
        sys.exit(1)

except Exception as e:
    print(f"Fatal Error: {e}")
    sys.exit(1)

from flask import Flask, send_from_directory, request
from io import BytesIO
import requests


app = Flask(__name__, static_url_path='')

def upload_to_ipfs(doc_to_store, ipfs_url):
    # expected url is like http://localhost:5001
    # Python doesn't have a Blob type like JavaScript, so we'll use BytesIO
    blob = BytesIO(doc_to_store.encode('utf-8'))
    
    # Creating the FormData
    files = {'file': blob}
    
    # Making the first request
    response = requests.post(ipfs_url + '/api/v0/add', files=files)
        
    result = response.json()
    cid = result['Hash']

    # Pin the cid
    response_pin = requests.post(ipfs_url + '/api/v0/pin/add?arg=' + cid)

    return cid


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# /post_ipfs POST body: {doc: "string"}
@app.route('/post_ipfs', methods=['POST'])
def post_ipfs():
    print(request.json)
    # Get the doc from the request body
    doc = request.json['doc']

    print("ipfs post request received")
    print("---------------------------")
    print(doc)
    print("---------------------------")

    # Upload the doc to IPFS
    # reject if doc is empty or greater than 1000 characters
    if len(doc) == 0 or len(doc) > 1000:
        return "Invalid doc"

    # Upload the doc to IPFS
    cid = upload_to_ipfs(doc, 'http://localhost:5001')

    # Return the cid json
    return {'cid': cid}
    
    

if __name__ == '__main__':
    app.run(debug=True)

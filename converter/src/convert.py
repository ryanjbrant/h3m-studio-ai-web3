import os
import tempfile
import json
from flask import Flask, request, jsonify
import requests
from google.cloud import storage
import subprocess
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
storage_client = storage.Client()

def download_file(url, local_path):
    """Download a file from a signed URL."""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    with open(local_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

def convert_usdz_to_glb(input_path, output_path):
    """Convert USDZ to GLB using USD tools."""
    try:
        # First convert USDZ to USD
        temp_usd = input_path.replace('.usdz', '.usd')
        subprocess.run(['usdcat', input_path, '--out', temp_usd], check=True)
        
        # Then convert USD to GLB
        subprocess.run(['usd2gltf', '--input', temp_usd, '--output', output_path], check=True)
        
        # Clean up temporary USD file
        os.remove(temp_usd)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Conversion failed: {str(e)}")
        return False

@app.route('/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        required_fields = ['inputUrl', 'outputBucket', 'outputPath']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        input_url = data['inputUrl']
        output_bucket = data['outputBucket']
        output_path = data['outputPath']

        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as tmpdir:
            # Download input file
            input_filename = os.path.basename(input_url.split('?')[0])
            input_path = os.path.join(tmpdir, input_filename)
            logger.info(f"Downloading file from {input_url}")
            download_file(input_url, input_path)

            # Convert file
            output_filename = os.path.basename(output_path)
            output_path_local = os.path.join(tmpdir, output_filename)
            logger.info("Converting USDZ to GLB")
            if not convert_usdz_to_glb(input_path, output_path_local):
                return jsonify({'error': 'Conversion failed'}), 500

            # Upload result
            bucket = storage_client.bucket(output_bucket)
            blob = bucket.blob(output_path)
            logger.info(f"Uploading result to {output_path}")
            blob.upload_from_filename(output_path_local)

        return jsonify({
            'message': 'Conversion successful',
            'outputPath': output_path
        })

    except Exception as e:
        logger.error(f"Error during conversion: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port) 
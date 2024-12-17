from flask import Flask, request, jsonify
import os
import subprocess
from google.cloud import storage
import tempfile

app = Flask(__name__)
storage_client = storage.Client()

@app.route('/convert', methods=['POST'])
def convert():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename.endswith('.usdz'):
        return jsonify({'error': 'Invalid file format'}), 400

    try:
        # Create temporary directory
        with tempfile.TemporaryDirectory() as tmpdir:
            # Save input file
            input_path = os.path.join(tmpdir, file.filename)
            file.save(input_path)

            # Create output path
            output_filename = os.path.splitext(file.filename)[0] + '.glb'
            output_path = os.path.join(tmpdir, output_filename)

            # Convert USDZ to USD
            usd_path = os.path.join(tmpdir, 'temp.usdc')
            subprocess.run(['usdzip', '-unpack', input_path, usd_path], check=True)

            # Convert USD to GLB
            subprocess.run(['usd2gltf', '-i', usd_path, '-o', output_path], check=True)

            # Upload result to Cloud Storage
            bucket = storage_client.bucket(os.environ.get('BUCKET_NAME'))
            blob = bucket.blob(f'conversions/output/{output_filename}')
            blob.upload_from_filename(output_path)

            return jsonify({
                'success': True,
                'output_url': f'gs://{bucket.name}/{blob.name}'
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True) 
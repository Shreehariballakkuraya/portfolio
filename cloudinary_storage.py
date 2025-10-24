import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import cloudinary.api
from werkzeug.utils import secure_filename
import re

load_dotenv()

# Cloudinary Configuration - using CLOUDINARY_URL format
cloudinary_url = os.environ.get('CLOUDINARY_URL')

# Explicitly configure from URL to ensure it works correctly
if cloudinary_url:
    # Parse the URL and configure explicitly
    match = re.match(r'cloudinary://([^:]+):([^@]+)@(.+)', cloudinary_url)
    if match:
        api_key, api_secret, cloud_name = match.groups()
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret
        )
        print(f"Cloudinary configured with cloud name: {cloud_name}")
    else:
        print("Warning: Invalid CLOUDINARY_URL format")
else:
    print("Warning: CLOUDINARY_URL not found in environment variables")

def upload_file_to_cloudinary(file, folder="portfolio_images"):
    """
    Upload a file to Cloudinary
    :param file: File to upload
    :param folder: Folder in Cloudinary to upload to
    :return: Tuple of (public_id, url) if successful, (None, None) otherwise
    """
    # Generate a secure filename
    filename = secure_filename(file.filename)
    
    # Try to upload the file to Cloudinary
    try:
        # Upload the image
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="auto",
            public_id=os.path.splitext(filename)[0],  # Use filename without extension as public_id
            overwrite=True
        )
        
        # Return the public_id and URL
        return result['public_id'], result['secure_url']
    
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return None, None

def get_cloudinary_url(public_id, **options):
    """
    Generate a URL for an existing Cloudinary image
    :param public_id: The public ID of the image
    :param options: Additional options for the URL (like transformations)
    :return: URL for the image
    """
    try:
        return cloudinary.CloudinaryImage(public_id).build_url(**options)
    except Exception as e:
        print(f"Error generating Cloudinary URL: {e}")
        return None

def delete_cloudinary_file(public_id):
    """
    Delete a file from Cloudinary
    :param public_id: The public ID of the file to delete
    :return: True if successful, False otherwise
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result['result'] == 'ok'
    except Exception as e:
        print(f"Error deleting from Cloudinary: {e}")
        return False
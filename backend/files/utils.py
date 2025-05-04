import hashlib

def calculate_file_hash(file_obj, chunk_size=8192):
    hasher = hashlib.sha256()
    file_obj.seek(0)
    while chunk := file_obj.read(chunk_size):
        hasher.update(chunk)
    file_obj.seek(0)
    return hasher.hexdigest()

to_mb = lambda b: round(b / (1024 * 1024), 2)
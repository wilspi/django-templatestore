import base64


def base64decode(template):
    decoded_bytes = base64.b64decode(template)
    return str(decoded_bytes, "utf-8")


def base64encode(rendered_output):
    encoded_bytes = base64.b64encode(rendered_output.encode("utf-8"))
    return str(encoded_bytes, "utf-8")

import base64


def base64decode(template):
    output = base64.b64decode(template.encode("utf-8"))
    return str(output.decode("utf-8"))


def base64encode(rendered_output):
    output = base64.b64encode(rendered_output.encode("utf-8"))
    return str(output.decode("utf-8"))

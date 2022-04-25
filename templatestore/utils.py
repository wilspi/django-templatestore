import base64
import datetime
from dateutil.relativedelta import relativedelta
import pytz
import re

regex = re.compile(
    r"^(?:http|ftp)s?://"  # http:// or https://
    r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|"  # domain...
    r"localhost|"  # localhost...
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...or ip
    r"(?::\d+)?"  # optional port
    r"(?:/?|[/?]\S+)$",
    re.IGNORECASE,
)


def base64decode(template):
    output = base64.b64decode(template.encode("utf-8"))
    return str(output.decode("utf-8"))


def base64encode(rendered_output):
    output = base64.b64encode(rendered_output.encode("utf-8"))
    return str(output.decode("utf-8"))

def generateDate(days):
    # .isoformat()
    IST = pytz.timezone("Asia/Kolkata")
    dt = datetime.datetime.now(IST) + relativedelta(days=+days)
    return str(dt.isoformat())

def generatePayload(templateTable, versionTable, data):
    ans = []
    i = 0
    while i < len(versionTable.tiny_url):
        original_url = "data" + "['context_data']" + versionTable.tiny_url[i]["urlKey"]

        try:
            re.match(regex, eval(original_url)) is not None
        except Exception as e:
            return None

        lob = templateTable.attributes["lob"]
        journey = templateTable.attributes["journey"]
        days = versionTable.tiny_url[i]["expiry"]
        expiry = generateDate(int(days))
        ans.append(
            {
                "original_url": eval(original_url),
                "lob": lob,
                "journey": journey,
                "expiry_time": expiry,
            }
        )
        i = i + 1
    return ans

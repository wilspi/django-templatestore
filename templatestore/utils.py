import base64
import datetime
from dateutil.relativedelta import relativedelta
import pytz

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

def generatePayload(templateTable, versionTable, param):
    ans = []
    i = 0
    while i < len(versionTable.tiny_url):
        original_url = (
            "versionTable.sample_context_data" + versionTable.tiny_url[i]["urlKey"]
        )
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

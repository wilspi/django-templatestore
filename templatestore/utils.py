import base64
import datetime
from ensurepip import version
from urllib import request 
from dateutil.relativedelta import relativedelta
import pytz

def base64decode(template):
    output = base64.b64decode(template.encode("utf-8"))
    return str(output.decode("utf-8"))


def base64encode(rendered_output):
    output = base64.b64encode(rendered_output.encode("utf-8"))
    return str(output.decode("utf-8"))

def generateDate(days, months, years):
    # .isoformat()
    IST = pytz.timezone('Asia/Kolkata')
    dt = datetime.datetime.now(IST)+relativedelta(days=+days)+relativedelta(months=+months)+relativedelta(years=+years)
    return str(dt.isoformat())
def generatePayload(templateTable,versionTable,param):
    ans=[]
    i=0
    while i< len(versionTable.tiny_url):
        original_url='versionTable.sample_context_data'+versionTable.tiny_url[i]['urlKey']
        lob=templateTable.attributes['lob']
        journey=templateTable.attributes['journey']
        expiry=versionTable.tiny_url[i]['expiry'].split(',')
        days=expiry[0]
        months=expiry[1]
        years=expiry[2]
        expiry=generateDate(int(days),int(months),int(years))
        ans.append({"original_url":eval(original_url),
                "lob":lob,
                "journey":journey,
                "expiry_time":expiry
                })
        i=i+1
    return ans
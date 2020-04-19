#
# Script to base64 encode all the existing template data
# How to run ??
# python update_data.py dbname host user password port
#

# import psycopg2
import base64
# import sys
# from django.db.models import F
from templatestore.models import SubTemplate


def base64encode(template_data):
    data = base64.b64encode(template_data.encode("utf-8"))
    return str(data.decode("utf-8"))


def update_data(dbname, host, user, password, port):
    conn = None
    try:
        # conn = psycopg2.connect(host=host, database=dbname, user=user, password=password, port=port)
        # cur = conn.cursor()
        SubTemplate.objects.all().update(data="a"pwd)
        # cur.execute(s)
        # conn.commit()
        # cur.close()

    except Exception as e:
        print(e)
    finally:
        if conn is not None:
            conn.close()


def main():
    dbname = sys.argv[1]
    host = sys.argv[2]
    user = sys.argv[3]
    password = sys.argv[4]
    port = sys.argv[5]
    update_data(dbname, host, user, password, port)
    exit(1)


if __name__ == "__main__":
    main()

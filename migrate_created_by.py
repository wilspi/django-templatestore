import os, django, sys
import requests
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "example.settings")
django.setup()
from templatestore.models import Template, TemplateVersion

US_PROD_API = 'http://entity-service.internal.acko.com/api/user/get/?id='
US_UAT_API = 'http://entity-service.internal.ackodev.com/api/user/get/?id='


def get_email_from_user_id(user_id, is_prod, context):
	api_url = None
	if is_prod:
		api_url = 'http://entity-service.internal.ackodev.com/api/user/get/?id='
	else:
		api_url = 'http://entity-service.internal.ackodev.com/api/user/get/?id='
	
	try:
		res = requests.get(api_url+str(user_id))
		body = res.json()
		print("body recieved", body)
		email = 'email'
		if email not in body:
			print("in context %d, for userid - %d, there is no email"%(context, user_id))
			pass
		else:
			print("in context %d, for userid - %d, email is %s" % (context, user_id, body[email]))
			return body[email]
	except Exception as e:
		print(e)
		
	return ""
	
	
def main_script(is_prod):
	user_id_mail_map = {}
	all_templates = Template.objects.all()
	print("all templates", all_templates)
	for template in all_templates:
		user_id = template.created_by
		print("template ", template, user_id)
		if not user_id or user_id is '':
			continue
		if user_id not in user_id_mail_map:
			email = get_email_from_user_id(user_id, is_prod, template.id)
			user_id_mail_map[user_id] = email
		else:
			email = user_id_mail_map[user_id]
		template.user_email = email
		template.save()
		
	print("all templates done")
	
	all_template_versions = TemplateVersion.objects.all()
	for template_version in all_template_versions:
		user_id = template_version.created_by
		print("template_version ", template_version, user_id)
		if not user_id or user_id is '':
			continue
		if user_id not in user_id_mail_map:
			email = get_email_from_user_id(user_id, is_prod, template_version.id)
			user_id_mail_map[user_id] = email
		else:
			email = user_id_mail_map[user_id]
		template_version.user_email = email
		template_version.save()
		
	print(user_id_mail_map)
	
	
if __name__ == '__main__':
	is_prod = True
	if len(sys.argv) > 1:
		given_arg = sys.argv[1]
		
		if given_arg.startswith("--"):
			t = given_arg.lstrip("--")
			if t == "uat":
				is_prod = False
				print('running script in uat context')
				
	main_script(is_prod)
